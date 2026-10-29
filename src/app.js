import { buildAttempt, MIN_QUESTIONS } from './quiz.js';
import { FALLBACK_COLORS, normalizeDataset, localizeDataset, plainText, inlineTermIds as termIdsOf, linkedIds as linkedIdsOf } from './dataset.js';
import { narrate, listeningMinutes, PHRASES } from './narration.js';
import { LANGUAGES, language, useLanguage, translatePage, t, tn } from './i18n.js';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const els = {
  workspace: $('#workspace'),
  mapPane: $('#map'),
  mapHeader: $('.map-header'),
  graphWrap: $('#graph-wrap'),
  graphLines: $('#graph-lines'),
  graphNodes: $('#graph-nodes'),
  legend: $('#legend'),
  loadState: $('#load-state'),
  hint: $('#graph-hint'),
  trail: $('#trail'),
  splitter: $('#splitter'),
  lessonPane: $('#lesson'),
  lessonContent: $('#lesson-content'),
  lessonCategory: $('#lesson-category'),
  lessonStep: $('#lesson-step'),
  lessonMeta: $('#lesson-meta'),
  listenButton: $('#listen-button'),
  pathNav: $('#path-nav'),
  lessonTitle: $('#lesson-title'),
  lessonSummary: $('#lesson-summary'),
  lessonLangNote: $('#lesson-lang-note'),
  langSwitch: $('#lang-switch'),
  lessonBody: $('#lesson-body'),
  lessonTerms: $('#lesson-terms'),
  relatedTopics: $('#related-topics'),
  sourcesBlock: $('#sources-block'),
  topicSources: $('#topic-sources'),
  bookmark: $('#bookmark-button'),
  learned: $('#learned-button'),
  learnedReset: $('#learned-reset'),
  categoryContent: $('#category-content'),
  categoryPill: $('#category-pill'),
  categoryMeta: $('#category-meta'),
  categoryTitle: $('#category-title'),
  categoryBlurb: $('#category-blurb'),
  categoryTopics: $('#category-topics'),
  groupActions: $('#group-actions'),
  stageNav: $('#stage-nav'),
  viewMap: $('#view-map'),
  viewRoadmap: $('#view-roadmap'),
  nextUp: $('#next-up'),
  search: $('#topic-search'),
  searchResults: $('#search-results'),
  progressCount: $('#progress-count'),
  progressBar: $('#progress-bar'),
  back: $('#back-button'),
  home: $('#home-button'),
  brand: $('#brand-button'),
  fit: $('#fit-button'),
  zoomIn: $('#zoom-in'),
  zoomOut: $('#zoom-out'),
  theme: $('#theme-toggle'),
  motion: $('#motion-toggle'),
  toast: $('#toast'),
  savedButton: $('#saved-button'),
  savedPopover: $('#saved-popover'),
  savedTopics: $('#bookmarked-topics'),
  savedCount: $('#saved-count'),
  quizOverlay: $('#quiz-overlay'),
  quizCard: $('#quiz-card'),
  quizHeading: $('#quiz-heading'),
  quizStep: $('#quiz-step'),
  quizProgress: $('#quiz-progress'),
  quizBody: $('#quiz-body'),
  quizFooter: $('#quiz-footer'),
  quizClose: $('#quiz-close'),
  listenToggle: $('#listen-toggle'),
  player: $('#player'),
  playerPrev: $('#player-prev'),
  playerBack: $('#player-back'),
  playerPlay: $('#player-play'),
  playerForward: $('#player-forward'),
  playerNext: $('#player-next'),
  playerTitle: $('#player-title'),
  playerFill: $('#player-fill'),
  playerDetail: $('#player-detail'),
  playerModes: $('#player-modes'),
  playerRate: $('#player-rate'),
  playerVoice: $('#player-voice'),
  playerClose: $('#player-close'),
  playerMore: $('#player-more'),
  mobileTabs: $('#mobile-tabs'),
  tabLessonTitle: $('#tab-lesson-title')
};

const state = {
  categories: [],
  topics: [],
  stages: [],
  path: [],
  byId: new Map(),
  categoryById: new Map(),
  stageById: new Map(),
  root: null,
  view: 'map',
  roadmapColumns: 1,
  nextUpId: null,
  selected: null,
  selectedCategory: null,
  selectedStage: null,
  origin: null,
  history: [],
  query: '',
  activeResult: 0,
  layout: { positions: new Map(), edges: [], nodes: new Map() },
  nodeEls: new Map(),
  edgeEls: [],
  lastFocus: null,
  framing: 'fit',
  drawn: new Map(),
  layoutFrame: 0,
  pan: { x: 0, y: 0 },
  zoom: 1,
  viewportFrame: 0,
  booted: false,
  bookmarks: new Set(),
  learned: new Set(),
  motion: true,
  quizLocks: {},
  quiz: null,
  // What is being read aloud: the topic, the chunk of its narration, and the settings.
  // `token` changes on every speak and every stop, so a late event from an utterance that
  // was cancelled cannot advance the one that replaced it.
  listen: { topic: null, index: 0, playing: false, open: false, token: 0, utterance: null, mode: 'path', rate: 1, voices: {} }
};

const STORAGE_KEYS = {
  bookmarks: 'ethereum-rpc-map:bookmarks',
  learned: 'ethereum-rpc-map:learned',
  theme: 'ethereum-rpc-map:theme',
  split: 'ethereum-rpc-map:lesson-width',
  motion: 'ethereum-rpc-map:motion',
  quiz: 'ethereum-rpc-map:quiz',
  view: 'ethereum-rpc-map:view',
  lang: 'ethereum-rpc-map:lang',
  listen: 'ethereum-rpc-map:listen',
  listenSettings: 'ethereum-rpc-map:listen-settings'
};

/* Answering has to take reading time: options stay inert until the dwell timer ends,
   so clicking through five questions in a few seconds is not possible. */
const QUIZ_DWELL_MS = 2500;
const QUIZ_LOCK_BASE_MS = 20000;
const QUIZ_LOCK_MAX_MS = 300000;

