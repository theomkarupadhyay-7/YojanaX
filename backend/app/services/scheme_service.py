import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from backend.app.schemas.scheme import Scheme


PROJECT_ROOT = Path(__file__).resolve().parents[3]

SCHEMES_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "schemes"
    / "schemes.json"
)


@lru_cache(maxsize=1)
def load_schemes() -> list[dict[str, Any]]:
    """
    Load scheme data from the processed JSON dataset.

    The result is cached so the JSON file is not read from disk
    on every API request.
    """

    if not SCHEMES_FILE.exists():
        raise FileNotFoundError(
            f"Scheme data file not found: {SCHEMES_FILE}"
        )

    with SCHEMES_FILE.open("r", encoding="utf-8") as file:
        schemes = json.load(file)

    if not isinstance(schemes, list):
        raise ValueError(
            "Scheme data must contain a JSON list of schemes."
        )

    return schemes


def get_all_schemes() -> list[Scheme]:
    """
    Return all available schemes.
    """

    schemes = load_schemes()

    return [
        Scheme.model_validate(scheme)
        for scheme in schemes
    ]


def get_scheme_by_id(scheme_id: str) -> Scheme | None:
    """
    Return a single scheme by its scheme_id.
    """

    schemes = load_schemes()

    for scheme in schemes:
        if scheme.get("scheme_id") == scheme_id:
            return Scheme.model_validate(scheme)

    return None