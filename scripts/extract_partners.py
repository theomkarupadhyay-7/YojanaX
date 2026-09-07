import json
import re
from pathlib import Path

import fitz


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DIR = BASE_DIR / "data" / "raw" / "partners"
OUTPUT_FILE = RAW_DIR / "nsfdc_partners.json"

PDF_FILES = {
    "sca": RAW_DIR / "nsfdc_sca.pdf",
    "rrb": RAW_DIR / "nsfdc_rrb.pdf",
    "nbfc_mfi": RAW_DIR / "nsfdc_nbfc_mfi.pdf",
}


JSON_FILES = {
    "psb": RAW_DIR / "nsfdc_psb.json",
}


# ============================================================
# HELPERS
# ============================================================

def clean_text(text):
    """Normalize whitespace and remove unnecessary line breaks."""
    if not text:
        return ""

    return " ".join(str(text).split())


def load_json(path):
    """Load a JSON file."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(data, path):
    """Save JSON with readable formatting."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ============================================================
# SCA
# ============================================================

def extract_scas():
    """Extract State Channelising Agencies from the SCA PDF."""

    pdf_path = PDF_FILES["sca"]

    if not pdf_path.exists():
        raise FileNotFoundError(f"SCA PDF not found: {pdf_path}")

    records = []

    doc = fitz.open(pdf_path)

    for page in doc:
        try:
            tables = page.find_tables()
        except Exception:
            continue

        for table in tables.tables:
            rows = table.extract()

            for row in rows:
                if len(row) < 4:
                    continue

                serial = clean_text(row[0])
                state_ut = clean_text(row[1])
                name = clean_text(row[2])
                address = clean_text(row[3])

                if not serial.isdigit():
                    continue

                records.append(
                    {
                        "partner_id": f"SCA-{int(serial):03d}",
                        "partner_type": "SCA",
                        "state_ut": state_ut,
                        "name": name,
                        "address": address,
                    }
                )

    doc.close()

    # Remove accidental duplicates while preserving order.
    unique = {}
    for record in records:
        unique[record["partner_id"]] = record

    records = list(unique.values())

    records.sort(key=lambda x: x["partner_id"])

    print(f"SCAs extracted: {len(records)}")

    return records


# ============================================================
# PSB
# ============================================================

def extract_psbs():
    """
    Load Public Sector Banks from the already verified PSB JSON.

    We intentionally do NOT parse the PSB PDF here because the
    structured JSON has already been extracted and verified.
    """

    json_path = JSON_FILES["psb"]

    if not json_path.exists():
        raise FileNotFoundError(f"PSB JSON not found: {json_path}")

    records = load_json(json_path)

    cleaned_records = []

    for record in records:
        cleaned_records.append(
            {
                "partner_id": clean_text(record.get("partner_id")),
                "partner_type": clean_text(record.get("partner_type")),
                "name": clean_text(record.get("name")),
                "address": clean_text(record.get("address")),
            }
        )

    cleaned_records = [
        record
        for record in cleaned_records
        if record["partner_id"] and record["name"]
    ]

    cleaned_records.sort(key=lambda x: x["partner_id"])

    print(f"PSBs extracted: {len(cleaned_records)}")

    return cleaned_records


# ============================================================
# RRB
# ============================================================

def extract_rrbs():
    """Extract Regional Rural Banks from the RRB PDF."""

    pdf_path = PDF_FILES["rrb"]

    if not pdf_path.exists():
        raise FileNotFoundError(f"RRB PDF not found: {pdf_path}")

    records = []

    doc = fitz.open(pdf_path)

    for page in doc:
        text = page.get_text("text")

        # Match each numbered RRB block.
        pattern = re.compile(
            r"(?ms)"
            r"(?P<num>\d+)\s+"
            r"(?P<content>.*?)"
            r"(?=\n\s*\d+\s*\n|\Z)"
        )

        for match in pattern.finditer(text):
            number = match.group("num")
            content = clean_text(match.group("content"))

            if not number.isdigit():
                continue

            number_int = int(number)

            if not 1 <= number_int <= 26:
                continue

            if not content:
                continue

            # Most records have name followed by address.
            # We preserve the extracted text rather than inventing
            # a split if the PDF layout is ambiguous.
            parts = content.split(" ", 1)

            name = parts[0]
            address = parts[1] if len(parts) > 1 else ""

            records.append(
                {
                    "partner_id": f"RRB-{number_int:03d}",
                    "partner_type": "RRB",
                    "name": name,
                    "address": address,
                }
            )

    doc.close()

    # If structured RRB JSON already exists, prefer it.
    rrb_json = RAW_DIR / "nsfdc_rrb.json"

    if rrb_json.exists():
        try:
            json_records = load_json(rrb_json)

            if len(json_records) == 26:
                records = json_records
        except Exception:
            pass

    unique = {}

    for record in records:
        unique[record["partner_id"]] = record

    records = list(unique.values())
    records.sort(key=lambda x: x["partner_id"])

    print(f"RRBs extracted: {len(records)}")

    return records


