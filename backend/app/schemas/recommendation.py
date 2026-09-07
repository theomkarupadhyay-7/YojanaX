from typing import Optional

from pydantic import BaseModel, Field

from backend.app.schemas.eligibility import EligibilityRequest


class RecommendationRequest(EligibilityRequest):
    preference: Optional[str] = Field(
        default=None,
        description="Optional preference such as lower interest, lower EMI, or shorter repayment.",
    )
    requested_loan_inr: Optional[int] = Field(default=None, ge=0)
    repayment_period_years: Optional[int] = Field(default=None, gt=0)
    installment_frequency: Optional[str] = Field(default=None)


class RecommendationItem(BaseModel):
    rank: int
    scheme_id: str
    scheme_name: str
    match_score: float
    eligibility_status: str
    recommendation_reason: str
    fit_factors: list[str] = Field(default_factory=list)


class RecommendationResponse(BaseModel):
    total_eligible: int
    recommendations: list[RecommendationItem]
    ranking_method: str