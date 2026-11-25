from fastapi import APIRouter

from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
def health() -> HealthResponse:
    """Liveness only: no version, model or configuration details. No X-Internal-Key required."""
    return HealthResponse(status="ok")
