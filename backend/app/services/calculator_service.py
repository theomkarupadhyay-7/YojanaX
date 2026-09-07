import math
from typing import Any

from backend.app.schemas.calculator import (
    CalculatorRequest,
    CalculatorResponse,
    CalculatorResult,
)
from backend.app.services.scheme_service import get_scheme_by_id


def _calculate_maximum_eligible_loan(
    scheme: dict[str, Any],
    base_amount: int,
) -> tuple[int, float | None]:
    """
    Calculate the maximum loan amount permitted by the scheme.

    For percentage-based schemes:
        maximum loan = min(base_amount * percentage, scheme ceiling)

    For fixed-ceiling schemes:
        maximum loan = scheme ceiling
    """

    loan_rules = scheme.get("loan_amount", {})

    max_percentage = loan_rules.get("max_percentage")
    max_inr = loan_rules.get("max_inr")

    if max_percentage is not None:
        percentage_amount = math.floor(
            base_amount * (max_percentage / 100)
        )

        if max_inr is not None:
            return min(percentage_amount, max_inr), max_percentage

        return percentage_amount, max_percentage

    if max_inr is not None:
        return min(base_amount, max_inr), None

    raise ValueError(
        f"Scheme '{scheme.get('scheme_id')}' does not contain valid loan amount rules."
    )


def _get_interest_rate(
    scheme: dict[str, Any],
    channel_partner_type: str | None,
) -> float:
    """
    Return the applicable interest rate.

    Fixed-rate schemes use value_percent directly.

    Partner-dependent schemes use the selected channel partner type
    to determine the applicable rate from the scheme's configured
    partner-specific rates.
    """

    interest_rules = scheme.get("interest_rate", {})

    interest_type = interest_rules.get("type")

    # ---------------------------------------------------------
    # Fixed interest rate
    # ---------------------------------------------------------

    if interest_type == "fixed":
        value = interest_rules.get("value_percent")

        if value is None:
            raise ValueError(
                f"Scheme '{scheme.get('scheme_id')}' does not contain "
                "a valid fixed interest rate."
            )

        return float(value)

    # ---------------------------------------------------------
    # Partner-dependent interest rate
    # ---------------------------------------------------------

    if interest_type == "partner_dependent":
        if not channel_partner_type:
            raise ValueError(
                f"Scheme '{scheme.get('scheme_id')}' requires a channel "
                "partner type to determine the applicable interest rate."
            )

        rates = interest_rules.get("rates")

        if not isinstance(rates, list):
            raise ValueError(
                f"Scheme '{scheme.get('scheme_id')}' does not contain "
                "valid partner-dependent interest rates."
            )

        for rate_option in rates:
            if rate_option.get("channel_partner_type") == channel_partner_type:
                value = rate_option.get("value_percent")

                if value is None:
                    raise ValueError(
                        f"Scheme '{scheme.get('scheme_id')}' does not contain "
                        f"a valid interest rate for partner type "
                        f"'{channel_partner_type}'."
                    )

                return float(value)

        allowed_partner_types = [
            option.get("channel_partner_type")
            for option in rates
            if option.get("channel_partner_type")
        ]

        raise ValueError(
            f"Channel partner type '{channel_partner_type}' is not supported "
            f"for scheme '{scheme.get('scheme_id')}'. "
            f"Supported partner types: {', '.join(allowed_partner_types)}."
        )

    # ---------------------------------------------------------
    # Unsupported configuration
    # ---------------------------------------------------------

    raise ValueError(
        f"Scheme '{scheme.get('scheme_id')}' has an unsupported "
        "interest rate type."
    )


def _get_repayment_period(
    scheme: dict[str, Any],
    requested_period_years: int | None,
) -> int:
    """
    Determine the repayment period in years.

    If the applicant supplies a repayment period, ensure it does not
    exceed the scheme's maximum repayment period.
    """

    repayment = scheme.get("repayment", {})

    maximum_period = repayment.get("period_years")

    if maximum_period is None:
        raise ValueError(
            f"Scheme '{scheme.get('scheme_id')}' does not contain "
            "a repayment period."
        )

    maximum_period = int(maximum_period)

    if requested_period_years is None:
        return maximum_period

    if requested_period_years <= 0:
        raise ValueError(
            "Repayment period must be greater than zero."
        )

    if requested_period_years > maximum_period:
        raise ValueError(
            f"Requested repayment period of {requested_period_years} years "
            f"exceeds the scheme maximum of {maximum_period} years."
        )

    return requested_period_years


def _get_frequency_parameters(
    installment_frequency: str,
) -> tuple[int, float]:
    """
    Return the number of installments per year and the number of
    months represented by one installment.

    Returns:
        installments_per_year
        months_per_installment
    """

    frequency_rules = {
        "monthly": (12, 1),
        "quarterly": (4, 3),
        "half_yearly": (2, 6),
        "yearly": (1, 12),
    }

    try:
        return frequency_rules[installment_frequency]
    except KeyError as exc:
        raise ValueError(
            f"Unsupported installment frequency: '{installment_frequency}'."
        ) from exc


