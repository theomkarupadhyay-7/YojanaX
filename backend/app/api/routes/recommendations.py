from fastapi import APIRouter, HTTPException

from backend.app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)
from backend.app.services.recommender_service import recommend_schemes

router = APIRouter(
    prefix="/recommendations",
    tags=["AI Recommendations"],
)


@router.post("", response_model=RecommendationResponse)
def get_scheme_recommendations(
    request: RecommendationRequest,
):
    try:
        return recommend_schemes(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Recommendation service error: {exc}",
        ) from exc
