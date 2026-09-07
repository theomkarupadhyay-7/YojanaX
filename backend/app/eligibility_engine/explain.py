"""
Human-readable explanation utilities for eligibility results.

This module does not make eligibility decisions.
The EligibilityEngine remains the authority.
"""


def explain_result(result: dict) -> str:
    """
    Convert an eligibility result into a human-readable explanation.
    """

    scheme_name = result.get(
        "scheme_name",
        "Unknown scheme"
    )

    status = result.get(
        "status",
        "unknown"
    )

    checks = result.get(
        "checks",
        []
    )

    lines = [
        f"Scheme: {scheme_name}",
        f"Status: {status.replace('_', ' ').title()}",
        "",
    ]

    for check in checks:

        criterion = check.get(
            "criterion",
            "Unknown criterion"
        )

        check_status = check.get(
            "status",
            "unknown"
        )

        reason = check.get(
            "reason",
            ""
        )

        symbol = {
            "passed": "✓",
            "failed": "✗",
            "pending": "?"
        }.get(
            check_status,
            "-"
        )

        lines.append(
            f"{symbol} {criterion}: {reason}"
        )

    return "\n".join(lines)


def explain_results(results: list) -> str:
    """
    Generate a combined explanation for multiple schemes.
    """

    if not results:
        return "No scheme results available."

    explanations = []

    for result in results:
        explanations.append(
            explain_result(result)
        )

    return "\n\n".join(explanations)