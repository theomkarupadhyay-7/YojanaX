import json
import requests
from bs4 import BeautifulSoup
from datetime import date
from pathlib import Path


URL = "https://nsfdc.nic.in/scheme"

OUTPUT_PATH = Path("data/raw/schemes/nsfdc_schemes.json")


def clean_text(text):
    return " ".join(text.split())


def extract_schemes():
    response = requests.get(URL, timeout=30)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    schemes = []

    for heading in soup.find_all("h2"):

        scheme_name = clean_text(
            heading.get_text(" ", strip=True)
        )

        current = heading.find_next_sibling()

        elements = []

        while current and current.name != "h2":

            text = clean_text(
                current.get_text(" ", strip=True)
            )

            if text:
                elements.append(text)

            current = current.find_next_sibling()

        description = elements[0] if elements else ""
        details = elements[1:] if len(elements) > 1 else []

        scheme = {
            "scheme_id": None,
            "scheme_name": scheme_name,
            "description": description,
            "raw_details": details,

            "source": {
                "organization": "National Scheduled Castes Finance and Development Corporation",
                "source_name": "NSFDC Loans / Credit Schemes",
                "url": URL,
                "retrieved_at": str(date.today())
            }
        }

        schemes.append(scheme)

    return schemes


def save_schemes(schemes):

    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        OUTPUT_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            schemes,
            file,
            indent=4,
            ensure_ascii=False
        )


if __name__ == "__main__":

    schemes = extract_schemes()

    save_schemes(schemes)

    print(f"Extracted: {len(schemes)} schemes")
    print(f"Saved to: {OUTPUT_PATH}")