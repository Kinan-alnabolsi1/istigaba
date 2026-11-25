"""X-Internal-Key check for every route except /health (apps/ai-service/CLAUDE.md)."""

import hmac
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status

from app.core.config import Settings, get_settings


def require_internal_key(
    settings: Annotated[Settings, Depends(get_settings)],
    x_internal_key: Annotated[str | None, Header(alias="X-Internal-Key")] = None,
) -> None:
    expected = settings.internal_key.get_secret_value()
    # An unset key never authorises anything.
    if (
        not expected
        or x_internal_key is None
        or not hmac.compare_digest(x_internal_key.encode(), expected.encode())
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "unauthenticated", "message": "Missing or invalid internal key."},
        )