function safeStorage() {
  try {
    const key = '__rpc_map_storage_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return localStorage;
  } catch {
    return null;
  }
}
const storage = safeStorage();
const readItem = key => { try { return storage?.getItem(key) ?? null; } catch { return null; } };
const writeItem = (key, value) => { try { storage?.setItem(key, value); } catch { /* storage unavailable */ } };
function readSet(key) {
  try {
    const value = JSON.parse(readItem(key) ?? '[]');
    return new Set(Array.isArray(value) ? value.filter(item => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
}
const writeSet = (key, set) => writeItem(key, JSON.stringify([...set]));
function readObject(key) {
  try {
    const value = JSON.parse(readItem(key) ?? '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}
const readLocks = () => readObject(STORAGE_KEYS.quiz);

state.bookmarks = readSet(STORAGE_KEYS.bookmarks);
state.learned = readSet(STORAGE_KEYS.learned);
state.quizLocks = readLocks();
// Dark is the default. An explicit choice wins; otherwise the system preference does.
const storedTheme = readItem(STORAGE_KEYS.theme);
const systemLight = window.matchMedia?.('(prefers-color-scheme: light)').matches ?? false;
document.documentElement.dataset.theme = storedTheme === 'light' || storedTheme === 'dark'
  ? storedTheme
  : systemLight ? 'light' : 'dark';
const savedSplit = Number.parseFloat(readItem(STORAGE_KEYS.split) ?? '');
if (Number.isFinite(savedSplit) && savedSplit >= 0.18 && savedSplit <= 0.62) {
  document.documentElement.style.setProperty('--lesson-width', `${(savedSplit * 100).toFixed(2)}%`);
}

const WORLD = { size: 4800, c: 2400 };
const INLINE_PATTERN = /(\[\[[^\]]+\]\]|`[^`\n]+`)/g;
// Motion is on unless the reader switches it off with the toolbar button. It deliberately
// does not follow the operating system's reduced-motion setting: the map's transitions are
// how it shows where you went, and a system-wide switch turned them off with nothing in the
// app to say why.
function applyMotion(on) {
  state.motion = on;
  document.documentElement.dataset.motion = on ? 'on' : 'off';
  if (els.motion) {
    els.motion.textContent = on ? '⏵' : '⏸';
    els.motion.classList.toggle('is-off', !on);
    els.motion.setAttribute('aria-label', on ? t('Turn animations off') : t('Turn animations on'));
    els.motion.title = on ? t('Animations are on') : t('Animations are off');
  }
}
const prefersReducedMotion = () => !state.motion;

function tint(hex, alpha = '1f') {
  const value = String(hex).replace('#', '');
  return /^[0-9a-f]{6}$/i.test(value) ? `#${value}${alpha}` : `${hex}${alpha}`;
}

/* ---------- dataset ---------- */
const findRoot = () => state.byId.get('ethereum-rpc') || state.byId.get('rpc') || state.topics[0] || null;
const categoryFor = topic => state.categoryById.get(topic?.category) || state.categories[0] || { id: '', label: 'Topic', color: FALLBACK_COLORS[0] };
const isRoot = topic => topic?.id === state.root?.id;
const categoryIndex = topic => Math.max(0, state.categories.findIndex(category => category.id === topic.category));
// Within a category, path order: the inner ring of each cluster holds what to read first.
const sortTopics = topics => [...topics].sort((a, b) => categoryIndex(a) - categoryIndex(b) || a.step - b.step || a.title.localeCompare(b.title));

const inlineTermIds = topic => termIdsOf(topic, state.byId);
const linkedIds = topic => linkedIdsOf(topic, state.byId);

/* ---------- learning path ---------- */
const stageFor = topic => state.stageById.get(topic?.stage) ?? null;
const pathNeighbour = (topic, delta) => (topic?.step ? state.path[topic.step - 1 + delta] ?? null : null);
const nextOnPath = () => state.path.find(topic => !state.learned.has(topic.id)) ?? null;
/** True when the lesson pane shows a topic, not a category or stage page. */
const viewingTopic = () => !state.selectedCategory && !state.selectedStage;

/* ---------- inline rendering ---------- */
function markLearnState(element, id) {
  element.classList.toggle('is-known', state.learned.has(id));
  element.classList.toggle('is-todo', !state.learned.has(id));
}

function renderInline(text, parent) {
  const parts = String(text).split(INLINE_PATTERN);
  parts.forEach(part => {
    if (!part) return;
    if (part.startsWith('[[') && part.endsWith(']]')) {
      const match = /^\[\[([^\]|]+)(?:\|([^\]]*))?\]\]$/.exec(part);
      const topic = match && state.byId.get(match[1]);
      const label = match?.[2] || topic?.title || match?.[1] || part;
      // A link to the topic you are already reading would go nowhere, so it stays text.
      const selfId = viewingTopic() ? state.selected?.id : null;
      if (!topic || topic.id === selfId) { parent.append(document.createTextNode(label)); return; }
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'inline-topic';
      markLearnState(link, topic.id);
      link.dataset.topicId = topic.id;
      link.textContent = label;
      link.title = state.learned.has(topic.id) ? t('{title} — already learned', { title: topic.title }) : t('{title} — not learned yet', { title: topic.title });
      parent.append(link);
      return;
    }
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
      const code = document.createElement('code');
      code.textContent = part.slice(1, -1);
      parent.append(code);
      return;
    }
    parent.append(document.createTextNode(part));
  });
}
function paragraph(text, parent, className = '') {
  const element = document.createElement('p');
  if (className) element.className = className;
  renderInline(text, element);
  parent.append(element);
  return element;
}
function setCategoryColor(element, category) {
  const color = category.color || FALLBACK_COLORS[0];
  element.style.setProperty('--node-color', color);
  element.style.setProperty('--category-color', color);
  element.style.setProperty('--category-tint', tint(color));
}

/* ---------- layouts ---------- */
function paneShape() {
  const width = Math.max(320, els.graphWrap.clientWidth || 1200);
  const height = Math.max(190, els.graphWrap.clientHeight || 420);
  const aspect = Math.min(3.4, Math.max(1.05, width / height));
  return { width, height, k: Math.sqrt(aspect) };
}
const tangentialScale = (rx, ry, angle) => Math.hypot(rx * Math.sin(angle), ry * Math.cos(angle));

function layoutOverview() {
  const positions = new Map();
  const edges = [];
  const nodes = new Map();
  const root = state.root;
  if (!root) return { positions, edges, nodes };
  positions.set(root.id, { x: WORLD.c, y: WORLD.c });
  nodes.set(root.id, { kind: 'center', topic: root });
  const groups = state.categories
    .map(category => ({ category, items: sortTopics(state.topics.filter(topic => topic.category === category.id && topic.id !== root.id)) }))
    .filter(group => group.items.length);
  const weights = groups.map(group => group.items.length + 3);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const { k } = paneShape();
  const ellipse = (radius, angleValue) => ({ x: WORLD.c + Math.cos(angleValue) * radius * k, y: WORLD.c + Math.sin(angleValue) * radius / k });
  let angle = -Math.PI / 2;
  const hubRadius = 560;
  const rings = [960, 1180, 1400, 1620, 1840, 2060, 2280];
  groups.forEach((group, groupIndex) => {
    const sector = weights[groupIndex] / total * 2 * Math.PI;
    const mid = angle + sector / 2;
    const hubId = `hub:${group.category.id}`;
    positions.set(hubId, ellipse(hubRadius, mid));
    nodes.set(hubId, { kind: 'hub', category: group.category, count: group.items.length });
    edges.push({ from: root.id, to: hubId, kind: 'tree' });
    const usable = sector * 0.92;
    const remaining = [...group.items];
    for (const radius of rings) {
      if (!remaining.length) break;
      const scale = tangentialScale(radius * k, radius / k, mid);
      const capacity = Math.max(1, Math.floor(usable * scale / 140));
      const batch = remaining.splice(0, capacity);
      const spread = Math.min(usable, batch.length * 140 / Math.max(1, scale)) / batch.length;
      batch.forEach((topic, index) => {
        const topicAngle = mid + (index - (batch.length - 1) / 2) * spread;
        positions.set(topic.id, ellipse(radius, topicAngle));
        nodes.set(topic.id, { kind: 'topic', topic, origin: topic.id === state.origin });
        edges.push({ from: hubId, to: topic.id, kind: 'tree' });
      });
    }
    angle += sector;
  });
  addSelectionEdges(positions, edges);
  return { positions, edges, nodes };
}

/** Lines from the open topic to every term it links to, and back to where you came from. */
function addSelectionEdges(positions, edges, { related = true } = {}) {
  if (!viewingTopic() || !state.selected || !positions.has(state.selected.id)) return;
  if (related) linkedIds(state.selected).forEach(id => {
    if (positions.has(id)) edges.push({ from: state.selected.id, to: id, kind: 'related', color: categoryFor(state.byId.get(id)).color });
  });
  if (state.origin && positions.has(state.origin) && state.origin !== state.selected.id) {
    edges.push({ from: state.selected.id, to: state.origin, kind: 'origin', color: categoryFor(state.byId.get(state.origin)).color });
  }
}

/* The roadmap reads like a page: one band per stage, its marker on the left and its
   topics in path order to the right, wrapping onto a further row when a stage is long.
   The column count is whichever makes the whole roadmap closest to the pane's shape, so
   Fit shows it as large as it can. The tiles are the same nodes as on the map, so
   switching views slides each one from its cluster to its place on the path. */
const ROADMAP = { cellWidth: 170, rowHeight: 86, stageGap: 30, minColumns: 4, maxColumns: 20 };

function layoutRoadmap() {
  const positions = new Map();
  const edges = [];
  const nodes = new Map();
  const stages = state.stages.filter(stage => stage.topicIds.length);
  if (!stages.length) return { positions, edges, nodes };
  const width = Math.max(320, els.graphWrap.clientWidth || 1200);
  const height = Math.max(190, els.graphWrap.clientHeight || 420);
  const aspect = Math.min(3.4, Math.max(.5, width / height));
  const { cellWidth, rowHeight, stageGap } = ROADMAP;
  const shape = columns => {
    const rows = stages.reduce((sum, stage) => sum + Math.ceil(stage.topicIds.length / columns), 0);
    const w = (columns + 1) * cellWidth;
    const h = rows * rowHeight + (stages.length - 1) * stageGap;
    return { columns, w, h, miss: Math.abs(Math.log(w / h / aspect)) };
  };
  let best = shape(ROADMAP.minColumns);
  for (let columns = ROADMAP.minColumns + 1; columns <= ROADMAP.maxColumns; columns += 1) {
    const candidate = shape(columns);
    if (candidate.miss < best.miss) best = candidate;
  }
  const left = WORLD.c - best.w / 2 + cellWidth / 2;
  let top = WORLD.c - best.h / 2 + rowHeight / 2;
  stages.forEach(stage => {
    const key = `stage:${stage.id}`;
    positions.set(key, { x: left, y: top });
    nodes.set(key, { kind: 'stage', stage });
    let previous = key;
    stage.topicIds.forEach((id, index) => {
      const topic = state.byId.get(id);
      const row = Math.floor(index / best.columns);
      const column = index % best.columns;
      positions.set(id, { x: left + (column + 1) * cellWidth, y: top + row * rowHeight });
      nodes.set(id, { kind: 'topic', topic, origin: id === state.origin });
      // The line runs along each row; a wrap starts a new line rather than slashing back.
      if (column > 0 || index === 0) edges.push({ from: previous, to: id, kind: 'path', done: state.learned.has(id) && (previous === key || state.learned.has(previous)) });
      previous = id;
    });
    top += Math.ceil(stage.topicIds.length / best.columns) * rowHeight + stageGap;
  });
  state.roadmapColumns = best.columns;
  // On a grid, lines to every linked term cut across the rows and hide the path, so the
  // roadmap keeps only the line back to where you came from.
  addSelectionEdges(positions, edges, { related: false });
  return { positions, edges, nodes };
}

function computeLayout() {
  return state.view === 'roadmap' ? layoutRoadmap() : layoutOverview();
}

/* ---------- graph rendering ---------- */
function ensureNode(key) {
  let node = state.nodeEls.get(key);
  if (node) {
    if (node.dataset.exiting) {
      delete node.dataset.exiting;
      window.clearTimeout(Number(node.dataset.exitTimer));
      node.classList.remove('is-exiting');
    }
    return node;
  }
  node = document.createElement('button');
  node.type = 'button';
  node.className = 'topic-node';
  state.nodeEls.set(key, node);
  return node;
}

function retireNode(key, node) {
  if (node.dataset.exiting) return;
  node.dataset.exiting = '1';
  node.classList.add('is-exiting');
  const timer = window.setTimeout(() => {
    node.remove();
    if (state.nodeEls.get(key) === node) state.nodeEls.delete(key);
    state.drawn.delete(key);
  }, prefersReducedMotion() ? 0 : 260);
  node.dataset.exitTimer = String(timer);
}

function decorateNode(node, meta) {
  if (meta.kind === 'stage') { decorateStage(node, meta.stage); return; }
  const isHub = meta.kind === 'hub';
  const topic = meta.topic;
  const category = isHub ? meta.category : categoryFor(topic);
  setCategoryColor(node, category);
  node.className = 'topic-node';
  node.replaceChildren();
  delete node.dataset.stageId;
  if (isHub) {
    node.dataset.categoryId = category.id;
    delete node.dataset.topicId;
    node.classList.add('is-hub');
    if (meta.center) node.classList.add('is-center');
    if (state.selectedCategory?.id === category.id) node.classList.add('is-selected');
    const items = state.topics.filter(item => item.category === category.id);
    const done = items.filter(item => state.learned.has(item.id)).length;
    node.append(document.createTextNode(category.label));
    const sub = document.createElement('span');
    sub.className = 'node-category';
    sub.textContent = t('{done} / {total} learned', { done, total: meta.count ?? items.length });
    node.append(sub);
    node.setAttribute('aria-label', t('Open the {label} category, {done} of {total} learned', { label: category.label, done, total: items.length }));
    return;
  }
  const learned = state.learned.has(topic.id);
  node.dataset.topicId = topic.id;
  delete node.dataset.categoryId;
  node.append(document.createTextNode(topic.title));
  if (isRoot(topic)) node.classList.add('is-root');
  if (meta.kind === 'center') node.classList.add('is-center');
  if (meta.kind === 'leaf') node.classList.add('is-leaf');
  if (meta.kind === 'topic') node.classList.add('is-compact');
  if (meta.origin) node.classList.add('is-origin');
  if (state.selected?.id === topic.id && viewingTopic()) node.classList.add('is-selected');
  if (state.nextUpId === topic.id) node.classList.add('is-next');
  node.classList.add(learned ? 'is-learned' : 'is-todo');
  const badge = document.createElement('span');
  badge.className = 'node-badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.textContent = learned ? '✓' : '×';
  node.append(badge);
  if (topic.step) {
    const step = document.createElement('span');
    step.className = 'node-step';
    step.setAttribute('aria-hidden', 'true');
    step.textContent = String(topic.step);
    node.append(step);
  }
  if (meta.kind === 'center' || meta.kind === 'branch') {
    const sub = document.createElement('span');
    sub.className = 'node-category';
    sub.textContent = meta.origin ? t('↩ you came from here') : meta.more > 0 ? t('{label} · +{more} more', { label: category.label, more: meta.more }) : category.label;
    node.append(sub);
  }
  const label = [
    topic.step ? t('Step {n}: {title}.', { n: topic.step, title: topic.title }) : `${topic.title}.`,
    learned ? t('Learned.') : t('Not learned yet.'),
    state.nextUpId === topic.id ? t('Next on the path.') : '',
    meta.origin ? t('You came from here.') : '',
    t('Open it')
  ];
  node.setAttribute('aria-label', label.filter(Boolean).join(' '));
}

function decorateStage(node, stage) {
  node.className = 'topic-node is-stage';
  node.replaceChildren();
  node.style.removeProperty('--node-color');
  node.dataset.stageId = stage.id;
  delete node.dataset.topicId;
  delete node.dataset.categoryId;
  if (state.selectedStage?.id === stage.id) node.classList.add('is-selected');
  const done = stage.topicIds.filter(id => state.learned.has(id)).length;
  if (done === stage.topicIds.length) node.classList.add('is-complete');
  const eyebrow = document.createElement('span');
  eyebrow.className = 'node-category';
  eyebrow.textContent = t('Stage {n}', { n: stage.number });
  const sub = document.createElement('span');
  sub.className = 'node-category';
  sub.textContent = t('{done} / {total} learned', { done, total: stage.topicIds.length });
  node.append(eyebrow, document.createTextNode(stage.label), sub);
  node.setAttribute('aria-label', t('Stage {n}, {label}: {done} of {total} learned. Open its reading list', { n: stage.number, label: stage.label, done, total: stage.topicIds.length }));
}

function renderGraph({ refit = false, animate = true } = {}) {
  state.nextUpId = nextOnPath()?.id ?? null;
  paintViewControls();
  const layout = computeLayout();
  state.layout = layout;
  els.graphNodes.style.width = `${WORLD.size}px`;
  els.graphNodes.style.height = `${WORLD.size}px`;
  const keep = new Set();
  const motion = animate && !prefersReducedMotion();
  const focusKey = selectionKey();
  const focusChanged = focusKey !== state.lastFocus;
  state.lastFocus = focusKey;
  let entering = 0;
  layout.nodes.forEach((meta, key) => {
    keep.add(key);
    const node = ensureNode(key);
    const fresh = !node.isConnected;
    // decorateNode rewrites className, so motion classes go on afterwards. Without this,
    // every node on screen would replay its entrance on every render.
    decorateNode(node, meta);
    if (fresh) els.graphNodes.append(node);
    if (!motion) return;
    if (fresh) {
      node.style.setProperty('--enter-delay', `${Math.min(entering * 16, 240)}ms`);
      node.classList.add('is-entering');
      entering += 1;
      node.addEventListener('animationend', () => node.classList.remove('is-entering'), { once: true });
      return;
    }
    // The topic you just opened lands with a pop as the camera arrives on it.
    if (key === focusKey && focusChanged) {
      node.classList.add('is-arriving');
      node.addEventListener('animationend', () => node.classList.remove('is-arriving'), { once: true });
    }
  });
  state.nodeEls.forEach((node, key) => { if (!keep.has(key)) retireNode(key, node); });
  buildEdges(layout);
  tweenLayout(layout, { animate: motion });
  if (refit) fitView({ animate });
}

function buildEdges(layout) {
  const svg = els.graphLines;
  svg.setAttribute('width', WORLD.size);
  svg.setAttribute('height', WORLD.size);
  svg.setAttribute('viewBox', `0 0 ${WORLD.size} ${WORLD.size}`);
  svg.style.width = `${WORLD.size}px`;
  svg.style.height = `${WORLD.size}px`;
  svg.replaceChildren();
  state.edgeEls = [];
  const order = { tree: 0, leaf: 1, path: 2, branch: 3, related: 4, origin: 5 };
  [...layout.edges].sort((a, b) => order[a.kind] - order[b.kind]).forEach(edge => {
    if (!layout.positions.has(edge.from) || !layout.positions.has(edge.to)) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', `edge is-${edge.kind}${edge.done ? ' is-done' : ''}`);
    if (edge.color) line.style.setProperty('--edge-color', edge.color);
    svg.append(line);
    state.edgeEls.push({ line, from: edge.from, to: edge.to });
  });
}

/**
 * Moves the map from where it is drawn to the new layout, nodes and edges together.
 * Edges are SVG geometry, which CSS cannot transition reliably, so a single frame loop
 * drives both; otherwise the lines would snap while the nodes glide.
 */
function tweenLayout(layout, { animate = true } = {}) {
  if (state.layoutFrame) cancelAnimationFrame(state.layoutFrame);
  state.layoutFrame = 0;
  const targets = layout.positions;
  const starts = new Map();
  targets.forEach((target, key) => {
    const drawn = state.drawn.get(key);
    if (drawn) { starts.set(key, drawn); return; }
    // A node appearing for the first time grows out of whatever it hangs from.
    const parentKey = layout.edges.find(edge => edge.to === key)?.from;
    const parent = parentKey && (state.drawn.get(parentKey) ?? targets.get(parentKey));
    starts.set(key, parent ? { x: parent.x, y: parent.y } : { x: target.x, y: target.y });
  });

  const paint = positions => {
    positions.forEach((point, key) => {
      const node = state.nodeEls.get(key);
      if (node) { node.style.left = `${point.x}px`; node.style.top = `${point.y}px`; }
    });
    state.edgeEls.forEach(({ line, from, to }) => {
      const start = positions.get(from) ?? targets.get(from);
      const end = positions.get(to) ?? targets.get(to);
      if (!start || !end) return;
      line.setAttribute('x1', start.x);
      line.setAttribute('y1', start.y);
      line.setAttribute('x2', end.x);
      line.setAttribute('y2', end.y);
    });
    state.drawn = positions;
  };

  const moved = [...targets].some(([key, target]) => {
    const start = starts.get(key);
    return Math.abs(start.x - target.x) > 0.5 || Math.abs(start.y - target.y) > 0.5;
  });
  if (!animate || !moved) { paint(new Map(targets)); return; }

  // Put everything at its starting point in this frame. Waiting for the first animation
  // frame would leave freshly appended nodes at the canvas origin for one paint.
  paint(new Map(starts));

  const duration = 520;
  const ease = time => 1 - (1 - time) ** 3;
  // The clock starts on the first frame, not here. A frame callback scheduled from an event
  // handler runs later in that same frame and is handed the frame's start timestamp, which
  // is earlier than performance.now() was at this line. Measuring from performance.now()
  // therefore gives a negative progress on the first step, and the easing turns that into a
  // large negative multiplier that throws every node far off screen before it recovers.
  let started = null;
  const step = now => {
    if (started === null) started = now;
    const progress = Math.min(1, Math.max(0, (now - started) / duration));
    const eased = ease(progress);
    const frame = new Map();
    targets.forEach((target, key) => {
      const start = starts.get(key);
      frame.set(key, { x: start.x + (target.x - start.x) * eased, y: start.y + (target.y - start.y) * eased });
    });
    paint(frame);
    state.layoutFrame = progress < 1 ? requestAnimationFrame(step) : 0;
  };
  state.layoutFrame = requestAnimationFrame(step);
  // Frame callbacks are throttled in background tabs and stop entirely in some embedded
  // views. Without this the map would be left frozen part-way through a move.
  window.clearTimeout(tweenLayout.settle);
  tweenLayout.settle = window.setTimeout(() => {
    if (!state.layoutFrame) return;
    cancelAnimationFrame(state.layoutFrame);
    state.layoutFrame = 0;
    paint(new Map(targets));
  }, duration + 140);
}

function applyViewport() {
  const transform = `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`;
  els.graphLines.style.transform = transform;
  els.graphNodes.style.transform = transform;
}

function stopViewportAnimation() {
  if (state.viewportFrame) cancelAnimationFrame(state.viewportFrame);
  state.viewportFrame = 0;
}

const RHO = Math.SQRT2;

/**
 * The smooth zoom-and-pan path of van Wijk and Nuij: it pulls back while travelling and
 * closes in on arrival, so a long hop never streaks across the map at reading distance.
 * `w` is the width of the view in world units, `u` the distance travelled along the line
 * between the two centres. Returns the path length in the same units as its parameter s.
 */
function flightPath(w0, w1, d) {
  if (d < 1e-6) {
    const direction = w1 < w0 ? -1 : 1;
    return { length: Math.abs(Math.log(w1 / w0)) / RHO, at: s => ({ u: 0, w: w0 * Math.exp(direction * RHO * s) }) };
  }
  const rho2 = RHO * RHO;
  const rho4 = rho2 * rho2;
  const b0 = (w1 * w1 - w0 * w0 + rho4 * d * d) / (2 * w0 * rho2 * d);
  const b1 = (w1 * w1 - w0 * w0 - rho4 * d * d) / (2 * w1 * rho2 * d);
  const r = value => Math.log(-value + Math.sqrt(value * value + 1));
  const r0 = r(b0);
  const r1 = r(b1);
  return {
    length: (r1 - r0) / RHO,
    at: s => ({
      u: (w0 / rho2) * (Math.cosh(r0) * Math.tanh(RHO * s + r0) - Math.sinh(r0)),
      w: (w0 * Math.cosh(r0)) / Math.cosh(RHO * s + r0)
    })
  };
}

/** Moves the camera to a pan and zoom. Returns how long the move takes, in milliseconds. */
function setViewport(pan, zoom, { animate = true } = {}) {
  stopViewportAnimation();
  window.clearTimeout(setViewport.settle);
  const land = () => { state.pan = pan; state.zoom = zoom; applyViewport(); };
  if (!animate || prefersReducedMotion()) { land(); return 0; }
  const width = Math.max(1, els.graphWrap.clientWidth);
  const height = Math.max(1, els.graphWrap.clientHeight);
  const centre = (p, z) => ({ x: (width / 2 - p.x) / z, y: (height / 2 - p.y) / z });
  const c0 = centre(state.pan, state.zoom);
  const c1 = centre(pan, zoom);
  const dx = c1.x - c0.x;
  const dy = c1.y - c0.y;
  const distance = Math.hypot(dx, dy);
  const w0 = width / state.zoom;
  const w1 = width / zoom;
  if (distance * zoom < 1 && Math.abs(Math.log(w1 / w0)) < 0.004) { land(); return 0; }
  const path = flightPath(w0, w1, distance);
  const duration = Math.round(Math.min(1250, Math.max(380, 360 + path.length * 300)));
  const ease = time => (time < 0.5 ? 4 * time ** 3 : 1 - (-2 * time + 2) ** 3 / 2);
  // Anchored to the first frame and clamped at both ends; see the note in tweenLayout.
  let started = null;
  const step = now => {
    if (started === null) started = now;
    const progress = Math.min(1, Math.max(0, (now - started) / duration));
    const { u, w } = path.at(ease(progress) * path.length);
    const z = width / w;
    const along = distance > 0 ? u / distance : 0;
    state.zoom = z;
    state.pan = { x: width / 2 - (c0.x + dx * along) * z, y: height / 2 - (c0.y + dy * along) * z };
    applyViewport();
    if (progress < 1) { state.viewportFrame = requestAnimationFrame(step); return; }
    state.viewportFrame = 0;
    land();
  };
  state.viewportFrame = requestAnimationFrame(step);
  // Frame callbacks are throttled in background tabs; land the camera regardless.
  setViewport.settle = window.setTimeout(() => {
    if (!state.viewportFrame) return;
    stopViewportAnimation();
    land();
  }, duration + 160);
  return duration;
}

/** Pan and zoom that frame a set of world points inside the map pane, clear of the
    toolbar along the top and the category chips along the bottom. */
function framePoints(points, { pad = 120, maxZoom = 1.05 } = {}) {
  const width = Math.max(320, els.graphWrap.clientWidth);
  const height = Math.max(190, els.graphWrap.clientHeight);
  if (!points.length) return { pan: { x: 0, y: 0 }, zoom: 1 };
  const top = Math.min(height * .25, els.mapHeader?.offsetHeight ?? 0);
  const bottom = Math.min(height * .2, (els.legend.offsetHeight || 0) + 14);
  const usable = Math.max(120, height - top - bottom);
  const minX = Math.min(...points.map(point => point.x)) - pad;
  const maxX = Math.max(...points.map(point => point.x)) + pad;
  const minY = Math.min(...points.map(point => point.y)) - pad * .4;
  const maxY = Math.max(...points.map(point => point.y)) + pad * .4;
  const zoom = Math.min(maxZoom, Math.max(.06, Math.min(width / Math.max(1, maxX - minX), usable / Math.max(1, maxY - minY))));
  return { pan: { x: width / 2 - ((minX + maxX) / 2) * zoom, y: top + usable / 2 - ((minY + maxY) / 2) * zoom }, zoom };
}

const computeFit = () => framePoints([...state.layout.positions.values()]);

function fitView({ animate = true } = {}) {
  const target = computeFit();
  state.framing = 'fit';
  return setViewport(target.pan, target.zoom, { animate });
}

function centerOnKey(key, zoom, { animate = true } = {}) {
  const position = state.layout.positions.get(key);
  if (!position) return 0;
  const width = Math.max(1, els.graphWrap.clientWidth);
  const height = Math.max(1, els.graphWrap.clientHeight);
  state.framing = 'focus';
  return setViewport({ x: width / 2 - position.x * zoom, y: height / 2 - position.y * zoom }, zoom, { animate });
}

/* Below FAR_ZOOM the labels are too small to read. Opening a topic from there flies in to
   TOPIC_ZOOM; from closer in it only pans, so a reader who picked their own zoom keeps it. */
const FAR_ZOOM = 0.6;
const TOPIC_ZOOM = 1.1;

const selectionKey = () => (state.selectedStage ? `stage:${state.selectedStage.id}`
  : state.selectedCategory ? `hub:${state.selectedCategory.id}` : state.selected?.id ?? null);

/** Brings the current selection into view. Returns the camera move's duration. */
function focusSelection({ animate = true } = {}) {
  const key = selectionKey();
  if (!key) return 0;
  if (viewingTopic() && isRoot(state.selected)) return fitView({ animate });
  if (state.selectedCategory || state.selectedStage) {
    // A category or a stage is a group: frame its marker and every topic in it. On the map
    // a stage has no marker, and its topics are spread across the clusters.
    let members = state.selectedStage
      ? state.selectedStage.topicIds
      : state.topics.filter(topic => topic.category === state.selectedCategory.id).map(topic => topic.id);
    // A long stage band does not fit at a readable size, so the roadmap opens on its left
    // end, where reading starts, rather than shrinking the whole band.
    if (state.selectedStage && state.view === 'roadmap') {
      const fits = Math.max(2, Math.floor((els.graphWrap.clientWidth - 160) / (ROADMAP.cellWidth * .85)) - 1);
      members = members.filter((_, index) => index % state.roadmapColumns < fits);
    }
    const points = [key, ...members].map(id => state.layout.positions.get(id)).filter(Boolean);
    const target = framePoints(points, { pad: 150, maxZoom: 1 });
    state.framing = 'focus';
    return setViewport(target.pan, target.zoom, { animate });
  }
  return centerOnKey(key, state.zoom < FAR_ZOOM ? TOPIC_ZOOM : state.zoom, { animate });
}

/** After the pane changes size: keep the whole map framed, or keep the selection centred. */
function relayout() {
  renderGraph({ animate: false });
  if (state.framing === 'fit') fitView({ animate: false });
  else if (state.framing === 'focus') focusSelection({ animate: false });
}

function zoomAt(factor, originX, originY) {
  stopViewportAnimation();
  state.framing = 'free';
  const previous = state.zoom;
  const next = Math.min(1.8, Math.max(.06, previous * factor));
  if (next === previous) return;
  const rect = els.graphWrap.getBoundingClientRect();
  const x = originX - rect.left;
  const y = originY - rect.top;
  state.pan.x = x - (x - state.pan.x) * next / previous;
  state.pan.y = y - (y - state.pan.y) * next / previous;
  state.zoom = next;
  applyViewport();
}

/* ---------- legend, trail ---------- */
function renderLegend() {
  els.legend.replaceChildren();
  state.categories.forEach(category => {
    const items = state.topics.filter(topic => topic.category === category.id);
    const done = items.filter(topic => state.learned.has(topic.id)).length;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'legend-chip';
    chip.dataset.categoryId = category.id;
    chip.style.setProperty('--chip-color', category.color);
    chip.append(document.createTextNode(category.label));
    const score = document.createElement('small');
    score.textContent = `${done}/${items.length}`;
    chip.append(score);
    chip.title = t('{label}: {done} of {total} learned', { label: category.label, done, total: items.length });
    if (done === items.length && items.length) chip.classList.add('is-complete');
    if (state.selectedCategory?.id === category.id || (viewingTopic() && state.selected?.category === category.id)) chip.classList.add('is-active');
    els.legend.append(chip);
  });
}

const currentKey = () => state.selectedStage ? `s:${state.selectedStage.id}`
  : state.selectedCategory ? `c:${state.selectedCategory.id}` : state.selected ? `t:${state.selected.id}` : null;
function labelForKey(key) {
  const [kind, id] = key.split(':');
  if (kind === 's') return state.stageById.get(id)?.label ?? id;
  return kind === 'c' ? state.categoryById.get(id)?.label ?? id : state.byId.get(id)?.title ?? id;
}

function renderTrail() {
  els.trail.replaceChildren();
  const rootKey = state.root ? `t:${state.root.id}` : null;
  const items = [...state.history, currentKey()].filter(Boolean);
  if (rootKey && items[0] !== rootKey) items.unshift(rootKey);
  const collapsed = items.length > 6 ? [items[0], null, ...items.slice(-4)] : items;
  collapsed.forEach((key, index) => {
    if (index > 0) {
      const separator = document.createElement('span');
      separator.className = 'trail-sep';
      separator.textContent = '›';
      els.trail.append(separator);
    }
    if (key === null) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'trail-ellipsis';
      ellipsis.textContent = '…';
      els.trail.append(ellipsis);
      return;
    }
    const isCurrent = index === collapsed.length - 1;
    const item = document.createElement(isCurrent ? 'span' : 'button');
    if (!isCurrent) { item.type = 'button'; item.dataset.trailKey = key; }
    item.className = `trail-item${isCurrent ? ' is-current' : ''}`;
    const [kind, id] = key.split(':');
    if (kind === 't') item.classList.add(state.learned.has(id) ? 'is-known' : 'is-todo');
    item.textContent = labelForKey(key);
    item.title = labelForKey(key);
    els.trail.append(item);
  });
  els.back.disabled = state.history.length === 0;
}

