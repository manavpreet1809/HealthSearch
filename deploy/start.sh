#!/bin/sh
# Ollama listens only inside the container; the web app is the public port.
ollama serve >/tmp/ollama.log 2>&1 &
exec python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-7860}"
