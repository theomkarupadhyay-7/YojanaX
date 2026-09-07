#!/usr/bin/env python3
"""
Strict one-time geocoding helper for SchemeSetu SIH26092.

Purpose
-------
Geocode the verified partner-location addresses in:
    data/processed/partners/partner_locations.json

This version is intentionally conservative.

IMPORTANT:
- Previous automatically generated coordinates may have been false positives
  (schools, hospitals, bus stands, generic localities, etc.).
- This script treats coordinates without explicit coordinate_source metadata
  as untrusted and clears them before rebuilding.
- A result is accepted only when it has strong evidence that the returned OSM
  object is the actual partner branch/office, not merely the surrounding area.
- Generic locality matches are NEVER accepted as branch coordinates.
- Nominatim public API is rate-limited to <= 1 request/second. This script
  runs sequentially and waits 1.2 seconds between requests.

The script is designed for a small, one-time dataset and caches accepted
results in the JSON file.
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any, Optional

import requests


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[1]
LOCATIONS_FILE = (
    PROJECT_ROOT / "data" / "processed" / "partners" / "partner_locations.json"
)
PARTNERS_FILE = (
    PROJECT_ROOT / "data" / "processed" / "partners" / "partners.json"
)
REPORT_FILE = (
    PROJECT_ROOT / "data" / "processed" / "partners" / "geocoding_report.json"
)


# ---------------------------------------------------------------------------
# Nominatim configuration
# ---------------------------------------------------------------------------

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Nominatim requires an identifying User-Agent and limits public usage to
# a maximum of 1 request/second. We deliberately stay below that limit.
REQUEST_DELAY_SECONDS = 1.2
REQUEST_TIMEOUT_SECONDS = 15

# Keep the result set small. We are looking for a specific branch, not
# performing a general place search.
RESULT_LIMIT = 8

NOMINATIM_EMAIL = os.getenv("NOMINATIM_EMAIL", "").strip()

USER_AGENT = (
    "SchemeSetu-SIH26092/1.0 "
    "(one-time partner branch geocoding; contact via configured email)"
)


# ---------------------------------------------------------------------------
# Matching configuration
# ---------------------------------------------------------------------------

# Exact postcode is the strongest address anchor available in this dataset.
POSTCODE_RE = re.compile(r"\b([1-9][0-9]{5})\b")

# Words that identify a real business/branch/office rather than a locality.
BRANCH_TERMS = {
    "branch",
    "bank",
    "office",
    "service branch",
    "regional office",
    "main office",
    "head office",
}

# Generic OSM result types which must never be accepted as a branch.
REJECT_TYPES = {
    "city",
    "town",
    "village",
    "suburb",
    "neighbourhood",
    "quarter",
    "hamlet",
    "locality",
    "administrative",
    "residential",
    "road",
    "street",
    "house",
    "school",
    "hospital",
    "bus_stop",
    "station",
    "place_of_worship",
    "restaurant",
    "cafe",
    "parking",
    "mall",
    "supermarket",
    "shop",
}

# Strongly preferred OSM classifications for actual offices/banks.
BANK_LIKE_CLASSES = {
    "amenity",
    "office",
    "building",
    "commercial",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def normalize(text: Any) -> str:
    """Normalize text for conservative token matching."""
    if text is None:
        return ""

    value = str(text).lower()
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def compact(text: Any) -> str:
    """Normalized text with spaces removed for loose brand matching."""
    return normalize(text).replace(" ", "")


def extract_postcode(text: Any) -> Optional[str]:
    match = POSTCODE_RE.search(str(text or ""))
    return match.group(1) if match else None


def extract_expected_postcode(location: dict[str, Any]) -> Optional[str]:
    """
    Extract the expected PIN code from the official source address.
    """
    return extract_postcode(location.get("address", ""))


def infer_partner_name(
    location: dict[str, Any],
    partners_by_id: dict[str, dict[str, Any]],
) -> str:
    """
    Resolve the parent partner name from partners.json.

    Falls back to known partner IDs used by this MVP dataset.
    """
    partner_id = str(location.get("partner_id", "")).strip()

    parent = partners_by_id.get(partner_id)
    if parent:
        name = parent.get("partner_name") or parent.get("name")
        if name:
            return str(name)

    if partner_id.startswith("RRB-002"):
        return "Maharashtra Gramin Bank"

    if partner_id.startswith("PSB-008"):
        return "Bank of Maharashtra"

    return ""


def get_branch_name(location: dict[str, Any]) -> str:
    return str(location.get("location_name") or "").strip()


def get_city_hint(location: dict[str, Any]) -> str:
    for key in ("city", "district", "state"):
        value = str(location.get(key) or "").strip()
        if value:
            return value
    return ""


def expected_brand_tokens(partner_name: str) -> set[str]:
    """
    Return meaningful brand tokens.

    Very short/common tokens such as "bank" are intentionally excluded.
    """
    tokens = set(normalize(partner_name).split())

    return {
        token
        for token in tokens
        if len(token) >= 4 and token not in {"bank", "the", "of"}
    }


def candidate_text(result: dict[str, Any]) -> str:
    """
    Combine all useful OSM naming/address fields into one normalized string.
    """
    address = result.get("address") or {}

    values = [
        result.get("display_name"),
        result.get("name"),
        result.get("type"),
        result.get("class"),
        result.get("category"),
        address.get("amenity"),
        address.get("building"),
        address.get("office"),
        address.get("shop"),
        address.get("road"),
        address.get("street"),
        address.get("suburb"),
        address.get("city"),
        address.get("town"),
        address.get("village"),
        address.get("county"),
        address.get("state_district"),
        address.get("state"),
        address.get("postcode"),
    ]

    return normalize(" ".join(str(v) for v in values if v))


def result_postcode(result: dict[str, Any]) -> Optional[str]:
    address = result.get("address") or {}

    # Prefer structured OSM postcode.
    postcode = extract_postcode(address.get("postcode"))
    if postcode:
        return postcode

    return extract_postcode(result.get("display_name", ""))


def result_type(result: dict[str, Any]) -> str:
    return normalize(
        result.get("type")
        or result.get("category")
        or result.get("class")
        or ""
    )


def has_rejected_type(result: dict[str, Any]) -> bool:
    """
    Reject obvious non-branch objects.
    """
    rtype = result_type(result)

    if rtype in REJECT_TYPES:
        return True

    # Administrative/place results are especially dangerous because they can
    # look like an exact locality match.
    result_class = normalize(result.get("class") or "")
    if result_class == "place":
        return True

    if result_class == "boundary":
        return True

    return False


def has_branch_like_type(result: dict[str, Any]) -> bool:
    rtype = result_type(result)
    rclass = normalize(result.get("class") or "")

    if rtype in {"bank", "branch", "office"}:
        return True

    if rclass in BANK_LIKE_CLASSES and any(
        term in candidate_text(result) for term in BRANCH_TERMS
    ):
        return True

    return False


def brand_match_strength(
    result: dict[str, Any],
    partner_name: str,
) -> int:
    """
    Score how strongly the returned object identifies the expected partner.

    0 = no evidence
    1 = one meaningful partner token
    2 = multiple meaningful partner tokens
    3 = explicit full partner name / strong exact match
    """
    text = candidate_text(result)
    compact_text = compact(text)

    partner_normalized = normalize(partner_name)
    partner_compact = compact(partner_name)

    if partner_normalized and partner_normalized in text:
        return 3

    if partner_compact and partner_compact in compact_text:
        return 3

    tokens = expected_brand_tokens(partner_name)
    matches = sum(1 for token in tokens if token in text.split())

    if matches >= 2:
        return 2

    if matches == 1:
        return 1

    return 0


def branch_name_match_strength(
    result: dict[str, Any],
    branch_name: str,
) -> int:
    """
    Compare the location/branch name with OSM text.

    We deliberately avoid accepting generic names like "Mahal" or "Ghansoli"
    by themselves. A branch-name match becomes useful only alongside partner
    evidence and an exact postcode.
    """
    if not branch_name:
        return 0

    text = candidate_text(result)
    branch = normalize(branch_name)

    if not branch:
        return 0

    if branch in text:
        return 3

    branch_tokens = [
        token
        for token in branch.split()
        if len(token) >= 4
        and token
        not in {
            "branch",
            "service",
            "road",
            "branch",
            "branch",
        }
    ]

    if not branch_tokens:
        return 0

    matched = sum(1 for token in branch_tokens if token in text.split())

    if matched >= max(2, len(branch_tokens) // 2):
        return 2

    if matched == 1:
        return 1

    return 0


def address_anchor_match(
    result: dict[str, Any],
    location: dict[str, Any],
) -> int:
    """
    Check whether useful address anchors from the official source address
    appear in the candidate.

    This is supplementary evidence, not a substitute for partner identity.
    """
    source_address = normalize(location.get("address", ""))
    candidate = candidate_text(result)

    if not source_address:
        return 0

    # Extract distinctive chunks from the official address.
    chunks = [
        chunk.strip()
        for chunk in re.split(r",|-", source_address)
        if len(chunk.strip()) >= 5
    ]

    strong_matches = 0

    for chunk in chunks:
        words = [
            word
            for word in chunk.split()
            if len(word) >= 5
            and word not in {
                "maharashtra",
                "district",
                "taluka",
                "near",
                "road",
                "main",
            }
        ]

        if not words:
            continue

        matched_words = sum(1 for word in words if word in candidate.split())

        if matched_words >= 2:
            strong_matches += 1

    if strong_matches >= 2:
        return 2

    if strong_matches == 1:
        return 1

    return 0


def evaluate_candidate(
    result: dict[str, Any],
    location: dict[str, Any],
    partner_name: str,
) -> tuple[bool, int, list[str]]:
    """
    Conservative branch acceptance.

    Required:
      1. exact expected postcode
      2. no obvious locality/non-business result
      3. actual branch/business-like object
      4. strong partner identity OR strong branch+address evidence

    The key rule is that postcode + locality alone is NEVER enough.
    """
    reasons: list[str] = []

    expected_postcode = extract_expected_postcode(location)
    actual_postcode = result_postcode(result)

    if expected_postcode:
        if actual_postcode != expected_postcode:
            reasons.append(
                f"postcode mismatch: expected {expected_postcode}, "
                f"got {actual_postcode or 'none'}"
            )
            return False, 0, reasons
    else:
        reasons.append("source address has no usable postcode")

    if has_rejected_type(result):
        reasons.append(
            f"rejected generic/non-branch OSM type: {result_type(result) or 'unknown'}"
        )
        return False, 0, reasons

    branch_like = has_branch_like_type(result)

    brand_strength = brand_match_strength(result, partner_name)
    branch_strength = branch_name_match_strength(
        result,
        get_branch_name(location),
    )
    address_strength = address_anchor_match(result, location)

    score = 0

    if actual_postcode == expected_postcode and expected_postcode:
        score += 30
        reasons.append("exact postcode match")

    if branch_like:
        score += 25
        reasons.append("branch/office/bank-like OSM object")

    if brand_strength == 3:
        score += 30
        reasons.append("strong partner-name match")
    elif brand_strength == 2:
        score += 20
        reasons.append("multiple partner-name token matches")
    elif brand_strength == 1:
        score += 8
        reasons.append("weak partner-name token match")
    else:
        reasons.append("no partner-name match")

    if branch_strength == 3:
        score += 20
        reasons.append("strong branch-name match")
    elif branch_strength == 2:
        score += 12
        reasons.append("partial branch-name match")
    elif branch_strength == 1:
        score += 5
        reasons.append("weak branch-name match")

    if address_strength == 2:
        score += 15
        reasons.append("strong official-address anchor match")
    elif address_strength == 1:
        score += 7
        reasons.append("partial official-address anchor match")

    # ------------------------------------------------------------------
    # Hard acceptance rules.
    # ------------------------------------------------------------------
    #
    # Case A: OSM explicitly identifies the expected partner and the object
    # is branch/office/bank-like.
    #
    # Case B: OSM has a branch-like object, exact postcode, and a strong
    # branch-name match plus at least some partner/address evidence.
    #
    # This prevents generic places such as:
    #   "Ghansoli"
    #   "Mahal"
    #   "Sitabuldi City Bus Stand"
    #   "Dr. Das Hospital"
    #   "SITS"
    # from being accepted.
    # ------------------------------------------------------------------

    partner_identified = brand_strength >= 2
    branch_identified = branch_strength >= 2

    case_a = (
        branch_like
        and partner_identified
        and actual_postcode == expected_postcode
    )

    case_b = (
        branch_like
        and actual_postcode == expected_postcode
        and branch_identified
        and (brand_strength >= 1 or address_strength >= 1)
    )

    accepted = case_a or case_b

    if not branch_like:
        reasons.append("candidate is not a bank/branch/office-like object")

    if not accepted:
        reasons.append(
            "not accepted: insufficient evidence that this is the actual partner branch"
        )

    return accepted, score, reasons


def build_queries(
    location: dict[str, Any],
    partner_name: str,
) -> list[str]:
    """
    Build at most two deliberate queries.

    Query 1: partner + full official address.
    Query 2: partner + branch name + city/district + postcode.

    We do NOT use locality-only searches because they produced false positives
    in the previous run.
    """
    address = str(location.get("address") or "").strip()
    branch_name = get_branch_name(location)
    city = get_city_hint(location)
    postcode = extract_expected_postcode(location)

    queries: list[str] = []

    if partner_name and address:
        queries.append(
            f"{partner_name}, {address}, India"
        )

    second_parts = [
        partner_name,
        branch_name,
        city,
        postcode or "",
        "India",
    ]
    second_query = ", ".join(
        part.strip()
        for part in second_parts
        if part and part.strip()
    )

    if second_query and second_query not in queries:
        queries.append(second_query)

    return queries[:2]


def build_headers() -> dict[str, str]:
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
    }

    # Referer is optional for Nominatim but useful as an additional
    # application identifier.
    headers["Referer"] = "https://github.com/theomkarupadhyay-7/infera-zenesys"

    return headers


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    temp_path = path.with_suffix(path.suffix + ".tmp")

    with temp_path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, ensure_ascii=False)

    temp_path.replace(path)


def load_locations() -> list[dict[str, Any]]:
    if not LOCATIONS_FILE.exists():
        raise FileNotFoundError(f"Locations file not found: {LOCATIONS_FILE}")

    data = load_json(LOCATIONS_FILE)

    if isinstance(data, dict) and "locations" in data:
        locations = data["locations"]
    elif isinstance(data, list):
        locations = data
    else:
        raise ValueError(
            "partner_locations.json must contain a list or an object with "
            "a 'locations' list."
        )

    if not isinstance(locations, list):
        raise ValueError("'locations' must be a list")

    return locations


def load_partners() -> dict[str, dict[str, Any]]:
    if not PARTNERS_FILE.exists():
        return {}

    data = load_json(PARTNERS_FILE)

    if isinstance(data, dict) and "partners" in data:
        items = data["partners"]
    elif isinstance(data, list):
        items = data
    else:
        return {}

    result: dict[str, dict[str, Any]] = {}

    for partner in items:
        if not isinstance(partner, dict):
            continue

        partner_id = str(partner.get("partner_id") or "").strip()

        if partner_id:
            result[partner_id] = partner

    return result


def clear_untrusted_coordinates(locations: list[dict[str, Any]]) -> int:
    """
    Clear coordinates produced without explicit provenance.

    Existing coordinates from the previous permissive script do not carry
    coordinate_source, so they are intentionally removed.
    """
    cleared = 0

    for location in locations:
        lat = location.get("latitude")
        lon = location.get("longitude")

        if lat is None and lon is None:
            continue

        source = str(location.get("coordinate_source") or "").strip()

        if not source:
            location["latitude"] = None
            location["longitude"] = None
            location.pop("coordinate_source", None)
            location.pop("coordinate_query", None)
            location.pop("coordinate_score", None)
            location.pop("coordinate_candidate", None)
            cleared += 1

    return cleared


def request_nominatim(
    session: requests.Session,
    query: str,
) -> tuple[Optional[list[dict[str, Any]]], Optional[str]]:
    """
    Make one Nominatim request.

    Returns:
        (results, error_message)
    """
    params = {
        "q": query,
        "format": "jsonv2",
        "addressdetails": 1,
        "namedetails": 1,
        "extratags": 1,
        "limit": RESULT_LIMIT,
        "countrycodes": "in",
        "layer": "address,poi",
    }

    if NOMINATIM_EMAIL:
        params["email"] = NOMINATIM_EMAIL

    try:
        response = session.get(
            NOMINATIM_URL,
            params=params,
            headers=build_headers(),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException as exc:
        return None, f"network error: {exc}"

    if response.status_code == 403:
        body = response.text[:1000].strip()
        return None, (
            "HTTP 403 from Nominatim. Stop immediately rather than retrying. "
            f"Response: {body}"
        )

    if response.status_code == 429:
        return None, "HTTP 429 rate limited"

    if response.status_code >= 500:
        return None, f"HTTP {response.status_code} server error"

    if response.status_code != 200:
        return None, (
            f"HTTP {response.status_code}: "
            f"{response.text[:500].strip()}"
        )

    try:
        payload = response.json()
    except ValueError as exc:
        return None, f"invalid JSON response: {exc}"

    if not isinstance(payload, list):
        return None, "unexpected Nominatim response format"

    return payload, None


def select_candidate(
    results: list[dict[str, Any]],
    location: dict[str, Any],
    partner_name: str,
) -> tuple[
    Optional[dict[str, Any]],
    int,
    list[str],
]:
    """
    Evaluate all returned candidates and select the strongest acceptable one.
    """
    accepted_candidates: list[
        tuple[int, int, dict[str, Any], list[str]]
    ] = []

    all_rejection_reasons: list[str] = []

    for index, result in enumerate(results, start=1):
        if not isinstance(result, dict):
            continue

        accepted, score, reasons = evaluate_candidate(
            result,
            location,
            partner_name,
        )

        if accepted:
            # Earlier candidates are preferred on equal score.
            accepted_candidates.append(
                (score, -index, result, reasons)
            )
        else:
            display = str(result.get("display_name") or "unknown candidate")
            all_rejection_reasons.append(
                f"candidate {index}: {display} -> {'; '.join(reasons)}"
            )

    if not accepted_candidates:
        return None, 0, all_rejection_reasons

    accepted_candidates.sort(
        key=lambda item: (item[0], item[1]),
        reverse=True,
    )

    score, _, candidate, reasons = accepted_candidates[0]

    return candidate, score, reasons


def process_location(
    session: requests.Session,
    location: dict[str, Any],
    partners_by_id: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    location_id = str(location.get("location_id") or "").strip()
    partner_name = infer_partner_name(location, partners_by_id)

    if not partner_name:
        return {
            "location_id": location_id,
            "status": "review",
            "reason": "parent partner name could not be resolved",
        }

    queries = build_queries(location, partner_name)

    if not queries:
        return {
            "location_id": location_id,
            "status": "review",
            "reason": "could not build a geocoding query",
        }

    report: dict[str, Any] = {
        "location_id": location_id,
        "location_name": location.get("location_name"),
        "partner_id": location.get("partner_id"),
        "partner_name": partner_name,
        "status": "review",
        "queries": queries,
        "candidates": [],
    }

    best_candidate: Optional[dict[str, Any]] = None
    best_score = 0
    best_reasons: list[str] = []

    for query_index, query in enumerate(queries, start=1):
        print(f"  Query {query_index}: {query}")

        results, error = request_nominatim(session, query)

        if error:
            print(f"  ERROR: {error}")

            report.setdefault("errors", []).append(error)

            # 403 is a hard stop.
            if "HTTP 403" in error:
                report["status"] = "stopped_403"
                return report

            # Temporary/network failure: try the next deliberately distinct
            # query only after the normal delay.
            if query_index < len(queries):
                time.sleep(REQUEST_DELAY_SECONDS)
                continue

            report["status"] = "review"
            report["reason"] = error
            return report

        assert results is not None

        for index, result in enumerate(results, start=1):
            if not isinstance(result, dict):
                continue

            accepted, score, reasons = evaluate_candidate(
                result,
                location,
                partner_name,
            )

            report["candidates"].append(
                {
                    "query_index": query_index,
                    "rank": index,
                    "display_name": result.get("display_name"),
                    "lat": result.get("lat"),
                    "lon": result.get("lon"),
                    "type": result.get("type"),
                    "class": result.get("class"),
                    "postcode": result_postcode(result),
                    "accepted": accepted,
                    "score": score,
                    "reasons": reasons,
                }
            )

            if accepted and score > best_score:
                best_candidate = result
                best_score = score
                best_reasons = reasons

        # If the first query produced a strong actual branch, do not make
        # another unnecessary public-API request.
        if best_candidate is not None:
            break

        if query_index < len(queries):
            time.sleep(REQUEST_DELAY_SECONDS)

    if best_candidate is None:
        report["status"] = "review"
        report["reason"] = (
            "No candidate passed the strict branch-identity checks. "
            "Coordinates remain null."
        )
        return report

    try:
        latitude = float(best_candidate["lat"])
        longitude = float(best_candidate["lon"])
    except (KeyError, TypeError, ValueError):
        report["status"] = "review"
        report["reason"] = "accepted candidate did not contain valid coordinates"
        return report

    # Only now write coordinates.
    location["latitude"] = latitude
    location["longitude"] = longitude
    location["coordinate_source"] = "Nominatim/OpenStreetMap"
    location["coordinate_query"] = report["queries"][0]
    location["coordinate_score"] = best_score
    location["coordinate_candidate"] = best_candidate.get("display_name")

    report["status"] = "accepted"
    report["score"] = best_score
    report["accepted_candidate"] = best_candidate.get("display_name")
    report["accepted_latitude"] = latitude
    report["accepted_longitude"] = longitude
    report["reasons"] = best_reasons

    return report


def main() -> int:
    print("=" * 78)
    print("SchemeSetu SIH26092 — STRICT PARTNER BRANCH GEOCODER")
    print("=" * 78)
    print(f"Locations: {LOCATIONS_FILE}")
    print(f"Report:    {REPORT_FILE}")
    print()
    print(
        "This run will clear coordinates that do not have explicit "
        "coordinate_source provenance."
    )
    print(
        "Generic locality/POI matches will NOT be accepted as branch "
        "coordinates."
    )
    print()

    try:
        locations = load_locations()
        partners_by_id = load_partners()
    except Exception as exc:
        print(f"FATAL: {exc}")
        return 1

    cleared = clear_untrusted_coordinates(locations)

    if cleared:
        save_json(LOCATIONS_FILE, locations)
        print(f"Cleared {cleared} untrusted existing coordinate pairs.")
    else:
        print("No untrusted existing coordinates needed clearing.")

    print(f"Total locations: {len(locations)}")
    print()

    session = requests.Session()

    reports: list[dict[str, Any]] = []

    accepted = 0
    review = 0

    for index, location in enumerate(locations, start=1):
        location_name = str(
            location.get("location_name")
            or location.get("location_id")
            or f"location-{index}"
        )

        print("-" * 78)
        print(f"[{index}/{len(locations)}] {location_name}")

        report = process_location(
            session,
            location,
            partners_by_id,
        )

        reports.append(report)

        status = report.get("status")

        if status == "accepted":
            accepted += 1
            print(
                "  ACCEPTED:",
                report.get("accepted_candidate"),
            )
            print(
                "  Coordinates:",
                report.get("accepted_latitude"),
                report.get("accepted_longitude"),
            )
            print(
                "  Score:",
                report.get("score"),
            )
        elif status == "stopped_403":
            print()
            print("HTTP 403 received. Stopping the entire run.")
            print(
                "Do NOT keep retrying the public Nominatim endpoint. "
                "Inspect the response/policy first."
            )
            review += 1

            save_json(LOCATIONS_FILE, locations)
            save_json(
                REPORT_FILE,
                {
                    "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "total": len(locations),
                    "accepted": accepted,
                    "review": len(locations) - accepted,
                    "stopped_due_to_403": True,
                    "reports": reports,
                },
            )

            return 2
        else:
            review += 1
            print("  REVIEW: no safe branch coordinate found.")

        # Save after every record so a network interruption does not destroy
        # previous progress.
        save_json(LOCATIONS_FILE, locations)

        # One request may already have happened inside process_location.
        # Keep a deliberate pause before the next location's first request.
        if index < len(locations):
            time.sleep(REQUEST_DELAY_SECONDS)

    report_payload = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "total": len(locations),
        "accepted": accepted,
        "review": review,
        "stopped_due_to_403": False,
        "notes": [
            "Coordinates are accepted only when the returned OSM object "
            "strongly matches the expected partner branch/office.",
            "Generic localities and unrelated POIs are intentionally rejected.",
            "coordinate_source identifies coordinates produced by this script.",
        ],
        "reports": reports,
    }

    save_json(REPORT_FILE, report_payload)
    save_json(LOCATIONS_FILE, locations)

    print()
    print("=" * 78)
    print("FINAL SUMMARY")
    print("=" * 78)
    print(f"Total:    {len(locations)}")
    print(f"Accepted: {accepted}")
    print(f"Review:   {review}")
    print()
    print(f"Updated locations: {LOCATIONS_FILE}")
    print(f"Report:           {REPORT_FILE}")
    print()
    print(
        "IMPORTANT: 'Review' is a valid outcome. It is safer to leave a "
        "coordinate null than to route users to the wrong branch."
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