/* ---------- lesson rendering ---------- */
function renderLesson(topic) {
  const category = categoryFor(topic);
  els.categoryContent.hidden = true;
  els.lessonContent.hidden = false;
  els.lessonCategory.textContent = category.label;
  els.lessonCategory.dataset.categoryId = category.id;
  setCategoryColor(els.lessonCategory, category);
  const stage = stageFor(topic);
  els.lessonStep.hidden = !stage;
  if (stage) {
    els.lessonStep.textContent = t('Step {n} of {total}', { n: topic.step, total: state.path.length });
    els.lessonStep.dataset.stageId = stage.id;
    els.lessonStep.title = t('Stage {n}: {label}. Open its reading list', { n: stage.number, label: stage.label });
  }
  const terms = inlineTermIds(topic);
  const minutes = Math.max(1, Math.round(topic.words / 210));
  els.lessonMeta.textContent = `${tn(terms.length, '{n} linked term', '{n} linked terms')} · ${t('{n} min read', { n: minutes })}`;
  els.lessonTitle.textContent = topic.title;
  // In a translated interface, a lesson not translated yet is shown in English and says so.
  els.lessonLangNote.hidden = topic.lang === language();
  // Mark the lesson text with its language, so a screen reader pronounces it right.
  [els.lessonTitle, els.lessonSummary, els.lessonBody].forEach(element => { element.lang = LANGUAGES[topic.lang]?.locale ?? topic.lang; });
  els.lessonSummary.replaceChildren();
  renderInline(topic.summary, els.lessonSummary);

  els.lessonBody.replaceChildren();
  // `data-read` names each block the way narration.js does, so the paragraph being read
  // aloud can be found and marked.
  topic.sections.forEach((section, index) => {
    const block = document.createElement('section');
    block.className = 'lesson-section';
    if (section.heading) {
      const heading = document.createElement('h3');
      heading.dataset.read = `s${index}`;
      const number = document.createElement('small');
      number.textContent = String(index + 1).padStart(2, '0');
      heading.append(number, document.createTextNode(section.heading));
      block.append(heading);
    }
    section.paragraphs.forEach((text, position) => { paragraph(text, block).dataset.read = `s${index}-${position}`; });
    els.lessonBody.append(block);
  });
  if (topic.example) {
    const figure = document.createElement('figure');
    figure.className = 'example';
    const head = document.createElement('figcaption');
    head.className = 'example-head';
    head.dataset.read = 'example';
    const title = document.createElement('span');
    title.textContent = topic.example.title;
    const language = document.createElement('small');
    language.textContent = topic.example.language;
    head.append(title, language);
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = topic.example.code;
    pre.append(code);
    figure.append(head, pre);
    if (topic.example.note) paragraph(topic.example.note, figure, 'example-note').dataset.read = 'example-note';
    els.lessonBody.append(figure);
  }
  if (topic.pitfalls.length) {
    const box = document.createElement('aside');
    box.className = 'pitfalls';
    const heading = document.createElement('h3');
    heading.dataset.read = 'pitfalls';
    // Part of the lesson, so in the lesson's language, as the narration says it.
    heading.textContent = (PHRASES[topic.lang] ?? PHRASES.en).pitfallsLabel;
    const list = document.createElement('ul');
    topic.pitfalls.forEach((text, index) => {
      const item = document.createElement('li');
      item.dataset.read = `pitfall-${index}`;
      renderInline(text, item);
      list.append(item);
    });
    box.append(heading, list);
    els.lessonBody.append(box);
  }
  if (!topic.sections.length && !topic.example && !topic.pitfalls.length) paragraph(t('This topic has no lesson text yet.'), els.lessonBody);
  if (speech) {
    // Every part after the introduction can be played on its own from its heading.
    narrationFor(topic).parts.forEach((part, index) => {
      const anchor = index && els.lessonBody.querySelector(`[data-read="${part.anchor}"]`);
      if (!anchor) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'section-listen';
      button.dataset.listenPart = String(index);
      button.setAttribute('aria-label', t('Listen from “{label}”', { label: part.label }));
      button.title = t('Listen from here');
      button.append(icon('play'));
      anchor.append(button);
    });
  }
  renderPathNav(topic);

  els.lessonTerms.replaceChildren();
  if (!terms.length) {
    const empty = document.createElement('span');
    empty.className = 'side-empty';
    empty.textContent = t('No linked terms in this lesson.');
    els.lessonTerms.append(empty);
  }
  terms.forEach(id => {
    const term = state.byId.get(id);
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'term-chip';
    markLearnState(chip, id);
    chip.dataset.topicId = id;
    setCategoryColor(chip, categoryFor(term));
    chip.textContent = term.title;
    chip.title = state.learned.has(id)
      ? t('{label}: {title} (learned)', { label: categoryFor(term).label, title: term.title })
      : `${categoryFor(term).label}: ${term.title}`;
    els.lessonTerms.append(chip);
  });

  els.relatedTopics.replaceChildren();
  const related = topic.related.map(id => state.byId.get(id)).filter(Boolean);
  if (!related.length) {
    const empty = document.createElement('span');
    empty.className = 'side-empty';
    empty.textContent = t('You are at the edge of this path.');
    els.relatedTopics.append(empty);
  }
  related.forEach(item => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'related-topic';
    markLearnState(chip, item.id);
    chip.dataset.topicId = item.id;
    setCategoryColor(chip, categoryFor(item));
    chip.textContent = item.title;
    els.relatedTopics.append(chip);
  });

  els.topicSources.replaceChildren();
  els.sourcesBlock.hidden = !topic.sources.length;
  topic.sources.forEach(source => {
    const link = document.createElement('a');
    link.className = 'topic-source';
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = source.title;
    els.topicSources.append(link);
  });
  updateLessonButtons(topic);
  paintListening();
  document.title = isRoot(topic) ? t('Ethereum RPC — knowledge map') : t('{title} · Ethereum RPC map', { title: topic.title });
}

