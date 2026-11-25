"""Request id propagation (X-Request-Id) and one allowlisted log line per request."""

import re
import time
import uuid
from contextvars import ContextVar
from typing import Final

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import logger

HEADER: Final = "X-Request-Id"
_VALID: Final = re.compile(r"^[A-Za-z0-9-]{8,64}$")

current_request_id: ContextVar[str | None] = ContextVar("current_request_id", default=None)


def resolve_request_id(incoming: str | None) -> str:
    """Keep a well-formed id from Laravel; otherwise generate a UUID v4."""
    if incoming is not None and _VALID.match(incoming):
        return incoming
    return str(uuid.uuid4())


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = resolve_request_id(request.headers.get(HEADER))
        token = current_request_id.set(request_id)
        started = time.perf_counter()
        status = 500
        try:
            response = await call_next(request)
            status = response.status_code
            response.headers[HEADER] = request_id
            return response
        finally:
            route = request.scope.get("route")
            logger.info(
                "http.request",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": getattr(route, "path", "unmatched"),
                    "status": status,
                    "duration_ms": round((time.perf_counter() - started) * 1000, 1),
                },
            )
            current_request_id.reset(token)
