// The spoken version of a lesson, so the map can be listened to like an audiobook.
//
// A lesson is read in parts: the introduction (title and summary), each headed section,
// the example, and the pitfalls. A part is what the section play buttons start from and
// what "stop after each section" stops at. Each part is split into chunks of a sentence
// or a few, because browser speech engines stall or cut off on long utterances, and
// because a chunk is the step that skipping back and forward moves by. Every chunk names
// the block of the lesson it came from, so the page can mark the paragraph being read.
//
// Code is never read out. An example is announced by its title and its note, and inline
// code is read as words.
//
// A lesson is narrated in its own language (a topic carries `lang`), so an English lesson
// shown in the Polish interface, before it is translated, is still read as English.

import { plainText } from './dataset.js';

// Kept under about fifteen seconds of speech: some engines silently stop an utterance
// that runs longer than that.
export const CHUNK_CHARS = 200;
export const MAX_CHUNK_CHARS = 260;
/** A steady narration pace at rate 1, used only for time estimates. */
export const WORDS_PER_MINUTE = 160;

// A sentence ends at . ! or ? followed by a capital (in any alphabet) or a digit.
const SENTENCE_BREAK = /(?<=[.!?]["')\]”»]*)\s+(?=["'(\[„«]?[\p{Lu}0-9])/u;
const CLAUSE_BREAK = /(?<=[,;:—])\s+/;

/** What narration says around a lesson, and the abbreviations it spells out, per language. */
export const PHRASES = {
  en: {
    stage: 'Stage {n}: {label}',
    topic: 'Topic {n}. {title}',
    example: 'Example: {title}',
    pitfalls: 'Pitfalls.',
    introduction: 'Introduction',
    exampleLabel: 'Example',
    pitfallsLabel: 'Pitfalls',
    section: 'Section {n}',
    hex: 'a hex value',
    arrow: ' to ',
    abbreviations: [[/\be\.g\.,?/gi, 'for example,'], [/\bi\.e\.,?/gi, 'that is,']],
    code: {
      command: 'a {name} command', json: 'a JSON object with {keys}', object: 'a JSON object', array: 'a JSON array',
      labels: 'the labels {keys}', enode: 'an enode address', local: 'localhost port {port}',
      times: 'times', minus: 'minus', equals: 'equals', and: 'and'
    },
    // Engines spell some names letter by letter; these are said as words.
    sounds: [['JSON', 'Jason'], ['nginx', 'engine x'], ['jq', 'J Q']]
  },
  pl: {
    stage: 'Etap {n}: {label}',
    topic: 'Temat {n}. {title}',
    example: 'Przykład: {title}',
    pitfalls: 'Pułapki.',
    introduction: 'Wstęp',
    exampleLabel: 'Przykład',
    pitfallsLabel: 'Pułapki',
    section: 'Sekcja {n}',
    hex: 'wartość hex',
    arrow: ' na ',
    abbreviations: [
      [/(?<![\p{L}])np\.(?=\s)/gu, 'na przykład'],
      [/(?<![\p{L}])Np\.(?=\s)/gu, 'Na przykład'],
      [/(?<![\p{L}])m\.in\./gu, 'między innymi'],
      [/(?<![\p{L}])itd\./gu, 'i tak dalej'],
      [/(?<![\p{L}])itp\./gu, 'i tym podobne'],
      [/(?<![\p{L}])tj\./gu, 'to jest']
    ],
    code: {
      command: 'polecenie {name}', json: 'obiekt JSON z polami {keys}', object: 'obiekt JSON', array: 'tablica JSON',
      labels: 'labele {keys}', enode: 'adres enode', local: 'localhost, port {port}',
      times: 'razy', minus: 'minus', equals: 'równa się', and: 'i'
    },
    // A Polish voice reads English words by Polish spelling rules, so the English terms Polish
    // developers use are respelled the way they say them. Each stem also covers its Polish
    // endings (receiptu, cache'owanie, eventów); an entry ending in $ matches the whole word
    // only. Longer and more specific entries come first.
    sounds: [
      ['JSON-RPC', 'dżejson er pe ce'], ['JSON-(?=\\p{L}{1,3}(?!\\p{L}))', 'dżejson'], ['JSON', 'dżejson'],
      ['Etherscan', 'Eterskan'], ['Ethereum', 'Eterium'], ['Otterscan', 'Oterskan'], ['Nethermind', 'Netermajnd'],
      ['Lighthouse', 'Lajthałs'], ['Lodestar', 'Lołdstar'], ['Prysm', 'Prizm'], ['Flashbots', 'Fleszbots'], ['WebSocket', 'Łebsoket'],
      ['curl', 'kerl'], ['jq$', 'dżej kju'], ['nginx', 'endżin iks'],
      ['health check', 'helf czek'], ['load balancer', 'lołd balanser'], ['circuit breaker', 'serkit brejker'],
      ['token bucket', 'tołken baket'], ['fork choice', 'fork czojs'], ['rate limit', 'rejt limit'],
      ['fraud proof', 'frod pruf'], ['validity proof', 'walidity pruf'], ['state root', 'stejt rut'], ['committee', 'komiti'],
      ['receipc', 'risic'], ['receipt', 'risit'], ['cache', 'kesz'], ['head', 'hed'], ['event', 'iwent'], ['batch', 'bacz'],
      ['payload', 'pejlołd'], ['endpoinc', 'endpojnc'], ['endpoint', 'endpojnt'], ['snapshoc', 'snapszoc'], ['snapshot', 'snapszot'],
      ['gateway', 'gejtłej'], ['upstream', 'apstrim'], ['failover', 'fejlołwer'], ['rollup', 'rolap'], ['bridge', 'bridż'],
      ['builder', 'bilder'], ['relayer', 'rilejer'], ['relay', 'rilej'], ['bundler', 'bandler'], ['bundle', 'bandl'],
      ['searcher', 'serczer'], ['proposer', 'propołzer'], ['tracing', 'trejsing'], ['tracer', 'trejser'], ['trace', 'trejs'],
      ['storage', 'storydż'], ['timeout', 'tajmałt'], ['retry', 'ritraj'], ['provider', 'prowajder'],
      ['nodzie', 'nołdzie'], ['node', 'nołd'], ['nonce', 'nons'], ['slashing', 'sleszing'], ['staking', 'stejking'], ['stake', 'stejk'],
      ['mempool', 'mempul'], ['peer', 'pir'], ['gossip', 'gosip'], ['trie', 'traj'], ['sync$', 'sink'],
      ['checkpoinc', 'czekpojnc'], ['checkpoint', 'czekpojnt'], ['commitmenc', 'komitmenc'], ['commitment', 'komitment'],
      ['witness', 'łitnes'], ['stateless', 'stejtles'], ['roocie', 'rucie'], ['root', 'rut'],
      ['unsafe', 'ansejf'], ['safe', 'sejf'], ['latest', 'lejtest'], ['finalized', 'fajnalajzd'], ['justified', 'dżastyfajd'],
      ['queued', 'kjud'], ['sidecar', 'sajdkar'], ['paymaster', 'pejmaster'], ['listener', 'lisener'], ['handshake', 'hendszejk'],
      ['dispatcher', 'dispeczer'], ['sockec', 'sokec'], ['socket', 'soket'], ['beacon', 'bikon'], ['engine', 'endżin'],
      ['ether', 'eter'], ['gwei', 'głej'], ['hash', 'hasz'], ['mainne', 'mejnne'], ['body$', 'bodi']
    ]
  }
};

// Each entry: a stem, matched at the start of a word in any letter case, with Polish endings
// allowed after it (and an apostrophe before them, as in cache'owanie), unless it ends in $.
const soundPatterns = new Map();
function soundRules(lang) {
  if (!soundPatterns.has(lang)) {
    soundPatterns.set(lang, (phrasesFor(lang).sounds ?? []).map(([stem, said]) => {
      const exact = stem.endsWith('$');
      const body = exact ? stem.slice(0, -1) : stem;
      const tail = exact ? "(?![\\p{L}'])" : "(?:'(?=\\p{L}))?";
      return [new RegExp(`(?<![\\p{L}])${body}${tail}`, 'giu'), said];
    }));
  }
  return soundPatterns.get(lang);
}
const matchCase = (found, said) => (/^\p{Lu}/u.test(found) && !/^\p{Lu}{2}/u.test(found) ? said[0].toUpperCase() + said.slice(1) : said);

const PROGRAMS = /^(curl|cast|geth|reth|nethermind|erigon|besu|docker|kurtosis|jq|npm|npx|node|anvil|forge|op-node|op-geth|wscat|websocat|helios|make|git|openssl|lighthouse|prysm|teku|nimbus|nimbus_beacon_node|lodestar|grandine|dig|systemctl|journalctl|cloudflared)(?=\s)/;
const isLocal = host => /^(127\.0\.0\.1|localhost|0\.0\.0\.0|\[::1\])$/.test(host);
const joinWords = (items, and) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} ${and} ${items.at(-1)}`);

/** An identifier, path, or flag as words: camelCase and separators split, markup dropped. */
function codeWords(text) {
  return text
    .replace(/(^|\s)--?(?=[A-Za-z])/g, '$1')
    .replace(/(?<=[A-Za-z])\.(?=[A-Za-z])/g, ' ')
    .replace(/(?<=\w)[_-](?=\w)/g, ' ')
    .replace(/\//g, ' ')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[<>{}()[\]'"`|=:]/g, ' ')
    .replace(/(?<=\w)-(?=\s|$)/g, '')
    .replace(/,(?=\S)/g, ', ');
}