/** Previous and next on the learning path, at the foot of a lesson. */
function renderPathNav(topic) {
  els.pathNav.replaceChildren();
  const ends = { previous: t('Start of the path'), next: t('End of the path') };
  [['previous', pathNeighbour(topic, -1)], ['next', pathNeighbour(topic, 1)]].forEach(([side, item]) => {
    if (!item) {
      const end = document.createElement('span');
      end.className = `path-step is-${side} is-end`;
      end.textContent = topic.step ? ends[side] : '';
      els.pathNav.append(end);
      return;
    }
    const caption = side === 'next' ? t('Next on the path · {n} →', { n: item.step }) : t('← {n} · Previous', { n: item.step });
    els.pathNav.append(pathStepButton(item, caption, side));
  });
}

function pathStepButton(topic, caption, side) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `path-step is-${side}`;
  button.dataset.topicId = topic.id;
  markLearnState(button, topic.id);
  setCategoryColor(button, categoryFor(topic));
  const small = document.createElement('small');
  small.textContent = caption;
  const title = document.createElement('strong');
  title.textContent = topic.title;
  button.append(small, title);
  return button;
}

function lockFor(topicId) {
  const entry = state.quizLocks[topicId];
  if (!entry) return { fails: 0, remaining: 0 };
  const remaining = Math.max(0, (entry.until ?? 0) - Date.now());
  return { fails: entry.fails ?? 0, remaining };
}

function updateLessonButtons(topic) {
  const saved = state.bookmarks.has(topic.id);
  els.bookmark.textContent = saved ? '★' : '☆';
  els.bookmark.classList.toggle('is-saved', saved);
  els.bookmark.setAttribute('aria-label', saved ? t('Remove from saved topics') : t('Save this topic'));
  const learned = state.learned.has(topic.id);
  const { remaining } = lockFor(topic.id);
  els.learned.classList.toggle('is-learned', learned);
  els.learnedReset.hidden = !learned;
  const label = document.createElement('span');
  label.setAttribute('aria-hidden', 'true');
  label.textContent = learned ? '✓' : '◆';
  const text = learned
    ? t('Learned')
    : remaining > 0
      ? t('Checkpoint locked · {n}s', { n: Math.ceil(remaining / 1000) })
      : t('Take the checkpoint');
  els.learned.replaceChildren(label, document.createTextNode(` ${text}`));
  els.learned.disabled = learned || remaining > 0;
  els.learned.title = learned ? t('This topic is marked as learned') : t('Answer the checkpoint questions to mark this topic as learned');
  // Keep the countdown live so the button re-enables itself when the lock expires.
  window.clearInterval(updateLessonButtons.timer);
  if (remaining > 0) {
    updateLessonButtons.timer = window.setInterval(() => {
      if (state.selected?.id !== topic.id) { window.clearInterval(updateLessonButtons.timer); return; }
      updateLessonButtons(topic);
    }, 1000);
  }
}

/** The topic cards on a category or stage page, numbered by their place on the path. */
function renderTopicCards(items) {
  els.categoryTopics.replaceChildren();
  items.forEach(topic => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'category-topic';
    markLearnState(card, topic.id);
    card.dataset.topicId = topic.id;
    setCategoryColor(card, categoryFor(topic));
    if (state.nextUpId === topic.id) card.classList.add('is-next');
    const title = document.createElement('strong');
    const step = document.createElement('small');
    step.className = 'card-step';
    step.textContent = String(topic.step);
    const name = document.createElement('span');
    name.className = 'card-title';
    name.textContent = topic.title;
    const badge = document.createElement('span');
    badge.className = 'card-badge';
    badge.textContent = state.learned.has(topic.id) ? '✓' : '×';
    title.append(step, name, badge);
    const summary = document.createElement('span');
    renderInline(topic.summary, summary);
    card.append(title, summary);
    els.categoryTopics.append(card);
  });
}

function clearCategoryColor(element) {
  ['--node-color', '--category-color', '--category-tint'].forEach(name => element.style.removeProperty(name));
}

function renderCategoryLesson(category) {
  els.lessonContent.hidden = true;
  els.categoryContent.hidden = false;
  els.categoryPill.textContent = t('Category');
  els.categoryPill.classList.remove('is-stage');
  setCategoryColor(els.categoryPill, category);
  const items = sortTopics(state.topics.filter(topic => topic.category === category.id));
  const learnedCount = items.filter(topic => state.learned.has(topic.id)).length;
  els.categoryMeta.textContent = `${tn(items.length, '{n} topic', '{n} topics')} · ${t('{n} learned', { n: learnedCount })}`;
  els.categoryTitle.textContent = category.label;
  els.categoryBlurb.textContent = category.blurb || t('Every topic in the {label} category.', { label: category.label });
  els.groupActions.hidden = true;
  els.stageNav.hidden = true;
  renderTopicCards(items);
  document.title = t('{title} · Ethereum RPC map', { title: category.label });
}

function renderStageLesson(stage) {
  els.lessonContent.hidden = true;
  els.categoryContent.hidden = false;
  els.categoryPill.textContent = t('Stage {n} of {total}', { n: stage.number, total: state.stages.length });
  els.categoryPill.classList.add('is-stage');
  clearCategoryColor(els.categoryPill);
  const items = stage.topicIds.map(id => state.byId.get(id));
  const learnedCount = items.filter(topic => state.learned.has(topic.id)).length;
  const words = items.reduce((total, topic) => total + topic.words, 0);
  els.categoryMeta.textContent = [
    tn(items.length, '{n} topic', '{n} topics'),
    t('{n} learned', { n: learnedCount }),
    t('{time} to listen', { time: formatDuration(listeningMinutes(words, state.listen.rate)) })
  ].join(' · ');
  els.categoryTitle.textContent = stage.label;
  els.categoryBlurb.textContent = stage.blurb;
  els.groupActions.replaceChildren();
  els.groupActions.hidden = false;
  const first = items[0];
  const resume = items.find(topic => !state.learned.has(topic.id));
  if (resume && resume !== first) {
    els.groupActions.append(quizButton(t('Continue at {n}: {title}', { n: resume.step, title: resume.title }), 'quiz-primary', () => selectTopic(resume.id)));
  }
  if (speech) {
    const listen = quizButton(` ${t('Listen to this stage')}`, resume && resume !== first ? 'quiz-secondary' : 'quiz-primary', () => startListening(first));
    listen.prepend(icon('listen'));
    els.groupActions.append(listen);
  }
  renderTopicCards(items);
  els.stageNav.replaceChildren();
  els.stageNav.hidden = false;
  [['previous', state.stages[stage.number - 2]], ['next', state.stages[stage.number]]].forEach(([side, item]) => {
    if (!item) {
      const end = document.createElement('span');
      end.className = `path-step is-${side} is-end`;
      end.textContent = side === 'next' ? t('End of the path') : t('Start of the path');
      els.stageNav.append(end);
      return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `path-step is-${side}`;
    button.dataset.stageId = item.id;
    const small = document.createElement('small');
    small.textContent = side === 'next' ? t('Next stage · {n} →', { n: item.number }) : t('← {n} · Previous stage', { n: item.number });
    const title = document.createElement('strong');
    title.textContent = item.label;
    button.append(small, title);
    els.stageNav.append(button);
  });
  document.title = t('{title} · Ethereum RPC map', { title: t('Stage {n}: {label}', { n: stage.number, label: stage.label }) });
}

function updateProgress() {
  const total = state.topics.length;
  const count = [...state.learned].filter(id => state.byId.has(id)).length;
  els.progressCount.textContent = `${count} / ${total}`;
  els.progressBar.style.width = total ? `${Math.min(100, count / total * 100)}%` : '0%';
}

function renderBookmarks() {
  els.savedTopics.replaceChildren();
  const saved = [...state.bookmarks].map(id => state.byId.get(id)).filter(Boolean);
  els.savedCount.textContent = String(saved.length);
  els.savedButton.classList.toggle('has-items', saved.length > 0);
  if (!saved.length) {
    const empty = document.createElement('span');
    empty.className = 'saved-empty';
    empty.textContent = t('Nothing saved yet. Use ☆ on a lesson to keep it here.');
    els.savedTopics.append(empty);
    return;
  }
  saved.forEach(topic => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'saved-topic';
    markLearnState(button, topic.id);
    button.dataset.topicId = topic.id;
    button.textContent = topic.title;
    els.savedTopics.append(button);
  });
}

