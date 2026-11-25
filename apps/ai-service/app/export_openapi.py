"""Write the committed OpenAPI snapshot: python -m app.export_openapi

CI regenerates it and fails on any diff (apps/ai-service/CLAUDE.md).
"""

import json
from pathlib import Path

from fastapi.openapi.utils import get_openapi

from app.main import TITLE, VERSION, app

SNAPSHOT = Path(__file__).resolve().parents[3] / "docs" / "ai-service" / "openapi.json"


def build_schema() -> str:
    schema = get_openapi(title=TITLE, version=VERSION, routes=app.routes)
    return json.dumps(schema, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def main() -> None:
    SNAPSHOT.write_text(build_schema(), encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
