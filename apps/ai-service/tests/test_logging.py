"""NFR-014 / H3: the AI service logs only request_id, duration, model_version and status.

(plus method and route path)."""

import json
import logging
import sys

import pytest
from fastapi.testclient import TestClient

from app.core.logging import ALLOWED_FIELDS, AllowlistJsonFormatter


def _format(
    message: object, *args: object, exc: bool = False, **extra: object
) -> dict[str, object]:
    record = logging.LogRecord(
        "istigaba.ai", logging.INFO, __file__, 1, message, args or None, None
    )
    if exc:
        try:
            raise ValueError("transcript: انا احمد ورقمي 0999")
        except ValueError:
            record.exc_info = sys.exc_info()
    record.__dict__.update(extra)
    parsed: dict[str, object] = json.loads(AllowlistJsonFormatter().format(record))
    return parsed


def test_nfr_014_only_allowlisted_fields_are_emitted() -> None:
    entry = _format(
        "extract.done",
        request_id="req-1",
        duration_ms=12.5,
        model_version="arabert-0.1",
        status=200,
        transcript="حريق في الطابق الثالث",
        user_id="u-1",
        phone="+963900000000",
        filename="voice.m4a",
    )

    assert set(entry) - {"timestamp", "level", "event"} <= ALLOWED_FIELDS
    assert entry["event"] == "extract.done"
    assert entry["request_id"] == "req-1"
    for leaked in ("transcript", "user_id", "phone", "filename"):
        assert leaked not in entry


@pytest.mark.parametrize(
    ("message", "args"),
    [
        ("body was %s", ("حريق في الطابق الثالث",)),
        ("transcript: حريق في الطابق الثالث", ()),
        ({"text": "body"}, ()),
    ],
)
def test_nfr_014_free_text_messages_are_dropped(message: object, args: tuple[object, ...]) -> None:
    line = json.dumps(_format(message, *args), ensure_ascii=False)

    assert "حريق" not in line
    assert "body" not in line


def test_nfr_014_exception_text_is_reduced_to_its_type() -> None:
    entry = _format("extract.failed", exc=True)
    line = json.dumps(entry, ensure_ascii=False)

    assert entry["exception"] == "ValueError"
    assert "احمد" not in line
    assert "0999" not in line


def test_nfr_014_request_log_line_contains_no_query_or_headers(
    client: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    logger = logging.getLogger("istigaba.ai")
    logger.addHandler(caplog.handler)
    try:
        with caplog.at_level(logging.INFO, logger="istigaba.ai"):
            client.get("/health?name=secret", headers={"X-Request-Id": "req-log-0001"})
    finally:
        logger.removeHandler(caplog.handler)

    lines = [AllowlistJsonFormatter().format(r) for r in caplog.records if r.msg == "http.request"]
    assert lines, "the request-id middleware must log one line per request"
    entry = json.loads(lines[-1])
    assert entry["request_id"] == "req-log-0001"
    assert entry["path"] == "/health"
    assert "secret" not in lines[-1]