function refreshLearnState() {
  writeSet(STORAGE_KEYS.learned, state.learned);
  state.nextUpId = nextOnPath()?.id ?? null;
  if (state.selectedStage) renderStageLesson(state.selectedStage);
  else if (state.selectedCategory) renderCategoryLesson(state.selectedCategory);
  else if (state.selected) renderLesson(state.selected);
  renderBookmarks();
  updateProgress();
  renderLegend();
  renderTrail();
  renderGraph();
}

/* ---------- checkpoint quiz ---------- */
function closeQuiz({ restoreFocus = true } = {}) {
  if (state.quiz?.dwellTimer) window.clearTimeout(state.quiz.dwellTimer);
  if (state.quiz?.tick) window.clearInterval(state.quiz.tick);
  state.quiz = null;
  els.quizOverlay.hidden = true;
  document.body.classList.remove('quiz-open');
  if (restoreFocus && !els.learned.disabled) els.learned.focus();
}

function openQuiz(topic) {
  const { remaining } = lockFor(topic.id);
  if (remaining > 0) { toast(t('Checkpoint locked for {n}s', { n: Math.ceil(remaining / 1000) })); return; }
  const attemptSeed = `${Date.now()}-${Math.random()}`;
  const questions = buildAttempt(topic, attemptSeed);
  if (questions.length < MIN_QUESTIONS) { toast(t('This topic does not have enough material for a checkpoint yet')); return; }
  if (state.listen.playing) pauseListening();
  state.quiz = { topic, questions, index: 0, correct: 0, stage: 'intro', dwellTimer: 0, tick: 0, locked: true };
  els.quizOverlay.hidden = false;
  document.body.classList.add('quiz-open');
  renderQuiz();
  els.quizClose.focus();
}

function quizButton(label, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function renderQuiz() {
  const quiz = state.quiz;
  if (!quiz) return;
  els.quizHeading.textContent = quiz.topic.title;
  els.quizBody.replaceChildren();
  els.quizFooter.replaceChildren();
  els.quizProgress.replaceChildren();

  if (quiz.stage === 'intro') {
    els.quizStep.textContent = t('Checkpoint');
    const intro = document.createElement('div');
    intro.className = 'quiz-intro';
    const lead = document.createElement('p');
    lead.textContent = t('{n} questions, drawn from this lesson. Every answer has to be right to mark the topic as learned.', { n: quiz.questions.length });
    const rules = document.createElement('ul');
    [
      t('You will not be told which answers were wrong, only how many you got right.'),
      t('Each question unlocks after a short reading pause, so guessing quickly does not work.'),
      t('A failed attempt locks the checkpoint briefly, and the questions are reshuffled next time.')
    ].forEach(text => {
      const item = document.createElement('li');
      item.textContent = text;
      rules.append(item);
    });
    intro.append(lead, rules);
    els.quizBody.append(intro);
    els.quizFooter.append(
      quizButton(t('Read the lesson again'), 'quiz-secondary', () => closeQuiz()),
      quizButton(t('Start'), 'quiz-primary', () => { quiz.stage = 'question'; quiz.index = 0; quiz.correct = 0; renderQuiz(); })
    );
    return;
  }

  if (quiz.stage === 'question') {
    const question = quiz.questions[quiz.index];
    els.quizStep.textContent = t('Question {n} of {total}', { n: quiz.index + 1, total: quiz.questions.length });
    quiz.questions.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = `quiz-dot${index < quiz.index ? ' is-done' : index === quiz.index ? ' is-current' : ''}`;
      els.quizProgress.append(dot);
    });
    const prompt = document.createElement('p');
    prompt.className = 'quiz-prompt';
    question.prompt.split('\n\n').forEach((part, index) => {
      if (index > 0) {
        const quote = document.createElement('span');
        quote.className = 'quiz-quote';
        quote.textContent = part;
        prompt.append(quote);
      } else {
        prompt.append(document.createTextNode(part));
      }
    });
    const options = document.createElement('div');
    options.className = 'quiz-options';
    const buttons = question.options.map((text, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option';
      button.disabled = true;
      const key = document.createElement('kbd');
      key.textContent = String(index + 1);
      const label = document.createElement('span');
      label.textContent = text;
      button.append(key, label);
      // The correct index never reaches the DOM; it stays in this closure.
      button.addEventListener('click', () => answerQuestion(index));
      options.append(button);
      return button;
    });
    const dwell = document.createElement('div');
    dwell.className = 'quiz-dwell';
    const fill = document.createElement('span');
    dwell.append(fill);
    const hint = document.createElement('p');
    hint.className = 'quiz-hint';
    hint.textContent = t('Reading…');
    els.quizBody.append(prompt, options, dwell, hint);
    quiz.locked = true;
    requestAnimationFrame(() => { fill.style.transitionDuration = `${QUIZ_DWELL_MS}ms`; fill.style.width = '100%'; });
    quiz.dwellTimer = window.setTimeout(() => {
      quiz.locked = false;
      buttons.forEach(button => { button.disabled = false; });
      dwell.classList.add('is-ready');
      hint.textContent = t('Pick one answer. Keys 1 to 4 work too.');
    }, QUIZ_DWELL_MS);
    return;
  }

  if (quiz.stage === 'passed') {
    els.quizStep.textContent = t('Passed');
    const result = document.createElement('div');
    result.className = 'quiz-result is-pass';
    const badge = document.createElement('span');
    badge.className = 'quiz-badge';
    badge.textContent = '✓';
    const text = document.createElement('p');
    text.textContent = t('All {n} correct. {title} is marked as learned, and its links turn green across the map.', { n: quiz.questions.length, title: quiz.topic.title });
    result.append(badge, text);
    els.quizBody.append(result);
    const next = nextUnlearned(quiz.topic);
    els.quizFooter.append(quizButton(t('Close'), 'quiz-secondary', () => closeQuiz()));
    if (next) els.quizFooter.append(quizButton(t('Next: {n}. {title}', { n: next.step, title: next.title }), 'quiz-primary', () => { const id = next.id; closeQuiz({ restoreFocus: false }); selectTopic(id); }));
    return;
  }

  if (quiz.stage === 'failed') {
    const { remaining } = lockFor(quiz.topic.id);
    els.quizStep.textContent = t('Not yet');
    const result = document.createElement('div');
    result.className = 'quiz-result is-fail';
    const badge = document.createElement('span');
    badge.className = 'quiz-badge';
    badge.textContent = '×';
    const text = document.createElement('p');
    text.textContent = t('{correct} of {total} correct. Which ones stay hidden on purpose: read the lesson again and look for the parts you skimmed.', { correct: quiz.correct, total: quiz.questions.length });
    result.append(badge, text);
    const countdown = document.createElement('p');
    countdown.className = 'quiz-countdown';
    els.quizBody.append(result, countdown);
    const retry = quizButton(t('Try again'), 'quiz-primary', () => {
      const topic = quiz.topic;
      closeQuiz({ restoreFocus: false });
      openQuiz(topic);
    });
    els.quizFooter.append(quizButton(t('Back to the lesson'), 'quiz-secondary', () => closeQuiz()), retry);
    const paint = () => {
      const left = lockFor(quiz.topic.id).remaining;
      retry.disabled = left > 0;
      countdown.textContent = left > 0 ? t('You can retry in {n}s.', { n: Math.ceil(left / 1000) }) : t('You can retry now.');
      if (state.selected?.id === quiz.topic.id) updateLessonButtons(quiz.topic);
      if (left <= 0 && quiz.tick) { window.clearInterval(quiz.tick); quiz.tick = 0; }
    };
    paint();
    if (remaining > 0) quiz.tick = window.setInterval(paint, 500);
  }
}

function answerQuestion(index) {
  const quiz = state.quiz;
  if (!quiz || quiz.locked || quiz.stage !== 'question') return;
  window.clearTimeout(quiz.dwellTimer);
  quiz.locked = true;
  if (index === quiz.questions[quiz.index].answer) quiz.correct += 1;
  quiz.index += 1;
  if (quiz.index < quiz.questions.length) { renderQuiz(); return; }
  if (quiz.correct === quiz.questions.length) {
    quiz.stage = 'passed';
    state.learned.add(quiz.topic.id);
    delete state.quizLocks[quiz.topic.id];
    writeItem(STORAGE_KEYS.quiz, JSON.stringify(state.quizLocks));
    refreshLearnState();
  } else {
    quiz.stage = 'failed';
    const fails = (state.quizLocks[quiz.topic.id]?.fails ?? 0) + 1;
    const wait = Math.min(QUIZ_LOCK_MAX_MS, QUIZ_LOCK_BASE_MS * 2 ** (fails - 1));
    state.quizLocks[quiz.topic.id] = { fails, until: Date.now() + wait };
    writeItem(STORAGE_KEYS.quiz, JSON.stringify(state.quizLocks));
    if (state.selected?.id === quiz.topic.id) updateLessonButtons(quiz.topic);
  }
  renderQuiz();
}

/** The first topic after this one on the path that is not learned, wrapping to the start. */
function nextUnlearned(topic) {
  const after = state.path.slice(topic.step);
  const before = state.path.slice(0, Math.max(0, topic.step - 1));
  return [...after, ...before].find(candidate => !state.learned.has(candidate.id)) ?? null;
}

/* ---------- navigation ---------- */
function pushHistory() {
  const key = currentKey();
  if (key && state.history[state.history.length - 1] !== key) state.history.push(key);
  if (state.history.length > 60) state.history.shift();
}

/* Each topic opened after start-up is its own browser history entry, so the browser's back
   button, and the back gesture on a phone, step back through what was read. */
function updateHash() {
  const key = currentKey();
  if (!key) return;
  const [kind, id] = key.split(':');
  const hash = `#${kind}/${id}`;
  if (location.hash === hash) return;
  if (state.booted) history.pushState(null, '', hash); else history.replaceState(null, '', hash);
}

function flashLesson() {
  const panel = viewingTopic() ? els.lessonContent : els.categoryContent;
  panel.classList.remove('is-switching');
  void panel.offsetWidth;
  panel.classList.add('is-switching');
}

function afterNavigate() {
  renderGraph();
  flashLesson();
  const duration = focusSelection();
  // Hold the arrival pop until the camera is nearly there, so it reads as a landing.
  const arriving = els.graphNodes.querySelector('.topic-node.is-arriving');
  if (arriving) arriving.style.setProperty('--arrive-delay', `${Math.max(0, duration - 260)}ms`);
  renderLegend();
  renderTrail();
  updateHash();
  paintMobileTabs();
  els.lessonPane.scrollTo({ top: 0, behavior: 'auto' });
}

function selectTopic(id, { push = true } = {}) {
  const topic = state.byId.get(id);
  if (!topic) return;
  const key = `t:${topic.id}`;
  if (currentKey() === key) { focusSelection(); return; }
  if (state.quiz) closeQuiz({ restoreFocus: false });
  state.origin = state.selected && viewingTopic() ? state.selected.id : state.origin;
  if (push) pushHistory();
  state.selected = topic;
  state.selectedCategory = null;
  state.selectedStage = null;
  renderLesson(topic);
  afterNavigate();
}

function selectCategory(id, { push = true } = {}) {
  const category = state.categoryById.get(id);
  if (!category) return;
  const key = `c:${category.id}`;
  if (currentKey() === key) { focusSelection(); return; }
  if (state.quiz) closeQuiz({ restoreFocus: false });
  state.origin = state.selected && viewingTopic() ? state.selected.id : null;
  if (push) pushHistory();
  state.selectedCategory = category;
  state.selectedStage = null;
  renderCategoryLesson(category);
  afterNavigate();
}

function selectStage(id, { push = true } = {}) {
  const stage = state.stageById.get(id);
  if (!stage) return;
  const key = `s:${stage.id}`;
  if (currentKey() === key) { focusSelection(); return; }
  if (state.quiz) closeQuiz({ restoreFocus: false });
  state.origin = state.selected && viewingTopic() ? state.selected.id : null;
  if (push) pushHistory();
  state.selectedStage = stage;
  state.selectedCategory = null;
  renderStageLesson(stage);
  afterNavigate();
}

function openKey(key, options) {
  const [kind, id] = String(key).split(':');
  if (kind === 's') selectStage(id, options);
  else if (kind === 'c') selectCategory(id, options);
  else selectTopic(id, options);
}

/** Steps along the learning path from the open topic, or from the next unlearned one. */
function stepPath(delta) {
  const from = viewingTopic() ? state.selected : null;
  const target = from ? pathNeighbour(from, delta) : nextOnPath() ?? state.path[0];
  if (target) selectTopic(target.id);
}

function goHome() {
  state.history = [];
  state.origin = null;
  if (!state.root) return;
  if (currentKey() === `t:${state.root.id}`) { fitView(); renderTrail(); return; }
  selectTopic(state.root.id, { push: false });
}

function selectFromHash() {
  const match = /^#(t|c|s)\/([a-z0-9-]+)$/i.exec(location.hash);
  if (!match) return false;
  const [, kind, id] = match;
  if (kind === 's' && state.stageById.has(id)) { selectStage(id); return true; }
  if (kind === 'c' && state.categoryById.has(id)) { selectCategory(id); return true; }
  if (kind === 't' && state.byId.has(id)) { selectTopic(id); return true; }
  return false;
}