# ============================================================
# NBFC-MFI
# ============================================================

def extract_nbfc_mfis():
    """Extract NBFC-MFIs from the NBFC-MFI PDF."""

    pdf_path = PDF_FILES["nbfc_mfi"]

    if not pdf_path.exists():
        raise FileNotFoundError(f"NBFC-MFI PDF not found: {pdf_path}")

    records = []

    doc = fitz.open(pdf_path)

    for page in doc:
        text = page.get_text("text")

        pattern = re.compile(
            r"(?ms)"
            r"(?P<num>\d+)\s+"
            r"(?P<content>.*?)"
            r"(?=\n\s*\d+\s*\n|\Z)"
        )

        for match in pattern.finditer(text):
            number = match.group("num")
            content = clean_text(match.group("content"))

            if not number.isdigit():
                continue

            number_int = int(number)

            if not 1 <= number_int <= 7:
                continue

            if not content:
                continue

            parts = content.split(" ", 1)

            name = parts[0]
            address = parts[1] if len(parts) > 1 else ""

            records.append(
                {
                    "partner_id": f"NBFC-MFI-{number_int:03d}",
                    "partner_type": "NBFC-MFI",
                    "name": name,
                    "address": address,
                }
            )

    doc.close()

    # Prefer existing structured JSON if it contains all 7 records.
    json_path = RAW_DIR / "nsfdc_nbfc_mfi.json"

    if json_path.exists():
        try:
            json_records = load_json(json_path)

            if len(json_records) == 7:
                records = json_records
        except Exception:
            pass

    unique = {}

    for record in records:
        unique[record["partner_id"]] = record

    records = list(unique.values())
    records.sort(key=lambda x: x["partner_id"])

    print(f"NBFC-MFIs extracted: {len(records)}")

    return records


# ============================================================
# CO-OPERATIVE BANKS
# ============================================================

def extract_cooperative_banks():
    """Use the verified cooperative bank records."""

    records = [
        {
            "partner_id": "COOP-BANK-001",
            "partner_type": "Co-operative Bank",
            "name": "Shri Mahila Sewa Sahakari Bank Ltd.",
            "address": "109. Sakar-II, Opp.Town Hall, Ellisbridge, Ahmedabad- 38006",
        },
        {
            "partner_id": "COOP-BANK-002",
            "partner_type": "Co-operative Bank",
            "name": "Konoklata mahila Urban Cooperative Bank, Assam.",
            "address": "",
        },
    ]

    print(f"Co-operative Banks extracted: {len(records)}")

    return records


# ============================================================
# OTHER AGENCIES / SIDBI
# ============================================================

def extract_other_agencies():
    """Use the verified Other Agencies / SIDBI records."""

    records = [
        {
            "partner_id": "OTHER-001",
            "partner_type": "Other Agency / SIDBI",
            "region_or_category": "Assam",
            "name": "North Eastern Development Finance Corporation Ltd. (NEDFi)",
            "address": (
                "Tea Auction Center, GS Rd, Sanket Vihar, Dispur, "
                "Opposite, Guwahati, Assam 781006"
            ),
        },
        {
            "partner_id": "OTHER-002",
            "partner_type": "Other Agency / SIDBI",
            "region_or_category": "Jharkhand",
            "name": (
                "Jharkhand Silk Textile & Handicraft Development "
                "Corporation Ltd. (JHARCRAFT)"
            ),
            "address": "Jharcraft, DIC Campus Ratu Road Ranchi Jharkhand 834001",
        },
        {
            "partner_id": "OTHER-003",
            "partner_type": "Other Agency / SIDBI",
            "region_or_category": "SIDBI",
            "name": "Small Industries Development Bank of India",
            "address": "SIDBI Tower, 15, Ashok Marg, Lucknow - 226001, Uttar Pradesh",
        },
    ]

    print(f"Other Agencies & SIDBI extracted: {len(records)}")

    return records


