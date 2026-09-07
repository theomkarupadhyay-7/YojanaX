from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

import requests

from backend.app.ai.rag import retrieve

SYSTEM_PROMPT = """You are Scheme Setu, an information assistant for NSFDC schemes and channel partners.
Answer only from the supplied CONTEXT. Do not invent eligibility rules, loan limits, interest rates,
documents, partner details, or application procedures. If the context does not contain the answer,
say that the information is not available in the current knowledge base and suggest checking the official
NSFDC source. Keep answers concise and practical. When useful, mention the source document/page.
"""


def _source_label(item: dict[str, Any]) -> str:
    if item.get("page"):
        return f"{item['source']} (page {item['page']})"
    return str(item.get("source"))


def _build_context(results: list[dict[str, Any]]) -> str:
    blocks = []
    for i, item in enumerate(results, start=1):
        blocks.append(
            f"[SOURCE {i}: {_source_label(item)}]\n{item['text']}"
        )
    return "\n\n".join(blocks)


def _load_scheme_records() -> list[dict[str, Any]]:
    path = Path(__file__).resolve().parents[3] / "data" / "processed" / "schemes" / "schemes.json"
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception:
        return []


def _find_scheme(question: str, records: list[dict[str, Any]]) -> dict[str, Any] | None:
    q = question.lower()
    aliases = {
        "MFS": ["mfs", "micro finance", "microfinance"],
        "TERM_LOAN": ["term loan", "term-loan"],
        "AMY": ["amy", "aajeevika", "aajivika", "micro-finance yojana"],
        "UNY": ["uny", "udyam nidhi", "udyam"],
        "ELS": ["els", "educational loan", "education loan"],
    }
    for record in records:
        scheme_id = str(record.get("scheme_id", ""))
        name = str(record.get("scheme_name", ""))
        candidates = aliases.get(scheme_id, []) + [name.lower()]
        if any(alias and alias in q for alias in candidates):
            return record
    return None


def _scheme_fallback(question: str, results: list[dict[str, Any]]) -> str | None:
    """Answer common scheme questions from the structured scheme dataset."""
    q = question.lower()
    records = _load_scheme_records()
    scheme = _find_scheme(question, records)
    if not scheme:
        return None

    name = scheme.get("scheme_name", scheme.get("scheme_id", "the scheme"))
    loan = scheme.get("loan_amount") or {}
    interest = scheme.get("interest_rate") or {}
    repayment = scheme.get("repayment") or {}
    eligibility = scheme.get("eligibility") or {}
    project_cost = scheme.get("project_cost") or {}

    if "maximum loan" in q or "max loan" in q or "loan limit" in q:
        pct = loan.get("max_percentage")
        cap = loan.get("max_inr")
        if pct is not None and cap is not None:
            return f"Under {name}, the maximum eligible loan is {pct}% of the project/course cost, capped at ₹{int(cap):,}."
        if cap is not None:
            return f"Under {name}, the maximum eligible loan is ₹{int(cap):,}."

    if "interest" in q or "interest rate" in q:
        if interest.get("type") == "fixed" and interest.get("value_percent") is not None:
            return f"The beneficiary interest rate under {name} is {interest['value_percent']}%."
        rates = interest.get("rates")
        if isinstance(rates, list) and rates:
            formatted = ", ".join(
                f"{item.get('channel_partner_type')}: {item.get('value_percent')}%"
                for item in rates
                if isinstance(item, dict)
            )
            if formatted:
                return f"{name} has partner-dependent beneficiary rates: {formatted}."
        if isinstance(rates, dict) and rates:
            formatted = ", ".join(f"{key}: {value}%" for key, value in rates.items())
            return f"{name} has partner-dependent beneficiary rates: {formatted}."

    if "repayment" in q:
        period = repayment.get("period_years")
        frequency = repayment.get("installment_frequency")
        if period is not None:
            answer = f"The repayment period under {name} is up to {period} years"
            if frequency:
                answer += f", with {frequency} instalments"
            return answer + "."

    if "moratorium" in q:
        months = repayment.get("moratorium_months")
        description = repayment.get("moratorium_description")
        special = repayment.get("special_moratorium") or {}
        if description:
            return f"For {name}, the moratorium is {description}."
        if months is not None:
            answer = f"The moratorium under {name} is {months} months"
            if special.get("plantation_or_construction_months"):
                answer += f"; {special['plantation_or_construction_months']} months applies to plantation/construction activities"
            return answer + "."

    if "eligib" in q or "eligible" in q:
        parts = []
        if eligibility.get("sc_required") is True:
            parts.append("the applicant must be from the Scheduled Caste category")
        if eligibility.get("annual_family_income_max_inr") is not None:
            parts.append(f"annual family income must be within ₹{int(eligibility['annual_family_income_max_inr']):,}")
        if project_cost:
            minimum = project_cost.get("min_inr_exclusive")
            maximum = project_cost.get("max_inr")
            if minimum is not None and maximum is not None:
                parts.append(f"project cost must be above ₹{int(minimum):,} and up to ₹{int(maximum):,}")
            elif maximum is not None:
                parts.append(f"project cost must be up to ₹{int(maximum):,}")
        education = eligibility.get("education") or {}
        if education.get("full_time_required"):
            parts.append("the course must be regular and full-time")
        if education.get("recognized_institution_required") or education.get("recognized_course_required"):
            parts.append("the institution/course must be recognized and approved")
        application = scheme.get("application_process") or {}
        if application.get("channel_partner_required"):
            parts.append("application must be routed through an authorized channel partner")
        if parts:
            return f"Key eligibility conditions for {name}: " + "; ".join(parts) + "."

    return None