def _calculate_installment(
    principal: float,
    annual_interest_rate: float,
    number_of_installments: int,
    installments_per_year: int,
) -> float:
    """
    Calculate the installment amount using a reducing-balance formula.

    The annual interest rate is converted to the rate applicable for
    the selected installment frequency.

    Formula:

        EMI = P × r × (1+r)^n / ((1+r)^n - 1)

    where:
        P = principal
        r = periodic interest rate
        n = total number of installments
    """

    if principal <= 0:
        return 0.0

    if number_of_installments <= 0:
        raise ValueError(
            "Number of installments must be greater than zero."
        )

    if installments_per_year <= 0:
        raise ValueError(
            "Installments per year must be greater than zero."
        )

    periodic_rate = (
        annual_interest_rate
        / (installments_per_year * 100)
    )

    if periodic_rate == 0:
        return principal / number_of_installments

    factor = (1 + periodic_rate) ** number_of_installments

    installment = (
        principal
        * periodic_rate
        * factor
        / (factor - 1)
    )

    return installment


def calculate_financing(
    request: CalculatorRequest,
) -> CalculatorResponse:
    """
    Calculate financing and repayment details for a selected scheme.
    """

    scheme_model = get_scheme_by_id(request.scheme_id)

    if scheme_model is None:
        raise ValueError(
            f"Scheme '{request.scheme_id}' was not found."
        )

    scheme = scheme_model.model_dump()

    scheme_id = scheme["scheme_id"]
    scheme_name = scheme["scheme_name"]
    scheme_category = scheme.get("scheme_category")

    # ---------------------------------------------------------
    # Determine the base amount
    # ---------------------------------------------------------

    if scheme_category == "education":
        if request.course_fee_inr is None:
            raise ValueError(
                "course_fee_inr is required for education schemes."
            )

        base_amount = request.course_fee_inr

    else:
        if request.project_cost_inr is None:
            raise ValueError(
                "project_cost_inr is required for entrepreneurship schemes."
            )

        base_amount = request.project_cost_inr

    if base_amount <= 0:
        raise ValueError(
            "The financing base amount must be greater than zero."
        )

    # ---------------------------------------------------------
    # Maximum eligible loan
    # ---------------------------------------------------------

    maximum_eligible_loan, financing_percentage = (
        _calculate_maximum_eligible_loan(
            scheme=scheme,
            base_amount=base_amount,
        )
    )

    if maximum_eligible_loan <= 0:
        raise ValueError(
            "The calculated maximum eligible loan amount is zero."
        )

    # ---------------------------------------------------------
    # Requested loan amount
    # ---------------------------------------------------------

    if request.requested_loan_inr is None:
        calculated_loan = maximum_eligible_loan

    else:
        if request.requested_loan_inr <= 0:
            raise ValueError(
                "requested_loan_inr must be greater than zero."
            )

        if request.requested_loan_inr > maximum_eligible_loan:
            raise ValueError(
                f"Requested loan amount ₹{request.requested_loan_inr:,} "
                f"exceeds the maximum eligible amount "
                f"₹{maximum_eligible_loan:,}."
            )

        calculated_loan = request.requested_loan_inr

    # ---------------------------------------------------------
    # Interest
    # ---------------------------------------------------------

    interest_rate = _get_interest_rate(
        scheme=scheme,
        channel_partner_type=request.channel_partner_type,
    )

    # ---------------------------------------------------------
    # Repayment period
    # ---------------------------------------------------------

    repayment_period_years = _get_repayment_period(
        scheme=scheme,
        requested_period_years=request.repayment_period_years,
    )

    repayment_period_months = repayment_period_years * 12

    # ---------------------------------------------------------
    # Installment frequency
    # ---------------------------------------------------------

    installments_per_year, months_per_installment = (
        _get_frequency_parameters(
            request.installment_frequency
        )
    )

    number_of_installments = (
        repayment_period_years * installments_per_year
    )

    # ---------------------------------------------------------
    # Installment calculation
    # ---------------------------------------------------------

    installment = _calculate_installment(
        principal=calculated_loan,
        annual_interest_rate=interest_rate,
        number_of_installments=number_of_installments,
        installments_per_year=installments_per_year,
    )

    # ---------------------------------------------------------
    # Total repayment
    # ---------------------------------------------------------

    total_repayment = (
        installment * number_of_installments
    )

    total_interest = (
        total_repayment - calculated_loan
    )

    # ---------------------------------------------------------
    # Moratorium
    # ---------------------------------------------------------

    repayment = scheme.get("repayment", {})

    moratorium_months = repayment.get("moratorium_months")
    moratorium_description = repayment.get(
        "moratorium_description"
    )

    # ---------------------------------------------------------
    # Response
    # ---------------------------------------------------------

    result = CalculatorResult(
        scheme_id=scheme_id,
        scheme_name=scheme_name,
        base_amount_inr=base_amount,
        maximum_eligible_loan_inr=maximum_eligible_loan,
        calculated_loan_inr=calculated_loan,
        financing_percentage=financing_percentage,
        interest_rate_percent=interest_rate,
        repayment_period_years=repayment_period_years,
        repayment_period_months=repayment_period_months,
        installment_frequency=request.installment_frequency,
        estimated_installment_inr=round(installment, 2),
        total_repayment_inr=round(total_repayment, 2),
        total_interest_inr=round(total_interest, 2),
        moratorium_months=moratorium_months,
        moratorium_description=moratorium_description,
    )

    return CalculatorResponse(result=result)