"""
One-time helper for Scheme Setu.

Run from the project root:
    python enable_recommender.py

It backs up backend/app/main.py and adds the recommendation router import
and app.include_router(...) line.
"""

from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent
MAIN = ROOT / "backend" / "app" / "main.py"

IMPORT = (
    "from backend.app.api.routes.recommendations import "
    "router as recommendations_router"
)
ROUTER = "app.include_router(recommendations_router)"


def main():
    if not MAIN.exists():
        raise FileNotFoundError(f"Could not find: {MAIN}")

    text = MAIN.read_text(encoding="utf-8")

    if IMPORT in text and ROUTER in text:
        print("Recommendation router is already enabled.")
        return

    backup = MAIN.with_name("main.py.before_recommender")
    if not backup.exists():
        shutil.copy2(MAIN, backup)
        print(f"Backup created: {backup}")

    lines = text.splitlines()

    # Find the last import statement.
    import_indexes = [
        i for i, line in enumerate(lines)
        if line.startswith("import ") or line.startswith("from ")
    ]
    if not import_indexes:
        raise RuntimeError("Could not find imports in main.py.")

    lines.insert(max(import_indexes) + 1, IMPORT)

    # Put the router after the existing include_router calls.
    router_indexes = [
        i for i, line in enumerate(lines)
        if "app.include_router(" in line
    ]

    if router_indexes:
        lines.insert(max(router_indexes) + 1, ROUTER)
    else:
        lines.extend(["", ROUTER])

    MAIN.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print("Recommendation router enabled successfully.")
    print("Endpoint: POST /recommendations")
    print("Swagger: http://127.0.0.1:8000/docs")


if __name__ == "__main__":
    main()
