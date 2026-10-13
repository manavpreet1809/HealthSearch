# WellQuery

A health-information search app that answers questions with passages from published articles and links to the sources.

![WellQuery showing a question, answer, and sources](docs/images/quick-answer.png)

## How it works

BM25 and MiniLM retrieve relevant passages from a SQLite collection. FastAPI serves the app. Answers use source excerpts by default; optional AI summaries run locally with Qwen through Ollama.

The current collection contains 15 NIDDK articles on diabetes, kidney health, and related medicines. Other conditions are not covered yet. This is a general-information tool, not medical advice.

## Run locally

Requires Python 3.12, [uv](https://docs.astral.sh/uv/), and make.

```sh
make setup
make ingest
make index
make local
```

Open [localhost:8000](http://localhost:8000). Ingestion downloads the articles; indexing downloads the embedding model.

For the Docker version with summaries, run `make docker` followed by `make docker-run`, then open [localhost:7860](http://localhost:7860). The build downloads model weights.

## Tests and feedback

Run `make check` for offline tests. Report bugs or missing topics through [GitHub issues](https://github.com/manavpreet1809/WellQuery/issues); leave out personal medical information.

Source material: [NIDDK](https://www.niddk.nih.gov/) ([copyright policy](https://www.niddk.nih.gov/copyright)). No endorsement is implied. Earlier project credits are in [ATTRIBUTION.md](ATTRIBUTION.md).
