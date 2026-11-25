import pytest
from fastapi.testclient import TestClient

from app.core.config import BIND_HOST, Settings, get_settings
from app.main import create_app
from tests.conftest import TEST_KEY, _probe_router


@pytest.mark.parametrize("headers", [{}, {"X-Internal-Key": "wrong"}, {"X-Internal-Key": ""}])
def test_s0_protected_routes_reject_missing_or_wrong_internal_key(
    client: TestClient, headers: dict[str, str]
) -> None:
    response = client.get("/__probe", headers=headers)

    assert response.status_code == 401
    assert response.json()["detail"]["code"] == "unauthenticated"


def test_s0_protected_routes_accept_the_internal_key(client: TestClient) -> None:
    response = client.get("/__probe", headers={"X-Internal-Key": TEST_KEY})

    assert response.status_code == 200


def test_s0_an_unset_internal_key_never_authorises() -> None:
    app = create_app(protected_routers=[_probe_router()])
    app.dependency_overrides[get_settings] = lambda: Settings(internal_key="")
    with TestClient(app) as test_client:
        assert test_client.get("/__probe", headers={"X-Internal-Key": ""}).status_code == 401


def test_s0_service_binds_to_loopback_only() -> None:
    assert BIND_HOST == "127.0.0.1"