def _extractive_answer(question: str, results: list[dict[str, Any]]) -> str:
    if not results:
        return (
            "I couldn't find enough information in the current NSFDC knowledge base to answer that. "
            "Please check the official NSFDC source for the latest details."
        )

    structured = _scheme_fallback(question, results)
    if structured:
        source = next((r for r in results if r.get("source") == "schemes.json"), results[0])
        return f"{structured}\n\nSource: {_source_label(source)}"

    question_terms = set(re.findall(r"[a-zA-Z0-9]+", question.lower()))
    stop_words = {"what", "what's", "is", "are", "the", "a", "an", "for", "under", "of", "to", "and", "can", "i", "how", "do", "does"}
    question_terms -= stop_words
    candidates = []
    for rank, result in enumerate(results):
        units = []
        for line in result["text"].splitlines():
            units.extend(re.split(r"(?<=[.!?])\s+", line))
        for unit in units:
            unit = unit.strip()
            if not unit:
                continue
            terms = set(re.findall(r"[a-zA-Z0-9]+", unit.lower()))
            overlap = len(question_terms & terms)
            if overlap:
                candidates.append((overlap, result["score"], -rank, unit, _source_label(result)))

    candidates.sort(key=lambda x: (x[0], x[1], x[2]), reverse=True)
    selected = []
    seen = set()
    for _, _, _, unit, source in candidates:
        key = unit.lower()
        if key in seen:
            continue
        seen.add(key)
        selected.append((unit, source))
        if len(selected) >= 3:
            break

    if not selected:
        selected = [(results[0]["text"], _source_label(results[0]))]

    answer = " ".join(unit for unit, _ in selected)
    sources = ", ".join(sorted({source for _, source in selected}))
    return f"{answer}\n\nSource: {sources}"


def _llm_answer(question: str, results: list[dict[str, Any]], history: list[dict[str, str]] | None) -> str | None:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    context = _build_context(results)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        for message in history[-6:]:
            role = message.get("role")
            content = message.get("content")
            if role in {"user", "assistant"} and content:
                messages.append({"role": role, "content": content})
    messages.append(
        {
            "role": "user",
            "content": f"CONTEXT:\n{context}\n\nQUESTION:\n{question}",
        }
    )

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": model, "messages": messages, "temperature": 0.1},
            timeout=45,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception:
        return None


def answer_question(
    question: str,
    top_k: int = 5,
    history: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    results = retrieve(question, top_k=top_k)
    answer = _llm_answer(question, results, history)
    generation_method = "LLM grounded by retrieved NSFDC context" if answer else "Extractive grounded fallback"
    if answer is None:
        answer = _extractive_answer(question, results)

    return {
        "answer": answer,
        "generation_method": generation_method,
        "sources": [
            {
                "source": item["source"],
                "page": item.get("page"),
                "source_url": item.get("source_url"),
                "relevance_score": item["score"],
            }
            for item in results
        ],
    }
