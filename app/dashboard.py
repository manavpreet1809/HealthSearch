"""Read-only views of local evaluation summaries, with conservative validation."""
import json
import math
from pathlib import Path
import re

RESULTS = Path(__file__).resolve().parents[1] / 'evaluation/results'
# Checked-in summaries (<name>-summary.json), shown when there are no local runs, e.g. the public demo.
PUBLISHED = Path(__file__).resolve().parents[1] / 'docs/results'


def valid_rate(value):
    """Require finite metrics in the unit interval."""
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) and 0 <= value <= 1


def load_runs(root: Path = RESULTS) -> tuple[list[dict], int]:
    """Read aggregate summaries only; ignore symlinks, invalid files, and oversized JSON."""
    runs, skipped = [], 0
    if not root.exists():
        return runs, skipped
    candidates = []
    for entry in sorted(root.iterdir(), reverse=True)[:100]:
        if entry.is_symlink():
            continue
        if entry.is_dir() and re.fullmatch(r'[A-Za-z0-9_-]+', entry.name):
            candidates.append((entry.name, entry / 'summary.json', True))
        elif match := re.fullmatch(r'([A-Za-z0-9_-]+)-summary\.json', entry.name):
            candidates.append((match[1], entry, False))
    for run_id, path, required in candidates:
        if path.is_symlink() or not path.is_file():
            continue
        try:
            if path.stat().st_size > 1_000_000:
                raise ValueError('Oversized summary')
            data = json.loads(path.read_text())
            if not required and 'configurations' not in data:
                continue  # another kind of summary, e.g. the prompt comparison
            total, verified = data['question_count'], data['verified_question_count']
            if type(total) is not int or type(verified) is not int or not 0 <= verified <= total or total == 0:
                raise ValueError('Invalid counts')
            metrics = []
            for name, item in data['configurations'].items():
                if '/' not in name or not valid_rate(item['recall_at_5']) or not valid_rate(item['mrr_at_5']):
                    raise ValueError('Invalid retrieval metrics')
                latency = item['p95_ms']
                if not isinstance(latency, (int, float)) or not math.isfinite(latency) or latency < 0 or type(item['n']) is not int or item['n'] < 1:
                    raise ValueError('Invalid latency/count')
                split, configuration = name.split('/', 1)
                metrics.append(dict(split=split, configuration=configuration, **item))
            behaviours = []
            for name, item in data.get('behaviour_checks', {}).items():
                if not valid_rate(item['match_rate']) or type(item['n']) is not int or item['n'] < 1:
                    raise ValueError('Invalid behaviour metrics')
                behaviours.append(dict(name=name, **item))
            runs.append(dict(id=run_id, question_count=total, verified_count=verified,
                             draft=verified < total, created_at=data.get('created_at','Unknown'),
                             metrics=metrics, behaviours=behaviours, model=data.get('model','Unknown'),
                             git_sha=data.get('git_sha','Unknown'), corpus_sha256=data.get('corpus_sha256','Unknown'),
                             dirty=data.get('working_tree_dirty',True)))
        except (OSError, ValueError, TypeError, KeyError, AttributeError):
            skipped += 1
    return runs, skipped
