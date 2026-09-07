import json
import sys
from pathlib import Path

# ------------------------------------------------------------
# ADD BACKEND/APP TO PYTHON PATH
# ------------------------------------------------------------

APP_DIR = Path(__file__).resolve().parents[1]

if str(APP_DIR) not in sys.path:
    sys.path.insert(0, str(APP_DIR))


from eligibility_engine.engine import EligibilityEngine
from eligibility_engine.validators import validate_profile
from eligibility_engine.explain import explain_results


# ------------------------------------------------------------
# LOAD SCHEMES
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[3]

SCHEMES_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "schemes"
    / "schemes.json"
)


with open(SCHEMES_FILE, "r", encoding="utf-8") as file:
    schemes = json.load(file)


# ------------------------------------------------------------
# TEST PROFILE
# ------------------------------------------------------------

profile = {
    "is_sc": True,
    "annual_family_income_inr": 300_000,
    "project_cost_inr": 200_000,
}


# ------------------------------------------------------------
# VALIDATE PROFILE
# ------------------------------------------------------------

validation = validate_profile(profile)

if not validation["valid"]:

    print("Profile validation failed:")

    for error in validation["errors"]:
        print(f"- {error}")

    raise SystemExit(1)


# ------------------------------------------------------------
# RUN ELIGIBILITY ENGINE
# ------------------------------------------------------------

engine = EligibilityEngine(schemes)

results = engine.match(profile)


# ------------------------------------------------------------
# DISPLAY RESULTS
# ------------------------------------------------------------

print("=" * 60)
print("ELIGIBILITY ENGINE TEST")
print("=" * 60)

for result in results:

    print(
        f"\n{result['scheme_name']}"
    )

    print(
        f"Status: {result['status']}"
    )

    for check in result["checks"]:

        print(
            f"  [{check['status'].upper()}] "
            f"{check['criterion']}"
        )

        print(
            f"       {check['reason']}"
        )


# ------------------------------------------------------------
# HUMAN-READABLE EXPLANATION
# ------------------------------------------------------------

print("\n")
print("=" * 60)
print("EXPLANATION")
print("=" * 60)

print(
    explain_results(results)
)