/* ---------- search ---------- */
function searchTopics(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const score = topic => {
    const title = topic.title.toLowerCase();
    if (title === needle) return 0;
    if (title.startsWith(needle)) return 1;
    if (topic.aliases.some(alias => alias.toLowerCase() === needle)) return 1.5;
    if (title.includes(needle)) return 2;
    if (topic.aliases.some(alias => alias.toLowerCase().includes(needle))) return 3;
    if (topic.summary.toLowerCase().includes(needle)) return 4;
    if (topic.searchText.includes(needle)) return 5;
    return null;
  };
  return state.topics.map(topic => ({ topic, score: score(topic) })).filter(item => item.score !== null)
    .sort((a, b) => a.score - b.score || a.topic.title.localeCompare(b.topic.title)).slice(0, 9).map(item => item.topic);
}

function showSearchResults() {
  const results = searchTopics(state.query);
  els.searchResults.replaceChildren();
  const open = state.query.trim().length > 0;
  els.searchResults.hidden = !open;
  els.search.setAttribute('aria-expanded', String(open));
  if (!open) return;
  if (!results.length) {
    const empty = document.createElement('div');
    empty.className = 'search-result is-empty';
    empty.textContent = t('No matching topics');
    els.searchResults.append(empty);
    return;
  }
  state.activeResult = Math.min(state.activeResult, results.length - 1);
  results.forEach((topic, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `search-result${index === state.activeResult ? ' is-active' : ''}`;
    markLearnState(button, topic.id);
    button.dataset.topicId = topic.id;
    button.setAttribute('role', 'option');
    const title = document.createElement('strong');
    title.textContent = topic.title;
    const summary = document.createElement('span');
    summary.textContent = plainText(topic.summary);
    const category = document.createElement('small');
    category.textContent = topic.step ? `${topic.step} · ${categoryFor(topic).label}` : categoryFor(topic).label;
    button.append(title, summary, category);
    els.searchResults.append(button);
  });
}

function clearSearch({ blur = false } = {}) {
  state.query = '';
  state.activeResult = 0;
  els.search.value = '';
  showSearchResults();
  if (blur) els.search.blur();
}

/* ---------- misc ui ---------- */
function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('is-visible');
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => els.toast.classList.remove('is-visible'), 2400);
}

function setSavedPopover(open) {
  els.savedPopover.hidden = !open;
  els.savedButton.setAttribute('aria-expanded', String(open));
}

/** Width of the lesson column, in pixels, clamped so neither side collapses. */
function setLessonWidth(pixels) {
  const total = els.workspace.clientWidth || window.innerWidth;
  const clamped = Math.min(Math.max(pixels, 296), total * 0.62);
  const fraction = clamped / total;
  document.documentElement.style.setProperty('--lesson-width', `${(fraction * 100).toFixed(2)}%`);
  writeItem(STORAGE_KEYS.split, String(fraction));
}

/* ---------- phone layout ---------- */
// At 1000 pixels and below the map and the lesson each fill the screen, and the tab bar at
// the bottom switches between them. Both stay laid out, one of them only hidden, so the map
// keeps its size and the camera stays on the open topic while the lesson is showing.
const phoneQuery = window.matchMedia?.('(max-width: 1000px)') ?? null;
const onPhone = () => Boolean(phoneQuery?.matches);

function setMobileView(view) {
  document.documentElement.dataset.mobileView = view;
  $$('[data-mobile-view]', els.mobileTabs).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mobileView === view)));
  const phone = onPhone();
  els.mapPane.inert = phone && view !== 'map';
  els.lessonPane.inert = phone && view !== 'lesson';
}

function paintMobileTabs() {
  els.tabLessonTitle.textContent = state.selectedStage?.label ?? state.selectedCategory?.label ?? state.selected?.title ?? '';
}

/** Zooms the map in on a point of the pane, centring it: the phone's answer to tiny tiles.
    From far out one tap goes straight to a zoom where labels can be read and tiles tapped. */
function zoomInOn(point) {
  const width = Math.max(1, els.graphWrap.clientWidth);
  const height = Math.max(1, els.graphWrap.clientHeight);
  const world = { x: (point.x - state.pan.x) / state.zoom, y: (point.y - state.pan.y) / state.zoom };
  const zoom = state.zoom < FAR_ZOOM ? 1 : Math.min(TOPIC_ZOOM * 1.4, state.zoom * 1.6);
  state.framing = 'free';
  setViewport({ x: width / 2 - world.x * zoom, y: height / 2 - world.y * zoom }, zoom);
}

/* ---------- map and roadmap views ---------- */
function paintViewControls() {
  const roadmap = state.view === 'roadmap';
  els.viewMap.setAttribute('aria-pressed', String(!roadmap));
  els.viewRoadmap.setAttribute('aria-pressed', String(roadmap));
  els.graphWrap.classList.toggle('is-roadmap', roadmap);
  const dot = els.hint.querySelector('.hint-dot');
  els.hint.replaceChildren(...(dot ? [dot] : []), document.createTextNode(` ${roadmap
    ? t('Read left to right, stage by stage · click a stage for its reading list')
    : t('Click a term to open it · drag to pan · scroll to zoom')}`));
  const next = state.nextUpId ? state.byId.get(state.nextUpId) : null;
  els.nextUp.hidden = !roadmap;
  els.nextUp.disabled = !next;
  els.nextUp.textContent = next ? t('Next up · {n}', { n: next.step }) : t('Path complete');
  els.nextUp.title = next
    ? t('Open {n}. {title}, the first topic on the path you have not learned', { n: next.step, title: next.title })
    : t('Every topic on the path is learned');
}

function setView(view) {
  if (view === state.view || !['map', 'roadmap'].includes(view)) return;
  state.view = view;
  writeItem(STORAGE_KEYS.view, view);
  renderGraph();
  fitView();
}

/* ---------- listening ---------- */
// The map read aloud by the browser's own speech engine: it needs no audio files and the
// page makes no network calls, though the browser's online voices send the text to their
// vendor (the device voices work offline). A lesson is spoken one chunk at a time
// (see narration.js). Pausing cancels the chunk and playing restarts it, because the
// engines' own pause and resume are unreliable and some never come back from a long
// pause. The position is saved on every chunk, so a long listen picks up where it stopped.
const speech = typeof window.speechSynthesis === 'object' && typeof window.SpeechSynthesisUtterance === 'function' ? window.speechSynthesis : null;
const LISTEN_MODES = ['section', 'topic', 'path'];
const listenModeText = mode => ({
  section: t('Stops at the end of each section'),
  topic: t('Stops at the end of each topic'),
  path: t('Keeps going, topic after topic, to the end of the path')
})[mode];
const LISTEN_RATES = [0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];
const narrations = new Map();

// Each lesson is narrated in its own language, which for a lesson not yet translated is
// English even when the interface is not; its stage is then announced in English too.
function narrationFor(topic) {
  if (!narrations.has(topic.id)) {
    const stage = stageFor(topic);
    const spoken = stage?.original && topic.lang !== language() ? { ...stage, ...stage.original } : stage;
    narrations.set(topic.id, narrate(topic, { stage: spoken, lang: topic.lang }));
  }
  return narrations.get(topic.id);
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const ICONS = {
  play: 'M8 5.5v13l10.5-6.5z',
  pause: 'M7 5h3.5v14H7zm6.5 0H17v14h-3.5z',
  previous: 'M6 5h2.2v14H6zm3.2 7L19 5.5v13z',
  next: 'M15.8 5H18v14h-2.2zM5 5.5 14.8 12 5 18.5z',
  back: 'M11.5 6.5v11L3.5 12zm8.5 0v11L12 12z',
  forward: 'M4 6.5 12 12l-8 5.5zm8.5 0 8 5.5-8 5.5z',
  listen: 'M12 4a8 8 0 0 0-8 8v6a2 2 0 0 0 2 2h2.5v-7H6v-1a6 6 0 0 1 12 0v1h-2.5v7H18a2 2 0 0 0 2-2v-6a8 8 0 0 0-8-8z'
};
function icon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', ICONS[name]);
  svg.append(path);
  return svg;
}

function formatDuration(minutes) {
  if (minutes < 1) return t('under a minute');
  if (minutes < 59.5) return t('{n} min', { n: Math.round(minutes) });
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes - hours * 60);
  return rest ? t('{h} h {m} min', { h: hours, m: rest }) : t('{h} h', { h: hours });
}

/* Neural voices (Edge's "Natural" ones, Chrome's Google ones) sound far better than the
   older system voices, so they are offered first, led by Edge's adult narrator voices
   rather than whichever sorts first (in English that would be Ana, a child's voice). */
const NARRATOR_VOICES = /\b(Andrew|Ava|Emma|Brian|Aria|Jenny|Guy|Sonia|Ryan|Libby|Marek|Zofia)\b/;
function rankVoice(voice) {
  let score = 0;
  if (/natural|neural|online/i.test(voice.name)) score += 6;
  if (NARRATOR_VOICES.test(voice.name)) score += 3;
  if (/google/i.test(voice.name)) score += 3;
  if (/^(en-(us|gb)|pl-pl)$/i.test(voice.lang)) score += 2;
  if (voice.default) score += 1;
  return score;
}
// Online voices all go through one service and fail together without a connection, so
// after one fails only voices on this device are used for the rest of the visit. The saved
// choice is kept for next time.
let onlineVoicesDown = false;
/** The language being listened to: the cued lesson's, which may differ from the interface's. */
const listenLang = () => state.listen.topic?.lang ?? language();
function voiceChoices(lang) {
  const voices = speech?.getVoices() ?? [];
  const matching = voices.filter(voice => new RegExp(`^${lang}\\b`, 'i').test(voice.lang));
  return (matching.length ? matching : voices).slice().sort((a, b) => rankVoice(b) - rankVoice(a) || a.name.localeCompare(b.name));
}
const usableVoices = lang => voiceChoices(lang).filter(voice => !onlineVoicesDown || voice.localService);
function currentVoice(lang = listenLang()) {
  const choices = usableVoices(lang);
  return choices.find(voice => voice.name === state.listen.voices[lang]) ?? choices[0] ?? null;
}
function renderVoices() {
  const lang = listenLang();
  renderVoices.lang = lang;
  const choices = usableVoices(lang);
  const current = currentVoice(lang);
  els.playerVoice.replaceChildren();
  els.playerVoice.disabled = !choices.length;
  if (!choices.length) { els.playerVoice.append(new Option(t('System voice'), '')); return; }
  choices.forEach(voice => {
    const name = voice.name.replace(/^(Microsoft|Google)\s+/, '').replace(/\s+-\s+.*$/, '');
    const option = new Option(`${name} · ${voice.lang}`, voice.name, false, voice === current);
    els.playerVoice.append(option);
  });
}

function saveListenSettings() {
  const { mode, rate, voices } = state.listen;
  writeItem(STORAGE_KEYS.listenSettings, JSON.stringify({ mode, rate, voices }));
}
function savePosition() {
  if (state.listen.topic) writeItem(STORAGE_KEYS.listen, JSON.stringify({ topic: state.listen.topic.id, index: state.listen.index }));
}

/** Puts a position in the player without speaking it. */
function cue(topic, index = 0) {
  state.listen.topic = topic;
  state.listen.index = Math.max(0, Math.min(index, narrationFor(topic).chunks.length - 1));
}

/** Cues a position. The lesson pane follows only if it was showing what is being read, so
    someone who has gone off to read something else is not pulled back. */
function moveListening(topic, index) {
  const listen = state.listen;
  const following = listen.topic && viewingTopic() && state.selected?.id === listen.topic.id && !state.quiz;
  cue(topic, index);
  if (following && state.selected.id !== topic.id) selectTopic(topic.id);
}

function startListening(topic, { part = 0 } = {}) {
  if (!speech || !topic) { toast(t('This browser cannot read aloud')); return; }
  cue(topic, narrationFor(topic).parts[part]?.first ?? 0);
  state.listen.open = true;
  playListening();
}

function playListening() {
  if (!speech) return;
  if (!state.listen.topic) {
    const topic = viewingTopic() && state.selected ? state.selected : nextOnPath() ?? state.path[0];
    if (!topic) return;
    cue(topic);
  }
  state.listen.playing = true;
  speakChunk();
}

function pauseListening() {
  state.listen.playing = false;
  state.listen.token += 1;
  window.clearInterval(speakChunk.keepAlive);
  speech?.cancel();
  savePosition();
  paintListening();
}

function toggleListening() {
  if (!speech) return;
  if (state.listen.playing) { pauseListening(); return; }
  state.listen.open = true;
  playListening();
}

