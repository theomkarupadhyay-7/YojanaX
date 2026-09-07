from backend.app.schemas.eligibility import (
    EligibilityRequest,
    EligibilityResponse,
)
from backend.app.eligibility_engine.engine import EligibilityEngine
from backend.app.services.scheme_service import get_all_schemes


def check_eligibility(
    request: EligibilityRequest,
) -> EligibilityResponse:

    # Load validated scheme models
    scheme_models = get_all_schemes()

    # The deterministic eligibility engine works with dictionaries.
    # Convert Pydantic models into dictionaries before passing them in.
    schemes = [
        scheme.model_dump()
        for scheme in scheme_models
    ]

    # Create deterministic eligibility engine
    engine = EligibilityEngine(schemes)

    # Run eligibility matching
    results = engine.match(
        request.model_dump()
    )

    # Validate and return the final API response
    return EligibilityResponse.model_validate(
        {
            "results": results
        }
    )