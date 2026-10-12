---
title: WellQuery
emoji: 🩺
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
short_description: Health questions answered from cited NIDDK sources
---

# WellQuery

Ask general questions about diabetes, kidney health, and diabetes medicines. Every answer shows the source passages it came from.

- **Source excerpts** (default): exact sentences from 15 NIDDK articles, found by hybrid keyword + semantic search. Fast.
- **AI synthesis**: Qwen2.5 1.5B rewrites the evidence into short claims, each linked to a source sentence. Takes up to a minute on this free CPU hardware.

Emergency and personal-dosing questions are refused before search.

Student prototype: general information only, not medical advice. Health content from the [National Institute of Diabetes and Digestive and Kidney Diseases](https://www.niddk.nih.gov/) (NIDDK), reused under its [copyright policy](https://www.niddk.nih.gov/copyright); not endorsed by NIDDK.

Source code, evaluation, and report: [github.com/manavpreet1809/WellQuery](https://github.com/manavpreet1809/WellQuery)
