export function defaultLanguage(menu) {
  const codes = (menu.languages || []).map(({ code }) => code);
  const preferred = menu.default_language || menu.restaurant?.default_language;
  return codes.includes(preferred) ? preferred : (codes[0] || 'es');
}
export function allergenName(code, language, menu, catalog) {
  const key = String(code).trim().toLowerCase();
  const custom = menu.languages?.find(l => l.code === language)?.translations?.allergens?.[key];
  const fallback = menu.languages?.find(l => l.code === defaultLanguage(menu))?.translations?.allergens?.[key];
  return (typeof custom === 'string' && custom.trim()) || catalog[language]?.[key] ||
    (typeof fallback === 'string' && fallback.trim()) || catalog.es?.[key] || String(code);
}
export function safeWebUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
export function safeColor(value, fallback) {
  return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value) ? value : fallback;
}
export function validSlug(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(value);
}
