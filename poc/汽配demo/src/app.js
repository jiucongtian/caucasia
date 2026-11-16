import { ROLES as SOURCE_ROLES, PRODUCTS as SOURCE_PRODUCTS, BATCHES as SOURCE_BATCHES, product as sourceProduct, unit as sourceUnit, price, round, cartTotal, validateCart, createOrder, seedOrders, stages as sourceStages, orderGroups, orderStatus as sourceOrderStatus, advanceOrder, packing } from './domain.js';
import { LANGUAGES, productSearchNames, getLanguage, setLanguage, tr, translateSource, money, formatNumber, formatDate, formatDateTime, formatTime, formatMonth, localizeError, canonicalAddress, applyDocumentLanguage } from './i18n.js';
import { catalogImage, catalogFallback } from './catalog-media.js';
import { localizePartName, localizeCategory, localizeBrand, localizeModel, localizeDescription, localizeUnit } from './catalog-i18n.js';
let ROLES, PRODUCTS, BATCHES;
function refreshDisplayData() {
  ROLES = Object.fromEntries(Object.entries(SOURCE_ROLES).map(([id, r]) => [id, { ...r, label: translateSource(r.label), name: translateSource(r.name), description: translateSource(r.description), address: translateSource(r.address) }]));
  PRODUCTS = SOURCE_PRODUCTS.map(p => ({ ...p, sourceName: p.name, name: localizePartName(p.name), category: localizeCategory(p.category), description: localizeDescription(p.category, p.description), spec: `1 ${localizeUnit(translateSource(sourceUnit(p)))}`, tag: translateSource(p.tag), arrival: p.type === 'stock' ? translateSource(p.arrival) : p.arrival }));
  BATCHES = Object.fromEntries(Object.entries(SOURCE_BATCHES).map(([id, b]) => [id, { ...b, label: translateSource(b.label) }]));
}
refreshDisplayData();
const product = id => PRODUCTS.find(p => p.id === id);
const unit = p => localizeUnit(translateSource(sourceUnit(sourceProduct(p.id))));
const stages = (type, delivery) => sourceStages(type, delivery).map(label => translateSource(label));
const orderStatus = order => translateSource(sourceOrderStatus(order));
function languageControl() {
  return `<label class="language-control">${icon('globe')}<span class="sr-only">${tr('data.687d3b0a')}</span><select data-language aria-label="${esc(tr('data.687d3b0a'))}">${Object.entries(LANGUAGES).map(([code, language]) => `<option value="${code}" lang="${language.htmlLang}" ${code === getLanguage() ? 'selected' : ''}>${language.label}</option>`).join('')}</select></label>`;
}

const $ = s => document.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fitment = p => p.fitments?.map(f => `${localizeBrand(f.brand)} ${localizeModel(f.model)}`).join(' · ') || `${localizeBrand(p.vehicle)} ${localizeModel(p.model)}`;
const catalogWords = {
  zh: ['订单编号', '原单车型', '配件说明'],
  en: ['Order part code', 'Original fitment text', 'Part description'],
  ka: ['შეკვეთის კოდი', 'ორიგინალი თავსებადობა', 'ნაწილის აღწერა'],
  ru: ['Код из заказа', 'Исходная применимость', 'Описание детали']
};
const cw = index => catalogWords[getLanguage()][index];
const stockText = (p, detail = false) => {
  const count = formatNumber(p.stock), itemUnit = unit(p);
  return ({
    zh: detail ? `本地仓 ${count} ${itemUnit}` : `本地仓可供 ${count} ${itemUnit}`,
    en: `Local stock: ${count} ${itemUnit}`,
    ka: `ადგილობრივი მარაგი: ${count} ${itemUnit}`,
    ru: `Местный склад: ${count} ${itemUnit}`
  })[getLanguage()];
};
const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  cart: '<path d="M3 4h2l3 12h11l2-8H6M9 20h.01M18 20h.01"/>',
  orders: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v4H9zM9 12h6M9 16h6"/>',
  cube: '<path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5M12 13v9M7 5.7l9 5"/>',
  chart: '<path d="M4 3v18h17M8 16v-4M13 16V8M18 16V5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  truck: '<path d="M3 5h11v12H3zM14 9h4l3 4v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  shield: '<path d="m12 3 8 3v6c0 6-8 10-8 10S4 18 4 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  logOut: '<path d="M9 4H4v16h5M10 12h11m-4-4 4 4-4 4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 17h.01"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.cube}</svg>`;
const logo = `<img class="site-logo" src="./assets/starlink-logo.png" alt="Starlink">`;
const STORE = 'caucasus-demo-v1';
const LEGACY_STORE = 'caucasia-demo-v1';
function load() { try { const data = JSON.parse(localStorage.getItem(STORE) ?? localStorage.getItem(LEGACY_STORE)); return data && data.version === 1 && data.accounts && typeof data.accounts === 'object' ? data : { version: 1, role: 'repair', accounts: {} }; } catch { return { version: 1, role: 'repair', accounts: {} }; } }
let db = load();
for (const entry of Object.values(db.accounts)) {
  entry.cart = (entry.cart || []).filter(line => sourceProduct(line.id));
  entry.orders = (entry.orders || []).filter(order => order.lines?.every(line => sourceProduct(line.id)));
}
let state = { role: ROLES[db.role] ? db.role : 'repair', page: 'catalog', search: '', category: tr("load.dc5e5f05"), vehicle: '', model: '', supply: 'all', sort: 'recommended', orderFilter: tr("load.778fc8f9"), modal: null, selected: null, batch: 'november', packed: false, running: false, delivery: 'delivery' };
function readRoute() {
  const [page, selected] = location.hash.slice(1).split('/');
  if (['catalog', 'orders', 'packing', 'dashboard', 'account', 'checkout', 'success'].includes(page)) state.page = page;
  else state.page = 'catalog';
  if (state.page === 'success') state.selected = selected;
}
function routeHash(page) { return '#' + page + (page === 'success' ? '/' + state.selected : ''); }
readRoute();
let lastFocus;
let toastTimer;
function account() { if (!db.accounts[state.role]) { const r = ROLES[state.role]; db.accounts[state.role] = { cart: [], orders: seedOrders(state.role), address: { contact: r.contact, phone: r.phone, address: SOURCE_ROLES[state.role].address } }; } return db.accounts[state.role]; }
function persist() { try { db.role = state.role; localStorage.setItem(STORE, JSON.stringify(db)); return true; } catch { toast(tr("persist.091feaa3"), true); return false; } }
function toast(text, error = false) { const el = $('#toast'); el.className = `toast show ${error ? 'error' : ''}`; el.innerHTML = `${icon(error ? 'help' : 'check')}<span>${esc(text)}</span>`; clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3300); }
function navigate(page) { closeModal(false); state.page = page; if (location.hash !== routeHash(page)) history.pushState(null, '', routeHash(page)); document.body.classList.remove('mobile-nav'); render(); window.scrollTo({ top: 0, behavior: 'instant' }); }
function setRole(role) { if (!ROLES[role]) return; state.role = role; state.delivery = 'delivery'; account(); persist(); navigate('catalog'); toast(tr("setRole.4aa3af5e", {v0: ROLES[role].label})); }
const countCart = () => account().cart.reduce((n, l) => n + l.qty, 0);
const badge = p => `<span class="badge ${p.type === 'stock' ? 'green' : 'amber'}"><i></i>${p.type === 'stock' ? tr("setRole.98e7daf1") : tr("setRole.e0236cf0")}</span>`;
const date = formatDateTime;
function empty(title, text, action = 'catalog', label = tr("empty.607d16ee")) { return `<div class="empty">${icon('cube')}<h3>${title}</h3><p>${text}</p><button class="btn primary" data-nav="${action}">${label}${icon('arrow')}</button></div>`; }

