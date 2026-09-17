// Dataset normalisation, shared by the browser app and the tests.
//
// Topic records are authored by hand, so the renderer never trusts their shape. Every
// field is coerced here once; everything downstream can then assume it exists.

export const LINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
export const FALLBACK_COLORS = ['#2f6a58', '#bd7042', '#537aa1', '#9a6b9c', '#7f7540', '#657a6e', '#ac695a'];

/** Strip link and code markup so text can be counted, searched, or read aloud. */
export const plainText = text => String(text ?? '').replace(LINK_PATTERN, (_, id, label) => label || id).replace(/`/g, '');
export const wordCount = text => plainText(text).split(/\s+/).filter(Boolean).length;

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
    // renderer and the quiz only ever deal with one shape.
    if (!sections.length && details.length) sections = [{ heading: 'Overview', paragraphs: details }];
    const rawExample = item?.example;
    const example = rawExample && typeof rawExample === 'object' && typeof rawExample.code === 'string'
      ? { title: String(rawExample.title ?? 'Example'), language: String(rawExample.language ?? 'text'), code: rawExample.code, note: rawExample.note ? String(rawExample.note) : '' }
      : null;
    const pitfalls = Array.isArray(item?.pitfalls) ? item.pitfalls.map(String).filter(Boolean) : [];
    const aliases = Array.isArray(item?.aliases) ? item.aliases.map(String) : [];
    const quiz = Array.isArray(item?.quiz) ? item.quiz : [];
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
      searchText: [String(item?.title ?? id), ...aliases, summary, ...bodyText].join(' ').toLowerCase()
    };
  });
  return { categories, topics };
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
