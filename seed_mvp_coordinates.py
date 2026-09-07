from pathlib import Path
import json

PROJECT_ROOT = Path(__file__).resolve().parent
DATA_FILE = PROJECT_ROOT / "data" / "processed" / "partners" / "partner_locations.json"

# MVP routing coordinates.
# These are locality/address-based approximations for the 24 selected
# Maharashtra locations. They are intentionally marked as approximate;
# they must not be presented as survey-grade/exact branch coordinates.
MVP_COORDINATES = {
    "RRB-002-PUNE-4616": (18.7510, 73.8620),  # Medankarwadi / Chakan
    "RRB-002-PUNE-4617": (18.7149, 73.9713),  # Koyali
    "RRB-002-PUNE-4618": (18.4554, 73.8182),  # Narhe
    "RRB-002-PUNE-4620": (18.5023, 73.7483),  # Bhugaon

    "RRB-002-THANE-5601": (19.2140, 72.9780),  # Vrindavan, Thane
    "RRB-002-THANE-5602": (19.1776, 73.2195),  # Belavali, Badlapur
    "RRB-002-THANE-5603": (19.3550, 73.4550),  # Tokawade, Murbad
    "RRB-002-THANE-5620": (19.3567, 73.2199),  # Khadavli
    "RRB-002-THANE-5630": (19.2450, 73.1290),  # Khadakpada, Kalyan
    "RRB-002-THANE-5632": (19.1265, 73.0070),  # Ghansoli

    "RRB-002-NAGPUR-6701": (21.0960, 79.1050),  # Hudkeswar
    "RRB-002-NAGPUR-6704": (21.0950, 78.9970),  # Hingana
    "RRB-002-NAGPUR-6705": (21.1059, 79.0569),  # Khamla
    "RRB-002-NAGPUR-6706": (21.1550, 79.1400),  # Pardi
    "RRB-002-NAGPUR-6711": (21.0960, 79.1050),  # Service Branch Nagpur

    "PSB-008-MUMBAI-0002": (18.9322, 72.8310),  # Fort
    "PSB-008-MUMBAI-0016": (19.0220, 72.8390),  # Ranade Road / Dadar
    "PSB-008-MUMBAI-0082": (19.1630, 72.8390),  # Goregaon West
    "PSB-008-MUMBAI-0089": (19.0620, 72.8940),  # Chembur

    "PSB-008-NAGPUR-0005": (21.1460, 79.0840),  # Sitabuldi
    "PSB-008-NAGPUR-0107": (21.1450, 79.1030),  # Mahal
    "PSB-008-NAGPUR-0452": (21.1600, 79.0750),  # Sadar Bazar

    "PSB-008-NASHIK-0834": (19.9550, 73.7660),  # Ambad MIDC
    "PSB-008-NASHIK-0014": (20.0000, 73.7800),  # Nashik City
}


def main() -> None:
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Missing data file: {DATA_FILE}")

    with DATA_FILE.open("r", encoding="utf-8") as f:
        locations = json.load(f)

    if not isinstance(locations, list):
        raise ValueError("partner_locations.json must contain a JSON list.")

    ids = {item.get("location_id") for item in locations}
    missing = sorted(set(MVP_COORDINATES) - ids)
    if missing:
        raise ValueError(f"Coordinate IDs not found in dataset: {missing}")

    updated = 0

    for item in locations:
        location_id = item.get("location_id")
        if location_id not in MVP_COORDINATES:
            continue

        lat, lon = MVP_COORDINATES[location_id]

        item["latitude"] = lat
        item["longitude"] = lon

        # Explicit provenance prevents these values from being mistaken
        # for exact GPS coordinates.
        item["coordinate_source"] = "mvp_locality_approximation"
        item["coordinate_accuracy"] = "approximate"
        item["coordinate_note"] = (
            "Approximate routing coordinate derived from the verified branch "
            "address/locality. Suitable for MVP proximity ranking; verify "
            "against a map/official branch locator before production use."
        )

        updated += 1

    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(locations, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Updated {updated} / {len(locations)} partner locations.")
    print(f"Dataset: {DATA_FILE}")
    print()
    print("WARNING: coordinates are APPROXIMATE MVP routing coordinates.")
    print("Do not describe them as exact branch GPS coordinates.")
    print("Next step: start the API and test POST /partners/nearby.")


if __name__ == "__main__":
    main()
