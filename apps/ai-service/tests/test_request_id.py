import re

import pytest
from fastapi.testclient import TestClient

UUID_V4 = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")


def test_s0_request_id_is_generated_when_missing(client: TestClient) -> None:
    assert UUID_V4.match(client.get("/health").headers["X-Request-Id"])


def test_s0_request_id_from_laravel_is_propagated(client: TestClient) -> None:
    response = client.get("/health", headers={"X-Request-Id": "laravel-req-0001"})

    assert response.headers["X-Request-Id"] == "laravel-req-0001"


@pytest.mark.parametrize("bad", ["short", "has spaces here", "x" * 65, "semi;colon-1234"])
def test_s0_malformed_request_id_is_replaced(client: TestClient, bad: str) -> None:
    assert UUID_V4.match(
        client.get("/health", headers={"X-Request-Id": bad}).headers["X-Request-Id"]
    )