function shell(content) {
  const r = ROLES[state.role];
  const nav = [['catalog', 'grid', tr("shell.054f6a8b")], ['orders', 'orders', tr("shell.4fe2c516")], ['packing', 'cube', tr("shell.40087e84")], ['dashboard', 'chart', tr("shell.ce93f50a")]];
  const titles = { catalog: tr("shell.054f6a8b"), orders: tr("shell.4fe2c516"), packing: tr("shell.40087e84"), dashboard: tr("shell.ce93f50a"), account: tr("shell.60590b31"), checkout: tr("shell.95361b0a"), success: tr("shell.5554e8b9") };
  return `<aside class="sidebar"><a class="brand" href="#catalog" data-nav="catalog">${logo}</a><div class="workspace-tag"><span class="live-dot"></span> ${tr("shell.94161b6c")}</div><div class="nav-label">${tr("shell.804173f3")}</div><nav>${nav.map(([id, i, label]) => `<button data-nav="${id}" class="nav-item ${state.page === id ? 'active' : ''}" ${state.page === id ? 'aria-current="page"' : ''}>${icon(i)}<span>${label}</span>${id === 'orders' ? `<span class="nav-count">${account().orders.filter(o => orderStatus(o) !== tr("shell.e99b48a2")).length}</span>` : ''}${id === 'packing' ? '<span class="new-tag">AI</span>' : ''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="service-note">${icon('globe')}<strong>${tr("shell.eff6e378")}</strong><p>${tr("shell.978e23bc")}<br>${tr("shell.5ae0f61e")}</p></div><button class="nav-item ${state.page === 'account' ? 'active' : ''}" data-nav="account">${icon('user')}${tr("shell.60590b31")}</button><button class="nav-item" data-action="help">${icon('help')}${tr("shell.f1937d10")}</button><div class="sidebar-version">POC DEMO <span>V0.1</span></div></div></aside><div class="mobile-scrim" data-action="menu"></div><div class="app-main"><header class="topbar"><div class="breadcrumb"><button class="icon-btn mobile-toggle" data-action="menu" aria-label="${esc(tr("shell.99aaea15"))}">${icon('menu')}</button><span>${tr("shell.489e79fb")}</span>${icon('chevron')}<strong>${titles[state.page]}</strong></div><div class="header-actions">${languageControl()}<span class="demo-pill"><i></i>${tr("shell.600a4eab")}</span><button class="cart-top" data-action="cart">${icon('cart')}<span>${tr("shell.5f21d19e")}</span><b>${countCart()}</b></button><button class="profile" data-action="roles" aria-label="${esc(tr("shell.0d07c81a"))}"><span class="avatar">${r.initials}</span><span><strong>${tr("shell.235ca7f0", {v12: r.label})}</strong><small>${r.name}</small></span>${icon('down')}</button></div></header><main class="content ${state.page === 'dashboard' ? 'dashboard-content' : ''}">${content}</main><footer class="footer"><span>${tr("shell.802c555a")}</span><span>${tr("shell.9d032589")}</span></footer></div>`;
}

function filteredProducts() {
  const q = state.search.toLowerCase().replace(/[\s-]/g, '');
  let list = PRODUCTS.filter(p => (!q || `${Object.values(productSearchNames[p.id] || {}).join(' ')}${p.name}${p.sourceName}${p.en}${p.sourceCode}${p.oe}${p.sku}${p.vehicleText}${fitment(p)}`.toLowerCase().replace(/[\s-]/g, '').includes(q)) && (state.category === tr("load.dc5e5f05") || p.category === state.category) && (!state.vehicle || p.fitments?.some(f => f.brand === state.vehicle)) && (!state.model || p.fitments?.some(f => f.brand === state.vehicle && f.model === state.model)) && (state.supply === 'all' || p.type === state.supply));
  if (state.sort === 'price-up') list.sort((a, b) => price(a, state.role) - price(b, state.role));
  if (state.sort === 'price-down') list.sort((a, b) => price(b, state.role) - price(a, state.role));
  return list;
}
function catalog() {
  const list = filteredProducts(), r = ROLES[state.role];
  const categories = [tr("load.dc5e5f05"), ...new Set(PRODUCTS.map(p => p.category))];
  const models = [...new Set(PRODUCTS.flatMap(p => p.fitments || []).filter(f => f.brand === state.vehicle).map(f => f.model))];
  return `<section class="page-intro"><div><div class="eyebrow">${tr("catalog.4f470252")}</div><h1>${tr("shell.054f6a8b")}<span class="intro-dot">.</span></h1><p>${tr("catalog.85c2ba2f")}</p></div><div class="location-label">${icon('pin')}${tr("catalog.f8d14c74")} <span class="live-dot"></span>${tr("catalog.65e1e15f")}</div></section>
  <section class="catalog-hero"><div class="hero-copy"><div class="hero-kicker">${tr("catalog.9db6b497")}</div><h2>${tr("catalog.b4c2009e")}</h2><p>${tr("catalog.361f0c4c")}</p><button class="hero-link" data-action="stock-filter">${tr("catalog.e9921a9f")}${icon('arrow')}</button></div><div class="hero-art" aria-hidden="true"><span class="hero-orbit"></span><div class="hero-number">01 / ${PRODUCTS.length}</div><img src="./assets/catalog/disc.jpg" alt=""><img class="hero-brake" src="./assets/catalog/brake-pad.jpg" alt=""><div class="hero-art-label">${tr("catalog.870f22f7")}<small>${tr("catalog.c852a8f7")}</small></div></div><div class="hero-side"><span class="hero-side-label">${tr("catalog.1221f223")}</span><strong>${r.label}</strong><span>${r.description}</span><div class="hero-rule"></div><div>${icon('shield')}${tr("catalog.72e9cbc9")}</div><div>${icon('truck')}${tr("catalog.65fd2986")}</div></div></section>
  <section class="search-panel"><form id="search-form" class="search-box">${icon('search')}<input id="search-input" name="search" value="${esc(state.search)}" placeholder="${esc(tr("catalog.6341db0e"))}" aria-label="${esc(tr("catalog.81447af6"))}"><span class="keycap">OE</span><button class="btn primary" type="submit">${tr("catalog.13763299")}</button></form><div class="vehicle-row"><span>${icon('filter')}${tr("catalog.84b3b8de")}</span><label class="sr-only" for="vehicle-filter">${tr("catalog.fc588c7c")}</label><select id="vehicle-filter"><option value="">${tr("catalog.466bc80a")}</option>${[...new Set(PRODUCTS.flatMap(p => p.fitments?.map(f => f.brand) || []))].map(v => `<option value="${esc(v)}" ${state.vehicle === v ? 'selected' : ''}>${esc(localizeBrand(v))}</option>`).join('')}</select>${icon('chevron')}<label class="sr-only" for="model-filter">${tr("catalog.11f84efc")}</label><select id="model-filter" ${!state.vehicle ? 'disabled' : ''}><option value="">${tr("catalog.61971941")}</option>${models.map(m => `<option value="${esc(m)}" ${state.model === m ? 'selected' : ''}>${esc(localizeModel(m))}</option>`).join('')}</select>${state.model ? `<span class="generation-label">${esc(localizeBrand(state.vehicle))}</span>` : `<span class="vehicle-tip">${tr("catalog.a3004085")}</span>`}<button class="text-btn" data-action="reset-filters">${tr("catalog.b63e2829")}</button></div></section>
  <div class="category-tabs" role="group" aria-label="${esc(tr("catalog.09482df6"))}">${categories.map((c, i) => `<button class="${state.category === c ? 'active' : ''}" data-category="${c}">${i === 0 ? icon('grid') : ''}${c}</button>`).join('')}</div>
  <div class="catalog-toolbar"><div class="segmented"><button data-supply="all" class="${state.supply === 'all' ? 'active' : ''}">${tr("catalog.44d43716")}</button><button data-supply="stock" class="${state.supply === 'stock' ? 'active' : ''}"><i class="dot green-dot"></i>${tr("setRole.98e7daf1")}</button><button data-supply="presale" class="${state.supply === 'presale' ? 'active' : ''}"><i class="dot amber-dot"></i>${tr("setRole.e0236cf0")}</button></div><div class="catalog-meta"><span>${tr("catalog.4ae454c3", {v18: formatNumber(list.length)})}</span><label class="sr-only" for="sort-filter">${tr("catalog.da9bf660")}</label><select id="sort-filter"><option value="recommended" ${state.sort === 'recommended' ? 'selected' : ''}>${tr("catalog.7c53cce3")}</option><option value="price-up" ${state.sort === 'price-up' ? 'selected' : ''}>${tr("catalog.42ab0067")}</option><option value="price-down" ${state.sort === 'price-down' ? 'selected' : ''}>${tr("catalog.4925cec3")}</option></select></div></div>
  ${list.length ? `<div class="product-grid">${list.map(p => `<article class="product-card"><button class="product-image" data-product="${p.id}" aria-label="${esc(tr("catalog.238d50e3", {v1: p.name}))}">${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}<img src="${esc(catalogImage(p))}" data-fallback="${esc(catalogFallback(p))}" alt="${esc(p.name)}" loading="lazy"><span class="image-zoom">${icon('plus')}</span></button><div class="product-body"><div class="product-topline"><span class="product-brand">${esc(localizeBrand(p.vehicle))}</span>${badge(p)}</div><button class="product-name" data-product="${p.id}">${p.name}</button><div class="product-fit">${esc(fitment(p))}</div><div class="product-oe">${cw(0)} <span>${esc(p.sourceCode || '—')}</span></div><div class="stock-line">${icon(p.type === 'stock' ? 'cube' : 'clock')}<span>${p.type === 'stock' ? stockText(p) : tr("catalog.11580a5d", {v0: formatDate(p.arrival)})}</span></div><div class="product-purchase"><div><small>${r.description}</small><strong>${money(price(p, state.role))}<span>/ ${unit(p)}</span></strong></div><button class="add-btn" data-add="${p.id}" aria-label="${esc(tr("catalog.e9d5810e", {v20: p.name}))}">${icon('plus')}</button></div></div></article>`).join('')}</div>` : empty(tr("catalog.0eccce3b"), tr("catalog.ab33632c"), 'catalog', tr("catalog.0cf7ed81"))}
  <div class="catalog-bottom">${icon('shield')}${tr("catalog.1d31594f")}<span>${tr("catalog.15386c75")}</span></div>`;
}

function qtyControl(id, qty, scope = 'cart') { return `<div class="quantity"><button data-qty="${id}" data-delta="-1" data-scope="${scope}" aria-label="${esc(tr("qtyControl.2f4c7493"))}" ${qty <= 1 ? 'disabled' : ''}>${icon('minus')}</button><input type="number" min="1" max="${product(id).type === 'stock' ? product(id).stock : 999}" value="${qty}" aria-label="${esc(tr("qtyControl.a574103c", {v6: product(id).name}))}" data-qty-input="${id}" data-scope="${scope}"><button data-qty="${id}" data-delta="1" data-scope="${scope}" aria-label="${esc(tr("qtyControl.e4e7cd4e"))}">${icon('plus')}</button></div>`; }
function cartLines(cart, editable = false) {
  return ['stock', 'presale'].filter(t => cart.some(l => product(l.id).type === t)).map(t => `<section class="cart-group"><div class="group-label">${icon(t === 'stock' ? 'cube' : 'globe')}<strong>${t === 'stock' ? tr("setRole.98e7daf1") : tr("setRole.e0236cf0")}</strong><span>${t === 'stock' ? tr("cartLines.fc9a2a29") : tr("cartLines.b41f32c4")}</span></div>${cart.filter(l => product(l.id).type === t).map(l => { const p = product(l.id); return `<div class="cart-line"><img src="${esc(catalogImage(p))}" data-fallback="${esc(catalogFallback(p))}" alt="${p.name}"><div class="cart-line-info"><strong>${p.name}</strong><small>${esc(localizeBrand(p.vehicle))} · ${esc(p.sourceCode || p.oe)}</small><span>${money(price(p, state.role))} / ${unit(p)}</span>${editable ? qtyControl(p.id, l.qty) : `<small>${tr("cartLines.62d5f916", {v0: l.qty})}</small>`}</div><div class="cart-line-right"><strong>${money(price(p, state.role) * l.qty)}</strong>${editable ? `<button class="icon-btn" data-remove="${p.id}" aria-label="${esc(tr("cartLines.3e914605", {v1: p.name}))}">${icon('trash')}</button>` : ''}</div></div>`; }).join('')}</section>`).join('');
}
function checkout() {
  const cart = account().cart, address = account().address;
  if (!cart.length) return empty(tr("checkout.22d033c8"), tr("checkout.fdbe1dcf"));
  const subtotal = cartTotal(cart, state.role), shipping = state.delivery === 'delivery' ? 12 : 0;
  return `<div class="page-intro"><div><div class="eyebrow">${tr("checkout.20b6df48")}</div><h1>${tr("shell.95361b0a")}</h1><p>${tr("checkout.de585100")}</p></div><button class="btn secondary" data-action="cart">${icon('cart')}${tr("checkout.db8cc6ee")}</button></div><div class="checkout-steps"><span class="done">${icon('check')}${tr("checkout.cdefe264")}</span><i></i><span class="current"><b>2</b>${tr("checkout.6ed44cb2")}</span><i></i><span><b>3</b>${tr("checkout.284d4527")}</span></div><form id="checkout-form" class="checkout-layout"><div class="checkout-main"><section class="panel"><div class="panel-heading"><h2>${tr("checkout.838f9dde")}</h2><span>${tr("checkout.1052562f")}</span></div><div class="delivery-options"><label class="delivery-option ${state.delivery === 'delivery' ? 'selected' : ''}"><input type="radio" name="delivery" value="delivery" ${state.delivery === 'delivery' ? 'checked' : ''}>${icon('truck')}<span><strong>${tr("checkout.dc983712")}</strong><small>${tr("checkout.5199890d", {v5: money(12)})}</small></span><i></i></label><label class="delivery-option ${state.delivery === 'pickup' ? 'selected' : ''}"><input type="radio" name="delivery" value="pickup" ${state.delivery === 'pickup' ? 'checked' : ''}>${icon('pin')}<span><strong>${tr("checkout.2494975d")}</strong><small>${tr("checkout.37365eb7")}</small></span><i></i></label></div><div class="form-grid"><label>${tr("checkout.2425bd4b")}<input name="contact" value="${esc(address.contact)}" required maxlength="60" autocomplete="name"></label><label>${tr("checkout.e02f6e57")}<input name="phone" type="tel" value="${esc(address.phone)}" required maxlength="40" autocomplete="tel"></label><label class="full-width">${state.delivery === 'delivery' ? tr("checkout.e301933e") : tr("checkout.415def20")}${state.delivery === 'delivery' ? `<input name="address" value="${esc(translateSource(canonicalAddress(address.address)))}" required maxlength="200" autocomplete="street-address">` : `<select name="address"><option value="tbilisi">${tr("checkout.f1956b7b")}</option><option value="kutaisi">${tr("checkout.c9dbe23a")}</option></select>`}</label></div></section><section class="panel"><div class="panel-heading"><h2>${tr("checkout.f085c68e")}</h2><span>${tr("checkout.96727ef6", {v13: cart.length, v14: countCart()})}</span></div>${cartLines(cart)}</section><div class="inline-note">${icon('help')}${tr("checkout.e128ff1f")}</div></div><aside class="summary panel"><div class="panel-heading"><h2>${tr("checkout.0d337e14")}</h2></div><div class="summary-role">${icon('shield')}${tr("checkout.573dfcec", {v18: ROLES[state.role].label})}</div><div class="summary-row"><span>${tr("checkout.92493475")}</span><b>${money(subtotal)}</b></div><div class="summary-row"><span>${tr("checkout.485cf254")} <small>${tr("checkout.30fd4ed5")}</small></span><b>${shipping ? money(shipping) : tr("checkout.aa571eee")}</b></div><div class="summary-total"><span>${tr("checkout.961e74fe")} <small>USD</small></span><strong>${money(subtotal + shipping)}</strong></div><div class="payment-note"><strong>${tr("checkout.3934edf1")}</strong><p>${tr("checkout.bd52c4b5")}</p></div><label class="agreement"><input type="checkbox" name="agree" required checked><span>${tr("checkout.e6b29d2f")}</span></label><button type="submit" class="btn primary block">${tr("checkout.674eeca9")}${icon('arrow')}</button><button type="button" class="text-btn block" data-nav="catalog">${tr("checkout.b2741e0e")}</button><p id="checkout-error" class="form-error" role="alert"></p></aside></form>`;
}
function success() {
  const o = account().orders.find(o => o.id === state.selected);
  if (!o) return orders();
  return `<div class="success-panel"><div class="success-icon">${icon('check')}</div><div class="eyebrow">${tr("success.39ae7014")}</div><h1>${tr("success.f27f168c")}</h1><p>${tr("success.f4fb089c")}</p><div class="success-order"><span>${tr("success.8c60a237")}</span><strong>${o.id}</strong><span>${tr("success.d6147504")}</span><strong>${money(o.total)}</strong><span>${tr("checkout.838f9dde")}</span><strong>${o.delivery === 'pickup' ? tr("checkout.2494975d") : tr("checkout.dc983712")}</strong></div><div class="success-actions"><button class="btn primary" data-order="${o.id}">${tr("success.55db7b37")}${icon('arrow')}</button><button class="btn secondary" data-nav="catalog">${tr("success.75d576c2")}</button></div><div class="inline-note">${icon('shield')}${tr("success.540cab41")}</div></div>`;
}

function orders() {
  const all = account().orders, list = all.filter(o => state.orderFilter === tr("load.778fc8f9") || (state.orderFilter === tr("orders.20825179") ? [tr("orders.20825179"), tr("orders.ed67e60b")].includes(orderStatus(o)) : state.orderFilter === tr("orders.8dc7176c") ? ![tr("orders.20825179"), tr("orders.ed67e60b"), tr("shell.e99b48a2")].includes(orderStatus(o)) : orderStatus(o) === tr("shell.e99b48a2")));
  return `<div class="page-intro"><div><div class="eyebrow">${tr("orders.29dc4b91")}</div><h1>${tr("shell.4fe2c516")}<span class="intro-dot">.</span></h1><p>${tr("orders.842cd093")}</p></div><button class="btn primary" data-nav="catalog">${icon('plus')}${tr("orders.6a9b7c21")}</button></div><div class="order-overview">${[[tr("orders.810272ff"), all.length, 'orders'], [tr("orders.394754a2"), all.filter(o => ['pending', 'review'].includes(o.payment)).length, 'clock'], [tr("orders.8dc7176c"), all.filter(o => o.payment === 'paid' && orderStatus(o) !== tr("shell.e99b48a2")).length, 'truck'], [tr("orders.49f7247c"), money(all.reduce((s, o) => s + o.total, 0)), 'chart']].map(([t, v, i]) => `<div>${icon(i)}<span>${t}</span><strong>${v}</strong></div>`).join('')}</div><div class="order-tabs">${[tr("load.778fc8f9"), tr("orders.20825179"), tr("orders.8dc7176c"), tr("shell.e99b48a2")].map(t => `<button data-order-filter="${t}" class="${state.orderFilter === t ? 'active' : ''}">${t}</button>`).join('')}<span>${tr("orders.22aa816b", {v3: ROLES[state.role].name})}</span></div>${list.length ? `<div class="order-list">${list.map(o => `<article class="order-card"><div class="order-card-head"><div><strong>${o.id}</strong><span>${date(o.created)}</span></div><span class="badge ${orderStatus(o) === tr("shell.e99b48a2") ? 'green' : o.payment !== 'paid' ? 'amber' : 'blue'}">${orderStatus(o)}</span></div><div class="order-card-body"><div class="order-products">${o.lines.slice(0, 3).map(l => `<img src="${esc(catalogImage(product(l.id)))}" data-fallback="${esc(catalogFallback(product(l.id)))}" alt="${product(l.id).name}">`).join('')}<div><strong>${tr("orders.7b34a69b", {v5: product(o.lines[0].id).name, v6: o.lines.length})}</strong><span>${tr("orders.797bbae4", {v7: o.lines.reduce((s, l) => s + l.qty, 0), v8: o.delivery === 'pickup' ? tr("checkout.2494975d") : tr("checkout.dc983712")})}</span><span class="order-types">${orderGroups(o).map(t => `<span>${t === 'stock' ? tr("orders.0a97ff03") : tr("orders.dfaf0d7c")}</span>`).join('')}</span></div></div><div class="order-amount"><small>${tr("checkout.961e74fe")}</small><strong>${money(o.total)}</strong></div><button class="btn secondary" data-order="${o.id}">${tr("orders.86940ce5")}${icon('chevron')}</button></div></article>`).join('')}</div>` : empty(tr("orders.608087d0"), tr("orders.5b239950"))}`;
}

function packingView() {
  const b = BATCHES[state.batch], basic = packing(b, false), optimized = packing(b, true), result = state.packed ? optimized : basic;
  return `<div class="page-intro"><div><div class="eyebrow">${tr("packingView.768bf8c2")}</div><h1>${tr("packingView.ef668a17")}<span class="intro-dot">.</span></h1><p>${tr("packingView.8f7890de")}</p></div><span class="badge blue">${icon('bolt')}${tr("packingView.8e10af37")}</span></div><div class="packing-layout"><section class="panel packing-config"><div class="panel-heading"><h2>${tr("packingView.bd549fe0")}</h2></div><label class="field-label" for="batch-select">${tr("packingView.bfb30806")}</label><select id="batch-select">${Object.entries(BATCHES).map(([id, x]) => `<option value="${id}" ${state.batch === id ? 'selected' : ''}>${x.label}</option>`).join('')}</select><div class="batch-meta"><span>${b.id}</span><span>${tr("packingView.473ecb82", {v3: formatDate(b.date)})}</span></div><div class="container-type">${icon('cube')}<div><strong>${tr("packingView.bf6c08b3")}</strong><small>${tr("packingView.ea722709")}</small></div></div><h3 class="small-heading">${tr("packingView.b38d5bb0")}</h3><div class="packing-parts">${b.lines.map(l => `<div><img src="${esc(catalogImage(product(l.id)))}" data-fallback="${esc(catalogFallback(product(l.id)))}" alt=""><span><strong>${product(l.id).name}</strong><small>${tr("packingView.e6270a64", {v2: l.qty, v3: product(l.id).stack ? tr("packingView.2d0dcc46") : tr("packingView.a169861a")})}</small></span><b>${formatNumber(round(product(l.id).volume * l.qty))}<small>m³</small></b></div>`).join('')}</div><div class="batch-total"><span>${tr("packingView.ad3e86c9")} <b>${formatNumber(result.volume)} m³</b></span><span>${tr("packingView.7e81be19")} <b>${formatNumber(result.weight)} kg</b></span></div><button class="btn primary block" data-action="pack" ${state.running ? 'disabled' : ''}>${icon('bolt')}${state.running ? tr("packingView.aa7eaf93") : state.packed ? tr("packingView.9aacb25c") : tr("packingView.8d33483e")}</button><p class="packing-disclaimer">${tr("packingView.363e1c06")}</p></section><section class="packing-preview"><div class="packing-preview-head"><span><span class="live-dot"></span>${state.packed ? tr("packingView.622c5d95") : tr("packingView.40d90180")}</span><span>40HQ / ${b.id}</span></div><div class="container-stage ${state.packed ? 'optimized' : ''} ${state.running ? 'scanning' : ''}"><div class="container-ground"></div><div class="container-3d"><div class="container-floor"></div><div class="container-back"></div><div class="container-side"></div><div class="container-boxes">${Array.from({ length: state.packed ? 30 : 22 }, (_, i) => `<div class="cargo-box box-${i % 4}" style="--col:${i % 6};--row:${Math.floor(i / 6)};--delay:${i * 18}ms"><span>${['BR', 'FL', 'SU', 'LT'][i % 4]}</span></div>`).join('')}</div><div class="container-front"><span>Starlink</span><small>${tr("packingView.360640a9")}</small></div></div><div class="stage-label"><span>12.03 m</span><span>2.35 m</span></div><div class="scan-line"></div></div><div class="packing-preview-foot"><span><i class="dot green-dot"></i>${tr("packingView.4ed9dad3")}</span><span><i class="dot amber-dot"></i>${tr("packingView.e9731994")}</span><span>${tr("packingView.918f785c")}</span></div><div class="packing-results"><div><small>${tr("packingView.4b8cd818")}</small><strong>${result.utilization}<span>%</span></strong><p>${state.packed ? tr("packingView.41004018") : tr("packingView.677919e5")}</p></div><div><small>${tr("packingView.7f0db2de")}</small><strong>${formatNumber(result.free)}<span>m³</span></strong><p>${tr("packingView.fd24ee7b")}</p></div><div><small>${tr("packingView.7cf13b47")}</small><strong>${result.unloaded.reduce((s, l) => s + l.qty, 0)}<span>${tr("packingView.04d7e6fc")}</span></strong><p>${result.unloaded.length ? tr("packingView.75a536d2") : tr("packingView.496012b9")}</p></div></div></section></div><section class="panel comparison"><div class="panel-heading"><h2>${tr("packingView.59749924")}</h2><span>${tr("packingView.13bb92bf")}</span></div><div class="comparison-grid">${[[tr("packingView.472edfbf"), basic, false], [tr("packingView.e0afd686"), optimized, true]].map(([label, v, active]) => `<div class="comparison-item ${active && state.packed ? 'highlight' : ''}"><div><strong>${label}</strong><span>${active ? tr("packingView.a7e4f307") : tr("packingView.69812ed2")}</span></div><div class="packing-bar"><i style="width:${state.packed || !active ? v.utilization : 0}%"></i></div><p>${tr("packingView.c63ea273")} <b>${state.packed || !active ? v.utilization + '%' : tr("packingView.aef41043")}</b><span>${tr("packingView.f846838f", {v5: state.packed || !active ? v.unloaded.reduce((s, l) => s + l.qty, 0) + (getLanguage() === 'zh' ? '' : ' ') + tr("packingView.0dc92dfb") : '—'})}</span></p></div>`).join('')}</div>${state.packed ? `<div class="packing-outcome">${icon('check')}${tr("packingView.ecbbad88", {v1: optimized.unloaded.length ? optimized.unloaded.map(l => tr("packingView.87647d55", {v0: product(l.id).name, v1: l.qty})).join(getLanguage() === 'zh' ? '、' : ', ') + (getLanguage() === 'zh' ? '' : ' ') + tr("packingView.cb12d8f9") : tr("packingView.fac80afa")})}</div>` : ''}</section>`;
}

function dashboard() {
  return `<div class="dashboard-top"><div><span class="eyebrow">${tr("dashboard.a0d4af37")}</span><h1>${tr("dashboard.58730e61")}</h1><p>${tr("dashboard.9ce46aa6")}</p></div><div class="dashboard-clock"><span class="live-dot"></span>${tr("dashboard.af50e607")} <strong id="live-clock"></strong><button class="icon-btn" data-action="fullscreen" aria-label="${esc(tr("dashboard.793a519b"))}">${icon('grid')}</button></div></div><div class="dash-metrics">${[[formatNumber(42), tr("dashboard.ca44a5ef"), tr("dashboard.b02fc64a"), 'user'], [formatNumber(3248), tr("dashboard.4ead600b"), tr("dashboard.904aaf52"), 'cube'], [money(128460), tr("dashboard.64629691"), tr("dashboard.a774b144"), 'chart'], [formatNumber(6), tr("dashboard.0fa648e1"), tr("dashboard.cf44f9fb"), 'truck']].map(([v, t, foot, i]) => `<div>${icon(i)}<span>${t}</span><strong>${v}</strong><small>${foot}</small></div>`).join('')}</div><div class="dash-grid"><section class="dash-panel map-panel"><div class="dash-panel-head"><h2>${tr("dashboard.4b77025a")}</h2><span>${tr("dashboard.4536d328")}</span></div><div class="georgia-map"><svg viewBox="0 0 680 310" role="img" aria-label="${esc(tr("dashboard.e158fb2e"))}"><defs><pattern id="mapgrid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0v28" fill="none" stroke="#315260" stroke-width=".5"/></pattern><linearGradient id="mapfill"><stop stop-color="#1b4a5b"/><stop offset="1" stop-color="#214756"/></linearGradient></defs><rect width="680" height="310" fill="url(#mapgrid)"/><path d="m78 66 67-16 83 34 41-8 39 21 37-12 50 29 30-8 36 34 62 18 46 50-16 28-46-11-38 24-57-15-35 10-61-18-45 7-29-24-55-10-32-38-37-13-34-45Z" fill="url(#mapfill)" stroke="#4b7b8d" stroke-width="1.5"/><path d="M186 171Q278 60 458 199M186 171Q254 168 304 145M458 199l50 30M304 145Q372 159 458 199" fill="none" stroke="#6eacb9" stroke-dasharray="5 6"/><g class="map-point"><circle cx="458" cy="199" r="22"/><circle cx="458" cy="199" r="6"/><text x="479" y="191">${tr("dashboard.69a626d3")}</text><text x="479" y="209" class="map-sub">${tr("dashboard.824ff6fa")}</text></g><g class="map-point"><circle cx="304" cy="145" r="17"/><circle cx="304" cy="145" r="5"/><text x="310" y="113">${tr("dashboard.24b1c8b6")}</text><text x="310" y="131" class="map-sub">${tr("dashboard.1c48a244")}</text></g><g class="map-point"><circle cx="186" cy="171" r="16"/><circle cx="186" cy="171" r="5"/><text x="113" y="217">${tr("dashboard.2b895680")}</text><text x="113" y="235" class="map-sub">${tr("dashboard.3dce36cf")}</text></g><g class="map-point"><circle cx="508" cy="229" r="13"/><circle cx="508" cy="229" r="4"/><text x="445" y="264">${tr("dashboard.e8f010a6")}</text></g><text x="80" y="274" class="map-sea">${tr("dashboard.c4cd4fee")}</text></svg></div><div class="map-legend"><span><i></i>${tr("dashboard.9df4dd17")}</span><span>${tr("dashboard.df60522d")}</span></div></section><section class="dash-panel"><div class="dash-panel-head"><h2>${tr("dashboard.76a407bd")}</h2><span>${tr("dashboard.64629691")}</span></div><div class="donut-wrap"><div class="donut"><div><strong>100<span>%</span></strong><small>${tr("dashboard.33709968")}</small></div></div></div><div class="source-legend">${[[tr("dashboard.56149e6e"), '70%', money(89922), 'mint'], [tr("dashboard.71bb2291"), '20%', money(25692), 'orange'], [tr("dashboard.270ec9ed"), '10%', money(12846), 'blue']].map(([n, v, a, c]) => `<div><i class="${c}"></i><span>${n}</span><b>${v}</b><small>${a}</small></div>`).join('')}</div></section><section class="dash-panel"><div class="dash-panel-head"><h2>${tr("dashboard.c5ae639f")}</h2><span>${tr("dashboard.c881b45a")}</span></div><div class="bar-chart">${[38, 47, 42, 65, 76, 108.3, 128.46].map((n, i) => `<div><span>${formatNumber(n, {maximumFractionDigits: i > 4 ? 1 : 0})}</span><i style="height:${n / 130 * 145}px"></i><small>${formatMonth(i + 4)}</small></div>`).join('')}</div><div class="chart-foot"><span>${tr("dashboard.aa68294e")}</span><b>${tr("dashboard.9f40e333")}</b></div></section><section class="dash-panel"><div class="dash-panel-head"><h2>${tr("dashboard.0fce2c46")}</h2><button class="text-btn" data-nav="packing">${tr("dashboard.c0da0b2d")}${icon('arrow')}</button></div><div class="container-progress-list">${[['CN-GE-2610-A', tr("checkout.dc983712"), 100, tr("dashboard.bc728216")], ['CN-GE-2610-B', tr("dashboard.a56dea3c"), 88, tr("dashboard.935a77ac")], ['CN-GE-2611-A', tr("dashboard.534c9f12"), 72, tr("dashboard.151bfd0b")], ['CN-GE-2611-B', tr("dashboard.fcf6e949"), 61, tr("dashboard.3e32da40")]].map(([id, s, n, t]) => `<div><span><strong>${id}</strong><small>${s}</small></span><div class="dash-progress"><i style="width:${n}%"></i></div><span><b>${n}%</b><small>${t}</small></span></div>`).join('')}</div><p class="dash-subnote">${tr("dashboard.e0b97450")}</p></section></div><div class="dash-bottom"><span><i class="live-dot"></i>${tr("dashboard.34537d1f")}</span><span>${tr("dashboard.bad46a5b")}</span></div>`;
}
function accountView() {
  const r = ROLES[state.role], a = account().address;
  return `<div class="page-intro"><div><div class="eyebrow">${tr("accountView.10247b7f")}</div><h1>${tr("shell.60590b31")}<span class="intro-dot">.</span></h1><p>${tr("accountView.e8c67870")}</p></div><button class="btn secondary" data-action="roles">${tr("accountView.37f4b9b8")}${icon('arrow')}</button></div><div class="account-layout"><section class="account-card panel"><span class="avatar large">${r.initials}</span><span class="badge green">${icon('shield')}${tr("accountView.dd88b803")}</span><h2>${r.name}</h2><p>${tr("accountView.0276d7e1", {v4: r.label})}</p><div class="account-price"><small>${tr("accountView.58286723")}</small><strong>${r.description}</strong><span>${tr("accountView.0e36e50e", {v6: formatNumber(r.factor, {minimumFractionDigits: 2, maximumFractionDigits: 2})})}</span></div><div class="account-tip">${icon('help')}${tr("accountView.d9abf2d9")}</div><button class="text-btn" data-action="logout">${icon('logOut')}${tr("accountView.d2bfa919")}</button></section><section class="panel"><div class="panel-heading"><h2>${tr("accountView.01421504")}</h2><span>${tr("accountView.ae16b2d8")}</span></div><form id="address-form" class="address-form"><label>${tr("checkout.2425bd4b")}<input name="contact" required value="${esc(a.contact)}" maxlength="60" autocomplete="name"></label><label>${tr("checkout.e02f6e57")}<input name="phone" type="tel" required value="${esc(a.phone)}" maxlength="40" autocomplete="tel"></label><label>${tr("checkout.e301933e")}<input name="address" required value="${esc(translateSource(canonicalAddress(a.address)))}" maxlength="200" autocomplete="street-address"></label><button class="btn primary" type="submit">${tr("accountView.86ee8c28")}${icon('check')}</button><p class="form-error" id="address-error" role="alert"></p></form><div class="account-order-shortcut"><div>${icon('orders')}<span><strong>${tr("accountView.b09e0cac")}</strong><small>${tr("accountView.d5b6d4a7", {v14: account().orders.length})}</small></span></div><button class="text-btn" data-nav="orders">${tr("orders.86940ce5")}${icon('arrow')}</button></div></section></div>`;
}
function render() {
  applyDocumentLanguage();
  account();
  const pages = { catalog, orders, packing: packingView, dashboard, account: accountView, checkout, success };
  $('#app').innerHTML = shell(pages[state.page]());
  document.title = `${{catalog:tr("shell.054f6a8b"),orders:tr("shell.4fe2c516"),packing:tr("shell.40087e84"),dashboard:tr("shell.ce93f50a"),account:tr("shell.60590b31"),checkout:tr("checkout.6ed44cb2"),success:tr("shell.5554e8b9")}[state.page]} · Starlink`;
  updateClock();
}
function updateClock() { const el = $('#live-clock'); if (el) el.textContent = formatTime(new Date()); }
setInterval(updateClock, 1000);

function openModal(type, id) {
  lastFocus = document.activeElement;
  state.modal = type;
  if (id) state.selected = id;
  renderModal();
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => $('#overlay-root button, #overlay-root input, #overlay-root select')?.focus());
}
function closeModal(restore = true) { state.modal = null; $('#overlay-root').innerHTML = ''; document.body.classList.remove('modal-open'); $('#app').inert = false; if (state.page === 'checkout') render(); if (restore && lastFocus?.isConnected) lastFocus.focus(); }
function productModal() {
  const p = product(state.selected);
  return `<div class="detail-layout"><div class="detail-image"><span class="product-brand">${esc(localizeBrand(p.vehicle))}</span><img src="${esc(catalogImage(p))}" data-fallback="${esc(catalogFallback(p))}" alt="${esc(tr("productModal.475a7577", {v2: p.name}))}"></div><div class="detail-copy">${badge(p)}<div class="eyebrow">${p.name}</div><h2 id="dialog-title">${p.name}</h2><p>${esc(fitment(p))}</p><dl class="spec-list"><div><dt>${cw(0)}</dt><dd>${esc(p.sourceCode || '—')}</dd></div><div><dt>${tr("productModal.abce889e")}</dt><dd>${p.sku}</dd></div><div><dt>${tr("productModal.53af00e1")}</dt><dd>${p.spec}</dd></div><div><dt>${tr("productModal.3d1afb56")}</dt><dd>${p.type === 'stock' ? stockText(p, true) : tr("productModal.83417f14")}</dd></div><div><dt>${tr("productModal.7dda5677")}</dt><dd>${p.type === 'stock' ? tr("productModal.7a48f949") : tr("productModal.e51b5aec", {v0: formatDate(p.arrival)})}</dd></div></dl><div class="catalog-description"><strong>${cw(2)}</strong><p>${esc(p.description)}</p><small>${cw(1)}：${esc(p.vehicleText || fitment(p))} · #${p.sourceRow}</small></div><div class="detail-price"><small>${ROLES[state.role].description}</small><strong>${money(price(p, state.role))}<span>/ ${unit(p)}</span></strong></div><div class="detail-buy">${qtyControl(p.id, 1, 'detail')}<button class="btn primary" data-add="${p.id}" data-detail="true">${icon('cart')}${tr("productModal.8ed7df28")}</button></div><div class="inline-note">${icon('shield')}${tr("productModal.4ef3bc2b")}</div></div></div>`;
}
function rolesModal(logout = false) {
  return `<div class="roles-content">${logo}<div class="eyebrow">${tr("rolesModal.e1d68c9a")}</div><h2 id="dialog-title">${logout ? tr("rolesModal.4e1b7271") : tr("shell.0d07c81a")}</h2><p>${tr("rolesModal.12e18e5e")}</p><div class="role-options">${Object.entries(ROLES).map(([id, r]) => `<button data-role="${id}" class="role-option ${id === state.role ? 'selected' : ''}"><span class="avatar">${r.initials}</span><span><strong>${r.label}</strong><small>${r.name}</small><em>${tr("rolesModal.740295bb", {v5: r.description, v6: formatNumber(r.factor, {minimumFractionDigits: 2, maximumFractionDigits: 2})})}</em></span>${icon(id === state.role ? 'check' : 'arrow')}</button>`).join('')}</div><div class="inline-note">${icon('help')}${tr("rolesModal.3305bf08")}</div></div>`;
}
function cartModal() {
  const cart = account().cart;
  return `<div class="drawer-header"><div><span class="eyebrow">${tr("cartModal.83a99fcb")}</span><h2 id="dialog-title">${tr("shell.5f21d19e")} <small>${tr("cartModal.0d0c2d62", {v0: cart.length, v1: countCart()})}</small></h2></div></div><div class="drawer-body">${cart.length ? cartLines(cart, true) : empty(tr("cartModal.d9c3a39f"), tr("cartModal.e9a6a9da"))}</div>${cart.length ? `<div class="drawer-footer"><div><span>${tr("cartModal.10642a46")} <small>USD</small></span><strong>${money(cartTotal(cart, state.role))}</strong></div><p>${tr("cartModal.70d3632a", {v1: ROLES[state.role].label})}</p><button class="btn primary block" data-nav="checkout">${tr("cartModal.8e290e58")}${icon('arrow')}</button></div>` : ''}`;
}
function orderModal() {
  const o = account().orders.find(o => o.id === state.selected);
  if (!o) return `<h2 id="dialog-title">${tr("orderModal.61e2de20")}</h2><p>${tr("orderModal.c018e59d")}</p>`;
  const address = o.address;
  return `<div class="order-detail"><div class="eyebrow">${tr("orderModal.2c6371d5")}</div><div class="order-detail-title"><div><h2 id="dialog-title">${o.id}</h2><p>${tr("orderModal.dd997a3a", {v1: date(o.created), v2: ROLES[o.role].label})}</p></div><span class="badge ${o.payment === 'paid' ? 'green' : 'amber'}">${orderStatus(o)}</span></div><div class="order-payment"><div>${icon('shield')}<span><strong>${{ pending: tr("orderModal.150a1205"), review: tr("orderModal.f9373021"), paid: tr("orderModal.2ff7d6ea") }[o.payment]}</strong><small>${tr("orderModal.a3c03261", {v7: money(o.total)})}</small></span></div>${o.payment !== 'paid' ? `<button class="btn primary" data-payment="${o.id}">${o.payment === 'pending' ? tr("orderModal.7fa56b0c") : tr("orderModal.3097a4f7")}${icon('arrow')}</button>` : `<span class="badge green">${tr("orderModal.e378767c")}</span>`}</div><div class="order-delivery-info">${icon(o.delivery === 'pickup' ? 'pin' : 'truck')}<span><strong>${o.delivery === 'pickup' ? tr("checkout.2494975d") : tr("checkout.dc983712")} · ${esc(address.contact)} · ${esc(address.phone)}</strong><small>${esc(translateSource(canonicalAddress(address.address)))}</small></span></div>${orderGroups(o).map(t => { const timeline = stages(t, o.delivery), step = o.stages[t]; return `<section class="fulfillment"><div class="panel-heading"><h3>${t === 'stock' ? tr("orderModal.8f754075") : tr("orderModal.a422ceec")}</h3>${t === 'presale' ? `<span>${tr("orderModal.7aef1806", {v0: [...new Set(o.lines.filter(l => l.type === t).map(l => product(l.id).arrival))].map(d => tr("orderModal.a6b5bc55", {v0: formatDate(d)})).join(' / ')})}</span>` : `<span>${tr("orderModal.1a5ec8e0")}</span>`}</div><div class="timeline">${timeline.map((n, i) => `<div class="${i < step ? 'done' : i === step ? 'current' : ''}"><i>${i < step ? icon('check') : i + 1}</i><strong>${n}</strong><small>${i < step ? tr("orderModal.b07a0a90") : i === step ? (o.payment === 'paid' ? tr("orderModal.4711c5fa") : tr("orderModal.faa6dd38")) : tr("orderModal.59a9eb4e")}</small></div>`).join('')}</div><div class="fulfillment-footer"><small>${tr("orderModal.9774dd22")}</small><button class="text-btn" data-advance="${o.id}" data-type="${t}" ${o.payment !== 'paid' || step === timeline.length - 1 ? 'disabled' : ''}>${step === timeline.length - 1 ? tr("orderModal.3cede4a8") : tr("orderModal.4078c6c9")}${icon('arrow')}</button></div></section>`; }).join('')}<div class="panel-heading"><h3>${tr("orderModal.17804aeb")}</h3><span>${tr("orderModal.b1d8c223")}</span></div><div class="order-detail-lines">${o.lines.map(l => `<div><img src="${esc(catalogImage(product(l.id)))}" data-fallback="${esc(catalogFallback(product(l.id)))}" alt=""><span><strong>${product(l.id).name}</strong><small>OE ${product(l.id).oe}</small></span><span>${money(l.unitPrice)} × ${l.qty}</span><b>${money(l.unitPrice * l.qty)}</b></div>`).join('')}</div><div class="order-totals"><span>${tr("checkout.92493475")} <b>${money(o.subtotal)}</b></span><span>${tr("checkout.485cf254")} <b>${money(o.shipping)}</b></span><strong>${tr("checkout.961e74fe")} <b>${money(o.total)}</b></strong></div></div>`;
}
function helpModal() { return `<div class="help-content"><div class="eyebrow">${tr("helpModal.cc811256")}</div><h2 id="dialog-title">${tr("helpModal.a1c2df90")}</h2><p>${tr("helpModal.8f22a1de")}</p><ol><li><strong>${tr("helpModal.0be718ca")}</strong><span>${tr("helpModal.4e8776f5")}</span></li><li><strong>${tr("checkout.284d4527")}</strong><span>${tr("helpModal.38b789bf")}</span></li><li><strong>${tr("helpModal.358b95e1")}</strong><span>${tr("helpModal.2cde2800")}</span></li><li><strong>${tr("helpModal.eb086daf")}</strong><span>${tr("helpModal.a90ab642")}</span></li></ol><div class="inline-note">${icon('help')}${tr("helpModal.27044b04")}</div><button class="btn primary" data-action="close">${tr("helpModal.2bc19ec6")}${icon('arrow')}</button></div>`; }
function renderModal() {
  if (!state.modal) return;
  $('#app').inert = true;
  const content = { product: productModal, roles: rolesModal, login: () => rolesModal(true), cart: cartModal, order: orderModal, help: helpModal }[state.modal]();
  $('#overlay-root').innerHTML = `<div class="overlay ${state.modal === 'cart' ? 'drawer-overlay' : ''}"><div class="modal-backdrop" data-action="close"></div><section class="modal ${state.modal === 'cart' ? 'drawer' : ''} ${state.modal === 'product' ? 'product-modal' : ''} ${state.modal === 'order' ? 'order-modal' : ''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="modal-close icon-btn" data-action="close" aria-label="${esc(tr("renderModal.81f18d4d"))}">${icon('close')}</button>${content}</section></div>`;
}

function updateCartNumbers(id, normalizeInput = true) {
  const line = account().cart.find(l => l.id === id);
  const input = $(`#overlay-root [data-qty-input="${id}"][data-scope="cart"]`);
  if (!line || !input) return;
  const p = product(id);
  if (normalizeInput) input.value = line.qty;
  input.previousElementSibling.disabled = line.qty === 1;
  input.nextElementSibling.disabled = line.qty >= (p.type === 'stock' ? p.stock : 999);
  input.closest('.cart-line').querySelector('.cart-line-right strong').textContent = money(price(p, state.role) * line.qty);
  $('.drawer-footer strong').textContent = money(cartTotal(account().cart, state.role));
  $('.drawer-header h2 small').textContent = tr("cartModal.0d0c2d62", {v0: account().cart.length, v1: countCart()});
  $('.cart-top b').textContent = countCart();
}
function changeQty(id, amount, scope, direct = false) {
  const p = product(id), max = p.type === 'stock' ? p.stock : 999;
  if (scope === 'detail') {
    const input = $('[data-qty-input][data-scope="detail"]');
    const qty = direct ? amount : Number(input.value) + amount;
    if (!Number.isInteger(qty) || qty < 1 || qty > max) { toast(tr("changeQty.c1d76d5b", {v0: max}), true); input.value = Math.max(1, Math.min(max, Math.floor(Number(input.value) || 1))); return; }
    input.value = qty; input.previousElementSibling.disabled = qty === 1; return;
  }
  const line = account().cart.find(l => l.id === id);
  if (!line) return;
  const qty = direct ? amount : line.qty + amount;
  if (!Number.isInteger(qty) || qty < 1 || qty > max) { toast(tr("changeQty.c1d76d5b", {v0: max}), true); updateCartNumbers(id); return; }
  if (qty !== line.qty) { line.qty = qty; persist(); }
  updateCartNumbers(id);
}
function addCart(id, qty = 1) {
  const cart = account().cart, old = cart.find(l => l.id === id), next = old ? cart.map(l => l.id === id ? { ...l, qty: l.qty + qty } : l) : [...cart, { id, qty }];
  try { validateCart(next); account().cart = next; persist(); render(); toast(tr("addCart.6022b87b", {v0: product(id).name, v1: qty})); } catch (e) { toast(localizeError(e), true); }
}

document.addEventListener('click', async e => {
  const btn = e.target.closest('button, a[data-nav], [data-action]');
  if (!btn || btn.disabled) return;
  if (btn.dataset.nav) { e.preventDefault(); if (btn.dataset.nav === 'catalog' && !filteredProducts().length) { state.search = ''; state.category = tr("load.dc5e5f05"); state.vehicle = ''; state.model = ''; state.supply = 'all'; } navigate(btn.dataset.nav); return; }
  if (btn.dataset.product) return openModal('product', btn.dataset.product);
  if (btn.dataset.add) { const qty = btn.dataset.detail ? Number($('[data-qty-input][data-scope="detail"]').value) : 1; addCart(btn.dataset.add, qty); return; }
  if (btn.dataset.category) { state.category = btn.dataset.category; render(); return; }
  if (btn.dataset.supply) { state.supply = btn.dataset.supply; render(); return; }
  if (btn.dataset.role) return setRole(btn.dataset.role);
  if (btn.dataset.qty) return changeQty(btn.dataset.qty, Number(btn.dataset.delta), btn.dataset.scope);
  if (btn.dataset.remove) { account().cart = account().cart.filter(l => l.id !== btn.dataset.remove); persist(); render(); renderModal(); return; }
  if (btn.dataset.orderFilter) { state.orderFilter = btn.dataset.orderFilter; render(); return; }
  if (btn.dataset.order) return openModal('order', btn.dataset.order);
  if (btn.dataset.payment) {
    const o = account().orders.find(o => o.id === btn.dataset.payment);
    if (!o) return;
    o.payment = o.payment === 'pending' ? 'review' : 'paid'; persist(); render(); renderModal(); toast(o.payment === 'review' ? tr("addCart.51c89627") : tr("addCart.886617d2")); return;
  }
  if (btn.dataset.advance) {
    const index = account().orders.findIndex(o => o.id === btn.dataset.advance);
    try { account().orders[index] = advanceOrder(account().orders[index], btn.dataset.type); persist(); render(); renderModal(); toast(tr("addCart.55a282bf")); } catch (e) { toast(localizeError(e), true); } return;
  }
  const action = btn.dataset.action;
  if (action === 'close') return closeModal();
  if (['roles', 'cart', 'help'].includes(action)) return openModal(action);
  if (action === 'menu') return document.body.classList.toggle('mobile-nav');
  if (action === 'logout') return openModal('login');
  if (action === 'stock-filter') { state.supply = 'stock'; render(); $('.search-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (action === 'reset-filters') { state.search = ''; state.category = tr("load.dc5e5f05"); state.vehicle = ''; state.model = ''; state.supply = 'all'; state.sort = 'recommended'; render(); }
  if (action === 'pack') { state.running = true; state.packed = false; render(); const batch = state.batch; await new Promise(r => setTimeout(r, 1200)); state.running = false; if (state.batch === batch) state.packed = true; if (state.page === 'packing') render(); toast(tr("addCart.2f23a196")); }
  if (action === 'fullscreen') { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { toast(tr("addCart.5ebcc1eb"), true); } }
});
function switchLanguage(next) {
  const categoryIndex = [tr('load.dc5e5f05'), ...new Set(PRODUCTS.map(p => p.category))].indexOf(state.category);
  const orderFilterIndex = [tr('load.778fc8f9'), tr('orders.20825179'), tr('orders.8dc7176c'), tr('shell.e99b48a2')].indexOf(state.orderFilter);
  const fields = [...document.querySelectorAll('form input, form select, [data-scope="detail"][data-qty-input]')].map(el => ({ form: el.closest('form')?.id, name: el.name, id: el.dataset.qtyInput, value: el.value, checked: el.checked, type: el.type }));
  const scroll = window.scrollY;
  if (!setLanguage(next)) return;
  refreshDisplayData();
  state.category = [tr('load.dc5e5f05'), ...new Set(PRODUCTS.map(p => p.category))][categoryIndex] || tr('load.dc5e5f05');
  state.orderFilter = [tr('load.778fc8f9'), tr('orders.20825179'), tr('orders.8dc7176c'), tr('shell.e99b48a2')][orderFilterIndex] || tr('load.778fc8f9');
  render();
  if (state.modal) renderModal();
  for (const field of fields) {
    const el = field.form ? [...document.getElementById(field.form)?.elements || []].find(el => el.name === field.name && el.type === field.type && (field.type !== 'radio' || el.value === field.value)) : document.querySelector('[data-scope="detail"][data-qty-input]');
    if (!el) continue;
    if (field.type === 'checkbox' || field.type === 'radio') el.checked = field.checked;
    else el.value = field.name === 'address' ? translateSource(canonicalAddress(field.value)) : field.value;
  }
  window.scrollTo({ top: scroll, behavior: 'instant' });
  document.querySelector(state.modal ? '.modal-close' : '.topbar [data-language]')?.focus();
}

document.addEventListener('change', e => {
  const el = e.target;
  if (el.matches('[data-language]')) return switchLanguage(el.value);
  if (el.id === 'vehicle-filter') { state.vehicle = el.value; state.model = ''; render(); }
  if (el.id === 'model-filter') { state.model = el.value; render(); }
  if (el.id === 'sort-filter') { state.sort = el.value; render(); }
  if (el.dataset.qtyInput) changeQty(el.dataset.qtyInput, Number(el.value), el.dataset.scope, true);
  if (el.id === 'batch-select') { state.batch = el.value; state.packed = false; render(); }
  if (el.name === 'delivery') {
    const form = $('#checkout-form');
    account().address = { contact: form.elements.contact.value, phone: form.elements.phone.value, address: state.delivery === 'delivery' ? canonicalAddress(form.elements.address.value) : account().address.address };
    state.delivery = el.value; render();
  }
});
document.addEventListener('invalid', e => {
  if (e.target.form && e.target.setCustomValidity) e.target.setCustomValidity(e.target.type === 'checkbox' ? tr('addCart.1968e30d') : tr('addCart.edf27768'));
}, true);
document.addEventListener('input', e => {
  e.target.setCustomValidity?.('');
  const input = e.target;
  if (!input.dataset.qtyInput || input.dataset.scope !== 'cart') return;
  const p = product(input.dataset.qtyInput), qty = Number(input.value);
  const line = account().cart.find(l => l.id === p.id);
  if (!line || !Number.isInteger(qty) || qty < 1 || qty > (p.type === 'stock' ? p.stock : 999)) return;
  line.qty = qty;
  persist();
  updateCartNumbers(p.id, false);
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target, data = new FormData(form);
  if (form.id === 'search-form') { state.search = data.get('search').trim(); render(); return; }
  if (form.id === 'checkout-form') {
    try {
      if (!data.get('agree')) throw new Error(tr("addCart.1968e30d"));
      const address = { contact: data.get('contact').trim(), phone: data.get('phone').trim(), address: state.delivery === 'pickup' ? ({tbilisi: '第比利斯中央仓 · Kakheti Highway 12', kutaisi: '库塔伊西合作仓 · Chavchavadze Ave 34'}[data.get('address')] || data.get('address').trim()) : canonicalAddress(data.get('address').trim()) };
      const o = createOrder(account().cart, state.role, state.delivery, address);
      const prevCart = account().cart; account().orders.unshift(o); account().cart = [];
      if (!persist()) { account().orders.shift(); account().cart = prevCart; throw new Error(tr("addCart.d4fa5fd9")); }
      state.selected = o.id; navigate('success');
    } catch (error) { $('#checkout-error').textContent = localizeError(error); }
  }
  if (form.id === 'address-form') {
    const a = Object.fromEntries(['contact', 'phone', 'address'].map(k => [k, k === 'address' ? canonicalAddress(data.get(k).trim()) : data.get(k).trim()]));
    if (Object.values(a).some(v => !v)) { $('#address-error').textContent = tr("addCart.edf27768"); return; }
    const prev = account().address; account().address = a;
    if (persist()) toast(tr("addCart.ff894bcc")); else account().address = prev;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); document.body.classList.remove('mobile-nav'); }
  if (e.key === 'Tab' && state.modal) {
    const nodes = [...document.querySelectorAll('.modal button:not([disabled]), .modal input:not([disabled]), .modal select:not([disabled]), .modal a[href]')].filter(n => n.getClientRects().length);
    const first = nodes[0], last = nodes.at(-1);
    if (!nodes.length) return;
    if (e.shiftKey && (document.activeElement === first || !$('.modal').contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !$('.modal').contains(document.activeElement))) { e.preventDefault(); first.focus(); }
  }
});
window.addEventListener('storage', e => { if (e.key === 'caucasus-language' && LANGUAGES[e.newValue]) { switchLanguage(e.newValue); return; } if (e.key === STORE) { db = load(); account(); render(); if (state.modal) renderModal(); toast(tr("addCart.461f1193")); } });
window.addEventListener('popstate', () => { closeModal(false); readRoute(); render(); window.scrollTo({ top: 0, behavior: 'instant' }); });
render();
persist();

document.addEventListener('error', event => { const img = event.target; if (img instanceof HTMLImageElement && img.dataset.fallback && img.src !== new URL(img.dataset.fallback, location.href).href) img.src = img.dataset.fallback; }, true);
