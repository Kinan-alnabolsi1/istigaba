from app.export_openapi import SNAPSHOT, build_schema


def test_s0_committed_openapi_snapshot_is_current() -> None:
    """docs/ai-service/openapi.json must equal the live schema.

    Regenerate with: python -m app.export_openapi
    """
    assert SNAPSHOT.read_text(encoding="utf-8") == build_schema()
