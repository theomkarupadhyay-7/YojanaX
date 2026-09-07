from fastapi import APIRouter, HTTPException

from backend.app.schemas.scheme import Scheme
from backend.app.services.scheme_service import (
    get_all_schemes,
    get_scheme_by_id,
)


router = APIRouter(
    prefix="/schemes",
    tags=["Schemes"],
)


@router.get("", response_model=list[Scheme])
def get_schemes() -> list[Scheme]:
    """
    Return all available schemes.
    """

    try:
        return get_all_schemes()

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while loading schemes.",
        ) from exc


@router.get("/{scheme_id}", response_model=Scheme)
def get_scheme(scheme_id: str) -> Scheme:
    """
    Return a single scheme by scheme_id.
    """

    try:
        scheme = get_scheme_by_id(scheme_id)

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while loading the scheme.",
        ) from exc

    if scheme is None:
        raise HTTPException(
            status_code=404,
            detail=f"Scheme '{scheme_id}' not found.",
        )

    return scheme