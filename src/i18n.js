// Interface language. The map's own text is written in English in the code, and that
// English is the key: `t('Back')` returns "Back" in English and the Polish entry for "Back"
// in Polish. A string with no Polish entry falls back to English rather than breaking, and
// a test checks that every string the code passes to t() and tn() has one.
//
// Lessons are translated separately, in data/pl/; see localizeDataset in dataset.js.

export const LANGUAGES = {
  en: { label: 'English', short: 'EN', locale: 'en' },
  pl: { label: 'Polski', short: 'PL', locale: 'pl' }
};

let current = 'en';
let dictionary = {};
let plurals = new Intl.PluralRules('en');

export const language = () => current;

/** Switches the interface language. Polish loads its dictionary on demand. */
export async function useLanguage(code) {
  current = LANGUAGES[code] ? code : 'en';
  dictionary = current === 'en' ? {} : (await import(`../data/${current}/interface.js`)).strings;
  plurals = new Intl.PluralRules(LANGUAGES[current].locale);
  return current;
}

const fill = (text, values) => String(text).replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match));

/** The interface string for `text`, with `{name}` placeholders filled from `values`. */
export function t(text, values = {}) {
  const entry = dictionary[text];
  return fill(typeof entry === 'string' ? entry : text, values);
}

/**
 * A count with the right plural form. English passes its singular and plural; a language
 * with more forms keys its entry by the English singular and gives one form per plural
 * category, such as Polish { one, few, many }. `{n}` is the count.
 */
export function tn(n, one, other, values = {}) {
  const entry = dictionary[one];
  const all = { n, ...values };
  if (entry && typeof entry === 'object') return fill(entry[plurals.select(n)] ?? entry.many ?? entry.other ?? one, all);
  return fill(n === 1 ? one : other, all);
}

/**
 * Translates the static page: an element marked `data-i18n` holds only its English text,
 * and `data-i18n-attr` lists attributes whose English values are translated.
 */
export function translatePage(root = document) {
  document.documentElement.lang = LANGUAGES[current].locale;
  if (current === 'en') return;
  root.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.textContent.trim()); });
  root.querySelectorAll('[data-i18n-attr]').forEach(element => {
    element.dataset.i18nAttr.split(/\s+/).filter(Boolean).forEach(name => {
      const value = element.getAttribute(name);
      if (value) element.setAttribute(name, t(value));
    });
  });
}
