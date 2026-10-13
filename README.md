# WellQuery

Answers general questions about diabetes and kidney health using 15 NIDDK
articles, with source passages shown alongside each answer.

**Built with:** Python, FastAPI, SQLite, BM25, and MiniLM. Optional summaries use
Qwen through Ollama.

## Highlights

- **Document search:** combines keyword matching and semantic search to retrieve relevant passages.
- **Visible evidence:** displays the source text alongside excerpts or optional generated summaries.
- **Evaluation:** compares retrieval methods using saved results and draft questions.

## Preview

![WellQuery answer and source passages](docs/images/quick-answer.png)

## Project structure

```text
app/          API, document ingestion, search, and answering
static/       Browser scripts and styles
templates/    Chat and evaluation pages
evaluation/   Evaluation and human-review tools
tests/        Automated tests
```

## Run locally

Requires Python 3.12, uv, and make.

```sh
make setup
make ingest
make index
make local
```

Open [localhost:8000](http://localhost:8000). This runs the source-excerpt version.
For the Docker version with summaries:

```sh
make docker
make docker-run
```

Open [localhost:7860](http://localhost:7860). The first build downloads model weights.
Run `make check` for offline tests.

## Status and sources

This is a student project, not medical advice. Evaluation questions are still
unreviewed. See [status](docs/STATUS.md) and [evaluation](evaluation/README.md).

Content comes from [NIDDK](https://www.niddk.nih.gov/) under its
[copyright policy](https://www.niddk.nih.gov/copyright); no endorsement is implied.
Built on my earlier MediBot project. See [attribution](ATTRIBUTION.md).
