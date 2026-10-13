import { messages } from './locales/messages.js';

export const LANGUAGES = Object.freeze({
  zh: { label: '中文', locale: 'zh-CN', htmlLang: 'zh-CN' },
  en: { label: 'English', locale: 'en-GB', htmlLang: 'en' },
  ka: { label: 'ქართული', locale: 'ka-GE', htmlLang: 'ka' },
  ru: { label: 'Русский', locale: 'ru-RU', htmlLang: 'ru' }
});
export const LANGUAGE_STORAGE_KEY = 'caucasus-language';
const byId = new Map(messages.map(row => [row.id, row]));
const bySource = new Map(messages.map(row => [row.source || row.zh, row.id]));
let language = 'zh';
try { const saved = globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY); if (Object.hasOwn(LANGUAGES, saved)) language = saved; } catch { /* A blocked storage provider must not prevent browsing. */ }
export const getLanguage = () => language;
export const getLocale = () => LANGUAGES[language].locale;
export function setLanguage(next) {
  if (!Object.hasOwn(LANGUAGES, next)) return false;
  language = next;
  try { globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, next); } catch { /* Selection remains active for this page. */ }
  return true;
}
export function tr(id, parameters = {}) {
  const row = byId.get(id);
  if (!row) throw new Error(`Unknown translation key: ${id}`);
  const template = row[language] || row.zh;
  return template.replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(parameters, name) ? String(parameters[name]) : match);
}
// Legacy demo records contain Chinese display labels. Their identity and prices stay unchanged.
export function translateSource(source, parameters = {}) {
  const id = bySource.get(source);
  return id ? tr(id, parameters) : source;
}
export function formatNumber(value, options = {}) {
  // Some WebKit builds lack ka-GE ICU data and silently use the system language.
  // Georgian uses a decimal comma and grouping from five digits in CLDR.
  if (language === 'ka') return new Intl.NumberFormat('ru-RU', { useGrouping: Math.abs(value) >= 10000, ...options }).format(value);
  return new Intl.NumberFormat(getLocale(), options).format(value);
}
export const money = value => language === 'ka' ? formatNumber(value, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '\u00a0USD' : new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'USD', currencyDisplay: 'code' }).format(value);
const dateValue = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T12:00:00+04:00') : new Date(value);
function georgianDateParts(value) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: '2-digit', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tbilisi' }).formatToParts(dateValue(value)).map(part => [part.type, part.value]));
}
export function formatDate(value) {
  if (language === 'ka') { const p = georgianDateParts(value); return `${p.day} ${tr('date.month' + p.month)} ${p.year}`; }
  return new Intl.DateTimeFormat(getLocale(), { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Tbilisi' }).format(dateValue(value));
}
export function formatDateTime(value) {
  if (language === 'ka') { const p = georgianDateParts(value); return `${formatDate(value)}, ${p.hour}:${p.minute}`; }
  return new Intl.DateTimeFormat(getLocale(), { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tbilisi' }).format(dateValue(value));
}
export const formatTime = value => new Intl.DateTimeFormat(language === 'ka' ? 'en-GB' : getLocale(), { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Tbilisi' }).format(dateValue(value));
export const formatMonth = month => language === 'ka' ? tr('date.month' + String(month).padStart(2, '0')) : new Intl.DateTimeFormat(getLocale(), { month: 'short', timeZone: 'Asia/Tbilisi' }).format(new Date(Date.UTC(2026, month - 1, 15)));
export function localizeError(error) {
  if (error.code === 'STOCK_LIMIT') return translateSource('{name} 最多可采购 {count} 件', { name: translateSource(error.partName), count: formatNumber(error.limit) });
  return translateSource(error.message);
}
export function applyDocumentLanguage() {
  document.documentElement.lang = LANGUAGES[language].htmlLang;
  document.documentElement.dir = 'ltr';
  document.querySelector('meta[name="description"]').content = tr('data.18d48bb6');
}
export const productSearchNames = Object.fromEntries([
  ['brake', 'data.c3469c76'], ['filter', 'data.e2738366'], ['disc', 'data.c850ddc7'], ['shock', 'data.5d07b7a2'],
  ['lamp', 'data.6cb83292'], ['plug', 'data.3cab3daa'], ['belt', 'data.06ce8d64'], ['pump', 'data.7bda58cf']
].map(([id, key]) => [id, Object.fromEntries(Object.keys(LANGUAGES).map(code => [code, byId.get(key)[code]]))]));
// Only recognize configured sample addresses; never translate customer-entered text.
export function canonicalAddress(value) {
  const addressIds = ['data.709d38c2', 'data.653de5c0', 'data.348cc1ad', 'checkout.f1956b7b', 'checkout.c9dbe23a'];
  const row = addressIds.map(id => byId.get(id)).find(row => Object.keys(LANGUAGES).some(code => row[code] === value));
  return row?.source ?? row?.zh ?? value;
}
