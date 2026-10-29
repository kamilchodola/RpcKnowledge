// Lists every interface string the code passes to t() and tn(), and every string the page
// marks for translation, so a test can check that each language has all of them.

// A single-quoted JavaScript string literal, allowing escaped characters inside it.
const SINGLE = "'(?:[^'\\\\\\n]|\\\\.)*'";
const unquote = literal => literal.slice(1, -1).replace(/\\(.)/g, '$1');

/** Keys used in a JavaScript source: t('…') and the singular of tn(n, '…', '…'). */
export function scriptKeys(source) {
  const keys = new Set();
  const plurals = new Set();
  for (const match of source.matchAll(new RegExp(`\\bt\\((${SINGLE})`, 'g'))) keys.add(unquote(match[1]));
  for (const match of source.matchAll(new RegExp(`\\btn\\([^,]+,\\s*(${SINGLE})`, 'g'))) plurals.add(unquote(match[1]));
  return { keys, plurals };
}

/** Keys in the page: the text of data-i18n elements and the values of data-i18n-attr attributes. */
export function pageKeys(html) {
  const keys = new Set();
  for (const match of html.matchAll(/<(\w+)\b([^>]*)>([^<]*)<\/\1>/g)) {
    if (/\sdata-i18n(\s|=|$)/.test(match[2])) keys.add(match[3].trim());
  }
  for (const match of html.matchAll(/<\w+\b([^>]*\sdata-i18n-attr="([^"]+)"[^>]*)>/g)) {
    match[2].split(/\s+/).forEach(name => {
      const value = new RegExp(`\\s${name}="([^"]*)"`).exec(match[1]);
      if (value) keys.add(value[1].replace(/&amp;/g, '&'));
    });
  }
  return keys;
}
