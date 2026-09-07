import json
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]

RAW_FILE = (
    PROJECT_ROOT
    / "data"
    / "raw"
    / "partners"
    / "nsfdc_partners.json"
)

PROCESSED_DIR = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "partners"
)

PROCESSED_FILE = PROCESSED_DIR / "partners.json"

SOURCE_URL = "https://nsfdc.nic.in/our-channel-partners"


STATE_NAMES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Puducherry",
    "Jammu & Kashmir",
]


def clean(value: Any) -> str | None:
    if value is None:
        return None

    value = str(value).strip()

    return value if value else None


def derive_state(record: dict[str, Any]) -> str | None:
    """
    Use the explicit state field first.

    If state is missing, attempt to derive it from the address.
    This is only normalization, not external verification.
    """

    state = (
        clean(record.get("state"))
        or clean(record.get("state_name"))
    )

    if state:
        return state

    address = clean(
        record.get("address")
        or record.get("office_address")
    )

    if not address:
        return None

    address_lower = address.lower()

    # Longer / more specific names first.
    state_candidates = sorted(
        STATE_NAMES,
        key=len,
        reverse=True,
    )

    for candidate in state_candidates:
        if candidate.lower() in address_lower:
            return candidate

    return None


def normalize_partner(
    record: dict[str, Any],
    index: int,
) -> dict[str, Any]:

    partner_id = (
        clean(record.get("partner_id"))
        or clean(record.get("id"))
        or f"PARTNER-{index:03d}"
    )

    partner_name = (
        clean(record.get("partner_name"))
        or clean(record.get("name"))
        or clean(record.get("institution_name"))
    )

    partner_type = (
        clean(record.get("partner_type"))
        or clean(record.get("type"))
        or clean(record.get("category"))
    )

    address = (
        clean(record.get("address"))
        or clean(record.get("office_address"))
    )

    state = derive_state(record)

    source_url = (
        clean(record.get("source_url"))
        or SOURCE_URL
    )

    if not partner_name:
        raise ValueError(
            f"Partner {index} has no partner name."
        )

    if not partner_type:
        raise ValueError(
            f"Partner {partner_name} has no partner type."
        )

    return {
        "partner_id": partner_id,
        "partner_name": partner_name,
        "partner_type": partner_type,
        "state": state,
        "address": address,
        "source_url": source_url,
    }


def main() -> None:

    if not RAW_FILE.exists():
        raise FileNotFoundError(
            f"Raw partner file not found: {RAW_FILE}"
        )

    with RAW_FILE.open(
        "r",
        encoding="utf-8",
    ) as file:
        raw_partners = json.load(file)

    if not isinstance(raw_partners, list):
        raise ValueError(
            "Raw partner data must be a JSON list."
        )

    normalized_partners = [
        normalize_partner(
            record,
            index,
        )
        for index, record in enumerate(
            raw_partners,
            start=1,
        )
    ]

    # Check duplicate IDs.
    partner_ids = [
        partner["partner_id"]
        for partner in normalized_partners
    ]

    if len(partner_ids) != len(set(partner_ids)):
        raise ValueError(
            "Duplicate partner IDs detected."
        )

    PROCESSED_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    with PROCESSED_FILE.open(
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            normalized_partners,
            file,
            indent=2,
            ensure_ascii=False,
        )

    states_found = sum(
        partner["state"] is not None
        for partner in normalized_partners
    )

    print(
        f"Normalized {len(normalized_partners)} partners."
    )

    print(
        f"Partners with state: "
        f"{states_found}/{len(normalized_partners)}"
    )

    print(
        f"Output: {PROCESSED_FILE}"
    )


if __name__ == "__main__":
    main()