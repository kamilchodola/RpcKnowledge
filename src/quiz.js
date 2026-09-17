// Quiz generation for the knowledge map.
//
// A topic is only marked as learned once its checkpoint is passed, so the questions have
// to be answerable from the lesson and hard to brute force. Two rules shape everything
// here: the correct option never appears in the DOM as data (it lives in a closure in
// app.js), and every attempt reshuffles both the question pool and the option order, so
// remembering "it was the third one" does not survive a retry.
//
// Topics may ship an authored `quiz` array. Those questions are used first; generated
// questions top the set up to the required count.

const LINK = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;

export const QUIZ_LENGTH = 5;
export const MIN_QUESTIONS = 3;

/** Deterministic PRNG so an attempt is reproducible while it is on screen. */
function rng(seedText) {
  let hash = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    hash ^= seedText.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

const plain = text => String(text ?? '').replace(LINK, (_, id, label) => label || id).replace(/`/g, '').replace(/\s+/g, ' ').trim();

function clip(text, limit = 165) {
  const value = plain(text);
  if (value.length <= limit) return value;
  const cut = value.slice(0, limit);
  const boundary = cut.lastIndexOf(' ');
  return `${cut.slice(0, boundary > limit * 0.6 ? boundary : limit).trim()}…`;
}

/** Hide the answer when the term names itself inside its own definition. */
function maskTitle(text, title) {
  const words = String(title).split(/\s+/).filter(word => word.length > 2);
  let masked = plain(text);
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const full = new RegExp(escape(title), 'gi');
  masked = masked.replace(full, '_____');
  if (words.length > 1) {
    words.forEach(word => { masked = masked.replace(new RegExp(`\\b${escape(word)}\\b`, 'gi'), '_____'); });
  }
  return masked.replace(/(_____[\s,]*)+/g, '_____ ');
}

const bodyParagraphs = topic => (topic.sections ?? []).flatMap(section => section.paragraphs ?? []);

function sentences(text) {
  return String(text)
    .split(/(?<=[.:;])\s+(?=[A-Z`\[])/)
    .map(part => part.trim())
    .filter(Boolean);
}

/** Topics that are plausible wrong answers: close enough to require knowing the lesson. */
function distractorPool(topic, topics, byId) {
  const linked = new Set([topic.id, ...linkedIdsOf(topic, byId)]);
  topics.forEach(other => { if (linkedIdsOf(other, byId).includes(topic.id)) linked.add(other.id); });
  // The root topic is an umbrella for everything, so it never makes an honest wrong answer.
  const usable = topics.filter(other => other.id !== 'ethereum-rpc' && !linked.has(other.id));
  const sameCategory = usable.filter(other => other.category === topic.category);
  const others = usable.filter(other => other.category !== topic.category);
  return { linked, sameCategory, others };
}

export function linkedIdsOf(topic, byId) {
  const ids = new Set();
  const texts = [topic.summary, ...bodyParagraphs(topic), ...(topic.pitfalls ?? []), topic.example?.note ?? ''];
  texts.forEach(text => {
    for (const match of String(text ?? '').matchAll(LINK)) {
      if (match[1] !== topic.id && byId.has(match[1])) ids.add(match[1]);
    }
  });
  (topic.related ?? []).forEach(id => { if (id !== topic.id && byId.has(id)) ids.add(id); });
  return [...ids];
}

function pickUnique(pool, count, random, taken = new Set()) {
  const chosen = [];
  for (const item of shuffle(pool, random)) {
    const key = typeof item === 'string' ? item : item.id ?? item.text;
    if (taken.has(key)) continue;
    taken.add(key);
    chosen.push(item);
    if (chosen.length === count) break;
  }
  return chosen;
}

/**
 * Build the candidate question pool for a topic. Returns questions shaped as
 * `{ kind, prompt, options: string[], answer: number }`.
 */
