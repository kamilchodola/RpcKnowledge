// Checks a translated lesson and its checkpoint against the English original.
//
// A translation changes the words and nothing else: the same sections and paragraphs, the
// same links to the same topics, the same inline code byte for byte, the same numbers, and
// checkpoint questions with the same kinds, the same answer positions, and options that
// stay as fair as the English ones. The repo tests and the translators' validator both run
// these checks, so a batch that passes the validator passes the tests.

const LINK = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
const CODE = /`[^`\n]+`/g;
const withoutCode = text => String(text ?? '').replace(CODE, ' ');
const linkTargets = text => [...withoutCode(text).matchAll(LINK)].map(match => match[1]).sort();
const linkLabels = text => [...withoutCode(text).matchAll(LINK)].map(match => match[2]);
const codeSpans = text => (String(text ?? '').match(CODE) ?? []).sort();
const prose = text => withoutCode(text).replace(LINK, (_, id, label) => label ?? id);
// Numbers compared as values: thousands may be grouped as 100,000 in English and 100 000 in
// Polish, and Polish writes decimals with a comma. A grouped number never starts with 0, so
// 0,009 stays a decimal.
const numbers = text => (prose(text)
  .replace(/(?<![\d.,])[1-9]\d{0,2}(?:[,   ]\d{3})+(?!\d)/g, group => group.replace(/[,   ]/g, ''))
  .match(/\d+(?:[.,]\d+)?/g) ?? []).map(value => value.replace(',', '.')).sort();
const same = (a, b) => a.length === b.length && a.every((item, index) => item === b[index]);
const ENGLISH = /\b(the|and|of|is|that|with|which|for|are|from|this|when|not)\b/gi;
const BANNED_OPTION = /wszystkie (powyższe|z powyższych)|żadn[eay] z (powyższych|nich)|\boba\b|\bobie\b|\bobu\b/i;
// Polish calques the translation guide rules out, with the word Polish developers use instead.
// Warnings, not errors: a one-time explanation in parentheses is allowed.
const CALQUES = [
  [/czoł\p{L}* łańcuch/iu, 'head'],
  [/kopert/iu, 'format komunikatu (envelope)'],
  [/potwierdze\p{L}* (transakcji|wykonania)/iu, 'receipt'],
  [/(?<!\p{L})temat\p{L}* (log|zdarze|event)/iu, 'topics'],
  [/pamię\p{L}* podręczn|buforowani/iu, "cache, cache'owanie"],
  [/kontrol\p{L}* stanu/iu, 'health check'],
  [/(?<!\p{L})wsad/iu, 'batch'],
  [/migawk/iu, 'snapshot'],
  [/(?<!\p{L})gniazd/iu, 'socket'],
  [/wypychani/iu, 'push'],
  [/(?<!\p{L})bram[aęyi]?(?!\p{L})/iu, 'gateway'],
  [/(?<!\p{L})ładun/iu, 'payload, execution payload'],
  [/(?<!\p{L})sprawdzian/iu, 'lessons never mention the app quiz'],
  [/przełącza\p{L}* awaryjn/iu, 'failover'],
  [/serwer\p{L}* źródłow/iu, 'upstream'],
  [/odwrotn\p{L}* proxy/iu, 'reverse proxy'],
  [/obietnic/iu, 'promise'],
  [/kont\p{L}* zewnętrzn/iu, 'EOA'],
  [/punkt\p{L}* kontroln/iu, 'checkpoint'],
  [/komitet\p{L}* synchronizacji/iu, 'sync committee'],
  [/(?<!\p{L})genez/iu, 'genesis'],
  [/losow\p{L}* rozrzut/iu, 'jitter'],
  [/wykładnicz\p{L}* odstęp/iu, 'exponential backoff'],
  [/(?<!\p{L})klienty(?!\p{L})/iu, 'klienci'],
  [/(kodowani|ciąg)\p{L}* szesnastkow/iu, 'hex'],
  [/zobowiązani\p{L}* \(commitment/iu, 'commitment']
];
const calques = text => CALQUES.filter(([pattern]) => pattern.test(prose(text))).map(([, instead]) => instead);

/**
 * Returns { errors, warnings } for one topic. `en` is the English topic as knowledge.js
 * exports it (with `quiz`); `pl` the translated fields; `quiz` the translated questions.
 */
export function checkTopicTranslation(en, pl, quiz) {
  const errors = [];
  const warnings = [];
  const where = en.id;
  if (!pl || typeof pl !== 'object') return { errors: [`${where}: no translated lesson`], warnings };

  const texts = [];
  const pair = (label, english, polish) => {
    if (typeof polish !== 'string' || !polish.trim()) { errors.push(`${where} ${label}: missing`); return; }
    texts.push(polish);
    if (!same(linkTargets(english), linkTargets(polish))) {
      errors.push(`${where} ${label}: links differ: en [${linkTargets(english)}] pl [${linkTargets(polish)}]`);
    }
    if (linkLabels(polish).some(value => value !== undefined && !value.trim())) errors.push(`${where} ${label}: a link has an empty label`);
    if (!same(codeSpans(english), codeSpans(polish))) {
      errors.push(`${where} ${label}: inline code differs: en ${JSON.stringify(codeSpans(english))} pl ${JSON.stringify(codeSpans(polish))}`);
    }
    if (!same(numbers(english), numbers(polish))) {
      warnings.push(`${where} ${label}: numbers differ: en [${numbers(english)}] pl [${numbers(polish)}]`);
    }
    const words = prose(polish).split(/\s+/).filter(Boolean);
    const leftover = (prose(polish).match(ENGLISH) ?? []).length;
    if (words.length >= 8 && leftover / words.length > 0.08) warnings.push(`${where} ${label}: reads like English (${leftover} English function words)`);
    calques(polish).forEach(instead => warnings.push(`${where} ${label}: style: use ${instead}`));
  };

  if (typeof pl.title !== 'string' || !pl.title.trim()) errors.push(`${where} title: missing`);
  else {
    texts.push(pl.title);
    calques(pl.title).forEach(instead => warnings.push(`${where} title: style: use ${instead}`));
  }
  if (pl.aliases !== undefined && (!Array.isArray(pl.aliases) || pl.aliases.some(alias => typeof alias !== 'string' || !alias.trim()))) {
    errors.push(`${where} aliases: must be a list of non-empty strings`);
  }
  pair('summary', en.summary, pl.summary);

  const enSections = en.sections ?? [];
  const plSections = Array.isArray(pl.sections) ? pl.sections : [];
  if (plSections.length !== enSections.length) errors.push(`${where}: ${plSections.length} sections, English has ${enSections.length}`);
  enSections.forEach((section, index) => {
    const translated = plSections[index];
    if (!translated) return;
    if (section.heading && !String(translated.heading ?? '').trim()) errors.push(`${where} section ${index}: heading missing`);
    if (translated.heading) texts.push(translated.heading);
    const paragraphs = Array.isArray(translated.paragraphs) ? translated.paragraphs : [];
    if (paragraphs.length !== section.paragraphs.length) {
      errors.push(`${where} section ${index}: ${paragraphs.length} paragraphs, English has ${section.paragraphs.length}`);
    }
    section.paragraphs.forEach((text, position) => pair(`section ${index} paragraph ${position}`, text, paragraphs[position]));
  });

  if (en.example) {
    if (!pl.example || typeof pl.example !== 'object') errors.push(`${where}: example missing`);
    else {
      if (!String(pl.example.title ?? '').trim()) errors.push(`${where} example: title missing`);
      else texts.push(pl.example.title);
      if (en.example.note) pair('example note', en.example.note, pl.example.note);
      else if (pl.example.note) errors.push(`${where} example: has a note the English does not`);
      if ('code' in pl.example) errors.push(`${where} example: code comes from the English record; leave it out`);
    }
  } else if (pl.example) errors.push(`${where}: has an example the English does not`);

  const enPitfalls = en.pitfalls ?? [];
  const plPitfalls = Array.isArray(pl.pitfalls) ? pl.pitfalls : [];
  if (plPitfalls.length !== enPitfalls.length) errors.push(`${where}: ${plPitfalls.length} pitfalls, English has ${enPitfalls.length}`);
  enPitfalls.forEach((text, index) => pair(`pitfall ${index}`, text, plPitfalls[index]));

  if (!/[ąćęłńóśźż]/i.test(texts.join(' '))) errors.push(`${where}: no Polish characters anywhere; is it translated?`);

  const enQuiz = en.quiz ?? [];
  const plQuiz = Array.isArray(quiz) ? quiz : [];
  if (plQuiz.length !== enQuiz.length) errors.push(`${where} quiz: ${plQuiz.length} questions, English has ${enQuiz.length}`);
  enQuiz.forEach((english, index) => {
    const question = plQuiz[index];
    const at = `${where} quiz[${index}]`;
    if (!question) return;
    if (question.kind !== english.kind) errors.push(`${at}: kind ${question.kind}, English is ${english.kind}`);
    if (question.answer !== english.answer) errors.push(`${at}: answer ${question.answer}, English is ${english.answer}`);
    if (typeof question.question !== 'string' || !question.question.trim().endsWith('?')) errors.push(`${at}: must be a question ending in ?`);
    const options = Array.isArray(question.options) ? question.options : [];
    if (options.length !== english.options.length) { errors.push(`${at}: ${options.length} options, English has ${english.options.length}`); return; }
    if (options.some(option => typeof option !== 'string' || !option.trim())) { errors.push(`${at}: an option is empty`); return; }
    if (new Set(options.map(option => option.trim().toLowerCase())).size !== options.length) errors.push(`${at}: repeats an option`);
    [question.question, ...options].forEach(text => {
      if (/\[\[|\*\*|`/.test(String(text))) errors.push(`${at}: must be plain text`);
      calques(text).forEach(instead => warnings.push(`${at}: style: use ${instead}`));
    });
    options.forEach(option => { if (BANNED_OPTION.test(option)) errors.push(`${at}: uses an "of the above" style option: ${option}`); });
    const correct = options[question.answer] ?? '';
    const longestWrong = Math.max(...options.filter((_, position) => position !== question.answer).map(option => option.length));
    if (correct.length > longestWrong * 1.2) errors.push(`${at}: correct option is ${Math.round(100 * correct.length / longestWrong)}% of the longest wrong one (max 120%)`);
    if (correct && String(question.question).toLowerCase().includes(correct.trim().toLowerCase())) errors.push(`${at}: contains its own answer`);
    options.forEach((option, position) => {
      if (!same(numbers(english.options[position]), numbers(option))) warnings.push(`${at} option ${position}: numbers differ from English`);
    });
  });
  return { errors, warnings };
}

/** The two batch-wide fairness numbers the English quizzes are held to. */
export function quizLengthStats(questions) {
  let longest = 0;
  let correctChars = 0;
  let wrongChars = 0;
  questions.forEach(question => {
    const correct = question.options[question.answer];
    const wrong = question.options.filter((_, index) => index !== question.answer);
    if (correct.length > Math.max(...wrong.map(option => option.length))) longest += 1;
    correctChars += correct.length;
    wrongChars += wrong.reduce((sum, option) => sum + option.length, 0) / wrong.length;
  });
  return { longestShare: questions.length ? longest / questions.length : 0, ratio: wrongChars ? correctChars / wrongChars : 0 };
}
