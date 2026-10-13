# WellQuery

Answers general questions about diabetes and kidney health using 15 NIDDK
articles, with source passages shown alongside each answer.

**Built with:** Python, FastAPI, SQLite, BM25, and MiniLM. Optional summaries use
Qwen through Ollama.

## From question to evidence

1. Ask a question about the topics in the collection.
2. Keyword and semantic search find related passages.
3. Read the excerpts or request an optional summary, then inspect the sources.

![WellQuery answer and source passages](docs/images/quick-answer.png)

## Try it

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

## Read the results carefully

This is a student project, not medical advice. Evaluation questions are still
unreviewed. See [status](docs/STATUS.md) and [evaluation](evaluation/README.md).

## Source material

Content comes from [NIDDK](https://www.niddk.nih.gov/) under its
[copyright policy](https://www.niddk.nih.gov/copyright); no endorsement is implied.
Built on my earlier MediBot project. See [attribution](ATTRIBUTION.md).
