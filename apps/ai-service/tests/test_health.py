from fastapi.testclient import TestClient


def test_s0_health_returns_status_only(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_s0_health_needs_no_internal_key(client: TestClient) -> None:
    assert client.get("/health", headers={"X-Internal-Key": "wrong"}).status_code == 200


def test_s0_no_interactive_docs_or_live_schema_are_exposed(client: TestClient) -> None:
    for path in ("/docs", "/redoc", "/openapi.json"):
        assert client.get(path).status_code == 404
