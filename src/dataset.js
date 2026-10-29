// Dataset normalisation, shared by the browser app and the tests.
//
// Topic records are authored by hand, so the renderer never trusts their shape. Every
// field is coerced here once; everything downstream can then assume it exists.

export const LINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
export const FALLBACK_COLORS = ['#2f6a58', '#bd7042', '#537aa1', '#9a6b9c', '#7f7540', '#657a6e', '#ac695a'];

/** Strip link and code markup so text can be counted, searched, or read aloud. */
export const plainText = text => String(text ?? '').replace(LINK_PATTERN, (_, id, label) => label || id).replace(/`/g, '');
export const wordCount = text => plainText(text).split(/\s+/).filter(Boolean).length;

/**
 * Lays a translation over the English dataset. `overlay` holds, keyed by id, the
 * translated words only: category and stage labels and blurbs, each topic's title,
 * aliases, summary, sections, example title and note, and pitfalls, and each topic's
 * checkpoint questions. Ids, links, code, related topics, and sources stay the English
 * record's. A topic the overlay does not cover stays in English and says so in `lang`.
 * The English title and aliases stay searchable beside the translated ones.
 */
export function localizeDataset(dataset, overlay) {
  if (!overlay) return dataset;
  const lang = String(overlay.lang ?? '');
  const words = (record, translated) => ({
    ...record,
    label: translated?.label ?? record.label,
    blurb: translated?.blurb ?? record.blurb
  });
  const categories = (dataset?.categories ?? []).map(category => words(category, overlay.categories?.[category.id]));
  // A stage keeps its English words too, so an English lesson can announce it in English.
  const stages = (dataset?.stages ?? []).map(stage => ({
    ...words(stage, overlay.stages?.[stage.id]),
    original: { label: stage.label, blurb: stage.blurb }
  }));
  const topics = (dataset?.topics ?? []).map(topic => {
    const text = overlay.topics?.[topic.id];
    if (!text) return { ...topic, lang: topic.lang ?? 'en' };
    return {
      ...topic,
      lang,
      title: text.title ?? topic.title,
      aliases: [...(text.aliases ?? []), topic.title, ...(topic.aliases ?? [])],
      summary: text.summary ?? topic.summary,
      sections: text.sections ?? topic.sections,
      example: topic.example
        ? { ...topic.example, title: text.example?.title ?? topic.example.title, note: text.example?.note ?? topic.example.note }
        : topic.example,
      pitfalls: text.pitfalls ?? topic.pitfalls,
      quiz: overlay.quizzes?.[topic.id] ?? topic.quiz
    };
  });
  return { ...dataset, categories, stages, topics };
}

export function normalizeDataset(dataset) {
  const rawCategories = Array.isArray(dataset?.categories) ? dataset.categories : [];
  const rawTopics = Array.isArray(dataset?.topics) ? dataset.topics : [];
  const categories = rawCategories.map((item, index) => ({
    id: String(item?.id ?? `category-${index}`),
    label: String(item?.label ?? item?.id ?? 'Layer'),
    color: item?.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    blurb: String(item?.blurb ?? '')
  }));
  const categoryIds = new Set(categories.map(item => item.id));
  const topics = rawTopics.map((item, index) => {
    const id = String(item?.id ?? `topic-${index}`);
    const details = Array.isArray(item?.details) ? item.details.map(String) : item?.details == null ? [] : [String(item.details)];
    let sections = Array.isArray(item?.sections)
      ? item.sections.filter(section => section && typeof section === 'object').map(section => ({
        heading: String(section.heading ?? ''),
        paragraphs: Array.isArray(section.paragraphs) ? section.paragraphs.map(String).filter(Boolean) : []
      })).filter(section => section.paragraphs.length)
      : [];
    // Older records carried a flat `details` array. Treat it as a single section so the
    // renderer only ever deals with one shape.
    if (!sections.length && details.length) sections = [{ heading: 'Overview', paragraphs: details }];
    const rawExample = item?.example;
    const example = rawExample && typeof rawExample === 'object' && typeof rawExample.code === 'string'
      ? { title: String(rawExample.title ?? 'Example'), language: String(rawExample.language ?? 'text'), code: rawExample.code, note: rawExample.note ? String(rawExample.note) : '' }
      : null;
    const pitfalls = Array.isArray(item?.pitfalls) ? item.pitfalls.map(String).filter(Boolean) : [];
    const aliases = Array.isArray(item?.aliases) ? item.aliases.map(String) : [];
    // Checkpoint questions are hand-written and the checkpoint gates "learned", so a
    // malformed one is dropped rather than shown: four distinct non-empty options and an
    // answer index that points at one of them.
    const quiz = Array.isArray(item?.quiz)
      ? item.quiz
        .filter(q => q && typeof q.question === 'string' && q.question.trim()
          && Array.isArray(q.options) && q.options.length >= 3
          && q.options.every(option => typeof option === 'string' && option.trim())
          && new Set(q.options.map(option => option.trim())).size === q.options.length
          && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length)
        .map(q => ({ kind: String(q.kind ?? 'detail'), question: q.question.trim(), options: q.options.map(option => option.trim()), answer: q.answer }))
      : [];
    const related = Array.isArray(item?.related) ? [...new Set(item.related.map(String))] : [];
    const sources = Array.isArray(item?.sources)
      ? item.sources.filter(source => source && typeof source === 'object')
        .map(source => ({ title: String(source.title ?? source.url ?? 'Reference'), url: String(source.url ?? '') }))
        .filter(source => /^https?:\/\//i.test(source.url))
      : [];
    const summary = String(item?.summary ?? '');
    const bodyText = [...sections.flatMap(section => section.paragraphs), ...pitfalls];
    return {
      id,
      lang: String(item?.lang ?? 'en'),
      title: String(item?.title ?? id),
      category: categoryIds.has(String(item?.category)) ? String(item.category) : categories[0]?.id ?? '',
      aliases,
      summary,
      sections,
      example,
      pitfalls,
      quiz,
      related,
      sources,
      words: wordCount([summary, ...bodyText].join(' ')),
      searchText: [String(item?.title ?? id), ...aliases, summary, ...bodyText].join(' ').toLowerCase(),
      step: 0,
      stage: ''
    };
  });
  const stages = normalizeStages(dataset?.stages, topics);
  const byId = new Map(topics.map(topic => [topic.id, topic]));
  let step = 0;
  stages.forEach(stage => stage.topicIds.forEach(id => {
    const topic = byId.get(id);
    step += 1;
    topic.step = step;
    topic.stage = stage.id;
  }));
  return { categories, topics, stages };
}

/**
 * The learning path: stages in order, each listing its topics in reading order. A topic
 * the path does not place still needs a number, so any left over are appended as a last
 * stage rather than dropped; the tests keep that stage from ever being needed.
 */
export function normalizeStages(rawStages, topics) {
  const known = new Set(topics.map(topic => topic.id));
  const placed = new Set();
  const stages = (Array.isArray(rawStages) ? rawStages : [])
    .filter(stage => stage && typeof stage === 'object')
    .map((stage, index) => {
      const topicIds = [];
      (Array.isArray(stage.topics) ? stage.topics : []).map(String).forEach(id => {
        if (known.has(id) && !placed.has(id)) { placed.add(id); topicIds.push(id); }
      });
      return {
        id: String(stage.id ?? `stage-${index + 1}`),
        label: String(stage.label ?? `Stage ${index + 1}`),
        blurb: String(stage.blurb ?? ''),
        // The English words of a translated stage (see localizeDataset).
        ...(stage.original ? { original: { label: String(stage.original.label ?? ''), blurb: String(stage.original.blurb ?? '') } } : {}),
        topicIds
      };
    });
  const rest = topics.filter(topic => !placed.has(topic.id)).map(topic => topic.id);
  if (rest.length) stages.push({ id: 'more', label: 'More topics', blurb: 'Topics the learning path does not place yet.', topicIds: rest });
  return stages.filter(stage => stage.topicIds.length).map((stage, index) => ({ ...stage, number: index + 1 }));
}

/** Every text field of a topic, in reading order. */
export const topicText = topic => [
  topic.summary,
  ...(topic.sections ?? []).flatMap(section => section.paragraphs ?? []),
  ...(topic.pitfalls ?? []),
  topic.example?.note ?? ''
];

/** Topic ids this lesson links to inline, in first-mention order. */
export function inlineTermIds(topic, byId) {
  const ids = [];
  const seen = new Set();
  for (const text of topicText(topic)) {
    for (const match of String(text).matchAll(LINK_PATTERN)) {
      const id = match[1];
      if (id !== topic.id && byId.has(id) && !seen.has(id)) { seen.add(id); ids.push(id); }
    }
  }
  return ids;
}

/** Inline links plus the curated `related` list: everything this topic branches to. */
export function linkedIds(topic, byId) {
  const ids = new Set(inlineTermIds(topic, byId));
  (topic.related ?? []).forEach(id => { if (id !== topic.id && byId.has(id)) ids.add(id); });
  return [...ids];
}
