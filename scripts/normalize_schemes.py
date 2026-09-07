import json
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

RAW_FILE = BASE_DIR / "data" / "raw" / "schemes" / "schemes.json"
OUTPUT_DIR = BASE_DIR / "data" / "processed" / "schemes"
OUTPUT_FILE = OUTPUT_DIR / "schemes.json"


# ============================================================
# CONSTANTS
# ============================================================

SOURCE_ORGANIZATION = "NSFDC"
SOURCE_NAME = "NSFDC Loans / Credit Schemes"
SOURCE_URL = "https://nsfdc.nic.in/scheme"
RETRIEVED_AT = "2026-09-04"


# ============================================================
# HELPERS
# ============================================================

def load_json(path: Path):
    if not path.exists():
        raise FileNotFoundError(
            f"Could not find input file:\n{path}\n\n"
            "Make sure your raw scheme JSON exists at:\n"
            "data/raw/schemes/schemes.json"
        )

    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)

    print(f"Saved normalized schemes to:\n{path}")


def clean_text(value):
    if value is None:
        return ""

    if not isinstance(value, str):
        return value

    return " ".join(value.split())


# ============================================================
# CANONICAL SCHEME DATA
# ============================================================
#
# IMPORTANT:
# These values are based only on the verified NSFDC data
# collected for the current seed dataset.
#
# We intentionally do NOT invent:
# - caste/category rules beyond verified data
# - document requirements
# - partner mappings where not explicitly verified
# - business activity restrictions
# - hidden eligibility conditions
#
# Those will be added only after verification.
# ============================================================

