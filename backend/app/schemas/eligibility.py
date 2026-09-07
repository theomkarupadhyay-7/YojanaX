from typing import Literal, Optional

from pydantic import BaseModel, Field


class EligibilityRequest(BaseModel):
    """
    Input received from the frontend for an eligibility check.

    The purpose determines which family of schemes should be evaluated:
    - entrepreneurship
    - education
    """

    purpose: Optional[Literal["entrepreneurship", "education"]] = Field(
        default=None,
        description=(
            "Purpose of the requested financial assistance. "
            "If omitted, the backend may infer it from the supplied fields."
        ),
    )

    # ------------------------------------------------------------
    # Common applicant information
    # ------------------------------------------------------------

    is_sc: Optional[bool] = Field(
        default=None,
        description="Whether the applicant belongs to the Scheduled Caste category.",
    )

    annual_family_income_inr: Optional[int] = Field(
        default=None,
        ge=0,
        description="Applicant's annual family income in INR.",
    )

    caste_certificate_valid: Optional[bool] = Field(
        default=None,
        description=(
            "Whether the applicant's caste certificate has been "
            "verified as valid."
        ),
    )

    # ------------------------------------------------------------
    # Entrepreneurship-specific information
    # ------------------------------------------------------------

    project_cost_inr: Optional[int] = Field(
        default=None,
        ge=0,
        description="Total proposed project cost in INR.",
    )

    # ------------------------------------------------------------
    # Education-specific information
    # ------------------------------------------------------------

    course_fee_inr: Optional[int] = Field(
        default=None,
        ge=0,
        description="Total course fee for an education loan request.",
    )

    course_type: Optional[str] = Field(
        default=None,
        description=(
            "Professional or technical course category, "
            "for example Engineering, Medical, Management or Law."
        ),
    )

    is_full_time: Optional[bool] = Field(
        default=None,
        description="Whether the course is regular and full-time.",
    )

    institution_recognized: Optional[bool] = Field(
        default=None,
        description="Whether the educational institution is recognized.",
    )

    # ------------------------------------------------------------
    # Channel partner
    # ------------------------------------------------------------

    channel_partner_type: Optional[str] = Field(
        default=None,
        description="Type of authorized channel partner selected by the applicant.",
    )


class EligibilityCheck(BaseModel):
    """
    Result of one individual eligibility criterion.
    """

    criterion: str
    status: Literal["passed", "failed", "pending"]
    reason: str


class SchemeEligibilityResult(BaseModel):
    """
    Eligibility result for one scheme.
    """

    scheme_id: str
    scheme_name: str

    status: Literal[
        "eligible",
        "incomplete",
        "not_eligible",
        "not_applicable",
    ]

    checks: list[EligibilityCheck]


class EligibilityResponse(BaseModel):
    """
    Complete response returned by the eligibility API.
    """

    results: list[SchemeEligibilityResult]