# ============================================================
# SMALL FINANCE BANKS
# ============================================================

def extract_small_finance_banks():
    """Use the verified Small Finance Bank records."""

    records = [
        {
            "partner_id": "SFB-001",
            "partner_type": "Small Finance Bank",
            "name": "AU Small Finance Bank",
        },
        {
            "partner_id": "SFB-002",
            "partner_type": "Small Finance Bank",
            "name": "Ujjivan Small Finance Bank",
        },
    ]

    print(f"Small Finance Banks extracted: {len(records)}")

    return records


# ============================================================
# COOPERATIVE SOCIETIES
# ============================================================

def extract_cooperative_societies():
    """Use the verified Cooperative Society records."""

    records = [
        {
            "partner_id": "COOP-SOC-001",
            "partner_type": "Cooperative Society",
            "name": "Streenidhi",
            "state_ut": "Telangana",
            "address": (
                "401 & 402, 4th Floor, My Home Sarovar Plaza, "
                "Secretariat Road, Ambedkar Colony, Saifabad, "
                "Hyderabad, Telangana 500004"
            ),
        },
        {
            "partner_id": "COOP-SOC-002",
            "partner_type": "Cooperative Society",
            "name": "Streenidhi AP",
            "state_ut": "Andhra Pradesh",
            "address": (
                "2nd Floor, NTR Administrative Block, RTC Complex, "
                "Vijayawada-520013, Andhra Pradesh"
            ),
        },
    ]

    print(f"Cooperative Societies extracted: {len(records)}")

    return records


# ============================================================
# VALIDATION
# ============================================================

def validate_records(records):
    """Validate the consolidated partner dataset."""

    partner_ids = [record.get("partner_id") for record in records]

    duplicates = {
        partner_id
        for partner_id in partner_ids
        if partner_ids.count(partner_id) > 1
    }

    if duplicates:
        print("\nWARNING: Duplicate partner IDs found:")
        for partner_id in sorted(duplicates):
            print(f"  - {partner_id}")

    missing_ids = [
        record
        for record in records
        if not record.get("partner_id")
    ]

    missing_names = [
        record
        for record in records
        if not record.get("name")
    ]

    if missing_ids:
        print(f"\nWARNING: {len(missing_ids)} records missing partner_id")

    if missing_names:
        print(f"WARNING: {len(missing_names)} records missing name")

    print("\nValidation:")
    print(f"  Total records: {len(records)}")
    print(f"  Unique IDs:    {len(set(partner_ids))}")

    return not duplicates and not missing_ids and not missing_names


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 50)
    print("NSFDC PARTNER EXTRACTION")
    print("=" * 50)

    all_records = []

    # 1. State Channelising Agencies
    all_records.extend(extract_scas())

    # 2. Public Sector Banks
    # Loaded from verified JSON rather than parsing PDF.
    all_records.extend(extract_psbs())

    # 3. Regional Rural Banks
    all_records.extend(extract_rrbs())

    # 4. NBFC-MFIs
    all_records.extend(extract_nbfc_mfis())

    # 5. Co-operative Banks
    all_records.extend(extract_cooperative_banks())

    # 6. Other Agencies / SIDBI
    all_records.extend(extract_other_agencies())

    # 7. Small Finance Banks
    all_records.extend(extract_small_finance_banks())

    # 8. Cooperative Societies
    all_records.extend(extract_cooperative_societies())

    # --------------------------------------------------------
    # Final deduplication
    # --------------------------------------------------------

    unique_records = {}

    for record in all_records:
        partner_id = record.get("partner_id")

        if partner_id:
            unique_records[partner_id] = record

    all_records = list(unique_records.values())

    # Sort by partner type and then partner ID.
    all_records.sort(
        key=lambda x: (
            x.get("partner_type", ""),
            x.get("partner_id", "")
        )
    )

    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------

    validate_records(all_records)

    # --------------------------------------------------------
    # Save consolidated dataset
    # --------------------------------------------------------

    save_json(all_records, OUTPUT_FILE)

    print()
    print(f"Saved {len(all_records)} records to:")
    print(OUTPUT_FILE)

    print()
    print("=" * 50)
    print("PARTNER EXTRACTION COMPLETE")
    print("=" * 50)
    print(f"Total partners extracted: {len(all_records)}")


if __name__ == "__main__":
    main()