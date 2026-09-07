from typing import List, Optional, Union, Literal

from pydantic import BaseModel, Field


class ProjectCost(BaseModel):
    min_inr: Optional[int] = None
    min_inr_exclusive: Optional[int] = None
    max_inr: int


class LoanAmount(BaseModel):
    max_percentage: Optional[float] = None
    max_inr: int


class InterestRateOption(BaseModel):
    channel_partner_type: str
    value_percent: float


class InterestRate(BaseModel):
    type: Literal["fixed", "partner_dependent"]
    value_percent: Optional[float] = None
    rates: Optional[List[InterestRateOption]] = None


class SpecialMoratorium(BaseModel):
    plantation_or_construction_months: Optional[int] = None


class Repayment(BaseModel):
    period_years: int
    moratorium_months: Optional[int] = None
    moratorium_description: Optional[str] = None
    special_moratorium: Optional[SpecialMoratorium] = None
    installment_frequency: Union[str, List[str]]


class EducationEligibility(BaseModel):
    """
    Education-specific eligibility requirements.

    These fields are only populated for education schemes such as ELS.
    """

    full_time_required: bool = False
    recognized_institution_required: bool = False
    recognized_course_required: bool = False
    allowed_course_types: List[str] = Field(default_factory=list)


class Eligibility(BaseModel):
    sc_required: bool
    annual_family_income_max_inr: Optional[int] = None
    income_criterion_applies: bool
    notes: List[str]
    education: Optional[EducationEligibility] = None


class ApplicationProcess(BaseModel):
    direct_application_to_nsfdc: bool
    channel_partner_required: bool


class Provenance(BaseModel):
    organization: str
    source_name: str
    source_url: str
    retrieved_at: str
    verification_status: str


class Scheme(BaseModel):
    scheme_id: str
    scheme_name: str
    scheme_category: str
    target_type: str

    # Entrepreneurship schemes use project cost.
    # Education schemes such as ELS do not.
    project_cost: Optional[ProjectCost] = None

    loan_amount: LoanAmount
    interest_rate: InterestRate
    repayment: Repayment

    channel_partner_types: List[str]

    eligibility: Eligibility
    documents: List[str]
    application_process: ApplicationProcess
    provenance: Provenance