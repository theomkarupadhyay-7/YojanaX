"""
Personalized scheme recommendation service.

Eligibility remains deterministic and authoritative.
The recommender ranks only schemes that have already passed eligibility.
"""

from typing import Any
import re

from backend.app.schemas.eligibility import EligibilityRequest
from backend.app.schemas.recommendation import (
    RecommendationItem,
    RecommendationRequest,
    RecommendationResponse,
)
from backend.app.services.eligibility_service import check_eligibility


SCHEME_HINTS = {
    "MFS": {
        "keywords": {"small", "micro", "low", "small business", "micro business"},
        "max_project": 140_000,
        "interest": 6.5,
        "max_loan": 125_000,
        "repayment_years": 3,
    },
    "AMY": {
        "keywords": {"micro", "small", "business", "mfi"},
        "max_project": 140_000,
        "interest": 15.0,
        "max_loan": 125_000,
        "repayment_years": 3,
    },
    "TERM_LOAN": {
        "keywords": {"term", "business", "enterprise", "larger", "equipment"},
        "max_project": 5_000_000,
        "interest": 8.0,
        "max_loan": 4_500_000,
        "repayment_years": 7,
    },
    "UNY": {
        "keywords": {"micro", "small", "business", "low loan"},
        "max_project": 500_000,
        "interest": 13.0,
        "max_loan": 450_000,
        "repayment_years": 5,
    },
    "ELS": {
        "keywords": {
            "education",
            "engineering",
            "medical",
            "college",
            "course",
            "student",
        },
        "interest": 6.5,
        "max_loan": 4_000_000,
        "repayment_years": 12,
    },
}


def _normalise(value: Any) -> str:
    if value is None:
        return ""

    return re.sub(r"\s+", " ", str(value).strip().lower())


