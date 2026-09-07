"""
Input validation for applicant profiles.

This module validates user-provided data before it reaches
the deterministic eligibility engine.
"""

from typing import Any, Dict


def validate_profile(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and normalize an applicant profile.

    Returns:
        A dictionary containing:
            valid: bool
            errors: list[str]
    """

    errors = []

    # --------------------------------------------------------
    # SC CATEGORY
    # --------------------------------------------------------

    if "is_sc" in profile:
        if not isinstance(profile["is_sc"], bool):
            errors.append(
                "'is_sc' must be True or False."
            )

    # --------------------------------------------------------
    # ANNUAL FAMILY INCOME
    # --------------------------------------------------------

    if "annual_family_income_inr" in profile:

        income = profile["annual_family_income_inr"]

        if not isinstance(income, (int, float)):
            errors.append(
                "'annual_family_income_inr' must be a number."
            )

        elif income < 0:
            errors.append(
                "'annual_family_income_inr' cannot be negative."
            )

    # --------------------------------------------------------
    # PROJECT COST
    # --------------------------------------------------------

    if "project_cost_inr" in profile:

        project_cost = profile["project_cost_inr"]

        if not isinstance(project_cost, (int, float)):
            errors.append(
                "'project_cost_inr' must be a number."
            )

        elif project_cost < 0:
            errors.append(
                "'project_cost_inr' cannot be negative."
            )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
    }