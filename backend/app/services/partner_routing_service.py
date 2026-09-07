import math
from typing import Any

from backend.app.schemas.partner import (
    PartnerRouteResult,
    PartnerRoutingRequest,
    PartnerRoutingResponse,
)
from backend.app.services.partner_location_service import (
    get_all_partner_locations,
)
from backend.app.services.partner_service import (
    get_partner_by_id,
)
from backend.app.services.scheme_service import (
    get_scheme_by_id,
)


def _calculate_distance_km(
    latitude_1: float,
    longitude_1: float,
    latitude_2: float,
    longitude_2: float,
) -> float:
    """
    Calculate the great-circle distance between two coordinates
    using the Haversine formula.
    """

    earth_radius_km = 6371.0

    lat1 = math.radians(latitude_1)
    lat2 = math.radians(latitude_2)

    delta_lat = math.radians(
        latitude_2 - latitude_1
    )
    delta_lon = math.radians(
        longitude_2 - longitude_1
    )

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(delta_lon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a),
    )

    return earth_radius_km * c


def _is_scheme_compatible(
    partner: dict[str, Any],
    scheme: dict[str, Any],
) -> bool:
    """
    Determine whether a channel partner is compatible with a scheme.

    An empty channel_partner_types list means that the scheme does not
    impose a partner-type restriction in the available scheme data.
    """

    allowed_partner_types = (
        scheme.get("channel_partner_types") or []
    )

    if not allowed_partner_types:
        return True

    partner_type = partner.get("partner_type")

    if not partner_type:
        return False

    partner_type_normalized = (
        str(partner_type).strip().lower()
    )

    return any(
        str(allowed_type).strip().lower()
        == partner_type_normalized
        for allowed_type in allowed_partner_types
    )


def _calculate_recommendation_score(
    distance_km: float,
    scheme_compatible: bool,
    operationally_eligible: bool | None,
    fund_utilization_percent: float | None,
    npa_percent: float | None,
) -> float:
    """
    Calculate a recommendation score for a channel partner location.

    The score considers:
    - scheme compatibility
    - operational eligibility
    - fund utilization
    - NPA
    - geographic distance
    """

    score = 0.0

    # Scheme compatibility: up to 40 points.
    if scheme_compatible:
        score += 40.0

    # Operational eligibility: up to 30 points.
    if operationally_eligible is True:
        score += 30.0
    elif operationally_eligible is None:
        score += 15.0

    # Fund utilization: up to 20 points.
    # Lower utilization is treated as better availability.
    if fund_utilization_percent is not None:
        utilization = max(
            0.0,
            min(100.0, fund_utilization_percent),
        )

        score += 20.0 * (
            1.0 - utilization / 100.0
        )
    else:
        score += 10.0

    # NPA: up to 10 points.
    # Lower NPA is treated as better.
    if npa_percent is not None:
        npa = max(
            0.0,
            min(100.0, npa_percent),
        )

        score += 10.0 * (
            1.0 - npa / 100.0
        )
    else:
        score += 5.0

    # Distance bonus: up to 5 points.
    distance_bonus = max(
        0.0,
        5.0 * (1.0 - distance_km / 100.0),
    )

    score += distance_bonus

    return round(
        min(score, 100.0),
        2,
    )


def find_nearby_partners(
    request: PartnerRoutingRequest,
) -> PartnerRoutingResponse:
    """
    Find and rank physical channel-partner locations near an applicant.

    Processing steps:

    1. Validate the requested scheme.
    2. Load physical partner locations.
    3. Optionally filter locations by partner type.
    4. Ignore locations without coordinates.
    5. Calculate geographic distance.
    6. Apply radius filtering.
    7. Resolve the parent channel partner organization.
    8. Check scheme compatibility.
    9. Calculate recommendation score.
    10. Rank locations.
    """

    scheme = get_scheme_by_id(
        request.scheme_id
    )

    if scheme is None:
        raise ValueError(
            f"Scheme '{request.scheme_id}' was not found."
        )

    scheme_data = scheme.model_dump()

    locations = get_all_partner_locations()

    results: list[PartnerRouteResult] = []

    for location in locations:
        latitude = location.get("latitude")
        longitude = location.get("longitude")

        # Geographic routing requires valid coordinates.
        if latitude is None or longitude is None:
            continue

        partner_id = location.get("partner_id")

        if not partner_id:
            continue

        # Resolve the organization associated with this location.
        partner = get_partner_by_id(partner_id)

        if partner is None:
            # Ignore orphaned location records.
            continue

        # Optional partner-type filter.
        if request.partner_type:
            partner_type = partner.get("partner_type")

            if not partner_type:
                continue

            if (
                str(partner_type).strip().lower()
                != request.partner_type.strip().lower()
            ):
                continue

        distance_km = _calculate_distance_km(
            request.latitude,
            request.longitude,
            float(latitude),
            float(longitude),
        )

        # Outside requested radius.
        if distance_km > request.radius_km:
            continue

        scheme_compatible = _is_scheme_compatible(
            partner,
            scheme_data,
        )

        # Do not recommend incompatible partners.
        if not scheme_compatible:
            continue

        recommendation_score = (
            _calculate_recommendation_score(
                distance_km=distance_km,
                scheme_compatible=scheme_compatible,
                operationally_eligible=partner.get(
                    "operationally_eligible"
                ),
                fund_utilization_percent=partner.get(
                    "fund_utilization_percent"
                ),
                npa_percent=partner.get(
                    "npa_percent"
                ),
            )
        )

        results.append(
            PartnerRouteResult(
                partner_id=partner["partner_id"],
                partner_name=partner["partner_name"],
                partner_type=partner["partner_type"],
                location_id=location["location_id"],
                location_name=location["location_name"],
                location_type=location["location_type"],
                state=location.get(
                    "state"
                ) or partner.get("state"),
                district=location.get(
                    "district"
                ),
                city=location.get(
                    "city"
                ),
                address=location.get(
                    "address"
                ) or partner.get("address"),
                latitude=latitude,
                longitude=longitude,
                distance_km=round(
                    distance_km,
                    2,
                ),
                scheme_compatible=scheme_compatible,
                operationally_eligible=partner.get(
                    "operationally_eligible"
                ),
                fund_utilization_percent=partner.get(
                    "fund_utilization_percent"
                ),
                npa_percent=partner.get(
                    "npa_percent"
                ),
                recommendation_score=(
                    recommendation_score
                ),
            )
        )

    # Higher recommendation score first.
    # Distance breaks ties.
    results.sort(
        key=lambda partner: (
            -partner.recommendation_score,
            partner.distance_km,
        )
    )

    return PartnerRoutingResponse(
        scheme_id=request.scheme_id,
        applicant_latitude=request.latitude,
        applicant_longitude=request.longitude,
        radius_km=request.radius_km,
        total_matches=len(results),
        partners=results,
    )