function speakChunk() {
  const listen = state.listen;
  const chunk = narrationFor(listen.topic).chunks[listen.index];
  if (!chunk) { pauseListening(); return; }
  listen.token += 1;
  const token = listen.token;
  window.clearInterval(speakChunk.keepAlive);
  speech.cancel();
  const utterance = new SpeechSynthesisUtterance(chunk.text);
  const voice = currentVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || LANGUAGES[listenLang()]?.locale || 'en';
  utterance.rate = listen.rate;
  utterance.onend = () => { if (token === listen.token) advanceListening(); };
  utterance.onerror = event => {
    if (token !== listen.token || event.error === 'interrupted' || event.error === 'canceled') return;
    if (voice && !voice.localService && !onlineVoicesDown && ['synthesis-failed', 'synthesis-unavailable', 'network', 'voice-unavailable'].includes(event.error)) {
      onlineVoicesDown = true;
      if (currentVoice()) {
        renderVoices();
        toast(t('Online voices are unavailable, so a voice on this device is reading'));
        speakChunk();
        return;
      }
    }
    pauseListening();
    toast(event.error === 'not-allowed' ? t('The browser blocked speech. Press play to start it') : t('The speech engine stopped. Press play to carry on'));
  };
  // Held on state so the utterance, and with it its end event, is not garbage collected
  // mid-sentence, which some engines otherwise do.
  listen.utterance = utterance;
  // Some engines drop an utterance queued in the same task as cancel(), so speak a beat later.
  window.setTimeout(() => {
    if (token !== listen.token) return;
    speech.resume();
    speech.speak(utterance);
    // Chrome's Google voices stop dead about fifteen seconds into an utterance unless the
    // engine is nudged; the usual cure is a pause and resume every few seconds.
    if (voice && /google/i.test(voice.name)) {
      speakChunk.keepAlive = window.setInterval(() => {
        if (token !== listen.token) { window.clearInterval(speakChunk.keepAlive); return; }
        speech.pause();
        speech.resume();
      }, 10000);
    }
  }, 40);
  savePosition();
  paintListening({ scroll: true });
}

function advanceListening() {
  const listen = state.listen;
  window.clearInterval(speakChunk.keepAlive);
  const { chunks } = narrationFor(listen.topic);
  const current = chunks[listen.index];
  if (listen.index + 1 < chunks.length) {
    listen.index += 1;
    if (listen.mode === 'section' && chunks[listen.index].part !== current.part) { pauseListening(); return; }
    speakChunk();
    return;
  }
  const next = pathNeighbour(listen.topic, 1);
  if (!next) {
    cue(listen.topic, 0);
    pauseListening();
    toast(t('That was the last topic on the path'));
    return;
  }
  // Stopping at a boundary leaves the next topic cued, so play carries straight on.
  if (listen.mode !== 'path') { cue(next, 0); pauseListening(); return; }
  moveListening(next, 0);
  speakChunk();
}

function resumeOrPaint() {
  if (state.listen.playing) { speakChunk(); return; }
  savePosition();
  paintListening({ scroll: true });
}

/** Back or forward by one chunk, running over into the neighbouring topic at either end. */
function skipChunk(delta) {
  const listen = state.listen;
  if (!listen.topic) return;
  const { chunks } = narrationFor(listen.topic);
  const index = listen.index + delta;
  if (index >= 0 && index < chunks.length) listen.index = index;
  else {
    const neighbour = pathNeighbour(listen.topic, delta);
    if (!neighbour) return;
    moveListening(neighbour, delta < 0 ? narrationFor(neighbour).chunks.length - 1 : 0);
  }
  resumeOrPaint();
}

/** Previous or next topic. Back from partway into a topic restarts it, like a music player. */
function skipTopic(delta) {
  const listen = state.listen;
  if (!listen.topic) return;
  const target = delta < 0 && listen.index > 2 ? listen.topic : pathNeighbour(listen.topic, delta);
  if (!target) return;
  moveListening(target, 0);
  resumeOrPaint();
}

function closePlayer() {
  pauseListening();
  state.listen.open = false;
  paintListening();
}

/** Whether an element in the lesson is on screen, optionally in full. */
function isReadable(element, fully = false) {
  const rect = element.getBoundingClientRect();
  const scrolls = getComputedStyle(els.lessonPane).overflowY !== 'visible';
  const box = scrolls ? els.lessonPane.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
  // The checkpoint bar, or on small screens the player, covers the foot of the lesson.
  const bottom = box.bottom - 76;
  return fully ? rect.top >= box.top && rect.bottom <= bottom : rect.bottom > box.top && rect.top < bottom;
}

function paintListening({ scroll = false } = {}) {
  if (!speech) return;
  const listen = state.listen;
  const topic = listen.topic;
  const script = topic ? narrationFor(topic) : null;
  const chunk = script?.chunks[listen.index] ?? null;

  els.player.hidden = !listen.open;
  // The voice list follows the language of the lesson being read.
  if (renderVoices.lang !== listenLang()) renderVoices();
  els.playerPlay.replaceChildren(icon(listen.playing ? 'pause' : 'play'));
  els.playerPlay.setAttribute('aria-label', listen.playing ? t('Pause') : t('Play'));
  els.playerPlay.title = listen.playing ? t('Pause (L)') : t('Play (L)');
  els.listenToggle.classList.toggle('is-playing', listen.playing);
  els.listenToggle.setAttribute('aria-pressed', String(listen.open));
  els.listenToggle.title = topic
    ? (listen.playing ? t('Listening to {n}. {title}', { n: topic.step, title: topic.title }) : t('Listen from {n}. {title}', { n: topic.step, title: topic.title }))
    : t('Listen to the map');
  if (topic && chunk) {
    const part = script.parts[chunk.part];
    const words = text => text.split(/\s+/).length;
    const left = script.chunks.slice(listen.index).reduce((sum, item) => sum + words(item.text), 0);
    const later = state.path.slice(topic.step).reduce((sum, item) => sum + item.words, 0);
    els.playerTitle.textContent = `${topic.step}. ${topic.title}`;
    els.playerTitle.dataset.topicId = topic.id;
    els.playerTitle.title = t('Open this lesson');
    els.playerDetail.textContent = [
      part.label,
      t('{time} left in this topic', { time: formatDuration(listeningMinutes(left, listen.rate)) }),
      t('{time} to the end of the path', { time: formatDuration(listeningMinutes(left + later, listen.rate)) })
    ].join(' · ');
    els.playerFill.style.width = `${(listen.index / script.chunks.length) * 100}%`;
  } else {
    els.playerTitle.textContent = t('Nothing queued');
    delete els.playerTitle.dataset.topicId;
    els.playerDetail.textContent = t('Open a lesson and press Listen.');
    els.playerFill.style.width = '0%';
  }
  $$('[data-listen-mode]', els.playerModes).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.listenMode === listen.mode)));
  els.playerRate.value = String(listen.rate);

  // The lesson pane: its Listen button, the section buttons, and the block being read.
  const shown = viewingTopic() ? state.selected : null;
  const here = Boolean(shown && topic?.id === shown.id);
  const playingHere = here && listen.playing;
  if (shown) {
    els.listenButton.replaceChildren(icon(playingHere ? 'pause' : 'listen'),
      document.createTextNode(playingHere ? t('Pause') : here && listen.index > 0 ? t('Resume') : t('Listen')));
    els.listenButton.classList.toggle('is-playing', playingHere);
    els.listenButton.title = playingHere
      ? t('Pause the narration (L)')
      : t('Listen to this lesson · {time}', { time: formatDuration(listeningMinutes(shown.words, listen.rate)) });
  }
  $$('[data-listen-part]', els.lessonBody).forEach(button => {
    const active = playingHere && chunk?.part === Number(button.dataset.listenPart);
    button.classList.toggle('is-active', active);
    button.replaceChildren(icon(active ? 'pause' : 'play'));
    button.title = active ? t('Pause') : t('Listen from here');
  });
  const previous = els.lessonContent.querySelector('.is-reading');
  const target = here && listen.open && chunk ? els.lessonContent.querySelector(`[data-read="${chunk.block}"]`) : null;
  if (previous && previous !== target) previous.classList.remove('is-reading');
  if (!target) return;
  target.classList.add('is-reading');
  // Keep the block in view, but only while the reader is following along: once they have
  // scrolled away to read something else, leave the page where they put it.
  if (scroll && (!previous || isReadable(previous)) && !isReadable(target, true)) {
    target.scrollIntoView({ block: 'center', behavior: state.motion ? 'smooth' : 'auto' });
  }
}

function initListening() {
  if (!speech) {
    els.listenToggle.hidden = true;
    els.listenButton.hidden = true;
    return;
  }
  const settings = readObject(STORAGE_KEYS.listenSettings);
  if (LISTEN_MODES.includes(settings.mode)) state.listen.mode = settings.mode;
  if (LISTEN_RATES.includes(Number(settings.rate))) state.listen.rate = Number(settings.rate);
  // One saved voice per language; a single `voice` is from before Polish and was English.
  if (settings.voices && typeof settings.voices === 'object') {
    Object.entries(settings.voices).forEach(([lang, name]) => { if (LANGUAGES[lang] && typeof name === 'string') state.listen.voices[lang] = name; });
  } else if (typeof settings.voice === 'string') state.listen.voices.en = settings.voice;
  els.listenToggle.replaceChildren(icon('listen'));
  els.playerPrev.replaceChildren(icon('previous'));
  els.playerBack.replaceChildren(icon('back'));
  els.playerForward.replaceChildren(icon('forward'));
  els.playerNext.replaceChildren(icon('next'));
  $$('[data-listen-mode]', els.playerModes).forEach(button => { button.title = listenModeText(button.dataset.listenMode); });
  LISTEN_RATES.forEach(rate => els.playerRate.append(new Option(`${rate}×`, String(rate))));
  renderVoices();
  speech.addEventListener?.('voiceschanged', renderVoices);
  // Some engines keep talking after the page is gone.
  window.addEventListener('pagehide', () => speech.cancel());
}

