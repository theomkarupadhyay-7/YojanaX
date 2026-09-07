from __future__ import annotations

import json
import math
import re
from collections import Counter
from pathlib import Path
from typing import Any

import fitz

BASE_DIR = Path(__file__).resolve().parents[3]
KNOWLEDGE_DIR = BASE_DIR / "data" / "knowledge_base"
SCHEMES_PATH = BASE_DIR / "data" / "processed" / "schemes" / "schemes.json"
PARTNERS_PATH = BASE_DIR / "data" / "processed" / "partners" / "partners.json"
INDEX_PATH = BASE_DIR / "data" / "processed" / "rag" / "index.json"

TOKEN_RE = re.compile(r"[a-zA-Z0-9₹]+")


def _tokens(text: str) -> list[str]:
    return [x.lower() for x in TOKEN_RE.findall(text)]


def _clean(text: str) -> str:
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in (text or "").splitlines()]
    return "\n".join(line for line in lines if line)


def _chunk_text(text: str, chunk_size: int = 260, overlap: int = 40) -> list[str]:
    text = _clean(text)
    if not text:
        return []

    paragraphs = [line for line in text.splitlines() if line]
    chunks: list[str] = []
    current: list[str] = []
    current_words = 0

    for paragraph in paragraphs:
        words = paragraph.split()
        if current and current_words + len(words) > chunk_size:
            chunks.append("\n".join(current))
            overlap_words = []
            for previous in reversed(current):
                overlap_words[0:0] = previous.split()
                if len(overlap_words) >= overlap:
                    break
            current = [" ".join(overlap_words[-overlap:])] if overlap_words else []
            current_words = len(overlap_words[-overlap:])

        current.append(paragraph)
        current_words += len(words)

    if current:
        chunks.append("\n".join(current))

    return chunks


def _pdf_documents() -> list[dict[str, Any]]:
    documents = []
    if not KNOWLEDGE_DIR.exists():
        return documents

    for pdf_path in sorted(KNOWLEDGE_DIR.rglob("*.pdf")):
        try:
            pdf = fitz.open(pdf_path)
            for page_number, page in enumerate(pdf, start=1):
                text = _clean(page.get_text("text"))
                if not text:
                    continue
                documents.append(
                    {
                        "text": text,
                        "source": pdf_path.name,
                        "source_type": "pdf",
                        "page": page_number,
                        "source_url": None,
                    }
                )
            pdf.close()
        except Exception as exc:
            print(f"WARNING: could not read {pdf_path}: {exc}")
    return documents


def _json_text(value: Any, prefix: str = "") -> str:
    if isinstance(value, dict):
        parts = []
        for key, item in value.items():
            child = _json_text(item, str(key))
            if child:
                parts.append(child)
        return "\n".join(parts)
    if isinstance(value, list):
        return "\n".join(_json_text(item, prefix) for item in value if item is not None)
    if value is None:
        return ""
    if prefix:
        return f"{prefix}: {value}"
    return str(value)


def _json_documents(path: Path, source_type: str) -> list[dict[str, Any]]:
    if not path.exists():
        return []

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"WARNING: could not read {path}: {exc}")
        return []

    records = data if isinstance(data, list) else [data]
    documents = []
    for index, record in enumerate(records, start=1):
        text = _clean(_json_text(record))
        if not text:
            continue
        source_url = None
        if isinstance(record, dict):
            source = record.get("source") or record.get("provenance") or {}
            if isinstance(source, dict):
                source_url = source.get("url") or source.get("source_url")
        documents.append(
            {
                "text": text,
                "source": path.name,
                "source_type": source_type,
                "page": None,
                "record": index,
                "source_url": source_url,
            }
        )
    return documents


def build_index() -> dict[str, Any]:
    raw_documents = _pdf_documents()
    raw_documents.extend(_json_documents(SCHEMES_PATH, "scheme_json"))
    raw_documents.extend(_json_documents(PARTNERS_PATH, "partner_json"))

    chunks = []
    for doc_id, document in enumerate(raw_documents, start=1):
        for chunk_number, chunk in enumerate(_chunk_text(document["text"]), start=1):
            chunks.append(
                {
                    "chunk_id": f"chunk-{doc_id}-{chunk_number}",
                    "text": chunk,
                    "source": document["source"],
                    "source_type": document["source_type"],
                    "page": document.get("page"),
                    "record": document.get("record"),
                    "source_url": document.get("source_url"),
                }
            )

    # A compact BM25 index is enough for this MVP and avoids heavyweight ML dependencies.
    tokenized = [_tokens(chunk["text"]) for chunk in chunks]
    document_frequency: Counter[str] = Counter()
    for tokens in tokenized:
        document_frequency.update(set(tokens))

    doc_lengths = [len(tokens) for tokens in tokenized]
    avgdl = sum(doc_lengths) / len(doc_lengths) if doc_lengths else 0.0

    index = {
        "version": 1,
        "retrieval": "BM25",
        "k1": 1.5,
        "b": 0.75,
        "avgdl": avgdl,
        "doc_lengths": doc_lengths,
        "document_frequency": dict(document_frequency),
        "documents": chunks,
        "tokenized_documents": tokenized,
    }

    INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False), encoding="utf-8")
    return index


def load_index() -> dict[str, Any]:
    if not INDEX_PATH.exists():
        raise FileNotFoundError(
            f"RAG index not found at {INDEX_PATH}. Run: python scripts/build_rag_index.py"
        )
    return json.loads(INDEX_PATH.read_text(encoding="utf-8"))


def _bm25_score(query_tokens: list[str], doc_tokens: list[str], index: dict[str, Any]) -> float:
    if not query_tokens or not doc_tokens:
        return 0.0

    k1 = float(index.get("k1", 1.5))
    b = float(index.get("b", 0.75))
    avgdl = float(index.get("avgdl", 1.0)) or 1.0
    doc_len = len(doc_tokens)
    n_docs = max(len(index["documents"]), 1)
    df = index.get("document_frequency", {})
    frequencies = Counter(doc_tokens)

    score = 0.0
    for term in set(query_tokens):
        term_df = int(df.get(term, 0))
        if term_df == 0:
            continue
        idf = math.log(1 + (n_docs - term_df + 0.5) / (term_df + 0.5))
        tf = frequencies.get(term, 0)
        denominator = tf + k1 * (1 - b + b * doc_len / avgdl)
        score += idf * (tf * (k1 + 1) / denominator)
    return score


def retrieve(query: str, top_k: int = 5) -> list[dict[str, Any]]:
    index = load_index()
    query_tokens = _tokens(query)
    scored = []
    for position, doc_tokens in enumerate(index["tokenized_documents"]):
        score = _bm25_score(query_tokens, doc_tokens, index)
        if score <= 0:
            continue
        item = dict(index["documents"][position])
        item["score"] = round(score, 4)
        scored.append(item)

    scored.sort(key=lambda item: item["score"], reverse=True)
    return scored[: max(1, min(top_k, 10))]
