from typing import Optional

from pydantic import BaseModel, Field


class ChannelPartner(BaseModel):
    """
    Represents an authorized NSFDC channel partner organization.
    """

    partner_id: str
    partner_name: str
    partner_type: str
    state: Optional[str] = None
    address: Optional[str] = None
    source_url: Optional[str] = None

    # ---------------------------------------------------------
    # Geospatial information
    # ---------------------------------------------------------

    latitude: Optional[float] = Field(
        default=None,
        ge=-90,
        le=90,
        description="Latitude of the channel partner location.",
    )

    longitude: Optional[float] = Field(
        default=None,
        ge=-180,
        le=180,
        description="Longitude of the channel partner location.",
    )

    # ---------------------------------------------------------
    # Operational eligibility
    # ---------------------------------------------------------

    operationally_eligible: Optional[bool] = Field(
        default=None,
        description=(
            "Whether the channel partner is currently operationally "
            "eligible to process applications."
        ),
    )

    fund_utilization_percent: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
        description=(
            "Cumulative fund utilization percentage reported for "
            "the channel partner."
        ),
    )

    npa_percent: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
        description=(
            "Non-performing asset percentage used for operational "
            "partner evaluation where applicable."
        ),
    )


class ChannelPartnerListResponse(BaseModel):
    """
    Response returned when listing channel partners.
    """

    total: int
    partners: list[ChannelPartner]


class PartnerRoutingRequest(BaseModel):
    """
    Input required to find suitable channel partner locations
    near an applicant.
    """

    latitude: float = Field(
        ge=-90,
        le=90,
        description="Applicant's latitude.",
    )

    longitude: float = Field(
        ge=-180,
        le=180,
        description="Applicant's longitude.",
    )

    scheme_id: str = Field(
        description="Scheme for which a channel partner is required.",
    )

    radius_km: float = Field(
        default=50,
        gt=0,
        description=(
            "Maximum search radius around the applicant's location, "
            "in kilometres."
        ),
    )

    partner_type: Optional[str] = Field(
        default=None,
        description=(
            "Optional filter for a specific channel partner type."
        ),
    )


class PartnerRouteResult(BaseModel):
    """
    Represents one ranked physical location of an authorized
    channel partner returned by the routing engine.
    """

    # ---------------------------------------------------------
    # Parent channel partner
    # ---------------------------------------------------------

    partner_id: str
    partner_name: str
    partner_type: str

    # ---------------------------------------------------------
    # Physical location
    # ---------------------------------------------------------

    location_id: str
    location_name: str
    location_type: str

    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # ---------------------------------------------------------
    # Routing information
    # ---------------------------------------------------------

    distance_km: float

    # ---------------------------------------------------------
    # Scheme compatibility
    # ---------------------------------------------------------

    scheme_compatible: bool

    # ---------------------------------------------------------
    # Operational information
    # ---------------------------------------------------------

    operationally_eligible: Optional[bool] = None

    fund_utilization_percent: Optional[float] = None
    npa_percent: Optional[float] = None

    # ---------------------------------------------------------
    # Recommendation
    # ---------------------------------------------------------

    recommendation_score: float


class PartnerRoutingResponse(BaseModel):
    """
    Ranked list of suitable physical channel partner locations
    near the applicant.
    """

    scheme_id: str

    applicant_latitude: float
    applicant_longitude: float

    radius_km: float

    total_matches: int

    partners: list[PartnerRouteResult]