import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { messages } from '../src/locales/messages.js';
import { LANGUAGES, setLanguage, getLanguage, tr, translateSource, formatNumber, formatDate, formatDateTime, money, localizeError, productSearchNames } from '../src/i18n.js';
import { product, validateCart, createOrder, cartTotal } from '../src/domain.js';
import { localizePartName, localizeCategory, localizeBrand, localizeModel } from '../src/catalog-i18n.js';
const placeholders = value => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
test('四语配置完整、键唯一、插值一致，译文不夹带HTML', () => {
  assert.equal(new Set(messages.map(row => row.id)).size, messages.length);
  for (const row of messages) for (const language of Object.keys(LANGUAGES)) {
    assert.ok(row[language]?.trim(), `${row.id}/${language}`);
    assert.deepEqual(placeholders(row[language]), placeholders(row.zh), `${row.id}/${language}`);
    assert.ok(!/[<>]/.test(row[language]), `${row.id}/${language}`);
    if (language !== 'zh') assert.ok(!/\p{Script=Han}/u.test(row[language]), `${row.id}/${language}`);
  }
});
test('所有页面引用的翻译键存在，不出现未替换占位符', async () => {
  const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  const ids = [...source.matchAll(/tr\(["']([^"']+)["']/g)].map(match => match[1]);
  for (const language of Object.keys(LANGUAGES)) {
    setLanguage(language);
    for (const id of ids) assert.ok(tr(id));
    for (const row of messages) assert.ok(!/\{\w+\}/.test(tr(row.id, Object.fromEntries(placeholders(row.zh).map(name => [name, 'test'])))));
  }
});
test('四语数量模板可调整语序，语言选择持久化且拒绝非法值', () => {
  const saved = new Map();
  globalThis.localStorage = { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) };
  setLanguage('ru');
  assert.equal(tr('cartModal.0d0c2d62', { v0: 1, v1: 2 }), 'Позиций: 1 / Количество: 2');
  assert.equal(saved.get('caucasus-language'), 'ru');
  assert.equal(setLanguage('__proto__'), false);
  assert.equal(getLanguage(), 'ru');
  delete globalThis.localStorage;
});
test('本地数字和日期格式保持USD与第比利斯时区，无汇率换算', () => {
  for (const language of Object.keys(LANGUAGES)) {
    setLanguage(language);
    assert.match(money(65), /USD/);
    assert.equal(money(65), new Intl.NumberFormat(LANGUAGES[language].locale, { style: 'currency', currency: 'USD', currencyDisplay: 'code' }).format(65));
    assert.equal(formatNumber(1234.56), new Intl.NumberFormat(LANGUAGES[language].locale).format(1234.56));
    assert.equal(formatDate('2026-11-20'), new Intl.DateTimeFormat(LANGUAGES[language].locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Tbilisi' }).format(new Date('2026-11-20T12:00:00+04:00')));
    assert.equal(formatDateTime('2026-11-19T21:30:00Z'), language === 'ka' ? '20 ნოე. 2026, 01:30' : new Intl.DateTimeFormat(LANGUAGES[language].locale, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tbilisi' }).format(new Date('2026-11-19T21:30:00Z')));
  }
});
test('切换语言不改变成交价、库存规则及既有订单数据', () => {
  const cart = [{ id: 'order-001', qty: 2 }];
  const order = createOrder(cart, 'dealer', 'pickup', { contact: 'Demo', phone: '123', address: 'Warehouse' });
  const before = JSON.stringify(order);
  for (const language of Object.keys(LANGUAGES)) {
    setLanguage(language);
    assert.equal(cartTotal(cart, 'dealer'), 23.4);
    assert.equal(JSON.stringify(order), before);
    try { validateCart([{ id: 'order-001', qty: 121 }]); assert.fail('Expected stock limit'); }
    catch (error) {
      assert.equal(error.code, 'STOCK_LIMIT');
      assert.ok(localizeError(error).includes(localizePartName(product('order-001').name)));
      if (language !== 'zh') assert.ok(!/\p{Script=Han}/u.test(localizeError(error)));
    }
  }
});
test('新目录名称、分类和品牌随四语切换，原单编号保持不变', () => {
  for (const language of Object.keys(LANGUAGES)) {
    setLanguage(language);
    assert.ok(localizePartName('前刹车片'));
    assert.ok(localizeCategory('制动系统'));
    assert.ok(localizeBrand('比亚迪'));
    assert.ok(localizeModel('秦PLUS'));
    if (language !== 'zh') assert.ok(!/\p{Script=Han}/u.test(localizePartName('前刹车片') + localizeCategory('制动系统') + localizeBrand('比亚迪') + localizeModel('秦PLUS')));
  }
  assert.equal(product('order-001').sourceCode, '472ZQA-1017100');
});
test('不支持格鲁吉亚locale的浏览器也不会退回系统中文月份', () => {
  setLanguage('ka');
  assert.equal(formatDate('2026-11-20'), '20 ნოე. 2026');
  assert.equal(money(128460), '128\u00a0460,00\u00a0USD');
  assert.equal(formatNumber(6144), '6144');
  assert.ok(!/\p{Script=Han}/u.test(formatDate('2026-11-20')));
});
const { canonicalAddress } = await import('../src/i18n.js');
test('样例地址跨语言保持身份，客户自由填写的姓名/地址不翻译', () => {
  assert.equal(canonicalAddress('საქართველო · თბილისი · კახეთის გზატკეცილი 12'), '格鲁吉亚 · 第比利斯 · Kakheti Highway 12');
  assert.equal(canonicalAddress('My own address 12'), 'My own address 12');
});
