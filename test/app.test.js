import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { safeFilePath, server } from '../server.js';
import { normalizeDataset, topicText, linkedIds, plainText, wordCount, LINK_PATTERN } from '../src/dataset.js';
import { buildAttempt, buildQuestionPool, MIN_QUESTIONS, QUIZ_LENGTH } from '../src/quiz.js';
import { PUBLISHED, HEADERS } from '../scripts/build.js';

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

test('every topic ships hand-written checkpoint questions', () => {
  topics.forEach(topic => {
    assert.ok(topic.quiz.length >= 3, `${topic.id} has ${topic.quiz.length} authored questions; write at least three`);
    topic.quiz.forEach((question, index) => {
      const where = `${topic.id} quiz[${index}]`;
      assert.ok(wordCount(question.question) >= 5, `${where} has no real question`);
      assert.ok(Array.isArray(question.options) && question.options.length >= 3 && question.options.length <= 5,
        `${where} needs three to five options`);
      assert.equal(new Set(question.options).size, question.options.length, `${where} repeats an option`);
      question.options.forEach(option => {
        assert.ok(typeof option === 'string' && option.trim(), `${where} has an empty option`);
        assert.ok(!/\[\[|\*\*/.test(option), `${where} must be plain text`);
      });
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length,
        `${where} answer must index options`);
      assert.ok(!question.question.toLowerCase().includes(String(question.options[question.answer]).toLowerCase()),
        `${where} gives away its own answer`);
    });
  });
});

// Authored questions may all store the answer at index 0; what matters is the position the
// reader sees, which is shuffled per attempt. This checks that, not the source order.
test('the correct answer does not settle into one position', () => {
  const positions = new Map();
  let total = 0;
  topics.forEach((topic, index) => {
    buildAttempt(topic, topics, byId, `spread-${index}`).forEach(question => {
      positions.set(question.answer, (positions.get(question.answer) ?? 0) + 1);
      total += 1;
    });
  });
  assert.ok(total > 50, 'expected a decent sample of questions');
  const worst = Math.max(...positions.values()) / total;
  assert.ok(worst < 0.4, `${Math.round(worst * 100)}% of correct answers land in the same slot; the shuffle is not working`);
});

test('every topic can produce a checkpoint', () => {
  topics.forEach(topic => {
    const attempt = buildAttempt(topic, topics, byId, 'seed-a');
    assert.ok(attempt.length >= MIN_QUESTIONS, `${topic.id} only generated ${attempt.length} questions`);
    assert.ok(attempt.length <= QUIZ_LENGTH, `${topic.id} generated more than ${QUIZ_LENGTH} questions`);
  });
});

test('checkpoint questions are answerable and unambiguous', () => {
  topics.forEach(topic => {
    buildAttempt(topic, topics, byId, 'seed-b').forEach(question => {
      assert.ok(question.prompt.trim().length > 15, `${topic.id}: a question prompt is too short`);
      assert.ok(question.options.length >= 3, `${topic.id}: a question has fewer than three options`);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length,
        `${topic.id}: the answer index is out of range`);
      question.options.forEach(option => assert.ok(String(option).trim().length > 0, `${topic.id}: an option is empty`));
      assert.equal(new Set(question.options).size, question.options.length, `${topic.id}: a question repeats an option`);
      const correct = question.options[question.answer];
      const wrong = question.options.filter((_, index) => index !== question.answer);
      assert.ok(!wrong.includes(correct), `${topic.id}: the correct option appears twice`);
      assert.ok(!question.prompt.includes(correct), `${topic.id}: the prompt gives away the answer`);
    });
  });
});

test('a checkpoint never asks a topic to identify itself', () => {
  topics.forEach(topic => {
    buildQuestionPool(topic, topics, byId, 'seed-c').forEach(question => {
      const wrong = question.options.filter((_, index) => index !== question.answer);
      assert.ok(!wrong.includes(topic.title), `${topic.id}: its own title is offered as a wrong answer`);
      if (question.kind === 'definition') {
        assert.ok(!question.prompt.toLowerCase().includes(topic.title.toLowerCase()),
          `${topic.id}: the definition question contains the term it asks for`);
      }
    });
  });
});

test('retrying a checkpoint reshuffles it, so answer positions cannot be memorised', () => {
  const sample = topics.filter(topic => buildAttempt(topic, topics, byId, '1').length >= MIN_QUESTIONS).slice(0, 12);
  assert.ok(sample.length, 'expected topics to sample');
  const moved = sample.filter(topic => {
    const first = buildAttempt(topic, topics, byId, 'attempt-1');
    const second = buildAttempt(topic, topics, byId, 'attempt-2');
    const shapeOf = attempt => attempt.map(question => `${question.kind}:${question.answer}`).join('|');
    return shapeOf(first) !== shapeOf(second);
  });
  assert.ok(moved.length >= sample.length * 0.7, 'most retries should differ from the first attempt');
});

test('quiz options never leak through plain text helpers', () => {
  const topic = byId.get('ethereum-rpc');
  const attempt = buildAttempt(topic, topics, byId, 'seed-d');
  attempt.forEach(question => {
    question.options.forEach(option => {
      assert.ok(!/\[\[|`/.test(option), 'options must be rendered as plain text');
    });
    assert.ok(!/\[\[/.test(question.prompt), 'prompts must be rendered as plain text');
  });
  assert.equal(plainText('see [[rpc|RPC]] and `eth_call`'), 'see RPC and eth_call');
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
