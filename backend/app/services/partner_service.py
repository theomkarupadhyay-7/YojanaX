import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional


PROJECT_ROOT = Path(__file__).resolve().parents[3]

PARTNERS_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "partners"
    / "partners.json"
)


@lru_cache(maxsize=1)
def load_partners() -> list[dict[str, Any]]:
    """
    Load channel partner data from the processed JSON file.
    """

    if not PARTNERS_FILE.exists():
        raise FileNotFoundError(
            f"Partner data file not found: {PARTNERS_FILE}"
        )

    with PARTNERS_FILE.open("r", encoding="utf-8") as file:
        partners = json.load(file)

    if not isinstance(partners, list):
        raise ValueError(
            "Partner data must contain a JSON list."
        )

    return partners


def _clean(value: Any) -> Optional[str]:
    """
    Normalize optional string values.
    """

    if value is None:
        return None

    value = str(value).strip()

    return value if value else None


def _clean_float(value: Any) -> Optional[float]:
    """
    Normalize optional numeric values.
    """

    if value is None or value == "":
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _clean_bool(value: Any) -> Optional[bool]:
    """
    Normalize optional boolean values.
    """

    if value is None or value == "":
        return None

    if isinstance(value, bool):
        return value

    if isinstance(value, str):
        normalized = value.strip().lower()

        if normalized in {"true", "yes", "1"}:
            return True

        if normalized in {"false", "no", "0"}:
            return False

    return None


def _normalize_partner(
    partner: dict[str, Any],
) -> dict[str, Any]:
    """
    Normalize a raw partner record into the API's expected structure.
    """

    return {
        "partner_id": _clean(
            partner.get("partner_id")
        ),
        "partner_name": _clean(
            partner.get("partner_name")
        ),
        "partner_type": _clean(
            partner.get("partner_type")
        ),
        "state": _clean(
            partner.get("state")
        ),
        "address": _clean(
            partner.get("address")
        ),
        "source_url": _clean(
            partner.get("source_url")
        ),
        "latitude": _clean_float(
            partner.get("latitude")
        ),
        "longitude": _clean_float(
            partner.get("longitude")
        ),
        "operationally_eligible": _clean_bool(
            partner.get("operationally_eligible")
        ),
        "fund_utilization_percent": _clean_float(
            partner.get("fund_utilization_percent")
        ),
        "npa_percent": _clean_float(
            partner.get("npa_percent")
        ),
    }


def get_all_partners() -> list[dict[str, Any]]:
    """
    Return all normalized channel partners.
    """

    return [
        _normalize_partner(partner)
        for partner in load_partners()
    ]


def get_partner_by_id(
    partner_id: str,
) -> dict[str, Any] | None:
    """
    Find one channel partner by ID.
    """

    partners = get_all_partners()

    for partner in partners:
        if partner["partner_id"] == partner_id:
            return partner

    return None


def search_partners(
    partner_type: str | None = None,
    state: str | None = None,
    search: str | None = None,
) -> list[dict[str, Any]]:
    """
    Search and filter channel partners.
    """

    partners = get_all_partners()

    filtered = partners

    if partner_type:
        partner_type_normalized = (
            partner_type.strip().lower()
        )

        filtered = [
            partner
            for partner in filtered
            if partner["partner_type"]
            and partner["partner_type"].strip().lower()
            == partner_type_normalized
        ]

    if state:
        state_normalized = state.strip().lower()

        filtered = [
            partner
            for partner in filtered
            if partner["state"]
            and partner["state"].strip().lower()
            == state_normalized
        ]

    if search:
        search_normalized = search.strip().lower()

        filtered = [
            partner
            for partner in filtered
            if search_normalized
            in (
                f"{partner['partner_name'] or ''} "
                f"{partner['partner_type'] or ''} "
                f"{partner['state'] or ''} "
                f"{partner['address'] or ''}"
            ).lower()
        ]

    return filtered