NORMALIZED_SCHEMES = [
    {
        "scheme_id": "MFS",
        "scheme_name": "Micro Finance Scheme",

        "scheme_category": "credit",
        "target_type": "entrepreneur",

        "project_cost": {
            "min_inr": 0,
            "max_inr": 140000
        },

        "loan_amount": {
            "max_percentage": 90,
            "max_inr": 125000
        },

        "interest_rate": {
            "type": "fixed",
            "value_percent": 6.5
        },

        "repayment": {
            "period_years": 3,
            "moratorium_months": 3,
            "installment_frequency": "quarterly"
        },

        "channel_partner_types": [],

        "eligibility": {
            "sc_required": True,
            "annual_family_income_max_inr": 500000,
            "income_criterion_applies": True,
            "notes": []
        },

        "documents": [],

        "application_process": {
            "direct_application_to_nsfdc": False,
            "channel_partner_required": True
        },

        "provenance": {
            "organization": SOURCE_ORGANIZATION,
            "source_name": SOURCE_NAME,
            "source_url": SOURCE_URL,
            "retrieved_at": RETRIEVED_AT,
            "verification_status": "verified_seed"
        }
    },

    {
        "scheme_id": "TERM_LOAN",
        "scheme_name": "Term Loan",

        "scheme_category": "credit",
        "target_type": "entrepreneur",

        "project_cost": {
            "min_inr_exclusive": 140000,
            "max_inr": 5000000
        },

        "loan_amount": {
            "max_percentage": 90,
            "max_inr": 4500000
        },

        "interest_rate": {
            "type": "fixed",
            "value_percent": 8.0
        },

        "repayment": {
            "period_years": 7,
            "moratorium_months": 6,
            "special_moratorium": {
                "plantation_or_construction_months": 12
            },
            "installment_frequency": "quarterly"
        },

        "channel_partner_types": [],

        "eligibility": {
            "sc_required": True,
            "annual_family_income_max_inr": 500000,
            "income_criterion_applies": True,
            "notes": []
        },

        "documents": [],

        "application_process": {
            "direct_application_to_nsfdc": False,
            "channel_partner_required": True
        },

        "provenance": {
            "organization": SOURCE_ORGANIZATION,
            "source_name": SOURCE_NAME,
            "source_url": SOURCE_URL,
            "retrieved_at": RETRIEVED_AT,
            "verification_status": "verified_seed"
        }
    },

    {
        "scheme_id": "AMY",
        "scheme_name": "Aajeevika Micro-Finance Yojana",

        "scheme_category": "credit",
        "target_type": "entrepreneur",

        "project_cost": {
            "min_inr": 0,
            "max_inr": 140000
        },

        "loan_amount": {
            "max_percentage": 90,
            "max_inr": 125000
        },

        "interest_rate": {
            "type": "fixed",
            "value_percent": 15.0
        },

        "repayment": {
            "period_years": 3,
            "moratorium_months": 3,
            "installment_frequency": "quarterly"
        },

        "channel_partner_types": [
            "NBFC-MFI"
        ],

        "eligibility": {
            "sc_required": True,
            "annual_family_income_max_inr": 500000,
            "income_criterion_applies": True,
            "notes": []
        },

        "documents": [],

        "application_process": {
            "direct_application_to_nsfdc": False,
            "channel_partner_required": True
        },

        "provenance": {
            "organization": SOURCE_ORGANIZATION,
            "source_name": SOURCE_NAME,
            "source_url": SOURCE_URL,
            "retrieved_at": RETRIEVED_AT,
            "verification_status": "verified_seed"
        }
    },

    {
        "scheme_id": "UNY",
        "scheme_name": "Udyam Nidhi Yojana",

        "scheme_category": "credit",
        "target_type": "entrepreneur",

        "project_cost": {
            "min_inr": 0,
            "max_inr": 500000
        },

        "loan_amount": {
            "max_inr": 450000
        },

        "interest_rate": {
            "type": "partner_dependent",
            "rates": [
                {
                    "channel_partner_type": "Co-operative Bank",
                    "value_percent": 13.0
                },
                {
                    "channel_partner_type": "Cooperative Society",
                    "value_percent": 13.0
                },
                {
                    "channel_partner_type": "Small Finance Bank",
                    "value_percent": 15.0
                }
            ]
        },

        "repayment": {
            "period_years": 5,
            "moratorium_months": 3,
            "installment_frequency": [
                "quarterly",
                "half_yearly"
            ]
        },

        "channel_partner_types": [
            "Co-operative Bank",
            "Cooperative Society",
            "Small Finance Bank"
        ],

        "eligibility": {
            "sc_required": True,
            "annual_family_income_max_inr": 500000,
            "income_criterion_applies": True,
            "notes": []
        },

        "documents": [],

        "application_process": {
            "direct_application_to_nsfdc": False,
            "channel_partner_required": True
        },

        "provenance": {
            "organization": SOURCE_ORGANIZATION,
            "source_name": SOURCE_NAME,
            "source_url": SOURCE_URL,
            "retrieved_at": RETRIEVED_AT,
            "verification_status": "verified_seed"
        }
    },

    {
        "scheme_id": "ELS",
        "scheme_name": "Educational Loan Scheme",

        "scheme_category": "education_loan",
        "target_type": "student",

        "project_cost": {
            "max_percentage_of_course_fee": 90,
            "max_inr": 4000000
        },

        "loan_amount": {
            "max_percentage": 90,
            "max_inr": 4000000
        },

        "interest_rate": {
            "type": "fixed",
            "value_percent": 6.5
        },

        "repayment": {
            "period_years_min": 10,
            "period_years_max": 12,
            "moratorium_description": (
                "Course duration + 1 year; "
                "or up to 6 months where repayment has started"
            )
        },

        "channel_partner_types": [],

        "eligibility": {
            "sc_required": True,
            "annual_family_income_max_inr": 500000,
            "income_criterion_applies": True,
            "notes": [
                "Recognized professional/technical courses"
            ]
        },

        "documents": [],

        "application_process": {
            "direct_application_to_nsfdc": False,
            "channel_partner_required": True
        },

        "provenance": {
            "organization": SOURCE_ORGANIZATION,
            "source_name": SOURCE_NAME,
            "source_url": SOURCE_URL,
            "retrieved_at": RETRIEVED_AT,
            "verification_status": "verified_seed"
        }
    }
]


# ============================================================
# VALIDATION
# ============================================================

