"""FastAPI application factory.

Run locally: uvicorn app.main:app --host 127.0.0.1 --port 8001
"""

from collections.abc import Sequence

from fastapi import APIRouter, FastAPI

from app.api.routes import health
from app.core.logging import configure_logging
from app.core.request_id import RequestIdMiddleware

TITLE = "Istigaba AI Service"
VERSION = "0.1.0"


def create_app(protected_routers: Sequence[APIRouter] = ()) -> FastAPI:
    """Build the app. Routers passed here must come from app.api.deps.protected_router()."""
    configure_logging()
    application = FastAPI(
        title=TITLE,
        version=VERSION,
        # Internal service: no interactive docs.
        # The schema is exported to docs/ai-service/openapi.json instead.
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )
    application.add_middleware(RequestIdMiddleware)
    application.include_router(health.router)
    for router in protected_routers:
        application.include_router(router)
    return application


app = create_app()
