"""Shared route dependencies."""

from fastapi import APIRouter, Depends

from app.core.security import require_internal_key


def protected_router() -> APIRouter:
    """Router whose every route requires X-Internal-Key. /transcribe and /extract go here (S8)."""
    return APIRouter(dependencies=[Depends(require_internal_key)])