def _get_val(obj: Any, key: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _only_channel_partner_pending(item: Any) -> bool:
    """
    Return True when an 'incomplete' result has NO failed checks and
    every pending check is solely about the channel partner.
    Such a result means the applicant passes all real eligibility
    criteria; only the partner selection step is outstanding.
    """
    checks = _get_val(item, "checks", []) or []
    has_failed = any(
        _get_val(c, "status") == "failed" for c in checks
    )
    if has_failed:
        return False
    pending = [c for c in checks if _get_val(c, "status") == "pending"]
    if not pending:
        return False
    return all(
        "channel partner" in str(_get_val(c, "criterion", "")).lower().replace("_", " ")
        for c in pending
    )


def _eligible_results(
    request: RecommendationRequest,
) -> list[Any]:
    eligibility_request = EligibilityRequest(
        **request.model_dump(
            exclude={
                "preference",
                "requested_loan_inr",
                "repayment_period_years",
                "installment_frequency",
            }
        )
    )

    response = check_eligibility(eligibility_request)
    results = _get_val(response, "results", []) or []

    eligible = []
    for item in results:
        status = _get_val(item, "status")
        if status == "eligible":
            eligible.append(item)
        elif status == "incomplete" and _only_channel_partner_pending(item):
            eligible.append(item)

    return eligible


def _deterministic_score(
    scheme_id: str,
    request: RecommendationRequest,
) -> tuple[float, list[str]]:
    hints = SCHEME_HINTS.get(scheme_id, {})

    score = 50.0
    factors: list[str] = []

    preference = _normalise(request.preference)
    project_cost = request.project_cost_inr

    # Purpose matching
    if request.purpose == "education" and scheme_id == "ELS":
        score += 35
        factors.append(
            "Educational purpose directly matches the scheme."
        )

    # Project cost matching
    if project_cost is not None and "max_project" in hints:
        if project_cost <= hints["max_project"]:
            score += 20
            factors.append(
                "Project cost fits the scheme's financing range."
            )

        if project_cost <= 140_000 and scheme_id in {"MFS", "AMY"}:
            score += 10
            factors.append(
                "Small project size is well suited to micro-finance."
            )

        if 140_000 < project_cost <= 5_000_000 and scheme_id == "TERM_LOAN":
            score += 12
            factors.append(
                "Project size is well suited to a term loan."
            )

        if project_cost <= 500_000 and scheme_id == "UNY":
            score += 8
            factors.append(
                "Project size fits Udyam Nidhi's small/micro range."
            )

    # Requested loan amount
    if request.requested_loan_inr is not None:
        max_loan = hints.get("max_loan")

        if max_loan is not None and request.requested_loan_inr <= max_loan:
            score += 8
            factors.append(
                "Requested loan amount fits the scheme limit."
            )

    # Repayment period
    if request.repayment_period_years is not None:
        scheme_years = hints.get("repayment_years")

        if (
            scheme_years is not None
            and scheme_years >= request.repayment_period_years
        ):
            score += 5
            factors.append(
                "Repayment horizon can accommodate the requested period."
            )

    # Lower interest preference
    if "lower interest" in preference or "low interest" in preference:
        rate = float(hints.get("interest", 99))

        score += max(0.0, 12.0 - rate / 2.0)

        factors.append(
            "Lower beneficiary interest rate is preferred."
        )

    # Lower EMI preference
    if "lower emi" in preference or "low emi" in preference:
        years = hints.get("repayment_years", 1)

        score += min(8.0, float(years))

        factors.append(
            "Longer repayment can support a lower installment."
        )

    # Shorter repayment preference
    if "shorter repayment" in preference:
        years = hints.get("repayment_years", 99)

        score += max(0.0, 6.0 - years / 2.0)

        factors.append(
            "Shorter repayment period is preferred."
        )

    # Preference keyword matching
    pref_tokens = set(
        re.findall(r"[a-z]+", preference)
    )

    overlap = pref_tokens & set(
        hints.get("keywords", set())
    )

    if overlap:
        score += min(
            10.0,
            3.0 * len(overlap),
        )

        factors.append(
            "User preference matches the scheme purpose."
        )

    if not factors:
        factors.append(
            "Scheme is eligible and matches the applicant profile."
        )

    return (
        round(
            max(0.0, min(100.0, score)),
            2,
        ),
        factors,
    )


def recommend_schemes(
    request: RecommendationRequest,
) -> RecommendationResponse:
    """
    Recommend the best eligible schemes for the applicant.

    The eligibility engine is the authoritative gate.
    This service only ranks schemes that passed that gate.
    """

    eligible = _eligible_results(request)

    if not eligible:
        return RecommendationResponse(
            total_eligible=0,
            recommendations=[],
            ranking_method=(
                "Eligibility-gated personalized scheme ranking."
            ),
        )

    candidates = []

    for item in eligible:
        scheme_id = str(_get_val(item, "scheme_id", "")).upper()

        score, factors = _deterministic_score(
            scheme_id,
            request,
        )

        candidates.append(
            {
                "scheme_id": scheme_id,
                "scheme_name": str(_get_val(item, "scheme_name", "")),
                "eligibility_status": str(_get_val(item, "status", "")),
                "deterministic_score": score,
                "fit_factors": factors,
            }
        )

    candidates.sort(
        key=lambda item: item["deterministic_score"],
        reverse=True,
    )

    recommendations = []

    for rank, item in enumerate(
        candidates,
        start=1,
    ):
        recommendations.append(
            RecommendationItem(
                rank=rank,
                scheme_id=item["scheme_id"],
                scheme_name=item["scheme_name"],
                match_score=item["deterministic_score"],
                eligibility_status=item["eligibility_status"],
                recommendation_reason=item["fit_factors"][0],
                fit_factors=item["fit_factors"],
            )
        )

    return RecommendationResponse(
        total_eligible=len(recommendations),
        recommendations=recommendations,
        ranking_method=(
            "Eligibility-gated personalized scheme ranking."
        ),
    )