export function buildQuestionPool(topic, topics, byId, seed = '') {
  const random = rng(`${topic.id}:${seed}`);
  const questions = [];
  const { sameCategory, others } = distractorPool(topic, topics, byId);
  const titlePool = [...sameCategory, ...others];

  (topic.quiz ?? []).forEach((authored, index) => {
    const options = Array.isArray(authored?.options) ? authored.options.map(plain).filter(Boolean) : [];
    const answerIndex = Number.isInteger(authored?.answer) ? authored.answer : 0;
    if (options.length >= 3 && options[answerIndex]) {
      questions.push({ kind: `authored-${index}`, prompt: plain(authored.question), options, answer: answerIndex });
    }
  });

  // 1. Definition without the name in it: "which term is this?"
  const maskedSummary = maskTitle(topic.summary, topic.title);
  if (maskedSummary.length > 40) {
    const wrong = pickUnique(titlePool.length >= 3 ? titlePool : topics.filter(other => other.id !== topic.id), 3, random).map(other => other.title);
    if (wrong.length === 3) {
      questions.push({ kind: 'definition', prompt: `Which term does this describe?\n\n“${clip(maskedSummary, 210)}”`, options: [topic.title, ...wrong], answer: 0 });
    }
  }

  // 2. The reverse: pick the right definition for the term.
  const summaryDistractors = pickUnique(titlePool.filter(other => plain(other.summary).length > 40), 3, random)
    .map(other => clip(maskTitle(other.summary, other.title), 150));
  if (summaryDistractors.length === 3) {
    questions.push({ kind: 'summary', prompt: `Which statement describes ${topic.title}?`, options: [clip(maskTitle(topic.summary, topic.title), 150), ...summaryDistractors], answer: 0 });
  }

  // 3. Cloze from the lesson body: the reader has to know which term belongs in the gap.
  const clozeCandidates = [];
  const clozeSeen = new Set();
  bodyParagraphs(topic).forEach(paragraph => {
    sentences(paragraph).forEach(sentence => {
      const matches = [...sentence.matchAll(LINK)].filter(match => match[1] !== topic.id && byId.has(match[1]));
      if (!matches.length) return;
      const wordCount = plain(sentence).split(/\s+/).length;
      if (wordCount < 10 || wordCount > 55) return;
      // Blank one linked term per sentence. Any other links stay visible, which keeps the
      // sentence readable and still forces the reader to know which term fits the gap.
      matches.forEach(match => {
        const target = byId.get(match[1]);
        if (clozeSeen.has(target.id)) return;
        clozeSeen.add(target.id);
        // Blank every mention of the target, not just the first: a sentence that links the
        // same term twice would otherwise print the answer next to its own gap.
        const gapped = plain(sentence.replace(LINK, (whole, id, label) => (id === target.id ? '_____' : label || id)));
        if (!gapped.includes('_____')) return;
        clozeCandidates.push({ target, gapped });
      });
    });
  });
  shuffle(clozeCandidates, random).slice(0, 6).forEach((candidate, index) => {
    const siblings = linkedIdsOf(topic, byId).map(id => byId.get(id)).filter(other => other && other.id !== candidate.target.id);
    const pool = [...siblings, ...titlePool];
    const wrong = pickUnique(pool, 3, random).map(other => other.title);
    if (wrong.length < 3) return;
    questions.push({ kind: `cloze-${index}`, prompt: `Which term completes this sentence from the lesson?\n\n“${candidate.gapped}”`, options: [candidate.target.title, ...wrong], answer: 0 });
  });

  // 4. Pitfalls: real mistake versus mistakes that belong to other topics.
  const pitfalls = (topic.pitfalls ?? []).filter(text => plain(text).length > 30);
  if (pitfalls.length) {
    const foreign = topics.filter(other => other.id !== topic.id && (other.pitfalls ?? []).length)
      .flatMap(other => (other.pitfalls ?? []).map(text => ({ id: `${other.id}-pit`, text: clip(text, 150) })));
    const wrong = pickUnique(foreign, 3, random).map(item => item.text);
    if (wrong.length === 3) {
      const correct = clip(shuffle(pitfalls, random)[0], 150);
      questions.push({ kind: 'pitfall', prompt: `Which of these is a real pitfall when working with ${topic.title}?`, options: [correct, ...wrong], answer: 0 });
    }
  }

  // 5. Neighbourhood: which term does this lesson actually depend on?
  const neighbours = linkedIdsOf(topic, byId).map(id => byId.get(id)).filter(Boolean);
  if (neighbours.length && others.length >= 3) {
    const correct = shuffle(neighbours, random)[0];
    const wrong = pickUnique(others.filter(other => other.id !== correct.id), 3, random).map(other => other.title);
    if (wrong.length === 3) {
      questions.push({ kind: 'relation', prompt: `Which of these does the ${topic.title} lesson directly build on?`, options: [correct.title, ...wrong], answer: 0 });
    }
  }

  // Last guard: a question whose prompt already contains its own answer is not a question.
  return questions.filter(question => {
    const correct = question.options[question.answer];
    return correct && !question.prompt.toLowerCase().includes(String(correct).toLowerCase());
  });
}

/** One attempt: a shuffled subset of the pool with shuffled options. */
export function buildAttempt(topic, topics, byId, attemptSeed) {
  const random = rng(`attempt:${topic.id}:${attemptSeed}`);
  const pool = buildQuestionPool(topic, topics, byId, attemptSeed);
  const byKind = new Map();
  pool.forEach(question => { if (!byKind.has(question.kind)) byKind.set(question.kind, question); });
  const unique = shuffle([...byKind.values()], random);
  // Question kinds are not equally good. Authored questions come first, then the ones that
  // need the lesson itself (cloze, pitfalls, definitions); "which term is related" is the
  // easiest to guess from category alone, so it only fills a gap at the end.
  const rank = kind => {
    if (kind.startsWith('authored')) return 0;
    if (kind.startsWith('cloze')) return 1;
    if (kind === 'pitfall') return 2;
    if (kind === 'definition') return 3;
    if (kind === 'summary') return 4;
    return 5;
  };
  const ordered = [...unique].sort((a, b) => rank(a.kind) - rank(b.kind));
  return ordered.slice(0, QUIZ_LENGTH).map(question => {
    const correctText = question.options[question.answer];
    const options = shuffle(question.options, random);
    return { kind: question.kind, prompt: question.prompt, options, answer: options.indexOf(correctText) };
  });
}
