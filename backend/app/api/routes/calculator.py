from fastapi import APIRouter, HTTPException

from backend.app.schemas.calculator import (
    CalculatorRequest,
    CalculatorResponse,
)
from backend.app.services.calculator_service import calculate_financing


router = APIRouter(
    prefix="/calculator",
    tags=["Calculator"],
)


@router.post(
    "/calculate",
    response_model=CalculatorResponse,
)
def calculate_user_financing(
    request: CalculatorRequest,
):
    """
    Calculate financing and repayment details for a selected scheme.
    """

    try:
        return calculate_financing(request)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc