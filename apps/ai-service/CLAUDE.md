# apps/ai-service — FastAPI (STT + extraction)

Read root `CLAUDE.md` first. Python **3.13** (pinned in `pyproject.toml` and `.python-version`; chosen for torch/ctranslate2 wheel compatibility on Windows), FastAPI, faster-whisper, AraBERT (custom Syrian-dialect model), ruff, mypy strict, pytest.

## Rules

- Bind `127.0.0.1` only. Every route (except minimal `/health`) requires `X-Internal-Key`.
- Endpoints: `POST /transcribe` (audio → text), `POST /extract` (text → type, severity, location, description + confidences). `MODEL_VERSION` in every `/extract` response.
- **No persistence. Audio is processed from a temp file removed in `finally`** (H2). **Never log bodies, transcripts or audio**; log only `request_id`, duration, `model_version`, status (H3).
- Input contains no user identity; reject/ignore any such field.
- STT: model size/device/compute via env; auto CUDA float16 else CPU int8; weights in `AI_MODELS_DIR` (outside git, one copy only—disk is limited).
- Type via AraBERT (placeholder slugs: medical, fire, accident, security, infrastructure, natural_disaster); severity via AraBERT; location by rule-based/Syrian gazetteer, `null` if unsure; description = cleaned input text. Thresholds: type 0.60, severity 0.50 (below → `null`). Label→`report_types.id` mapping is Laravel's job, not this service's.
- Commit `docs/ai-service/openapi.json`; CI fails on drift.
- Tests: pytest with IDs in names/markers (FR-013..018, NFR-005, NFR-0xx); a test proves zero audio files remain after success and failure. Eval (`python -m eval.run`, accuracy ≥85% type) is manual/scheduled, not per push.

## Structure

```
app/
├── main.py
├── api/{routes/(transcribe,extract,health).py, deps.py}   # routes thin: validate → call service → return schema
├── schemas/                 # Pydantic request/response models (incl. model_version)
├── services/{stt,classifier,severity,location,text_cleaning}.py
├── core/{config,security,logging,request_id}.py
└── models/                  # loaders only; weights live in AI_MODELS_DIR, never in git
tests/        eval/
```

## Do / Don't

- Do: type everything (mypy strict); services are pure/testable and take explicit inputs; load models once at startup.
- Do: temp audio in a `tempfile` and delete in `finally`; return `null` fields when confidence is below threshold.
- Don't: log request bodies, transcripts, audio or filenames; no `print`; no persistence of any kind.
- Don't: accept or forward user identifiers; don't import Laravel concepts (no report ids, no type ids).
- Don't: expose routes without `X-Internal-Key`; don't bind to `0.0.0.0`.
- Don't: block the event loop with model inference in async routes (use threadpool/`run_in_executor`).

## Commands

`python -m venv .venv && source .venv/Scripts/activate` · `pip-sync requirements.lock` · `ruff check . && ruff format --check .` · `mypy .` · `pytest` · `uvicorn app.main:app --host 127.0.0.1 --port 8001`
