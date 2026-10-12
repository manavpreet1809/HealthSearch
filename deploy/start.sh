#!/bin/sh
# Ollama listens only inside the container; the web app is the public port.
ollama serve >/tmp/ollama.log 2>&1 &
# Load the model into memory now so the first visitor's AI answer is not also a cold start.
(for i in $(seq 60); do
   curl -sf http://127.0.0.1:11434/api/tags >/dev/null && break; sleep 1
 done
 curl -s http://127.0.0.1:11434/api/generate -d "{\"model\":\"$OLLAMA_MODEL\",\"keep_alive\":-1}" >/dev/null) &
exec python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-7860}"
