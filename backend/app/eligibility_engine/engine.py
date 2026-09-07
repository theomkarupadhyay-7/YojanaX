from typing import Any, Dict, List

from .rules import (
    ANNUAL_FAMILY_INCOME_MAX_INR,
    SC_REQUIRED,
    get_application_rules,
    get_channel_partner_rules,
    get_project_cost_rules,
)


class EligibilityEngine:
    """
    Deterministic eligibility engine.

    The engine makes eligibility decisions using explicit rules.
    No LLM is involved in the eligibility decision.

    schemes.json = scheme data
    rules.py    = matching/business rules

    The engine supports two scheme families:

    1. Entrepreneurship / credit schemes
       - project cost
       - channel partner
       - common SC/income/certificate requirements

    2. Education schemes
       - course fee
       - course type
       - full-time study
       - recognized institution
       - common SC/income/certificate requirements
    """

    def __init__(self, schemes: List[Dict[str, Any]]):
        self.schemes = schemes

    # ============================================================
    # MATCH ALL SCHEMES
    # ============================================================

    def match(self, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        results = []

        purpose = self._get_request_purpose(profile)

        for scheme in self.schemes:
            result = self.evaluate_scheme(
                profile,
                scheme,
                purpose=purpose,
            )

            results.append(result)

        status_priority = {
            "eligible": 0,
            "incomplete": 1,
            "not_eligible": 2,
            "not_applicable": 3,
        }

        results.sort(
            key=lambda result: status_priority.get(
                result["status"],
                99,
            )
        )

        return results

    # ============================================================
    # REQUEST PURPOSE
    # ============================================================

    def _get_request_purpose(
        self,
        profile: Dict[str, Any],
    ) -> str | None:
        """
        Determine whether the request is for entrepreneurship
        or education.

        Explicit purpose always wins.

        If purpose is omitted, infer it from the fields supplied.
        This preserves compatibility with the previous API requests
        that only supplied project_cost_inr.
        """

        explicit_purpose = profile.get("purpose")

        if explicit_purpose in {
            "entrepreneurship",
            "education",
        }:
            return explicit_purpose

        education_fields = (
            "course_fee_inr",
            "course_type",
            "is_full_time",
            "institution_recognized",
        )

        if any(
            profile.get(field) is not None
            for field in education_fields
        ):
            return "education"

        if profile.get("project_cost_inr") is not None:
            return "entrepreneurship"

        return None

    # ============================================================
    # SCHEME TYPE
    # ============================================================

    def _is_education_scheme(
        self,
        scheme: Dict[str, Any],
    ) -> bool:
        """
        Determine whether a scheme belongs to the education category.

        The primary source is scheme_category. The fallback checks
        the presence of education-specific eligibility data.
        """

        category = str(
            scheme.get("scheme_category") or ""
        ).strip().lower()

        if category in {
            "education",
            "educational",
            "education_loan",
            "educational_loan",
        }:
            return True

        eligibility = scheme.get("eligibility") or {}

        return isinstance(
            eligibility.get("education"),
            dict,
        )

    # ============================================================
    # EVALUATE ONE SCHEME
    # ============================================================

    def evaluate_scheme(
        self,
        profile: Dict[str, Any],
        scheme: Dict[str, Any],
        purpose: str | None = None,
    ) -> Dict[str, Any]:

        scheme_id = scheme.get("scheme_id")

        scheme_name = (
            scheme.get("scheme_name")
            or scheme.get("name")
            or "Unknown Scheme"
        )

        if purpose is None:
            purpose = self._get_request_purpose(profile)

        is_education_scheme = self._is_education_scheme(
            scheme
        )

        # --------------------------------------------------------
        # Don't evaluate an education scheme for a business request.
        # Don't evaluate business schemes for an education request.
        # --------------------------------------------------------

        if purpose == "education" and not is_education_scheme:
            return {
                "scheme_id": scheme_id,
                "scheme_name": scheme_name,
                "status": "not_applicable",
                "checks": [
                    {
                        "criterion": "Scheme purpose",
                        "status": "passed",
                        "reason": (
                            "This is an entrepreneurship/credit scheme "
                            "and is not applicable to an education loan request."
                        ),
                    }
                ],
            }

        if purpose == "entrepreneurship" and is_education_scheme:
            return {
                "scheme_id": scheme_id,
                "scheme_name": scheme_name,
                "status": "not_applicable",
                "checks": [
                    {
                        "criterion": "Scheme purpose",
                        "status": "passed",
                        "reason": (
                            "This is an education loan scheme and is not "
                            "applicable to an entrepreneurship request."
                        ),
                    }
                ],
            }

        if is_education_scheme:
            return self._evaluate_education_scheme(
                profile,
                scheme,
            )

        return self._evaluate_entrepreneurship_scheme(
            profile,
            scheme,
        )

    # ============================================================
    # COMMON APPLICANT CHECKS
    # ============================================================

    def _check_common_criteria(
        self,
        profile: Dict[str, Any],
        scheme: Dict[str, Any],
    ) -> List[Dict[str, str]]:
        """
        Evaluate criteria common to NSFDC loan schemes.

        These currently include:
        - SC category
        - annual family income
        - caste certificate

        Scheme data can override the global SC/income rules when
        explicit scheme-level values are available.
        """

        checks = []

        eligibility = scheme.get("eligibility") or {}

        # --------------------------------------------------------
        # 1. SC CATEGORY
        # --------------------------------------------------------

        sc_required = eligibility.get(
            "sc_required",
            SC_REQUIRED,
        )

        if sc_required:

            is_sc = profile.get("is_sc")

            if is_sc is True:
                checks.append(
                    {
                        "criterion": "SC category",
                        "status": "passed",
                        "reason": (
                            "Applicant belongs to the SC category."
                        ),
                    }
                )

            elif is_sc is False:
                checks.append(
                    {
                        "criterion": "SC category",
                        "status": "failed",
                        "reason": (
                            "Applicant does not belong to the SC category."
                        ),
                    }
                )

            else:
                checks.append(
                    {
                        "criterion": "SC category",
                        "status": "pending",
                        "reason": (
                            "SC category information is required."
                        ),
                    }
                )

        # --------------------------------------------------------
        # 2. ANNUAL FAMILY INCOME
        # --------------------------------------------------------

        income = profile.get(
            "annual_family_income_inr"
        )

        income_limit = eligibility.get(
            "annual_family_income_max_inr"
        )

        if income_limit is None:
            income_limit = ANNUAL_FAMILY_INCOME_MAX_INR

        income_criterion_applies = eligibility.get(
            "income_criterion_applies",
            True,
        )

        if not income_criterion_applies:
            checks.append(
                {
                    "criterion": "Annual family income",
                    "status": "passed",
                    "reason": (
                        "No income criterion applies to this scheme."
                    ),
                }
            )

        elif income is None:

            checks.append(
                {
                    "criterion": "Annual family income",
                    "status": "pending",
                    "reason": (
                        "Annual family income is required."
                    ),
                }
            )

        elif not isinstance(
            income,
            (int, float),
        ) or isinstance(income, bool):

            checks.append(
                {
                    "criterion": "Annual family income",
                    "status": "failed",
                    "reason": (
                        "Annual family income must be a valid number."
                    ),
                }
            )

        elif income < 0:

            checks.append(
                {
                    "criterion": "Annual family income",
                    "status": "failed",
                    "reason": (
                        "Annual family income cannot be negative."
                    ),
                }
            )

        elif income <= income_limit:

            checks.append(
                {
                    "criterion": "Annual family income",
                    "status": "passed",
                    "reason": (
                        f"Annual family income ₹{income:,.0f} "
                        f"is within the "
                        f"₹{income_limit:,.0f} limit."
                    ),
                }
            )

        else:

            checks.append(
                {
                    "criterion": "Annual family income",
                    "status": "failed",
                    "reason": (
                        f"Annual family income ₹{income:,.0f} "
                        f"exceeds the "
                        f"₹{income_limit:,.0f} limit."
                    ),
                }
            )

        # --------------------------------------------------------
        # 3. CASTE CERTIFICATE
        # --------------------------------------------------------

        caste_certificate_valid = profile.get(
            "caste_certificate_valid"
        )

        if caste_certificate_valid is True:

            checks.append(
                {
                    "criterion": "Caste certificate",
                    "status": "passed",
                    "reason": (
                        "A valid caste certificate is available."
                    ),
                }
            )

        elif caste_certificate_valid is False:

            checks.append(
                {
                    "criterion": "Caste certificate",
                    "status": "failed",
                    "reason": (
                        "A valid caste certificate is required."
                    ),
                }
            )

        else:

            checks.append(
                {
                    "criterion": "Caste certificate",
                    "status": "pending",
                    "reason": (
                        "Caste certificate verification is pending."
                    ),
                }
            )

        return checks

    # ============================================================
    # ENTREPRENEURSHIP / CREDIT SCHEMES
    # ============================================================

    def _evaluate_entrepreneurship_scheme(
        self,
        profile: Dict[str, Any],
        scheme: Dict[str, Any],
    ) -> Dict[str, Any]:

        scheme_id = scheme.get("scheme_id")

        scheme_name = (
            scheme.get("scheme_name")
            or scheme.get("name")
            or "Unknown Scheme"
        )

        checks = self._check_common_criteria(
            profile,
            scheme,
        )

        # --------------------------------------------------------
        # 4. PROJECT COST
        # --------------------------------------------------------

        project_cost = profile.get(
            "project_cost_inr"
        )

        project_rules = get_project_cost_rules(
            scheme_id
        )

        if project_cost is None:

            checks.append(
                {
                    "criterion": "Project cost",
                    "status": "pending",
                    "reason": (
                        "Project cost is required."
                    ),
                }
            )

        elif not isinstance(
            project_cost,
            (int, float),
        ) or isinstance(project_cost, bool):

            checks.append(
                {
                    "criterion": "Project cost",
                    "status": "failed",
                    "reason": (
                        "Project cost must be a valid number."
                    ),
                }
            )

        elif project_cost < 0:

            checks.append(
                {
                    "criterion": "Project cost",
                    "status": "failed",
                    "reason": (
                        "Project cost cannot be negative."
                    ),
                }
            )

        else:

            checks.append(
                self._check_project_cost(
                    project_cost,
                    project_rules,
                )
            )

        # --------------------------------------------------------
        # 5. CHANNEL PARTNER
        # --------------------------------------------------------

        checks.append(
            self._check_channel_partner(
                profile,
                scheme_id,
            )
        )

        return self._build_result(
            scheme_id,
            scheme_name,
            checks,
        )

    # ============================================================
    # EDUCATION SCHEMES
    # ============================================================

    def _evaluate_education_scheme(
        self,
        profile: Dict[str, Any],
        scheme: Dict[str, Any],
    ) -> Dict[str, Any]:

        scheme_id = scheme.get("scheme_id")

        scheme_name = (
            scheme.get("scheme_name")
            or scheme.get("name")
            or "Unknown Scheme"
        )

        checks = self._check_common_criteria(
            profile,
            scheme,
        )

        eligibility = scheme.get("eligibility") or {}
        education_rules = eligibility.get("education") or {}

        # --------------------------------------------------------
        # 4. COURSE FEE
        # --------------------------------------------------------

        course_fee = profile.get(
            "course_fee_inr"
        )

        loan_amount = scheme.get("loan_amount") or {}

        max_percentage = loan_amount.get(
            "max_percentage"
        )

        max_loan_inr = loan_amount.get(
            "max_inr"
        )

        if course_fee is None:

            checks.append(
                {
                    "criterion": "Course fee",
                    "status": "pending",
                    "reason": (
                        "Course fee is required to calculate "
                        "the maximum eligible loan amount."
                    ),
                }
            )

        elif not isinstance(
            course_fee,
            (int, float),
        ) or isinstance(course_fee, bool):

            checks.append(
                {
                    "criterion": "Course fee",
                    "status": "failed",
                    "reason": (
                        "Course fee must be a valid number."
                    ),
                }
            )

        elif course_fee <= 0:

            checks.append(
                {
                    "criterion": "Course fee",
                    "status": "failed",
                    "reason": (
                        "Course fee must be greater than zero."
                    ),
                }
            )

        else:

            calculated_loan = course_fee

            if max_percentage is not None:
                calculated_loan = min(
                    calculated_loan,
                    course_fee * (
                        max_percentage / 100
                    ),
                )

            if max_loan_inr is not None:
                calculated_loan = min(
                    calculated_loan,
                    max_loan_inr,
                )

            checks.append(
                {
                    "criterion": "Course fee",
                    "status": "passed",
                    "reason": (
                        f"Course fee ₹{course_fee:,.0f} "
                        f"fits the scheme's financing rules. "
                        f"Maximum calculated loan amount: "
                        f"₹{calculated_loan:,.0f}."
                    ),
                }
            )

        # --------------------------------------------------------
        # 5. COURSE TYPE
        # --------------------------------------------------------

        course_type = profile.get(
            "course_type"
        )

        allowed_course_types = education_rules.get(
            "allowed_course_types",
            [],
        )

        if course_type is None:

            checks.append(
                {
                    "criterion": "Professional/technical course",
                    "status": "pending",
                    "reason": (
                        "Course type is required."
                    ),
                }
            )

        elif not isinstance(
            course_type,
            str,
        ) or not course_type.strip():

            checks.append(
                {
                    "criterion": "Professional/technical course",
                    "status": "failed",
                    "reason": (
                        "A valid course type is required."
                    ),
                }
            )

        elif allowed_course_types:

            normalized_course = course_type.strip().lower()

            normalized_allowed = {
                str(course).strip().lower()
                for course in allowed_course_types
            }

            if normalized_course in normalized_allowed:

                checks.append(
                    {
                        "criterion": "Professional/technical course",
                        "status": "passed",
                        "reason": (
                            f"Course type '{course_type}' "
                            "is supported by the configured "
                            "education scheme rules."
                        ),
                    }
                )

            else:

                checks.append(
                    {
                        "criterion": "Professional/technical course",
                        "status": "failed",
                        "reason": (
                            f"Course type '{course_type}' "
                            "does not match the configured "
                            "eligible course categories."
                        ),
                    }
                )

        else:

            checks.append(
                {
                    "criterion": "Professional/technical course",
                    "status": "passed",
                    "reason": (
                        f"Course type '{course_type}' "
                        "has been provided. Detailed course "
                        "category validation is not configured "
                        "for this scheme."
                    ),
                }
            )

        # --------------------------------------------------------
        # 6. FULL-TIME STUDY
        # --------------------------------------------------------

        full_time_required = education_rules.get(
            "full_time_required",
            False,
        )

        is_full_time = profile.get(
            "is_full_time"
        )

        if not full_time_required:

            checks.append(
                {
                    "criterion": "Full-time study",
                    "status": "passed",
                    "reason": (
                        "Full-time study is not configured "
                        "as a mandatory criterion."
                    ),
                }
            )

        elif is_full_time is None:

            checks.append(
                {
                    "criterion": "Full-time study",
                    "status": "pending",
                    "reason": (
                        "Whether the course is regular and "
                        "full-time is required."
                    ),
                }
            )

        elif is_full_time is False:

            checks.append(
                {
                    "criterion": "Full-time study",
                    "status": "failed",
                    "reason": (
                        "This education scheme requires "
                        "regular full-time study."
                    ),
                }
            )

        else:

            checks.append(
                {
                    "criterion": "Full-time study",
                    "status": "passed",
                    "reason": (
                        "The course is regular and full-time."
                    ),
                }
            )

        # --------------------------------------------------------
        # 7. RECOGNIZED INSTITUTION
        # --------------------------------------------------------

        institution_required = education_rules.get(
            "recognized_institution_required",
            False,
        )

        institution_recognized = profile.get(
            "institution_recognized"
        )

        if not institution_required:

            checks.append(
                {
                    "criterion": "Recognized institution",
                    "status": "passed",
                    "reason": (
                        "Institution recognition is not configured "
                        "as a mandatory criterion."
                    ),
                }
            )

        elif institution_recognized is None:

            checks.append(
                {
                    "criterion": "Recognized institution",
                    "status": "pending",
                    "reason": (
                        "Institution recognition status is required."
                    ),
                }
            )

        elif institution_recognized is False:

            checks.append(
                {
                    "criterion": "Recognized institution",
                    "status": "failed",
                    "reason": (
                        "The educational institution must be recognized."
                    ),
                }
            )

        else:

            checks.append(
                {
                    "criterion": "Recognized institution",
                    "status": "passed",
                    "reason": (
                        "The institution recognition requirement "
                        "is satisfied."
                    ),
                }
            )

        # --------------------------------------------------------
        # 8. CHANNEL PARTNER
        # --------------------------------------------------------

        checks.append(
            self._check_channel_partner(
                profile,
                scheme_id,
            )
        )

        return self._build_result(
            scheme_id,
            scheme_name,
            checks,
        )

    # ============================================================
    # CHANNEL PARTNER CHECK
    # ============================================================

    def _check_channel_partner(
        self,
        profile: Dict[str, Any],
        scheme_id: str,
    ) -> Dict[str, str]:

        application_rules = get_application_rules(
            scheme_id
        )

        partner_rules = get_channel_partner_rules(
            scheme_id
        )

        partner_required = application_rules.get(
            "channel_partner_required",
            True,
        )

        selected_partner_type = profile.get(
            "channel_partner_type"
        )

        if not partner_required:

            return {
                "criterion": "Channel partner",
                "status": "passed",
                "reason": (
                    "A channel partner is not required "
                    "for this scheme."
                ),
            }

        allowed_partner_types = partner_rules.get(
            "allowed_partner_types",
            [],
        )

        # Empty list means that no scheme-specific partner
        # restriction has been captured yet.
        if not allowed_partner_types:

            if selected_partner_type:

                return {
                    "criterion": "Channel partner",
                    "status": "passed",
                    "reason": (
                        f"Channel partner type "
                        f"'{selected_partner_type}' is provided."
                    ),
                }

            return {
                "criterion": "Channel partner",
                "status": "pending",
                "reason": (
                    "Application must be routed through "
                    "an authorized channel partner."
                ),
            }

        if selected_partner_type is None:

            return {
                "criterion": "Channel partner",
                "status": "pending",
                "reason": (
                    "A channel partner is required for this scheme."
                ),
            }

        if selected_partner_type in allowed_partner_types:

            return {
                "criterion": "Channel partner",
                "status": "passed",
                "reason": (
                    f"'{selected_partner_type}' is an allowed "
                    f"channel partner type for this scheme."
                ),
            }

        return {
            "criterion": "Channel partner",
            "status": "failed",
            "reason": (
                f"'{selected_partner_type}' is not an allowed "
                f"channel partner type for this scheme."
            ),
        }

    # ============================================================
    # FINAL RESULT
    # ============================================================

    def _build_result(
        self,
        scheme_id: str,
        scheme_name: str,
        checks: List[Dict[str, str]],
    ) -> Dict[str, Any]:

        statuses = [
            check["status"]
            for check in checks
        ]

        if "failed" in statuses:
            status = "not_eligible"

        elif "pending" in statuses:
            status = "incomplete"

        else:
            status = "eligible"

        return {
            "scheme_id": scheme_id,
            "scheme_name": scheme_name,
            "status": status,
            "checks": checks,
        }

    # ============================================================
    # PROJECT COST CHECK
    # ============================================================

    def _check_project_cost(
        self,
        project_cost: float,
        rules: Dict[str, Any],
    ) -> Dict[str, str]:

        min_inr = rules.get(
            "min_inr"
        )

        max_inr = rules.get(
            "max_inr"
        )

        min_inr_exclusive = rules.get(
            "min_inr_exclusive"
        )

        # --------------------------------------------------------
        # Exclusive minimum
        # --------------------------------------------------------

        if min_inr_exclusive is not None:

            if project_cost <= min_inr_exclusive:

                return {
                    "criterion": "Project cost",
                    "status": "failed",
                    "reason": (
                        f"Project cost ₹{project_cost:,.0f} "
                        f"must be greater than "
                        f"₹{min_inr_exclusive:,.0f}."
                    ),
                }

        # --------------------------------------------------------
        # Inclusive minimum
        # --------------------------------------------------------

        elif min_inr is not None:

            if project_cost < min_inr:

                return {
                    "criterion": "Project cost",
                    "status": "failed",
                    "reason": (
                        f"Project cost ₹{project_cost:,.0f} "
                        f"is below the minimum of "
                        f"₹{min_inr:,.0f}."
                    ),
                }

        # --------------------------------------------------------
        # Maximum
        # --------------------------------------------------------

        if max_inr is not None:

            if project_cost > max_inr:

                return {
                    "criterion": "Project cost",
                    "status": "failed",
                    "reason": (
                        f"Project cost ₹{project_cost:,.0f} "
                        f"exceeds the maximum of "
                        f"₹{max_inr:,.0f}."
                    ),
                }

        # --------------------------------------------------------
        # Success message
        # --------------------------------------------------------

        if min_inr_exclusive is not None:

            reason = (
                f"Project cost ₹{project_cost:,.0f} "
                f"is greater than "
                f"₹{min_inr_exclusive:,.0f}"
            )

            if max_inr is not None:

                reason += (
                    f" and within the maximum of "
                    f"₹{max_inr:,.0f}."
                )

            else:

                reason += "."

        elif max_inr is not None:

            reason = (
                f"Project cost ₹{project_cost:,.0f} "
                f"is within the maximum of "
                f"₹{max_inr:,.0f}."
            )

        else:

            reason = (
                f"Project cost ₹{project_cost:,.0f} "
                f"fits within this scheme's "
                f"project-cost range."
            )

        return {
            "criterion": "Project cost",
            "status": "passed",
            "reason": reason,
        }


# ================================================================
# CONVENIENCE FUNCTION
# ================================================================

def run_eligibility(
    schemes: List[Dict[str, Any]],
    profile: Dict[str, Any],
) -> List[Dict[str, Any]]:

    engine = EligibilityEngine(
        schemes
    )

    return engine.match(
        profile
    )