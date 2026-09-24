import { buildAttempt, MIN_QUESTIONS } from './quiz.js';
import { FALLBACK_COLORS, normalizeDataset, plainText, inlineTermIds as termIdsOf, linkedIds as linkedIdsOf } from './dataset.js';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const els = {
  workspace: $('#workspace'),
  mapPane: $('#map'),
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
  lessonMeta: $('#lesson-meta'),
  lessonTitle: $('#lesson-title'),
  lessonSummary: $('#lesson-summary'),
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
  quizClose: $('#quiz-close')
};

const state = {
  categories: [],
  topics: [],
  byId: new Map(),
  categoryById: new Map(),
  root: null,
  selected: null,
  selectedCategory: null,
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
  pointer: null,
  bookmarks: new Set(),
  learned: new Set(),
  motion: true,
  quizLocks: {},
  quiz: null
};

const STORAGE_KEYS = {
  bookmarks: 'ethereum-rpc-map:bookmarks',
  learned: 'ethereum-rpc-map:learned',
  theme: 'ethereum-rpc-map:theme',
  split: 'ethereum-rpc-map:lesson-width',
  motion: 'ethereum-rpc-map:motion',
  quiz: 'ethereum-rpc-map:quiz'
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
function readLocks() {
  try {
    const value = JSON.parse(readItem(STORAGE_KEYS.quiz) ?? '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

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
    els.motion.setAttribute('aria-label', on ? 'Turn animations off' : 'Turn animations on');
    els.motion.title = on ? 'Animations are on' : 'Animations are off';
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
const sortTopics = topics => [...topics].sort((a, b) => categoryIndex(a) - categoryIndex(b) || a.title.localeCompare(b.title));

const inlineTermIds = topic => termIdsOf(topic, state.byId);
const linkedIds = topic => linkedIdsOf(topic, state.byId);

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
      const selfId = state.selectedCategory ? null : state.selected?.id;
      if (!topic || topic.id === selfId) { parent.append(document.createTextNode(label)); return; }
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'inline-topic';
      markLearnState(link, topic.id);
      link.dataset.topicId = topic.id;
      link.textContent = label;
      link.title = state.learned.has(topic.id) ? `${topic.title} — already learned` : `${topic.title} — not learned yet`;
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
  if (!state.selectedCategory && state.selected && positions.has(state.selected.id)) {
    linkedIds(state.selected).forEach(id => {
      if (positions.has(id)) edges.push({ from: state.selected.id, to: id, kind: 'related', color: categoryFor(state.byId.get(id)).color });
    });
    if (state.origin && positions.has(state.origin) && state.origin !== state.selected.id) {
      edges.push({ from: state.selected.id, to: state.origin, kind: 'origin', color: categoryFor(state.byId.get(state.origin)).color });
    }
  }
  return { positions, edges, nodes };
}

function computeLayout() {
  return layoutOverview();
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
  const isHub = meta.kind === 'hub';
  const topic = meta.topic;
  const category = isHub ? meta.category : categoryFor(topic);
  setCategoryColor(node, category);
  node.className = 'topic-node';
  node.replaceChildren();
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
    sub.textContent = `${done} / ${meta.count ?? items.length} learned`;
    node.append(sub);
    node.setAttribute('aria-label', `Open the ${category.label} category, ${done} of ${items.length} learned`);
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
  if (state.selected?.id === topic.id && !state.selectedCategory) node.classList.add('is-selected');
  node.classList.add(learned ? 'is-learned' : 'is-todo');
  const badge = document.createElement('span');
  badge.className = 'node-badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.textContent = learned ? '✓' : '×';
  node.append(badge);
  if (meta.kind === 'center' || meta.kind === 'branch') {
    const sub = document.createElement('span');
    sub.className = 'node-category';
    sub.textContent = meta.origin ? '↩ you came from here' : meta.more > 0 ? `${category.label} · +${meta.more} more` : category.label;
    node.append(sub);
  }
  node.setAttribute('aria-label', `${topic.title}. ${learned ? 'Learned' : 'Not learned yet'}.${meta.origin ? ' You came from here.' : ''} Open it`);
}

function renderGraph({ refit = false, animate = true } = {}) {
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
  const order = { tree: 0, leaf: 1, branch: 2, related: 3, origin: 4 };
  [...layout.edges].sort((a, b) => order[a.kind] - order[b.kind]).forEach(edge => {
    if (!layout.positions.has(edge.from) || !layout.positions.has(edge.to)) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', `edge is-${edge.kind}`);
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

/** Pan and zoom that frame a set of world points inside the map pane. */
function framePoints(points, { pad = 120, maxZoom = 1.05 } = {}) {
  const width = Math.max(320, els.graphWrap.clientWidth);
  const height = Math.max(190, els.graphWrap.clientHeight);
  if (!points.length) return { pan: { x: 0, y: 0 }, zoom: 1 };
  const minX = Math.min(...points.map(point => point.x)) - pad;
  const maxX = Math.max(...points.map(point => point.x)) + pad;
  const minY = Math.min(...points.map(point => point.y)) - pad * .6;
  const maxY = Math.max(...points.map(point => point.y)) + pad * .6;
  const zoom = Math.min(maxZoom, Math.max(.06, Math.min(width / Math.max(1, maxX - minX), height / Math.max(1, maxY - minY))));
  return { pan: { x: width / 2 - ((minX + maxX) / 2) * zoom, y: height / 2 - ((minY + maxY) / 2) * zoom }, zoom };
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

const selectionKey = () => (state.selectedCategory ? `hub:${state.selectedCategory.id}` : state.selected?.id ?? null);

/** Brings the current selection into view. Returns the camera move's duration. */
function focusSelection({ animate = true } = {}) {
  const key = selectionKey();
  if (!key) return 0;
  if (!state.selectedCategory && isRoot(state.selected)) return fitView({ animate });
  if (state.selectedCategory) {
    // A category is its whole cluster: frame the hub and every topic hanging off it.
    const points = [key, ...state.topics.filter(topic => topic.category === state.selectedCategory.id).map(topic => topic.id)]
      .map(id => state.layout.positions.get(id)).filter(Boolean);
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
    chip.title = `${category.label}: ${done} of ${items.length} learned`;
    if (done === items.length && items.length) chip.classList.add('is-complete');
    if (state.selectedCategory?.id === category.id || (!state.selectedCategory && state.selected?.category === category.id)) chip.classList.add('is-active');
    els.legend.append(chip);
  });
}

const currentKey = () => state.selectedCategory ? `c:${state.selectedCategory.id}` : state.selected ? `t:${state.selected.id}` : null;
function labelForKey(key) {
  const [kind, id] = key.split(':');
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
  const terms = inlineTermIds(topic);
  const minutes = Math.max(1, Math.round(topic.words / 210));
  els.lessonMeta.textContent = `${terms.length} linked ${terms.length === 1 ? 'term' : 'terms'} · ${minutes} min read`;
  els.lessonTitle.textContent = topic.title;
  els.lessonSummary.replaceChildren();
  renderInline(topic.summary, els.lessonSummary);

  els.lessonBody.replaceChildren();
  topic.sections.forEach((section, index) => {
    const block = document.createElement('section');
    block.className = 'lesson-section';
    if (section.heading) {
      const heading = document.createElement('h3');
      const number = document.createElement('small');
      number.textContent = String(index + 1).padStart(2, '0');
      heading.append(number, document.createTextNode(section.heading));
      block.append(heading);
    }
    section.paragraphs.forEach(text => paragraph(text, block));
    els.lessonBody.append(block);
  });
  if (topic.example) {
    const figure = document.createElement('figure');
    figure.className = 'example';
    const head = document.createElement('figcaption');
    head.className = 'example-head';
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
    if (topic.example.note) paragraph(topic.example.note, figure, 'example-note');
    els.lessonBody.append(figure);
  }
  if (topic.pitfalls.length) {
    const box = document.createElement('aside');
    box.className = 'pitfalls';
    const heading = document.createElement('h3');
    heading.textContent = 'Pitfalls';
    const list = document.createElement('ul');
    topic.pitfalls.forEach(text => {
      const item = document.createElement('li');
      renderInline(text, item);
      list.append(item);
    });
    box.append(heading, list);
    els.lessonBody.append(box);
  }
  if (!topic.sections.length && !topic.example && !topic.pitfalls.length) paragraph('This topic has no lesson text yet.', els.lessonBody);

  els.lessonTerms.replaceChildren();
  if (!terms.length) {
    const empty = document.createElement('span');
    empty.className = 'side-empty';
    empty.textContent = 'No linked terms in this lesson.';
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
    chip.title = `${categoryFor(term).label}: ${term.title}${state.learned.has(id) ? ' (learned)' : ''}`;
    els.lessonTerms.append(chip);
  });

  els.relatedTopics.replaceChildren();
  const related = topic.related.map(id => state.byId.get(id)).filter(Boolean);
  if (!related.length) {
    const empty = document.createElement('span');
    empty.className = 'side-empty';
    empty.textContent = 'You are at the edge of this path.';
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
  document.title = isRoot(topic) ? 'Ethereum RPC — knowledge map' : `${topic.title} · Ethereum RPC map`;
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
  els.bookmark.setAttribute('aria-label', saved ? 'Remove from saved topics' : 'Save this topic');
  const learned = state.learned.has(topic.id);
  const { remaining } = lockFor(topic.id);
  els.learned.classList.toggle('is-learned', learned);
  els.learnedReset.hidden = !learned;
  const label = document.createElement('span');
  label.setAttribute('aria-hidden', 'true');
  label.textContent = learned ? '✓' : '◆';
  const text = learned
    ? ' Learned'
    : remaining > 0
      ? ` Checkpoint locked · ${Math.ceil(remaining / 1000)}s`
      : ` Take the checkpoint`;
  els.learned.replaceChildren(label, document.createTextNode(text));
  els.learned.disabled = learned || remaining > 0;
  els.learned.title = learned ? 'This topic is marked as learned' : 'Answer the checkpoint questions to mark this topic as learned';
  // Keep the countdown live so the button re-enables itself when the lock expires.
  window.clearInterval(updateLessonButtons.timer);
  if (remaining > 0) {
    updateLessonButtons.timer = window.setInterval(() => {
      if (state.selected?.id !== topic.id) { window.clearInterval(updateLessonButtons.timer); return; }
      updateLessonButtons(topic);
    }, 1000);
  }
}

function renderCategoryLesson(category) {
  els.lessonContent.hidden = true;
  els.categoryContent.hidden = false;
  els.categoryPill.textContent = 'Category';
  setCategoryColor(els.categoryPill, category);
  const items = sortTopics(state.topics.filter(topic => topic.category === category.id));
  const learnedCount = items.filter(topic => state.learned.has(topic.id)).length;
  els.categoryMeta.textContent = `${items.length} topics · ${learnedCount} learned`;
  els.categoryTitle.textContent = category.label;
  els.categoryBlurb.textContent = category.blurb || `Every topic in the ${category.label} category.`;
  els.categoryTopics.replaceChildren();
  items.forEach(topic => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'category-topic';
    markLearnState(card, topic.id);
    card.dataset.topicId = topic.id;
    setCategoryColor(card, category);
    const title = document.createElement('strong');
    title.textContent = topic.title;
    const badge = document.createElement('span');
    badge.className = 'card-badge';
    badge.textContent = state.learned.has(topic.id) ? '✓' : '×';
    title.append(badge);
    const summary = document.createElement('span');
    renderInline(topic.summary, summary);
    card.append(title, summary);
    els.categoryTopics.append(card);
  });
  document.title = `${category.label} · Ethereum RPC map`;
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
    empty.textContent = 'Nothing saved yet. Use ☆ on a lesson to keep it here.';
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
  if (state.selectedCategory) renderCategoryLesson(state.selectedCategory);
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
  if (remaining > 0) { toast(`Checkpoint locked for ${Math.ceil(remaining / 1000)}s`); return; }
  const attemptSeed = `${Date.now()}-${Math.random()}`;
  const questions = buildAttempt(topic, attemptSeed);
  if (questions.length < MIN_QUESTIONS) { toast('This topic does not have enough material for a checkpoint yet'); return; }
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
    els.quizStep.textContent = 'Checkpoint';
    const intro = document.createElement('div');
    intro.className = 'quiz-intro';
    const lead = document.createElement('p');
    lead.textContent = `${quiz.questions.length} questions, drawn from this lesson. Every answer has to be right to mark the topic as learned.`;
    const rules = document.createElement('ul');
    [
      'You will not be told which answers were wrong, only how many you got right.',
      'Each question unlocks after a short reading pause, so guessing quickly does not work.',
      'A failed attempt locks the checkpoint briefly, and the questions are reshuffled next time.'
    ].forEach(text => {
      const item = document.createElement('li');
      item.textContent = text;
      rules.append(item);
    });
    intro.append(lead, rules);
    els.quizBody.append(intro);
    els.quizFooter.append(
      quizButton('Read the lesson again', 'quiz-secondary', () => closeQuiz()),
      quizButton('Start', 'quiz-primary', () => { quiz.stage = 'question'; quiz.index = 0; quiz.correct = 0; renderQuiz(); })
    );
    return;
  }

  if (quiz.stage === 'question') {
    const question = quiz.questions[quiz.index];
    els.quizStep.textContent = `Question ${quiz.index + 1} of ${quiz.questions.length}`;
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
    hint.textContent = 'Reading…';
    els.quizBody.append(prompt, options, dwell, hint);
    quiz.locked = true;
    requestAnimationFrame(() => { fill.style.transitionDuration = `${QUIZ_DWELL_MS}ms`; fill.style.width = '100%'; });
    quiz.dwellTimer = window.setTimeout(() => {
      quiz.locked = false;
      buttons.forEach(button => { button.disabled = false; });
      dwell.classList.add('is-ready');
      hint.textContent = 'Pick one answer. Keys 1 to 4 work too.';
    }, QUIZ_DWELL_MS);
    return;
  }

  if (quiz.stage === 'passed') {
    els.quizStep.textContent = 'Passed';
    const result = document.createElement('div');
    result.className = 'quiz-result is-pass';
    const badge = document.createElement('span');
    badge.className = 'quiz-badge';
    badge.textContent = '✓';
    const text = document.createElement('p');
    text.textContent = `All ${quiz.questions.length} correct. ${quiz.topic.title} is marked as learned, and its links turn green across the map.`;
    result.append(badge, text);
    els.quizBody.append(result);
    const next = nextUnlearned(quiz.topic);
    els.quizFooter.append(quizButton('Close', 'quiz-secondary', () => closeQuiz()));
    if (next) els.quizFooter.append(quizButton(`Next: ${next.title}`, 'quiz-primary', () => { const id = next.id; closeQuiz({ restoreFocus: false }); selectTopic(id); }));
    return;
  }

  if (quiz.stage === 'failed') {
    const { remaining } = lockFor(quiz.topic.id);
    els.quizStep.textContent = 'Not yet';
    const result = document.createElement('div');
    result.className = 'quiz-result is-fail';
    const badge = document.createElement('span');
    badge.className = 'quiz-badge';
    badge.textContent = '×';
    const text = document.createElement('p');
    text.textContent = `${quiz.correct} of ${quiz.questions.length} correct. Which ones stay hidden on purpose: read the lesson again and look for the parts you skimmed.`;
    result.append(badge, text);
    const countdown = document.createElement('p');
    countdown.className = 'quiz-countdown';
    els.quizBody.append(result, countdown);
    const retry = quizButton('Try again', 'quiz-primary', () => {
      const topic = quiz.topic;
      closeQuiz({ restoreFocus: false });
      openQuiz(topic);
    });
    els.quizFooter.append(quizButton('Back to the lesson', 'quiz-secondary', () => closeQuiz()), retry);
    const paint = () => {
      const left = lockFor(quiz.topic.id).remaining;
      retry.disabled = left > 0;
      countdown.textContent = left > 0 ? `You can retry in ${Math.ceil(left / 1000)}s.` : 'You can retry now.';
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

function nextUnlearned(topic) {
  const candidates = [...linkedIds(topic).map(id => state.byId.get(id)), ...state.topics];
  return candidates.find(candidate => candidate && candidate.id !== topic.id && !state.learned.has(candidate.id)) ?? null;
}

/* ---------- navigation ---------- */
function pushHistory() {
  const key = currentKey();
  if (key && state.history[state.history.length - 1] !== key) state.history.push(key);
  if (state.history.length > 60) state.history.shift();
}

function updateHash() {
  const key = currentKey();
  if (!key) return;
  const [kind, id] = key.split(':');
  const hash = `#${kind}/${id}`;
  if (location.hash !== hash) history.replaceState(null, '', hash);
}

function flashLesson() {
  const panel = state.selectedCategory ? els.categoryContent : els.lessonContent;
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
  els.lessonPane.scrollTo({ top: 0, behavior: 'auto' });
}

function selectTopic(id, { push = true } = {}) {
  const topic = state.byId.get(id);
  if (!topic) return;
  const key = `t:${topic.id}`;
  if (currentKey() === key) { focusSelection(); return; }
  if (state.quiz) closeQuiz({ restoreFocus: false });
  state.origin = state.selected && !state.selectedCategory ? state.selected.id : state.origin;
  if (push) pushHistory();
  state.selected = topic;
  state.selectedCategory = null;
  renderLesson(topic);
  afterNavigate();
}

function selectCategory(id, { push = true } = {}) {
  const category = state.categoryById.get(id);
  if (!category) return;
  const key = `c:${category.id}`;
  if (currentKey() === key) { focusSelection(); return; }
  if (state.quiz) closeQuiz({ restoreFocus: false });
  state.origin = state.selected && !state.selectedCategory ? state.selected.id : null;
  if (push) pushHistory();
  state.selectedCategory = category;
  renderCategoryLesson(category);
  afterNavigate();
}

function openKey(key, options) {
  const [kind, id] = String(key).split(':');
  if (kind === 'c') selectCategory(id, options); else selectTopic(id, options);
}

function goHome() {
  state.history = [];
  state.origin = null;
  if (!state.root) return;
  if (currentKey() === `t:${state.root.id}`) { fitView(); renderTrail(); return; }
  selectTopic(state.root.id, { push: false });
}

function selectFromHash() {
  const match = /^#(t|c)\/([a-z0-9-]+)$/i.exec(location.hash);
  if (!match) return false;
  const [, kind, id] = match;
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
    empty.textContent = 'No matching topics';
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
    category.textContent = categoryFor(topic).label;
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

/* ---------- events ---------- */
function bindEvents() {
  document.addEventListener('click', event => {
    if (event.target.closest('.quiz-card')) return;
    const trail = event.target.closest('[data-trail-key]');
    if (trail) {
      const key = trail.dataset.trailKey;
      const index = state.history.indexOf(key);
      state.history = index >= 0 ? state.history.slice(0, index) : [];
      openKey(key, { push: false });
      return;
    }
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
    toast(saving ? 'Saved to your list' : 'Removed from saved topics');
  });
  els.learned.addEventListener('click', () => { if (state.selected) openQuiz(state.selected); });
  els.learnedReset.addEventListener('click', () => {
    if (!state.selected) return;
    state.learned.delete(state.selected.id);
    refreshLearnState();
    toast('Marked as not learned');
  });
  els.quizClose.addEventListener('click', () => closeQuiz());
  els.quizOverlay.addEventListener('click', event => { if (event.target === els.quizOverlay) closeQuiz(); });
  els.savedButton.addEventListener('click', () => setSavedPopover(els.savedPopover.hidden));
  els.motion.addEventListener('click', () => {
    applyMotion(!state.motion);
    writeItem(STORAGE_KEYS.motion, state.motion ? 'on' : 'off');
    toast(state.motion ? 'Animations on' : 'Animations off');
  });
  els.theme.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    writeItem(STORAGE_KEYS.theme, next);
    els.theme.setAttribute('aria-label', next === 'light' ? 'Switch to the dark theme' : 'Switch to the light theme');
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
    const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if (event.key === '/' && !typing) { event.preventDefault(); els.search.focus(); els.search.select(); return; }
    if (event.key === 'Escape') { setSavedPopover(false); if (state.query && !typing) clearSearch(); return; }
    if (typing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Backspace' && state.history.length) { event.preventDefault(); openKey(state.history.pop(), { push: false }); }
    if (event.key.toLowerCase() === 'q' && state.selected && !els.learned.disabled) openQuiz(state.selected);
  });

  els.graphWrap.addEventListener('wheel', event => { event.preventDefault(); zoomAt(event.deltaY < 0 ? 1.08 : .92, event.clientX, event.clientY); }, { passive: false });
  els.graphWrap.addEventListener('pointerdown', event => {
    if (event.target.closest('.topic-node, .legend, .map-header')) return;
    stopViewportAnimation();
    state.framing = 'free';
    state.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: state.pan.x, panY: state.pan.y };
    els.graphWrap.classList.add('is-dragging');
    els.graphWrap.setPointerCapture(event.pointerId);
  });
  els.graphWrap.addEventListener('pointermove', event => {
    if (!state.pointer || event.pointerId !== state.pointer.id) return;
    state.pan.x = state.pointer.panX + event.clientX - state.pointer.x;
    state.pan.y = state.pointer.panY + event.clientY - state.pointer.y;
    applyViewport();
  });
  const releasePointer = event => {
    if (state.pointer?.id === event.pointerId) state.pointer = null;
    els.graphWrap.classList.remove('is-dragging');
  };
  els.graphWrap.addEventListener('pointerup', releasePointer);
  els.graphWrap.addEventListener('pointercancel', releasePointer);

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
    const match = /^#(t|c)\/([a-z0-9-]+)$/i.exec(location.hash);
    if (!match) return;
    const key = `${match[1]}:${match[2]}`;
    if (key !== currentKey()) openKey(key);
  });
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(relayout, 140);
  });
}

/* ---------- boot ---------- */
async function load() {
  const storedMotion = readItem(STORAGE_KEYS.motion);
  applyMotion(storedMotion !== 'off');
  bindEvents();
  try {
    const module = await import('../knowledge.js');
    const dataset = normalizeDataset(module.default ?? module);
    state.categories = dataset.categories;
    state.topics = dataset.topics;
    state.byId = new Map(state.topics.map(topic => [topic.id, topic]));
    state.categoryById = new Map(state.categories.map(category => [category.id, category]));
    state.root = findRoot();
    els.loadState.hidden = true;
    els.search.placeholder = `Search ${state.topics.length} topics, methods, EIPs…`;
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
  } catch (error) {
    els.loadState.textContent = 'The knowledge dataset could not be loaded.';
    console.error('Could not load knowledge.js', error);
  }
}

load();
