import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { safeFilePath, server } from '../server.js';
import { normalizeDataset, topicText, linkedIds, wordCount, LINK_PATTERN } from '../src/dataset.js';
import { buildAttempt, QUIZ_LENGTH } from '../src/quiz.js';
import { PUBLISHED, HEADERS, build } from '../scripts/build.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const raw = await import('../knowledge.js').then(module => module.default ?? module);
const { categories, topics } = normalizeDataset(raw);
const byId = new Map(topics.map(topic => [topic.id, topic]));
const categoryIds = new Set(categories.map(category => category.id));
const topicIds = new Set(topics.map(topic => topic.id));

test('static server resolves only files inside the workspace', () => {
  assert.equal(path.basename(safeFilePath('/index.html')), 'index.html');
  assert.equal(safeFilePath('/../package.json'), null);
  assert.equal(safeFilePath('/%2e%2e/%2e%2e/etc/passwd'), null);
  assert.equal(safeFilePath('/%00index.html'), null);
  assert.equal(path.basename(safeFilePath('/src/quiz.js')), 'quiz.js');
});

test('static server serves the browser entry and its modules', async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const { port } = server.address();
    const page = await fetch(`http://127.0.0.1:${port}/index.html`);
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type') ?? '', /^text\/html/);
    assert.equal(page.headers.get('x-content-type-options'), 'nosniff');
    assert.match(await page.text(), /Ethereum RPC/);

    const module = await fetch(`http://127.0.0.1:${port}/src/quiz.js`);
    assert.equal(module.status, 200);
    assert.match(module.headers.get('content-type') ?? '', /^text\/javascript/);

    const traversal = await new Promise(resolve => {
      const request = http.request({ hostname: '127.0.0.1', port, path: '/%2e%2e/%2e%2e/etc/passwd', method: 'GET' }, result => {
        result.resume();
        result.on('end', () => resolve(result));
      });
      request.end();
    });
    assert.equal(traversal.statusCode, 400);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('the server binds to every interface by default so the map is reachable on the network', async () => {
  const source = await fs.readFile(path.resolve(root, 'server.js'), 'utf8');
  assert.match(source, /process\.env\.HOST \?\? '0\.0\.0\.0'/);
});

test('categories are well formed and all of them carry topics', () => {
  assert.ok(categories.length >= 5, 'expected several categories');
  assert.equal(categoryIds.size, categories.length, 'category ids must be unique');
  categories.forEach(category => {
    assert.match(category.id, /^[a-z0-9-]+$/, `${category.id} is not a slug`);
    assert.ok(category.label, `${category.id} needs a label`);
    assert.match(category.color, /^#[0-9a-f]{6}$/i, `${category.id} needs a hex colour`);
    assert.ok(topics.some(topic => topic.category === category.id), `category ${category.id} has no topics`);
  });
});

test('every topic carries a definition and a lesson', () => {
  assert.ok(topics.length > 0, 'the dataset is empty');
  assert.equal(new Set(topics.map(topic => topic.id)).size, topics.length, 'topic ids must be unique');
  topics.forEach(topic => {
    assert.match(topic.id, /^[a-z0-9-]+$/, `${topic.id} is not a slug`);
    assert.ok(topic.title, `${topic.id} needs a title`);
    assert.ok(categoryIds.has(topic.category), `${topic.id} references unknown category ${topic.category}`);
    assert.ok(wordCount(topic.summary) >= 10, `${topic.id} needs a one-sentence definition as its summary`);
    assert.ok(topic.sections.length >= 1, `${topic.id} has no lesson body`);
    topic.sections.forEach((section, index) => {
      assert.ok(section.paragraphs.length, `${topic.id} section ${index} has no paragraphs`);
      section.paragraphs.forEach((text, position) => {
        assert.ok(wordCount(text) >= 6, `${topic.id} section ${index} paragraph ${position} is not a sentence`);
      });
    });
    const bodyWords = [...topic.sections.flatMap(section => section.paragraphs), ...topic.pitfalls]
      .reduce((total, text) => total + wordCount(text), 0);
    // A floor that only catches empty records. Topics written against the section schema
    // are held to a far higher bar by the next test.
    assert.ok(bodyWords >= 35, `${topic.id} has only ${bodyWords} words of lesson`);
  });
});

// Topics authored against the richer schema are held to the higher bar; older records
// that still use a flat body are allowed through by the test above.
test('topics written with the section schema meet the depth bar', () => {
  const authored = raw.topics.filter(topic => Array.isArray(topic.sections) && topic.sections.length);
  authored.forEach(item => {
    const topic = byId.get(String(item.id));
    assert.ok(topic.sections.length >= 2, `${topic.id} needs at least two sections`);
    topic.sections.forEach((section, index) => {
      assert.ok(section.heading, `${topic.id} section ${index} needs a heading`);
      section.paragraphs.forEach((text, position) => {
        assert.ok(wordCount(text) >= 15, `${topic.id} section ${index} paragraph ${position} is too short to teach anything`);
      });
    });
    const bodyWords = [...topic.sections.flatMap(section => section.paragraphs), ...topic.pitfalls]
      .reduce((total, text) => total + wordCount(text), 0);
    assert.ok(bodyWords >= 240, `${topic.id} has only ${bodyWords} words; the map promises a real explanation`);
    assert.ok(!('details' in item), `${topic.id} mixes the removed \`details\` field with \`sections\``);
    if (topic.category === 'requests') assert.ok(topic.example, `${topic.id} is a method: show a request and a response`);
  });
});

test('examples are renderable', () => {
  topics.filter(topic => topic.example).forEach(topic => {
    const { title, language, code } = topic.example;
    assert.ok(title, `${topic.id} example needs a title`);
    assert.match(language, /^(json|bash|js|text|yaml|solidity|http)$/, `${topic.id} example has an unknown language`);
    assert.ok(code.trim().length > 20, `${topic.id} example needs real code`);
  });
});

test('every link, related id, and source resolves', () => {
  topics.forEach(topic => {
    for (const text of topicText(topic)) {
      for (const match of String(text).matchAll(LINK_PATTERN)) {
        assert.ok(byId.has(match[1]), `${topic.id} links to unknown topic ${match[1]}`);
        assert.notEqual(match[1], topic.id, `${topic.id} links to itself`);
        if (match[2] !== undefined) assert.ok(match[2].trim(), `${topic.id} has an empty label on a link to ${match[1]}`);
      }
    }
    assert.ok(topic.related.length >= 3, `${topic.id} needs at least three onward paths`);
    topic.related.forEach(id => {
      assert.ok(byId.has(id), `${topic.id} lists unknown related topic ${id}`);
      assert.notEqual(id, topic.id, `${topic.id} lists itself as related`);
    });
    assert.ok(topic.sources.length, `${topic.id} needs at least one reference`);
    topic.sources.forEach(source => {
      assert.ok(source.title, `${topic.id} has a source without a title`);
      assert.match(source.url, /^https?:\/\/\S+$/, `${topic.id} has an unusable source url`);
    });
  });
});

test('the whole map is reachable from the Ethereum RPC root, and nothing is a dead end', () => {
  assert.ok(byId.has('ethereum-rpc'), 'the dataset needs an ethereum-rpc root');
  const graph = new Map(topics.map(topic => [topic.id, new Set()]));
  const incoming = new Map(topics.map(topic => [topic.id, 0]));
  topics.forEach(topic => {
    const references = new Set(linkedIds(topic, byId));
    references.forEach(id => {
      graph.get(topic.id).add(id);
      graph.get(id).add(topic.id);
      incoming.set(id, incoming.get(id) + 1);
    });
  });
  const reachable = new Set(['ethereum-rpc']);
  const pending = ['ethereum-rpc'];
  while (pending.length) {
    graph.get(pending.pop()).forEach(id => { if (!reachable.has(id)) { reachable.add(id); pending.push(id); } });
  }
  assert.deepEqual(topics.filter(topic => !reachable.has(topic.id)).map(topic => topic.id), [],
    'every topic must be reachable by following links from the root');
  assert.deepEqual([...incoming].filter(([id, count]) => count === 0 && id !== 'ethereum-rpc').map(([id]) => id), [],
    'these topics are never linked from another lesson');
});

// Checkpoints gate "learned", so their questions are held to the rules the reviewers wrote
// to: six per topic, varied in kind, plain text, and never giving the answer away by shape.
const QUIZ_KINDS = new Set(['scenario', 'cause', 'contrast', 'detail', 'consequence']);
const allQuestions = topics.flatMap(topic => topic.quiz.map(question => ({ topic, question })));
const describe = (topic, question) => `${topic.id}: "${question.question.slice(0, 60)}…"`;

test('every topic has six hand-written checkpoint questions of varied kinds', () => {
  topics.forEach(topic => {
    assert.equal(topic.quiz.length, 6, `${topic.id} has ${topic.quiz.length} checkpoint questions; it needs six`);
    topic.quiz.forEach((question, index) => assert.ok(QUIZ_KINDS.has(question.kind), `${topic.id} quiz[${index}] has unknown kind "${question.kind}"`));
    const kinds = new Set(topic.quiz.map(question => question.kind));
    assert.ok(kinds.size >= 4, `${topic.id} uses only ${kinds.size} kinds of question`);
    assert.ok(kinds.has('scenario'), `${topic.id} needs at least one scenario question`);
    assert.equal(new Set(topic.quiz.map(question => question.question.toLowerCase())).size, topic.quiz.length, `${topic.id} repeats a question`);
  });
});

test('checkpoint questions are well formed and plain text', () => {
  allQuestions.forEach(({ topic, question }) => {
    const where = describe(topic, question);
    assert.ok(question.question.endsWith('?'), `${where} is not phrased as a question`);
    assert.equal(question.options.length, 4, `${where} needs four options`);
    assert.equal(new Set(question.options.map(option => option.toLowerCase())).size, 4, `${where} repeats an option`);
    [question.question, ...question.options].forEach(text => assert.ok(!/\[\[|\*\*|`/.test(text), `${where} must be plain text`));
    question.options.forEach(option => assert.ok(!/\b(all|none|both|neither) of (the above|these)\b/i.test(option), `${where} uses an "of the above" option`));
    const correct = question.options[question.answer];
    assert.ok(!question.question.toLowerCase().includes(correct.toLowerCase()), `${where} contains its own answer`);
  });
});

test('the correct option never stands out by length', () => {
  let longest = 0;
  let correctChars = 0;
  let wrongChars = 0;
  allQuestions.forEach(({ topic, question }) => {
    const correct = question.options[question.answer];
    const wrong = question.options.filter((_, index) => index !== question.answer);
    const longestWrong = Math.max(...wrong.map(option => option.length));
    assert.ok(correct.length <= longestWrong * 1.2,
      `${describe(topic, question)} has a correct option ${Math.round(100 * correct.length / longestWrong)}% the length of the longest wrong one`);
    if (correct.length > longestWrong) longest += 1;
    correctChars += correct.length;
    wrongChars += wrong.reduce((sum, option) => sum + option.length, 0) / wrong.length;
  });
  const share = longest / allQuestions.length;
  assert.ok(share <= 0.35, `the correct option is the longest in ${Math.round(share * 100)}% of questions, so "pick the longest" would pass`);
  assert.ok(correctChars / wrongChars <= 1.12, `correct options average ${(correctChars / wrongChars).toFixed(2)}x the length of wrong ones`);
});

test('an attempt asks five of the topic\'s own questions, spread across kinds', () => {
  topics.forEach(topic => {
    const attempt = buildAttempt(topic, 'seed-a');
    assert.equal(attempt.length, QUIZ_LENGTH, `${topic.id} built ${attempt.length} questions`);
    attempt.forEach(asked => {
      const source = topic.quiz.find(question => question.question === asked.prompt);
      assert.ok(source, `${topic.id} asked a question that is not in its own set`);
      assert.deepEqual([...asked.options].sort(), [...source.options].sort(), `${topic.id}: shuffling changed the options`);
      assert.equal(asked.options[asked.answer], source.options[source.answer], `${topic.id}: shuffling lost track of the answer`);
    });
    const available = new Set(topic.quiz.map(question => question.kind)).size;
    assert.ok(new Set(attempt.map(question => question.kind)).size >= Math.min(4, available), `${topic.id}: the attempt does not spread across kinds`);
  });
});

test('the correct answer does not settle into one position', () => {
  const positions = new Map();
  let total = 0;
  topics.forEach((topic, index) => {
    buildAttempt(topic, `spread-${index}`).forEach(question => {
      positions.set(question.answer, (positions.get(question.answer) ?? 0) + 1);
      total += 1;
    });
  });
  const worst = Math.max(...positions.values()) / total;
  assert.ok(worst < 0.35, `${Math.round(worst * 100)}% of correct answers land in the same slot; the shuffle is not working`);
});

test('retrying a checkpoint changes the questions, their order, and the option layout', () => {
  const shape = attempt => attempt.map(question => `${question.prompt}|${question.options.join('|')}`).join('\n');
  const layoutChanged = topics.filter(topic => shape(buildAttempt(topic, 'attempt-1')) !== shape(buildAttempt(topic, 'attempt-2')));
  assert.ok(layoutChanged.length >= topics.length * 0.95, 'most retries should lay the checkpoint out differently');
  const setChanged = topics.filter(topic => {
    const first = new Set(buildAttempt(topic, 'set-1').map(question => question.prompt));
    return buildAttempt(topic, 'set-2').some(question => !first.has(question.prompt));
  });
  assert.ok(setChanged.length >= topics.length * 0.3, 'retries should sometimes swap in a question the first attempt did not ask');
});

// The issues log is only useful if it stays current, so the gap list is machine-checked:
// once a wanted term gets its own topic, this fails until the entry moves to Resolved.
test('the known-issues log exists and its gap list is still accurate', async () => {
  const log = await fs.readFile(path.resolve(root, 'KNOWN-ISSUES.md'), 'utf8');
  ['## Ethereum protocol and spec', '## Client behaviour worth knowing', '## Gaps in this map', '## This repo', '## Resolved']
    .forEach(heading => assert.ok(log.includes(heading), `KNOWN-ISSUES.md lost its "${heading}" section`));

  const section = log.split('## Gaps in this map')[1]?.split('\n## ')[0] ?? '';
  const wanted = section.split('\n')
    .filter(line => line.startsWith('- `'))
    .flatMap(line => [...line.split('—')[0].matchAll(/`([a-z][a-z0-9-]+)`/g)].map(match => match[1]));
  assert.ok(wanted.length >= 5, 'expected the gap list to name the terms it wants as slugs');
  const covered = wanted.filter(slug => topicIds.has(slug));
  assert.deepEqual(covered, [], 'these terms now have topics; move them to the Resolved section');
});

// The deploy target is an allow-list, so a file added to the repo is not published until
// someone puts it on that list. This keeps the list honest in both directions.
test('the publish list covers the site and nothing else', async () => {
  const neverPublish = ['server.js', 'test', 'package.json', 'package-lock.json', 'README.md', 'KNOWN-ISSUES.md', 'scripts', 'node_modules', '.git'];
  neverPublish.forEach(entry => assert.ok(!PUBLISHED.includes(entry), `${entry} must not be published`));
  for (const entry of PUBLISHED) {
    await fs.stat(path.resolve(root, entry));
  }

  const page = await fs.readFile(path.resolve(root, 'index.html'), 'utf8');
  const referenced = [...page.matchAll(/(?:src|href)="\.\/([^"]+)"/g)].map(match => match[1]);
  assert.ok(referenced.length >= 3, 'expected the page to reference its own assets');
  referenced.forEach(asset => {
    const top = asset.split('/')[0];
    assert.ok(PUBLISHED.includes(top) || PUBLISHED.includes(asset), `index.html loads ${asset}, which is not published`);
  });

  assert.match(HEADERS, /X-Content-Type-Options: nosniff/, 'published headers lost nosniff');
  assert.match(HEADERS, /Content-Security-Policy: [^\n]*script-src 'self'/, 'published headers lost the script policy');
  assert.ok(!/unsafe-inline|unsafe-eval/.test(HEADERS), 'the content security policy must not allow inline or eval');
});

// What `npm run share` puts on the internet: the server pointed at dist/. This spawns it
// the same way and checks that only the site is reachable and that the Pages headers
// arrive, so a tunnel can never expose the repo.
test('serving dist exposes only the site, with its security headers', async () => {
  await build();
  const { spawn } = await import('node:child_process');
  const port = 4300 + Math.floor(Math.random() * 500);
  const child = spawn(process.execPath, [path.resolve(root, 'server.js')], {
    env: { ...process.env, SITE_ROOT: 'dist', HOST: '127.0.0.1', PORT: String(port) },
    stdio: 'ignore'
  });
  try {
    const base = `http://127.0.0.1:${port}`;
    let page;
    for (let attempt = 0; attempt < 40 && !page; attempt += 1) {
      page = await fetch(`${base}/`).catch(() => null);
      if (!page) await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(page, 'the dist server never started');
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-security-policy') ?? '', /script-src 'self'/, 'dist must be served with its content security policy');
    assert.equal(page.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.equal((await fetch(`${base}/data/foundations.js`)).status, 200, 'the dataset must be reachable');
    for (const hidden of ['_headers', 'server.js', 'README.md', 'KNOWN-ISSUES.md', 'package.json', 'scripts/share.js', 'test/app.test.js']) {
      assert.equal((await fetch(`${base}/${hidden}`)).status, 404, `${hidden} must not be reachable from the published site`);
    }
  } finally {
    child.kill();
  }
});

test('required browser entry files are present', async () => {
  for (const filename of ['index.html', 'styles.css', 'src/app.js', 'src/quiz.js', 'src/dataset.js', 'knowledge.js', 'data/categories.js', 'package.json']) {
    const content = await fs.readFile(path.resolve(root, filename), 'utf8');
    assert.ok(content.length > 100, `${filename} should not be empty`);
  }
});

test('no scratch files are left in the published tree', async () => {
  const entries = await fs.readdir(root);
  assert.deepEqual(entries.filter(name => name.startsWith('_')), [], 'temporary probe files must not ship');
});
