#!/bin/zsh
# Starts Voice Studio on http://localhost:8765 (local only).
cd "$(dirname "$0")"
exec .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port "${PORT:-8765}"
