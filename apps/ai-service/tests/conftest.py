from collections.abc import Iterator

import pytest
from fastapi import APIRouter
from fastapi.testclient import TestClient

from app.api.deps import protected_router
from app.core.config import Settings, get_settings
from app.main import create_app

TEST_KEY = "test-internal-key-0123456789"


def _probe_router() -> APIRouter:
    """A protected route that exists only in tests (S0 has no /transcribe or /extract yet)."""
    router = protected_router()

    @router.get("/__probe")
    def probe() -> dict[str, str]:
        return {"probe": "ok"}

    return router


@pytest.fixture
def client() -> Iterator[TestClient]:
    app = create_app(protected_routers=[_probe_router()])
    app.dependency_overrides[get_settings] = lambda: Settings(internal_key=TEST_KEY)
    with TestClient(app) as test_client:
        yield test_client
