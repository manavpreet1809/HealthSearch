# WellQuery

Answers general questions about diabetes and kidney health from 15 NIDDK articles, and shows the source passage for every answer.
Python, FastAPI, SQLite, BM25 + MiniLM search, optional Qwen2.5 1.5B summaries through Ollama.

<p align="center"><img src="docs/images/quick-answer.png" alt="WellQuery answering a question with its sources" width="560"></p>

## Run with Docker

```sh
make docker
make docker-run
```

App: http://127.0.0.1:7860 (first build downloads the ~1 GB model)

## Run locally

Needs Python 3.12, [uv](https://docs.astral.sh/uv/) and `make`.

```sh
make setup     # install dependencies into .venv
make ingest    # download the 15 articles
make index     # build the search index
make local     # http://127.0.0.1:8000
```

Summaries (optional), in a second terminal:

```sh
make model-serve
make model-pull                  # once, ~1 GB
```

Then set `OLLAMA_MODEL=qwen2.5:1.5b` in `.env` and pick "AI summary" in the app.

## Test

```sh
make check       # unit tests + whitespace check
make smoke       # end-to-end check with the real search index
make evaluate    # re-run the 60 main test questions
```

## Publish to Hugging Face Spaces

```sh
hf auth login
make deploy SPACE=<hf-username>/wellquery
```

## Notes

- Not medical advice. Only covers what is in the 15 articles.
- Emergency and personal dosing questions are refused.
- The test questions are unreviewed drafts, so the results page is a development check only.
- Health content: [NIDDK](https://www.niddk.nih.gov/), reused under its [copyright policy](https://www.niddk.nih.gov/copyright). Not endorsed by NIDDK.
- Built on my earlier MediBot project. Its Databricks + Llama setup is still available with `BACKEND_MODE=databricks` (off by default). See [ATTRIBUTION.md](ATTRIBUTION.md).
