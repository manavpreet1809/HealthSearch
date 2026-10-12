const form = document.querySelector('#question-form');
const input = document.querySelector('#question');
const button = form.querySelector('button[type=submit]');
const status = document.querySelector('#status');
const messages = document.querySelector('#messages');
let responseNumber = 0;

// Friendly wording for each refusal reason the API can return.
const REFUSALS = {
  emergency: ['This may be an emergency', 'urgent'],
  personal_advice: ['WellQuery can’t give personal medical advice', 'caution'],
  insufficient_evidence: ['Not covered by the sources', 'info'],
  injection: ['That request isn’t supported', 'info'],
  invalid_output: ['The AI summary couldn’t be checked against the sources', 'info'],
};
const HINTS = {
  insufficient_evidence: 'WellQuery only answers from 15 NIDDK articles about diabetes, kidney health, and diabetes medicines. Try one of the example questions.',
  invalid_output: 'It was hidden instead of being shown unchecked. Try the Quick answer style.',
};

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function safeSource(url) {
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : null;
  } catch { return null; }
}
function citationLink(n) {
  const a = element('a', String(n), 'cite');
  const target = `evidence-${responseNumber}-${n}`;
  a.href = '#' + target;
  a.setAttribute('aria-label', 'View source ' + n);
  a.addEventListener('click', () => { document.getElementById(target).open = true; });
  return a;
}
// "Symptoms include thirst; hunger; fatigue." reads better as a bulleted list.
function renderClaim(claim, hasSource) {
  const list = claim.text.match(/^(.*?\b(?:include|includes|including|such as))\s+(.+)$/i);
  const items = list ? list[2].replace(/\.$/, '').split(/;\s*/).filter(Boolean) : [];
  const block = element('div', undefined, 'claim');
  const lead = element('p', items.length > 2 ? list[1] + ':' : claim.text);
  if (hasSource) lead.append(' ', citationLink(claim.citation));
  block.append(lead);
  if (items.length > 2) {
    const ul = element('ul');
    for (const item of items) ul.append(element('li', item));
    block.append(ul);
  }
  return block;
}
function renderSources(data, card) {
  if (!data.citations?.length) return;
  card.append(element('h3', 'Sources'));
  for (const citation of data.citations) {
    const details = element('details', undefined, 'source');
    details.id = `evidence-${responseNumber}-${citation.n}`;
    const summary = element('summary');
    summary.append(element('span', String(citation.n), 'cite'), ' ', citation.title);
    details.append(summary);
    if (citation.section_path) details.append(element('p', citation.section_path, 'source-meta'));
    const quotes = new Set((data.claims || []).filter(c => c.citation === citation.n).map(c => c.quote));
    for (const quote of quotes) details.append(element('blockquote', quote));
    const full = element('details', undefined, 'passage');
    full.append(element('summary', 'Show the full passage'), element('p', citation.text));
    details.append(full);
    const url = safeSource(citation.url);
    if (url) {
      const a = element('a', `Read the full article (${citation.publisher?.match(/\(([^)]+)\)/)?.[1] || 'source'}) ↗`);
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; details.append(a);
    }
    card.append(details);
  }
}
function renderAnswer(data, card) {
  responseNumber += 1;
  card.replaceChildren();
  card.classList.remove('loading');
  const ai = data.answer_style === 'ollama';
  if (data.refused) {
    const [title, tone] = REFUSALS[data.refusal_reason] || ['Response limited', 'info'];
    const box = element('div', undefined, 'refusal ' + tone);
    box.append(element('strong', title), element('p', data.answer));
    if (HINTS[data.refusal_reason]) box.append(element('p', HINTS[data.refusal_reason]));
    card.append(box);
    return;
  }
  card.append(element('p', ai ? 'AI summary · check it against the sources' : 'Quick answer · quoted from the sources', 'answer-label'));
  const sources = new Set((data.citations || []).map(c => c.n));
  if (data.claims?.length) {
    for (const claim of data.claims) card.append(renderClaim(claim, sources.has(claim.citation)));
  } else card.append(element('p', data.answer));
  renderSources(data, card);
  const n = data.chunks_used;
  const seconds = (data.latency_ms || 0) / 1000;
  const time = seconds < 1 ? 'in under a second' : `in ${seconds.toFixed(1)} s`;
  card.append(element('p', `Answered from ${n} source${n === 1 ? '' : 's'} ${time}`, 'source-meta'));
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question || button.disabled) return;
  button.disabled = true; form.setAttribute('aria-busy', 'true');
  const style = form.querySelector('input[name=answer-style]:checked')?.value || 'excerpts';
  status.textContent = '';
  const turn = element('article', undefined, 'turn');
  turn.append(element('p', question, 'question'));
  const card = element('div', undefined, 'answer loading');
  card.append(element('p', style === 'ollama' ? 'Writing an AI summary from the sources… this can take up to a minute.' : 'Finding the answer in the sources…'));
  turn.append(card);
  messages.prepend(turn);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch('/ask', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({question, answer_style: style}),
      signal: controller.signal
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(typeof error.detail === 'string' ? error.detail : 'The request could not be completed. Please try again.');
    }
    renderAnswer(await response.json(), card);
    input.value = '';
  } catch (error) {
    card.classList.remove('loading');
    card.replaceChildren(element('p', error.name === 'AbortError'
      ? 'This took too long, probably because the free server is busy. Please try again, or use the Quick answer style.'
      : error.message, 'error'));
  } finally {
    clearTimeout(timer); button.disabled = false; form.setAttribute('aria-busy', 'false');
  }
});
for (const example of document.querySelectorAll('.example')) {
  example.addEventListener('click', () => { input.value = example.textContent; form.requestSubmit(); });
}