/* ---------- events ---------- */
function bindEvents() {
  document.addEventListener('click', event => {
    if (event.target.closest('.quiz-card')) return;
    const tab = event.target.closest('#mobile-tabs [data-mobile-view]');
    if (tab) { setMobileView(tab.dataset.mobileView); return; }
    // On a phone, opening something from the map, search, saved topics, or the player shows
    // the lesson; links inside a lesson are already in the lesson view.
    if (onPhone() && event.target.closest('#graph-wrap [data-topic-id], #graph-wrap [data-category-id], #graph-wrap [data-stage-id], #search-results [data-topic-id], #saved-popover [data-topic-id], #player-title[data-topic-id]')) {
      setMobileView('lesson');
    }
    const trail = event.target.closest('[data-trail-key]');
    if (trail) {
      const key = trail.dataset.trailKey;
      const index = state.history.indexOf(key);
      state.history = index >= 0 ? state.history.slice(0, index) : [];
      openKey(key, { push: false });
      return;
    }
    const partTarget = event.target.closest('[data-listen-part]');
    if (partTarget) {
      if (partTarget.classList.contains('is-active')) pauseListening();
      else if (state.selected) startListening(state.selected, { part: Number(partTarget.dataset.listenPart) });
      return;
    }
    const stageTarget = event.target.closest('[data-stage-id]');
    if (stageTarget) { selectStage(stageTarget.dataset.stageId); return; }
    const topicTarget = event.target.closest('[data-topic-id]');
    if (topicTarget) {
      selectTopic(topicTarget.dataset.topicId);
      if (topicTarget.classList.contains('search-result')) clearSearch({ blur: true });
      if (topicTarget.classList.contains('saved-topic')) setSavedPopover(false);
      return;
    }
    const categoryTarget = event.target.closest('[data-category-id]');
    if (categoryTarget) { selectCategory(categoryTarget.dataset.categoryId); return; }
    if (!event.target.closest('.saved-wrap')) setSavedPopover(false);
    if (!event.target.closest('.search-wrap')) { els.searchResults.hidden = true; els.search.setAttribute('aria-expanded', 'false'); }
  });

  els.back.addEventListener('click', () => {
    const previous = state.history.pop();
    if (previous) openKey(previous, { push: false });
  });
  els.home.addEventListener('click', goHome);
  els.brand.addEventListener('click', goHome);
  els.fit.addEventListener('click', () => fitView());
  const mapCenter = () => { const rect = els.graphWrap.getBoundingClientRect(); return [rect.left + rect.width / 2, rect.top + rect.height / 2]; };
  els.zoomIn.addEventListener('click', () => { const [x, y] = mapCenter(); zoomAt(1.18, x, y); });
  els.zoomOut.addEventListener('click', () => { const [x, y] = mapCenter(); zoomAt(.85, x, y); });
  els.bookmark.addEventListener('click', () => {
    if (!state.selected) return;
    const saving = !state.bookmarks.has(state.selected.id);
    if (saving) state.bookmarks.add(state.selected.id); else state.bookmarks.delete(state.selected.id);
    writeSet(STORAGE_KEYS.bookmarks, state.bookmarks);
    updateLessonButtons(state.selected);
    renderBookmarks();
    toast(saving ? t('Saved to your list') : t('Removed from saved topics'));
  });
  els.learned.addEventListener('click', () => { if (state.selected) openQuiz(state.selected); });
  els.learnedReset.addEventListener('click', () => {
    if (!state.selected) return;
    state.learned.delete(state.selected.id);
    refreshLearnState();
    toast(t('Marked as not learned'));
  });
  els.langSwitch.addEventListener('click', event => {
    const button = event.target.closest('[data-lang]');
    if (button) switchLanguage(button.dataset.lang);
  });
  els.viewMap.addEventListener('click', () => setView('map'));
  els.viewRoadmap.addEventListener('click', () => setView('roadmap'));
  els.nextUp.addEventListener('click', () => {
    const next = nextOnPath();
    if (!next) return;
    if (onPhone()) setMobileView('lesson');
    selectTopic(next.id);
  });
  els.playerMore.addEventListener('click', () => {
    const open = !els.player.classList.contains('is-expanded');
    els.player.classList.toggle('is-expanded', open);
    els.playerMore.setAttribute('aria-expanded', String(open));
  });
  els.listenButton.addEventListener('click', () => {
    const topic = viewingTopic() ? state.selected : null;
    if (!topic) return;
    if (state.listen.topic?.id === topic.id) toggleListening(); else startListening(topic);
  });
  els.listenToggle.addEventListener('click', () => {
    if (state.listen.open) { closePlayer(); return; }
    state.listen.open = true;
    if (!state.listen.topic) {
      const topic = viewingTopic() && state.selected ? state.selected : nextOnPath() ?? state.path[0];
      if (topic) cue(topic);
    }
    paintListening({ scroll: true });
  });
  els.playerPlay.addEventListener('click', toggleListening);
  els.playerBack.addEventListener('click', () => skipChunk(-1));
  els.playerForward.addEventListener('click', () => skipChunk(1));
  els.playerPrev.addEventListener('click', () => skipTopic(-1));
  els.playerNext.addEventListener('click', () => skipTopic(1));
  els.playerClose.addEventListener('click', closePlayer);
  els.playerModes.addEventListener('click', event => {
    const button = event.target.closest('[data-listen-mode]');
    if (!button) return;
    state.listen.mode = button.dataset.listenMode;
    saveListenSettings();
    paintListening();
    toast(listenModeText(state.listen.mode));
  });
  els.playerRate.addEventListener('change', () => {
    state.listen.rate = Number(els.playerRate.value) || 1;
    saveListenSettings();
    // Restart the sentence so the new speed is heard straight away.
    if (state.listen.playing) speakChunk(); else paintListening();
  });
  els.playerVoice.addEventListener('change', () => {
    state.listen.voices[listenLang()] = els.playerVoice.value;
    saveListenSettings();
    if (state.listen.playing) speakChunk();
  });
  els.quizClose.addEventListener('click', () => closeQuiz());
  els.quizOverlay.addEventListener('click', event => { if (event.target === els.quizOverlay) closeQuiz(); });
  els.savedButton.addEventListener('click', () => setSavedPopover(els.savedPopover.hidden));
  els.motion.addEventListener('click', () => {
    applyMotion(!state.motion);
    writeItem(STORAGE_KEYS.motion, state.motion ? 'on' : 'off');
    toast(state.motion ? t('Animations on') : t('Animations off'));
  });
  els.theme.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    writeItem(STORAGE_KEYS.theme, next);
    els.theme.setAttribute('aria-label', next === 'light' ? t('Switch to the dark theme') : t('Switch to the light theme'));
  });

  els.search.addEventListener('input', event => { state.query = event.target.value; state.activeResult = 0; showSearchResults(); });
  els.search.addEventListener('focus', () => { if (state.query) showSearchResults(); });
  els.search.addEventListener('keydown', event => {
    const results = $$('.search-result[data-topic-id]', els.searchResults);
    if (event.key === 'Escape') { clearSearch({ blur: true }); return; }
    if (event.key === 'ArrowDown' && results.length) { event.preventDefault(); state.activeResult = (state.activeResult + 1) % results.length; showSearchResults(); return; }
    if (event.key === 'ArrowUp' && results.length) { event.preventDefault(); state.activeResult = (state.activeResult - 1 + results.length) % results.length; showSearchResults(); return; }
    if (event.key === 'Enter' && results.length) {
      event.preventDefault();
      const target = results[state.activeResult] ?? results[0];
      selectTopic(target.dataset.topicId);
      clearSearch({ blur: true });
    }
  });
  document.addEventListener('keydown', event => {
    if (state.quiz) {
      if (event.key === 'Escape') { closeQuiz(); return; }
      if (state.quiz.stage === 'question' && !state.quiz.locked && /^[1-9]$/.test(event.key)) {
        const options = $$('.quiz-option', els.quizBody);
        const target = options[Number(event.key) - 1];
        if (target && !target.disabled) { event.preventDefault(); target.click(); }
      }
      return;
    }
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (event.key === '/' && !typing) { event.preventDefault(); els.search.focus(); els.search.select(); return; }
    if (event.key === 'Escape') { setSavedPopover(false); if (state.query && !typing) clearSearch(); return; }
    if (typing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Backspace' && state.history.length) { event.preventDefault(); openKey(state.history.pop(), { push: false }); }
    const key = event.key.toLowerCase();
    if (key === 'q' && state.selected && !els.learned.disabled) openQuiz(state.selected);
    if (key === 'n') stepPath(1);
    if (key === 'p') stepPath(-1);
    if (key === 'r') setView(state.view === 'roadmap' ? 'map' : 'roadmap');
    if (key === 'l') toggleListening();
  });

  els.graphWrap.addEventListener('wheel', event => { event.preventDefault(); zoomAt(event.deltaY < 0 ? 1.08 : .92, event.clientX, event.clientY); }, { passive: false });

  /* One pointer pans, two pinch to zoom. A gesture may start on a tile: it only becomes a
     drag after the pointer moves a few pixels, so a tap or click still opens the tile, and a
     drag that ends on a tile does not. */
  const pointers = new Map();
  let gesture = null;
  let suppressClick = false;
  const DRAG_THRESHOLD = 6;
  const wrapPoint = event => {
    const rect = els.graphWrap.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const beginGesture = moved => {
    const points = [...pointers.values()];
    if (points.length >= 2) {
      const [a, b] = points;
      gesture = { kind: 'pinch', distance: Math.hypot(a.x - b.x, a.y - b.y) || 1, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, zoom: state.zoom, pan: { ...state.pan } };
    } else if (points.length === 1) {
      gesture = { kind: 'pan', start: { ...points[0] }, pan: { ...state.pan }, moved };
    } else {
      gesture = null;
    }
  };
  const startDragging = event => {
    stopViewportAnimation();
    state.framing = 'free';
    suppressClick = true;
    els.graphWrap.classList.add('is-dragging');
    try { els.graphWrap.setPointerCapture(event.pointerId); } catch { /* pointer already gone */ }
  };
  els.graphWrap.addEventListener('pointerdown', event => {
    if (event.target.closest('.legend, .map-header')) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (!pointers.size) suppressClick = false;
    pointers.set(event.pointerId, wrapPoint(event));
    beginGesture(pointers.size > 1);
    if (pointers.size > 1) startDragging(event);
  });
  els.graphWrap.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    pointers.set(event.pointerId, wrapPoint(event));
    if (gesture.kind === 'pinch') {
      const [a, b] = [...pointers.values()];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const zoom = Math.min(1.8, Math.max(.06, gesture.zoom * Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance));
      const world = { x: (gesture.mid.x - gesture.pan.x) / gesture.zoom, y: (gesture.mid.y - gesture.pan.y) / gesture.zoom };
      state.zoom = zoom;
      state.pan = { x: mid.x - world.x * zoom, y: mid.y - world.y * zoom };
      applyViewport();
      return;
    }
    const point = pointers.get(event.pointerId);
    const dx = point.x - gesture.start.x;
    const dy = point.y - gesture.start.y;
    if (!gesture.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      gesture.moved = true;
      startDragging(event);
    }
    state.pan = { x: gesture.pan.x + dx, y: gesture.pan.y + dy };
    applyViewport();
  });
  const releasePointer = event => {
    if (!pointers.delete(event.pointerId)) return;
    // A finger lifted from a pinch leaves the other one panning from where it is.
    if (pointers.size) beginGesture(true);
    else { gesture = null; els.graphWrap.classList.remove('is-dragging'); }
  };
  els.graphWrap.addEventListener('pointerup', releasePointer);
  els.graphWrap.addEventListener('pointercancel', releasePointer);
  els.graphWrap.addEventListener('click', event => {
    if (!suppressClick) return;
    suppressClick = false;
    event.stopPropagation();
    event.preventDefault();
  }, true);
  // On a phone, tapping empty map zooms in there, since tiles start out too small to tap.
  els.graphWrap.addEventListener('click', event => {
    if (!onPhone() || event.target.closest('.topic-node, .legend, .map-header') || state.zoom >= TOPIC_ZOOM * 1.4) return;
    zoomInOn(wrapPoint(event));
  });

  let splitDrag = null;
  els.splitter.addEventListener('pointerdown', event => {
    splitDrag = { id: event.pointerId, startX: event.clientX, startWidth: els.lessonPane.getBoundingClientRect().width };
    els.splitter.classList.add('is-dragging');
    els.splitter.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  els.splitter.addEventListener('pointermove', event => {
    if (!splitDrag || event.pointerId !== splitDrag.id) return;
    // Dragging left widens the lesson, so the delta is inverted.
    setLessonWidth(splitDrag.startWidth - (event.clientX - splitDrag.startX));
    applyViewport();
  });
  const releaseSplit = event => {
    if (!splitDrag || event.pointerId !== splitDrag.id) return;
    splitDrag = null;
    els.splitter.classList.remove('is-dragging');
    relayout();
  };
  els.splitter.addEventListener('pointerup', releaseSplit);
  els.splitter.addEventListener('pointercancel', releaseSplit);
  els.splitter.addEventListener('keydown', event => {
    const delta = event.key === 'ArrowLeft' ? 40 : event.key === 'ArrowRight' ? -40 : 0;
    if (!delta) return;
    event.preventDefault();
    setLessonWidth(els.lessonPane.getBoundingClientRect().width + delta);
    relayout();
  });
  els.splitter.addEventListener('dblclick', () => { setLessonWidth((els.workspace.clientWidth || window.innerWidth) * .3); relayout(); });

  window.addEventListener('hashchange', () => {
    const match = /^#(t|c|s)\/([a-z0-9-]+)$/i.exec(location.hash);
    if (!match) return;
    const key = `${match[1]}:${match[2]}`;
    if (key !== currentKey()) openKey(key);
  });
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(relayout, 140);
  });
  // Crossing the phone breakpoint changes which pane is hidden.
  phoneQuery?.addEventListener?.('change', () => setMobileView(document.documentElement.dataset.mobileView ?? 'lesson'));
}

/* ---------- language ---------- */
/** `?lang=` in the address wins and is remembered; otherwise the saved choice; otherwise English. */
function chosenLanguage() {
  const asked = new URLSearchParams(location.search).get('lang');
  if (asked && LANGUAGES[asked]) { writeItem(STORAGE_KEYS.lang, asked); return asked; }
  const saved = readItem(STORAGE_KEYS.lang);
  return LANGUAGES[saved] ? saved : 'en';
}

function paintLanguageSwitch() {
  $$('[data-lang]', els.langSwitch).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === language())));
}

/* Every view is built at load, so switching language reloads on the same topic rather than
   repainting each string in place. Dropping ?lang= keeps the address from switching back. */
function switchLanguage(code) {
  if (!LANGUAGES[code] || code === language()) return;
  writeItem(STORAGE_KEYS.lang, code);
  speech?.cancel();
  const url = new URL(location.href);
  url.searchParams.delete('lang');
  history.replaceState(null, '', url.href);
  location.reload();
}

/* ---------- boot ---------- */
async function load() {
  try { await useLanguage(chosenLanguage()); } catch (error) { console.error('Could not load the interface language', error); await useLanguage('en'); }
  translatePage();
  paintLanguageSwitch();
  const storedMotion = readItem(STORAGE_KEYS.motion);
  applyMotion(storedMotion !== 'off');
  state.view = readItem(STORAGE_KEYS.view) === 'roadmap' ? 'roadmap' : 'map';
  // A phone opens on the lesson, which reads at full size; the map is one tap away.
  setMobileView('lesson');
  initListening();
  bindEvents();
  try {
    const module = await import('../knowledge.js');
    const overlay = language() === 'en' ? null : await import(`../data/${language()}/index.js`);
    const dataset = normalizeDataset(localizeDataset(module.default ?? module, overlay));
    state.categories = dataset.categories;
    state.topics = dataset.topics;
    state.stages = dataset.stages;
    state.byId = new Map(state.topics.map(topic => [topic.id, topic]));
    state.categoryById = new Map(state.categories.map(category => [category.id, category]));
    state.stageById = new Map(state.stages.map(stage => [stage.id, stage]));
    state.path = state.stages.flatMap(stage => stage.topicIds.map(id => state.byId.get(id)));
    state.root = findRoot();
    // Where listening stopped last time is cued, not played: speech needs a press of play.
    const position = readObject(STORAGE_KEYS.listen);
    if (speech && state.byId.has(position.topic)) cue(state.byId.get(position.topic), Number(position.index) || 0);
    els.loadState.hidden = true;
    els.search.placeholder = t('Search {n} topics, methods, EIPs…', { n: state.topics.length });
    renderBookmarks();
    updateProgress();
    if (!selectFromHash()) {
      if (state.root) selectTopic(state.root.id, { push: false });
      else renderGraph({ refit: true, animate: false });
    }
    state.history = [];
    state.origin = null;
    renderGraph();
    renderTrail();
    fitView({ animate: false });
    // A link straight to a topic opens on the whole map, then flies in to it once the nodes
    // have faded in, so the reader sees where on the map it lives.
    if (!state.selectedCategory && state.selected && !isRoot(state.selected)) window.setTimeout(() => focusSelection(), 420);
    else if (state.selectedCategory) window.setTimeout(() => focusSelection(), 420);
    // ?checkpoint opens the quiz straight away, so a checkpoint can be linked to directly.
    if (new URLSearchParams(location.search).has('checkpoint') && state.selected && !state.learned.has(state.selected.id)) openQuiz(state.selected);
    paintMobileTabs();
    state.booted = true;
  } catch (error) {
    els.loadState.textContent = t('The knowledge dataset could not be loaded.');
    console.error('Could not load knowledge.js', error);
  }
}

load();
