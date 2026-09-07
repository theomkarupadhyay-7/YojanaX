import fitz
from pathlib import Path


PDF_PATH = Path("data/raw/partners/nsfdc_psb.pdf")


document = fitz.open(PDF_PATH)

for page_number, page in enumerate(document, start=1):

    print(f"\n{'=' * 60}")
    print(f"PAGE {page_number}")
    print(f"{'=' * 60}")

    tables = page.find_tables()

    print(f"Tables found: {len(tables.tables)}")

    for table_number, table in enumerate(tables.tables, start=1):

        print(f"\n--- TABLE {table_number} ---")

        rows = table.extract()

        for row_number, row in enumerate(rows, start=1):
            print(f"ROW {row_number}: {row}")


document.close()