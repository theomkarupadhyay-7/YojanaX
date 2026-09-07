import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional


PROJECT_ROOT = Path(__file__).resolve().parents[3]

PARTNER_LOCATIONS_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "partners"
    / "partner_locations.json"
)


@lru_cache(maxsize=1)
def load_partner_locations() -> list[dict[str, Any]]:
    """
    Load physical/service locations of authorized channel partners.
    """

    if not PARTNER_LOCATIONS_FILE.exists():
        raise FileNotFoundError(
            f"Partner locations file not found: "
            f"{PARTNER_LOCATIONS_FILE}"
        )

    with PARTNER_LOCATIONS_FILE.open(
        "r",
        encoding="utf-8",
    ) as file:
        locations = json.load(file)

    if not isinstance(locations, list):
        raise ValueError(
            "Partner location data must contain a JSON list."
        )

    return locations


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


def _normalize_location(
    location: dict[str, Any],
) -> dict[str, Any]:
    """
    Normalize a raw partner-location record.
    """

    return {
        "location_id": _clean(
            location.get("location_id")
        ),
        "partner_id": _clean(
            location.get("partner_id")
        ),
        "location_name": _clean(
            location.get("location_name")
        ),
        "location_type": _clean(
            location.get("location_type")
        ),
        "state": _clean(
            location.get("state")
        ),
        "district": _clean(
            location.get("district")
        ),
        "city": _clean(
            location.get("city")
        ),
        "address": _clean(
            location.get("address")
        ),
        "latitude": _clean_float(
            location.get("latitude")
        ),
        "longitude": _clean_float(
            location.get("longitude")
        ),
        "source_url": _clean(
            location.get("source_url")
        ),
        "verified": _clean_bool(
            location.get("verified")
        ),
    }


def get_all_partner_locations() -> list[dict[str, Any]]:
    """
    Return all normalized partner locations.
    """

    return [
        _normalize_location(location)
        for location in load_partner_locations()
    ]


def get_locations_by_partner_id(
    partner_id: str,
) -> list[dict[str, Any]]:
    """
    Return all physical/service locations belonging
    to a specific channel partner organization.
    """

    partner_id_normalized = partner_id.strip().lower()

    return [
        location
        for location in get_all_partner_locations()
        if location["partner_id"]
        and location["partner_id"].strip().lower()
        == partner_id_normalized
    ]


def get_location_by_id(
    location_id: str,
) -> dict[str, Any] | None:
    """
    Find a single partner location by location ID.
    """

    location_id_normalized = location_id.strip().lower()

    for location in get_all_partner_locations():
        if (
            location["location_id"]
            and location["location_id"].strip().lower()
            == location_id_normalized
        ):
            return location

    return None