from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.ai.rag import build_index


if __name__ == "__main__":
    index = build_index()

    print("RAG index built successfully.")
    print(f"Chunks: {len(index['documents'])}")
    print("Index: data/processed/rag/index.json")