from fastapi import APIRouter, HTTPException

from backend.app.schemas.eligibility import (
    EligibilityRequest,
    EligibilityResponse,
)
from backend.app.services.eligibility_service import check_eligibility


router = APIRouter(
    prefix="/eligibility",
    tags=["Eligibility"],
)


@router.post("/check", response_model=EligibilityResponse)
def check_user_eligibility(request: EligibilityRequest):
    try:
        return check_eligibility(request)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc