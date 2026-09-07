from typing import Literal, Optional

from pydantic import BaseModel, Field


class CalculatorRequest(BaseModel):
    """
    Input required to calculate financing details for a scheme.
    """

    scheme_id: str = Field(
        description="Unique identifier of the scheme, for example ELS or TERM_LOAN."
    )

    # Entrepreneurship
    project_cost_inr: Optional[int] = Field(
        default=None,
        ge=0,
        description="Total proposed project cost in INR.",
    )

    # Education
    course_fee_inr: Optional[int] = Field(
        default=None,
        ge=0,
        description="Total course fee for an education loan request.",
    )

    # Optional user-selected financing amount
    requested_loan_inr: Optional[int] = Field(
        default=None,
        ge=0,
        description="Optional loan amount requested by the applicant.",
    )

    # Optional override for schemes with flexible tenure
    repayment_period_years: Optional[int] = Field(
        default=None,
        gt=0,
        description="Optional repayment period selected by the applicant.",
    )

    installment_frequency: Optional[
        Literal["monthly", "quarterly", "half_yearly", "yearly"]
    ] = Field(
        default="monthly",
        description="Frequency used for the repayment calculation.",
    )

    # Channel partner
    channel_partner_type: Optional[str] = Field(
        default=None,
        description=(
            "Selected authorized channel partner type. "
            "Required for schemes whose interest rate depends "
            "on the channel partner, such as UNY."
        ),
    )


class CalculatorResult(BaseModel):
    """
    Calculated financing information for a scheme.
    """

    scheme_id: str
    scheme_name: str

    base_amount_inr: int
    maximum_eligible_loan_inr: int
    calculated_loan_inr: int

    financing_percentage: Optional[float] = None
    interest_rate_percent: float

    repayment_period_years: int
    repayment_period_months: int

    installment_frequency: str
    estimated_installment_inr: float

    total_repayment_inr: float
    total_interest_inr: float

    moratorium_months: Optional[int] = None
    moratorium_description: Optional[str] = None


class CalculatorResponse(BaseModel):
    """
    Response returned by the financial calculator.
    """

    result: CalculatorResult