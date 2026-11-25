"""JSON logging that can only emit an allowlist of fields (H3, NFR-014).

The service must never log request bodies, transcripts, audio, filenames or user identity.
Instead of trusting every call site, the formatter drops anything that is not explicitly allowed:
free-text messages are replaced unless they are a plain event name, extra fields outside the
allowlist are discarded, and exception text is reduced to the exception type.
"""

import json
import logging
import re
from datetime import UTC, datetime
from typing import Final

#: Fields that may appear in a log line besides timestamp/level/event.
ALLOWED_FIELDS: Final = frozenset(
    {"request_id", "duration_ms", "model_version", "status", "path", "method"}
)
_EVENT_NAME: Final = re.compile(r"^[a-z][a-z0-9_.]{0,63}$")
_DROPPED: Final = "[dropped]"


class AllowlistJsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        message = record.msg if isinstance(record.msg, str) else ""
        entry: dict[str, object] = {
            "timestamp": datetime.fromtimestamp(record.created, UTC).isoformat(),
            "level": record.levelname.lower(),
            # Only plain event names (e.g. "http.request") survive; formatted text never does.
            "event": message if _EVENT_NAME.match(message) and not record.args else _DROPPED,
        }
        for name in sorted(ALLOWED_FIELDS):
            value = record.__dict__.get(name)
            if isinstance(value, str | int | float) and not isinstance(value, bool):
                entry[name] = value
        if record.exc_info and record.exc_info[0] is not None:
            entry["exception"] = record.exc_info[0].__name__
        return json.dumps(entry, ensure_ascii=False)


def configure_logging(level: int = logging.INFO) -> None:
    """Route the app logger and uvicorn's loggers through the allowlist formatter."""
    handler = logging.StreamHandler()
    handler.setFormatter(AllowlistJsonFormatter())
    for name in ("istigaba", "uvicorn", "uvicorn.error", "uvicorn.access"):
        logger = logging.getLogger(name)
        logger.handlers = [handler]
        logger.setLevel(level)
        logger.propagate = False
    # uvicorn's access log prints full request lines (paths with query strings); the request-id
    # middleware writes its own allowlisted line instead.
    logging.getLogger("uvicorn.access").disabled = True


logger: Final = logging.getLogger("istigaba.ai")
