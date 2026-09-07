from fastapi import APIRouter, HTTPException, Query

from backend.app.schemas.partner import (
    ChannelPartner,
    ChannelPartnerListResponse,
    PartnerRoutingRequest,
    PartnerRoutingResponse,
)
from backend.app.services.partner_routing_service import (
    find_nearby_partners,
)
from backend.app.services.partner_service import (
    get_partner_by_id,
    search_partners,
)


router = APIRouter(
    prefix="/partners",
    tags=["Channel Partners"],
)


@router.get(
    "",
    response_model=ChannelPartnerListResponse,
)
def list_channel_partners(
    partner_type: str | None = Query(
        default=None,
        description="Filter by channel partner type.",
    ),
    state: str | None = Query(
        default=None,
        description="Filter by state.",
    ),
    search: str | None = Query(
        default=None,
        description="Search partner name, type, state or address.",
    ),
):
    partners = search_partners(
        partner_type=partner_type,
        state=state,
        search=search,
    )

    return ChannelPartnerListResponse(
        total=len(partners),
        partners=[
            ChannelPartner.model_validate(partner)
            for partner in partners
        ],
    )


@router.get(
    "/{partner_id}",
    response_model=ChannelPartner,
)
def get_channel_partner(partner_id: str):
    partner = get_partner_by_id(partner_id)

    if partner is None:
        raise HTTPException(
            status_code=404,
            detail="Channel partner not found.",
        )

    return ChannelPartner.model_validate(partner)


@router.post(
    "/nearby",
    response_model=PartnerRoutingResponse,
)
def find_nearby_channel_partners(
    request: PartnerRoutingRequest,
):
    try:
        return find_nearby_partners(request)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc