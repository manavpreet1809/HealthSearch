# Public demo image: local search, cited excerpts, and Qwen2.5 1.5B via Ollama.
# Runs on a free Hugging Face Docker Space (port 7860, user 1000) or `docker run`.
FROM python:3.12-slim

ARG OLLAMA_VERSION=0.40.0
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 HOME=/home/user \
    BACKEND_MODE=local OLLAMA_MODEL=qwen2.5:1.5b OLLAMA_HOST=127.0.0.1:11434 \
    OLLAMA_MODELS=/home/user/ollama OLLAMA_KEEP_ALIVE=24h OLLAMA_NUM_PARALLEL=1

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates zstd \
    && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL "https://github.com/ollama/ollama/releases/download/v${OLLAMA_VERSION}/ollama-linux-$(dpkg --print-architecture).tar.zst" \
    | zstd -d | tar -x -C /usr && rm -rf /usr/lib/ollama/cuda_* /usr/lib/ollama/rocm*  # CPU-only host
RUN useradd -m -u 1000 user
WORKDIR /home/user/app

COPY requirements-demo.lock .
RUN pip install --index-url https://download.pytorch.org/whl/cpu torch==2.14.1 \
    && pip install -r requirements-demo.lock

USER user
RUN ollama serve >/tmp/ollama.log 2>&1 & \
    for i in $(seq 30); do ollama list >/dev/null 2>&1 && break; sleep 1; done; \
    ollama pull "$OLLAMA_MODEL"

COPY --chown=user . .
# The evaluated corpus ships with the Space; a plain clone downloads it from NIDDK instead.
RUN if [ ! -f data/processed/wellquery.sqlite3 ]; then python -m app.ingest --download; fi \
    && python -m app.search --index --download-model

EXPOSE 7860
CMD ["sh", "deploy/start.sh"]