def validate_scheme(scheme):
    required_fields = [
        "scheme_id",
        "scheme_name",
        "scheme_category",
        "target_type",
        "provenance"
    ]

    for field in required_fields:
        if field not in scheme:
            raise ValueError(
                f"Scheme {scheme.get('scheme_id', '<unknown>')} "
                f"is missing required field: {field}"
            )

    if not scheme["scheme_id"].strip():
        raise ValueError("Scheme ID cannot be empty.")

    if not scheme["scheme_name"].strip():
        raise ValueError(
            f"Scheme {scheme['scheme_id']} has an empty name."
        )

    provenance = scheme["provenance"]

    required_provenance = [
        "organization",
        "source_name",
        "source_url",
        "retrieved_at",
        "verification_status"
    ]

    for field in required_provenance:
        if field not in provenance:
            raise ValueError(
                f"{scheme['scheme_id']} provenance is missing: {field}"
            )


def validate_all_schemes(schemes):
    ids = [scheme["scheme_id"] for scheme in schemes]

    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate scheme IDs detected.")

    for scheme in schemes:
        validate_scheme(scheme)


# ============================================================
# OPTIONAL RAW-SOURCE CHECK
# ============================================================
#
# We don't transform the raw JSON automatically because its
# exact structure may evolve during data collection.
#
# Instead, this check confirms that the expected five schemes
# exist somewhere in the raw source.
# ============================================================

EXPECTED_SCHEME_NAMES = {
    "Micro Finance Scheme",
    "Term Loan",
    "Aajeevika Micro-Finance Yojana",
    "Udyam Nidhi Yojana",
    "Educational Loan Scheme"
}


def extract_names_from_raw(raw_data):
    names = set()

    if isinstance(raw_data, list):
        records = raw_data

    elif isinstance(raw_data, dict):
        possible_records = (
            raw_data.get("schemes")
            or raw_data.get("data")
            or raw_data.get("records")
        )

        if isinstance(possible_records, list):
            records = possible_records
        else:
            records = [raw_data]

    else:
        records = []

    for record in records:
        if not isinstance(record, dict):
            continue

        possible_name = (
            record.get("scheme_name")
            or record.get("name")
            or record.get("title")
        )

        if possible_name:
            names.add(clean_text(possible_name))

    return names


def check_raw_source():
    if not RAW_FILE.exists():
        print()
        print("WARNING:")
        print(f"Raw source not found at:\n{RAW_FILE}")
        print(
            "The normalized seed dataset will still be generated "
            "from the verified records."
        )
        return

    raw_data = load_json(RAW_FILE)
    raw_names = extract_names_from_raw(raw_data)

    if not raw_names:
        print()
        print(
            "WARNING: Could not detect scheme names in the raw JSON."
        )
        print(
            "No automatic comparison was performed."
        )
        return

    missing = EXPECTED_SCHEME_NAMES - raw_names

    if missing:
        print()
        print("WARNING: These expected schemes were not detected")
        print("in the raw JSON:")
        for name in sorted(missing):
            print(f"  - {name}")
    else:
        print("Raw source check: OK")
        print("All 5 expected scheme names were found.")


# ============================================================
# MAIN
# ============================================================

def main():
    print("=" * 60)
    print("NSFDC SCHEME NORMALIZATION")
    print("=" * 60)

    check_raw_source()

    validate_all_schemes(NORMALIZED_SCHEMES)

    save_json(
        OUTPUT_FILE,
        NORMALIZED_SCHEMES
    )

    print()
    print("Validation:")
    print(f"  Total schemes: {len(NORMALIZED_SCHEMES)}")
    print(
        f"  Unique IDs:    "
        f"{len(set(s['scheme_id'] for s in NORMALIZED_SCHEMES))}"
    )

    print()
    print("Schemes:")
    for scheme in NORMALIZED_SCHEMES:
        print(
            f"  {scheme['scheme_id']:<12} "
            f"{scheme['scheme_name']}"
        )

    print()
    print("=" * 60)
    print("SCHEME NORMALIZATION COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()