/** Spoken form of a flag and its value; a value that is an address, number, or path is dropped. */
function flagWords(token) {
  const [flag, value = ''] = token.split('=');
  const spokenValue = /^(\w+:\/\/|[\d.:]+$|\/|<)/.test(value) || !value ? '' : ` ${codeWords(value)}`;
  return `${codeWords(flag)}${spokenValue}`;
}

/**
 * What to say for one inline code span. Short identifiers are read as words; anything a
 * listener could not follow letter by letter (a whole command, a JSON object, a URL, a
 * selector) is named instead of spelled out, because the lesson on screen still shows it.
 */
export function speakCode(code, lang = 'en') {
  const say = phrasesFor(lang).code;
  const text = code.trim();
  if (PROGRAMS.test(text)) {
    const tokens = text.split(/\s+/);
    if (tokens.length <= 3 && !/["'{]|:\/\//.test(text)) return tokens.map(token => (token.startsWith('-') ? flagWords(token) : codeWords(token))).join(' ');
    return fill(say.command, { name: codeWords(tokens[0]) });
  }
  if (/^--?[A-Za-z]/.test(text)) {
    const parts = [];
    text.split(/\s+/).forEach(token => {
      if (/^--?[A-Za-z]/.test(token)) parts.push(flagWords(token));
      else if (parts.length && !/^(\w+:\/\/|[\d.:]+$|\/)/.test(token)) parts[parts.length - 1] += ` ${codeWords(token)}`;
    });
    return parts.join(', ');
  }
  if (/^[{[]/.test(text) && /["':=]/.test(text)) {
    const keys = [...text.matchAll(/"([A-Za-z_$][\w$]*)"\s*:/g)].map(match => codeWords(match[1]));
    if (keys.length) return fill(say.json, { keys: joinWords(keys, say.and) });
    const labels = [...text.matchAll(/([A-Za-z_][\w]*)\s*=/g)].map(match => codeWords(match[1]));
    if (labels.length) return fill(say.labels, { keys: joinWords(labels, say.and) });
    return text.startsWith('[') ? say.array : say.object;
  }
  if (/^enode:\/\//.test(text)) return say.enode;
  const url = /^(?:https?|wss?):\/\/([^/:?#]+)(?::(\d+))?/.exec(text);
  if (url) return isLocal(url[1]) ? fill(say.local, { port: url[2] ?? '' }).replace(/[ ,]+$/, '') : url[1];
  if (/^0x[0-9a-f]{7,}$/i.test(text)) return phrasesFor(lang).hex;
  return codeWords(text
    .replace(/0x[0-9a-f…]{7,}/gi, ` ${phrasesFor(lang).hex} `)
    .replace(/(?<![\w.])(?=[0-9a-f]*[a-f])(?=[0-9a-f]*\d)[0-9a-f]{7,}(?![\w])/gi, '')
    .replace(/\s*[×*]\s*/g, ` ${say.times} `)
    .replace(/\s+-\s+/g, ` ${say.minus} `)
    .replace(/\s+==?\s+/g, ` ${say.equals} `)
    .replace(/\s*\|\|\s*/g, ', '));
}
const phrasesFor = lang => PHRASES[lang] ?? PHRASES.en;
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match));

/**
 * Text a speech engine reads naturally: inline code said as words or named (see speakCode),
 * no markup or brackets, abbreviations spelled out, and names an engine would spell letter by
 * letter or mispronounce respelled for that language's voice.
 */
export function speakable(text, lang = 'en') {
  const phrases = phrasesFor(lang);
  let spoken = plainText(String(text ?? '').replace(/`([^`\n]+)`/g, (_, code) => ` ${speakCode(code, lang)} `))
    .replace(/[[\]{}]/g, ' ')
    .replace(/\b0x[0-9a-f]{7,}\b/gi, phrases.hex);
  phrases.abbreviations.forEach(([pattern, words]) => { spoken = spoken.replace(pattern, words); });
  spoken = spoken
    .replace(/([A-Za-z0-9])_(?=[A-Za-z0-9])/g, '$1 ')
    .replace(/\s*(?:→|->)\s*/g, phrases.arrow);
  soundRules(lang).forEach(([pattern, said]) => { spoken = spoken.replace(pattern, found => matchCase(found, said)); });
  return spoken
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    // A named code span can open a sentence ("a curl command …"); sentences start with a capital.
    .replace(/(^|[.!?]\s+)(\p{Ll})/gu, (_, before, letter) => before + letter.toUpperCase());
}

const ending = text => (/[.!?:]$/.test(text) ? text : `${text}.`);

function pack(pieces, limit) {
  const out = [];
  let current = '';
  pieces.forEach(piece => {
    if (current && current.length + 1 + piece.length > limit) { out.push(current); current = piece; }
    else current = current ? `${current} ${piece}` : piece;
  });
  if (current) out.push(current);
  return out;
}

/** Cuts at word boundaries; only for a run-on clause with no punctuation to split at. */
function splitWords(text) {
  const out = [];
  let rest = text;
  while (rest.length > MAX_CHUNK_CHARS) {
    let cut = rest.lastIndexOf(' ', CHUNK_CHARS);
    if (cut <= 0) cut = rest.indexOf(' ', CHUNK_CHARS);
    if (cut <= 0) break;
    out.push(rest.slice(0, cut));
    rest = rest.slice(cut + 1);
  }
  out.push(rest);
  return out;
}

/** Speakable text in chunks of whole sentences, splitting a long sentence at its clauses. */
export function chunkText(text, lang = 'en') {
  const clean = speakable(text, lang);
  if (!clean) return [];
  const pieces = clean.split(SENTENCE_BREAK).flatMap(sentence => (sentence.length <= CHUNK_CHARS
    ? [sentence]
    : pack(sentence.split(CLAUSE_BREAK), CHUNK_CHARS).flatMap(part => (part.length > MAX_CHUNK_CHARS ? splitWords(part) : [part]))));
  return pack(pieces, CHUNK_CHARS);
}

/**
 * The script for one topic. `stage` is the topic's stage on the learning path; when the
 * topic opens that stage, the stage is announced first, like a chapter heading.
 *
 * Returns `lang`, `parts` ({ label, anchor, first }), where `anchor` is the block holding
 * the part's heading and `first` its first chunk, and `chunks` ({ part, block, text }).
 * Block keys match the `data-read` attributes the lesson renderer puts on the page.
 */
export function narrate(topic, { stage = null, lang = topic.lang || 'en' } = {}) {
  const phrases = phrasesFor(lang);
  const parts = [];
  const chunks = [];
  const part = (label, anchor) => parts.push({ label, anchor, first: chunks.length }) - 1;
  const add = (index, block, text) => chunkText(text, lang).forEach(piece => chunks.push({ part: index, block, text: piece }));

  const intro = part(phrases.introduction, 'title');
  if (stage && stage.topicIds?.[0] === topic.id) {
    add(intro, 'stage', ending(fill(phrases.stage, { n: stage.number, label: stage.label })));
    if (stage.blurb) add(intro, 'stage', stage.blurb);
  }
  add(intro, 'title', ending(topic.step ? fill(phrases.topic, { n: topic.step, title: topic.title }) : topic.title));
  add(intro, 'summary', topic.summary);

  (topic.sections ?? []).forEach((section, index) => {
    const at = part(section.heading || fill(phrases.section, { n: index + 1 }), `s${index}`);
    if (section.heading) add(at, `s${index}`, ending(section.heading));
    section.paragraphs.forEach((text, position) => add(at, `s${index}-${position}`, text));
  });

  if (topic.example) {
    const at = part(phrases.exampleLabel, 'example');
    add(at, 'example', ending(fill(phrases.example, { title: topic.example.title })));
    if (topic.example.note) add(at, 'example-note', topic.example.note);
  }

  if (topic.pitfalls?.length) {
    const at = part(phrases.pitfallsLabel, 'pitfalls');
    add(at, 'pitfalls', phrases.pitfalls);
    topic.pitfalls.forEach((text, index) => add(at, `pitfall-${index}`, text));
  }

  return { lang, parts, chunks };
}

/** Minutes of listening for a word count at a speech rate. */
export const listeningMinutes = (words, rate = 1) => words / (WORDS_PER_MINUTE * rate);
