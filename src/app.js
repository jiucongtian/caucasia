import { ROLES, PRODUCTS, BATCHES, product, unit, price, money, round, cartTotal, validateCart, createOrder, seedOrders, stages, orderGroups, orderStatus, advanceOrder, packing } from './domain.js';

const $ = s => document.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
const logo = `<svg viewBox="0 0 44 36" class="logo-mark" aria-hidden="true"><path d="M2 30 18 5l9 14 6-9 10 20H30L18 13 7 30Z" fill="currentColor"/><path d="m18 24 4 6h-8Z" fill="#e97845"/></svg>`;
const STORE = 'caucasus-demo-v1';
const LEGACY_STORE = 'caucasia-demo-v1';
function load() { try { const data = JSON.parse(localStorage.getItem(STORE) ?? localStorage.getItem(LEGACY_STORE)); return data && data.version === 1 && data.accounts && typeof data.accounts === 'object' ? data : { version: 1, role: 'repair', accounts: {} }; } catch { return { version: 1, role: 'repair', accounts: {} }; } }
let db = load();
let state = { role: ROLES[db.role] ? db.role : 'repair', page: 'catalog', search: '', category: '全部配件', vehicle: '', model: '', supply: 'all', sort: 'recommended', orderFilter: '全部', modal: null, selected: null, batch: 'november', packed: false, running: false, delivery: 'delivery' };
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
function account() { if (!db.accounts[state.role]) { const r = ROLES[state.role]; db.accounts[state.role] = { cart: [], orders: seedOrders(state.role), address: { contact: r.contact, phone: r.phone, address: r.address } }; } return db.accounts[state.role]; }
function persist() { try { db.role = state.role; localStorage.setItem(STORE, JSON.stringify(db)); return true; } catch { toast('本机存储不可用，无法保存。请检查浏览器存储空间。', true); return false; } }
function toast(text, error = false) { const el = $('#toast'); el.className = `toast show ${error ? 'error' : ''}`; el.innerHTML = `${icon(error ? 'help' : 'check')}<span>${esc(text)}</span>`; clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3300); }
function navigate(page) { closeModal(false); state.page = page; if (location.hash !== routeHash(page)) history.pushState(null, '', routeHash(page)); document.body.classList.remove('mobile-nav'); render(); window.scrollTo({ top: 0, behavior: 'instant' }); }
function setRole(role) { if (!ROLES[role]) return; state.role = role; state.delivery = 'delivery'; account(); persist(); navigate('catalog'); toast(`已切换为${ROLES[role].label}，价格与订单已更新`); }
const countCart = () => account().cart.reduce((n, l) => n + l.qty, 0);
const badge = p => `<span class="badge ${p.type === 'stock' ? 'green' : 'amber'}"><i></i>${p.type === 'stock' ? '本地现货' : '跨境预售'}</span>`;
const date = text => new Date(text).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
function empty(title, text, action = 'catalog', label = '去选购配件') { return `<div class="empty">${icon('cube')}<h3>${title}</h3><p>${text}</p><button class="btn primary" data-nav="${action}">${label}${icon('arrow')}</button></div>`; }

function shell(content) {
  const r = ROLES[state.role];
  const nav = [['catalog', 'grid', '配件采购'], ['orders', 'orders', '我的订单'], ['packing', 'cube', '智能拼柜'], ['dashboard', 'chart', '运营大屏']];
  const titles = { catalog: '配件采购', orders: '我的订单', packing: '智能拼柜', dashboard: '运营大屏', account: '账户中心', checkout: '确认采购订单', success: '采购成功' };
  return `<aside class="sidebar"><a class="brand" href="#catalog" data-nav="catalog">${logo}<span>CAUCASUS<small>高加索汽配</small></span></a><div class="workspace-tag"><span class="live-dot"></span> 格鲁吉亚采购工作台</div><div class="nav-label">采购工作台</div><nav>${nav.map(([id, i, label]) => `<button data-nav="${id}" class="nav-item ${state.page === id ? 'active' : ''}" ${state.page === id ? 'aria-current="page"' : ''}>${icon(i)}<span>${label}</span>${id === 'orders' ? `<span class="nav-count">${account().orders.filter(o => orderStatus(o) !== '已完成').length}</span>` : ''}${id === 'packing' ? '<span class="new-tag">AI</span>' : ''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="service-note">${icon('globe')}<strong>连接货源，抵达所需</strong><p>中国货源 · 本地仓配<br>让每一次采购更确定</p></div><button class="nav-item ${state.page === 'account' ? 'active' : ''}" data-nav="account">${icon('user')}账户中心</button><button class="nav-item" data-action="help">${icon('help')}演示指南</button><div class="sidebar-version">POC DEMO <span>V0.1</span></div></div></aside><div class="mobile-scrim" data-action="menu"></div><div class="app-main"><header class="topbar"><div class="breadcrumb"><button class="icon-btn mobile-toggle" data-action="menu" aria-label="打开导航">${icon('menu')}</button><span>采购平台</span>${icon('chevron')}<strong>${titles[state.page]}</strong></div><div class="header-actions"><span class="demo-pill"><i></i>演示环境</span><button class="cart-top" data-action="cart">${icon('cart')}<span>采购清单</span><b>${countCart()}</b></button><button class="profile" data-action="roles" aria-label="切换采购身份"><span class="avatar">${r.initials}</span><span><strong>${r.label}账号</strong><small>${r.name}</small></span>${icon('down')}</button></div></header><main class="content ${state.page === 'dashboard' ? 'dashboard-content' : ''}">${content}</main><footer class="footer"><span>© 2026 CAUCASUS · 高加索汽配</span><span>美元示例定价 · 库存、付款及履约数据为演示</span></footer></div>`;
}

function filteredProducts() {
  const q = state.search.toLowerCase().replace(/[\s-]/g, '');
  let list = PRODUCTS.filter(p => (!q || `${p.name}${p.en}${p.brand}${p.oe}${p.sku}${p.vehicle}${p.model}`.toLowerCase().replace(/[\s-]/g, '').includes(q)) && (state.category === '全部配件' || p.category === state.category) && (!state.vehicle || p.vehicle === state.vehicle) && (!state.model || p.model === state.model) && (state.supply === 'all' || p.type === state.supply));
  if (state.sort === 'price-up') list.sort((a, b) => price(a, state.role) - price(b, state.role));
  if (state.sort === 'price-down') list.sort((a, b) => price(b, state.role) - price(a, state.role));
  return list;
}
function catalog() {
  const list = filteredProducts(), r = ROLES[state.role];
  const categories = ['全部配件', ...new Set(PRODUCTS.map(p => p.category))];
  const models = [...new Set(PRODUCTS.filter(p => !state.vehicle || p.vehicle === state.vehicle).map(p => p.model))];
  return `<section class="page-intro"><div><div class="eyebrow">YOUR PARTS. YOUR PRICE.</div><h1>配件采购<span class="intro-dot">.</span></h1><p>从准确找件，到安心交付。你的采购，在这里开始。</p></div><div class="location-label">${icon('pin')}第比利斯本地仓 <span class="live-dot"></span>正常供货</div></section>
  <section class="catalog-hero"><div class="hero-copy"><div class="hero-kicker">CAUCASUS PROCUREMENT</div><h2>好配件，<br>不必远寻。</h2><p>本地现货，即时补货。跨境预售，从容备货。</p><button class="hero-link" data-action="stock-filter">选购本地现货 ${icon('arrow')}</button></div><div class="hero-art" aria-hidden="true"><span class="hero-orbit"></span><div class="hero-number">01 / 08</div><img src="/assets/disc.svg" alt=""><img class="hero-brake" src="/assets/brake.svg" alt=""><div class="hero-art-label">BUILT FOR THE ROAD.<small>制动系统 · 精选配件</small></div></div><div class="hero-side"><span class="hero-side-label">为你的业务定价</span><strong>${r.label}</strong><span>${r.description}</span><div class="hero-rule"></div><div>${icon('shield')}账号专属价格</div><div>${icon('truck')}配送 / 到仓自提</div></div></section>
  <section class="search-panel"><form id="search-form" class="search-box">${icon('search')}<input id="search-input" name="search" value="${esc(state.search)}" placeholder="搜索配件名称、OE 件号或品牌" aria-label="搜索商品"><span class="keycap">OE</span><button class="btn primary" type="submit">查找配件</button></form><div class="vehicle-row"><span>${icon('filter')}按车型找件</span><label class="sr-only" for="vehicle-filter">车辆品牌</label><select id="vehicle-filter"><option value="">全部品牌</option>${['Toyota', 'BMW', 'Hyundai', 'Nissan'].map(v => `<option ${state.vehicle === v ? 'selected' : ''}>${v}</option>`).join('')}</select>${icon('chevron')}<label class="sr-only" for="model-filter">车型</label><select id="model-filter" ${!state.vehicle ? 'disabled' : ''}><option value="">全部车型</option>${models.map(m => `<option ${state.model === m ? 'selected' : ''}>${m}</option>`).join('')}</select>${state.model ? `<span class="generation-label">${esc(PRODUCTS.find(p => p.model === state.model)?.generation)}</span>` : '<span class="vehicle-tip">选择品牌与车型，匹配适用配件</span>'}<button class="text-btn" data-action="reset-filters">重置筛选</button></div></section>
  <div class="category-tabs" role="group" aria-label="商品分类">${categories.map((c, i) => `<button class="${state.category === c ? 'active' : ''}" data-category="${c}">${i === 0 ? icon('grid') : ''}${c}</button>`).join('')}</div>
  <div class="catalog-toolbar"><div class="segmented"><button data-supply="all" class="${state.supply === 'all' ? 'active' : ''}">全部供给</button><button data-supply="stock" class="${state.supply === 'stock' ? 'active' : ''}"><i class="dot green-dot"></i>本地现货</button><button data-supply="presale" class="${state.supply === 'presale' ? 'active' : ''}"><i class="dot amber-dot"></i>跨境预售</button></div><div class="catalog-meta"><span>找到 <b>${list.length}</b> 款配件</span><label class="sr-only" for="sort-filter">商品排序</label><select id="sort-filter"><option value="recommended" ${state.sort === 'recommended' ? 'selected' : ''}>推荐排序</option><option value="price-up" ${state.sort === 'price-up' ? 'selected' : ''}>价格从低到高</option><option value="price-down" ${state.sort === 'price-down' ? 'selected' : ''}>价格从高到低</option></select></div></div>
  ${list.length ? `<div class="product-grid">${list.map(p => `<article class="product-card"><button class="product-image" data-product="${p.id}" aria-label="查看${p.name}">${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}<img src="/assets/${p.id}.svg" alt="${p.name}配件示意图" loading="lazy"><span class="image-zoom">${icon('plus')}</span></button><div class="product-body"><div class="product-topline"><span class="product-brand">${p.brand}</span>${badge(p)}</div><button class="product-name" data-product="${p.id}">${p.name}</button><div class="product-fit">${p.vehicle} ${p.model} <span>· ${p.generation.split(' · ')[0]}</span></div><div class="product-oe">OE <span>${p.oe}</span></div><div class="stock-line">${icon(p.type === 'stock' ? 'cube' : 'clock')}<span>${p.type === 'stock' ? `本地仓可供 <b>${p.stock}</b> 件` : `预计 ${p.arrival.slice(5).replace('-', '月')}日到货`}</span></div><div class="product-purchase"><div><small>${r.description}</small><strong>${money(price(p, state.role))}<span>/ ${unit(p)}</span></strong></div><button class="add-btn" data-add="${p.id}" aria-label="将${p.name}加入采购清单">${icon('plus')}</button></div></div></article>`).join('')}</div>` : empty('没有找到匹配的配件', '试试其他 OE 件号、关键词，或重置筛选条件。', 'catalog', '查看全部配件')}
  <div class="catalog-bottom">${icon('shield')}配件图片与车型适配为演示示例，正式采购前请核对 OE 号及车辆信息。<span>供给有数，交付有期。</span></div>`;
}

function qtyControl(id, qty, scope = 'cart') { return `<div class="quantity"><button data-qty="${id}" data-delta="-1" data-scope="${scope}" aria-label="减少数量" ${qty <= 1 ? 'disabled' : ''}>${icon('minus')}</button><input type="number" min="1" max="${product(id).type === 'stock' ? product(id).stock : 999}" value="${qty}" aria-label="${product(id).name}数量" data-qty-input="${id}" data-scope="${scope}"><button data-qty="${id}" data-delta="1" data-scope="${scope}" aria-label="增加数量">${icon('plus')}</button></div>`; }
function cartLines(cart, editable = false) {
  return ['stock', 'presale'].filter(t => cart.some(l => product(l.id).type === t)).map(t => `<section class="cart-group"><div class="group-label">${icon(t === 'stock' ? 'cube' : 'globe')}<strong>${t === 'stock' ? '本地现货' : '跨境预售'}</strong><span>${t === 'stock' ? '付款核账后安排备货' : '按商品批次分组交付'}</span></div>${cart.filter(l => product(l.id).type === t).map(l => { const p = product(l.id); return `<div class="cart-line"><img src="/assets/${p.id}.svg" alt="${p.name}"><div class="cart-line-info"><strong>${p.name}</strong><small>${p.brand} · OE ${p.oe}</small><span>${money(price(p, state.role))} / ${unit(p)}</span>${editable ? qtyControl(p.id, l.qty) : `<small>采购数量：${l.qty}</small>`}</div><div class="cart-line-right"><strong>${money(price(p, state.role) * l.qty)}</strong>${editable ? `<button class="icon-btn" data-remove="${p.id}" aria-label="删除${p.name}">${icon('trash')}</button>` : ''}</div></div>`; }).join('')}</section>`).join('');
}
function checkout() {
  const cart = account().cart, address = account().address;
  if (!cart.length) return empty('采购清单还是空的', '挑选所需配件后，即可确认交付方式并提交采购。');
  const subtotal = cartTotal(cart, state.role), shipping = state.delivery === 'delivery' ? 12 : 0;
  return `<div class="page-intro"><div><div class="eyebrow">CHECKOUT</div><h1>确认采购订单</h1><p>核对配件、交付方式与金额，然后提交采购。</p></div><button class="btn secondary" data-action="cart">${icon('cart')}修改采购清单</button></div><div class="checkout-steps"><span class="done">${icon('check')}选择配件</span><i></i><span class="current"><b>2</b>确认订单</span><i></i><span><b>3</b>完成采购</span></div><form id="checkout-form" class="checkout-layout"><div class="checkout-main"><section class="panel"><div class="panel-heading"><h2>交付方式</h2><span>根据你的用件时间选择</span></div><div class="delivery-options"><label class="delivery-option ${state.delivery === 'delivery' ? 'selected' : ''}"><input type="radio" name="delivery" value="delivery" ${state.delivery === 'delivery' ? 'checked' : ''}>${icon('truck')}<span><strong>本地配送</strong><small>配送费用 ${money(12)} / 单（示例）</small></span><i></i></label><label class="delivery-option ${state.delivery === 'pickup' ? 'selected' : ''}"><input type="radio" name="delivery" value="pickup" ${state.delivery === 'pickup' ? 'checked' : ''}>${icon('pin')}<span><strong>到仓自提</strong><small>免配送费 · 备货完成后通知</small></span><i></i></label></div><div class="form-grid"><label>联系人<input name="contact" value="${esc(address.contact)}" required maxlength="60" autocomplete="name"></label><label>联系电话<input name="phone" type="tel" value="${esc(address.phone)}" required maxlength="40" autocomplete="tel"></label><label class="full-width">${state.delivery === 'delivery' ? '收货地址' : '自提仓库'}${state.delivery === 'delivery' ? `<input name="address" value="${esc(address.address)}" required maxlength="200" autocomplete="street-address">` : '<select name="address"><option>第比利斯中央仓 · Kakheti Highway 12</option><option>库塔伊西合作仓 · Chavchavadze Ave 34</option></select>'}</label></div></section><section class="panel"><div class="panel-heading"><h2>采购商品</h2><span>${cart.length} 款 · ${countCart()} 件</span></div>${cartLines(cart)}</section><div class="inline-note">${icon('help')}现货与预售共用一个采购订单，按供给类型分组履约。预售预计日期与批次见商品及订单详情。</div></div><aside class="summary panel"><div class="panel-heading"><h2>采购结算</h2></div><div class="summary-role">${icon('shield')}按${ROLES[state.role].label}价格结算</div><div class="summary-row"><span>商品金额</span><b>${money(subtotal)}</b></div><div class="summary-row"><span>配送费 <small>示例</small></span><b>${shipping ? money(shipping) : '免费'}</b></div><div class="summary-total"><span>订单总额 <small>USD</small></span><strong>${money(subtotal + shipping)}</strong></div><div class="payment-note"><strong>付款凭证 · 人工核账</strong><p>提交订单后可模拟付款与核账。当前演示按全额结算，不发生实际扣款。</p></div><label class="agreement"><input type="checkbox" name="agree" required checked><span>已核对配件适配、数量与交付信息，知悉本次为演示采购。</span></label><button type="submit" class="btn primary block">提交采购订单${icon('arrow')}</button><button type="button" class="text-btn block" data-nav="catalog">继续选购</button><p id="checkout-error" class="form-error" role="alert"></p></aside></form>`;
}
function success() {
  const o = account().orders.find(o => o.id === state.selected);
  if (!o) return orders();
  return `<div class="success-panel"><div class="success-icon">${icon('check')}</div><div class="eyebrow">ORDER PLACED</div><h1>采购订单已提交</h1><p>你的需求已收到。完成付款核账后，我们将按履约分组安排交付。</p><div class="success-order"><span>订单编号</span><strong>${o.id}</strong><span>采购总额</span><strong>${money(o.total)}</strong><span>交付方式</span><strong>${o.delivery === 'pickup' ? '到仓自提' : '本地配送'}</strong></div><div class="success-actions"><button class="btn primary" data-order="${o.id}">查看订单与模拟付款${icon('arrow')}</button><button class="btn secondary" data-nav="catalog">继续采购</button></div><div class="inline-note">${icon('shield')}订单已保存到当前浏览器，刷新后仍可查看。</div></div>`;
}

function orders() {
  const all = account().orders, list = all.filter(o => state.orderFilter === '全部' || (state.orderFilter === '待付款' ? ['待付款', '待核账'].includes(orderStatus(o)) : state.orderFilter === '履约中' ? !['待付款', '待核账', '已完成'].includes(orderStatus(o)) : orderStatus(o) === '已完成'));
  return `<div class="page-intro"><div><div class="eyebrow">YOUR PROCUREMENT</div><h1>我的订单<span class="intro-dot">.</span></h1><p>每一单的商品、付款与交付进度，都清晰可见。</p></div><button class="btn primary" data-nav="catalog">${icon('plus')}新建采购</button></div><div class="order-overview">${[['全部订单', all.length, 'orders'], ['待付款 / 核账', all.filter(o => ['pending', 'review'].includes(o.payment)).length, 'clock'], ['履约中', all.filter(o => o.payment === 'paid' && orderStatus(o) !== '已完成').length, 'truck'], ['累计采购金额', money(all.reduce((s, o) => s + o.total, 0)), 'chart']].map(([t, v, i]) => `<div>${icon(i)}<span>${t}</span><strong>${v}</strong></div>`).join('')}</div><div class="order-tabs">${['全部', '待付款', '履约中', '已完成'].map(t => `<button data-order-filter="${t}" class="${state.orderFilter === t ? 'active' : ''}">${t}</button>`).join('')}<span>仅显示 ${ROLES[state.role].name} 的订单</span></div>${list.length ? `<div class="order-list">${list.map(o => `<article class="order-card"><div class="order-card-head"><div><strong>${o.id}</strong><span>${date(o.created)}</span></div><span class="badge ${orderStatus(o) === '已完成' ? 'green' : o.payment !== 'paid' ? 'amber' : 'blue'}">${orderStatus(o)}</span></div><div class="order-card-body"><div class="order-products">${o.lines.slice(0, 3).map(l => `<img src="/assets/${l.id}.svg" alt="${product(l.id).name}">`).join('')}<div><strong>${product(o.lines[0].id).name}${o.lines.length > 1 ? `等 ${o.lines.length} 款配件` : ''}</strong><span>共 ${o.lines.reduce((s, l) => s + l.qty, 0)} 件 · ${o.delivery === 'pickup' ? '到仓自提' : '本地配送'}</span><span class="order-types">${orderGroups(o).map(t => `<span>${t === 'stock' ? '现货' : '预售'}</span>`).join('')}</span></div></div><div class="order-amount"><small>订单总额</small><strong>${money(o.total)}</strong></div><button class="btn secondary" data-order="${o.id}">查看订单${icon('chevron')}</button></div></article>`).join('')}</div>` : empty('当前没有这类订单', '可以开始一笔采购，或切换订单状态查看其他记录。')}`;
}

function packingView() {
  const b = BATCHES[state.batch], basic = packing(b, false), optimized = packing(b, true), result = state.packed ? optimized : basic;
  return `<div class="page-intro"><div><div class="eyebrow">SMART CONSOLIDATION</div><h1>让每一寸空间，都有价值<span class="intro-dot">.</span></h1><p>从采购清单到装箱方案，提前看清你的跨境备货。</p></div><span class="badge blue">${icon('bolt')}AI 概念演示</span></div><div class="packing-layout"><section class="panel packing-config"><div class="panel-heading"><h2>采购批次</h2></div><label class="field-label" for="batch-select">选择拼柜批次</label><select id="batch-select">${Object.entries(BATCHES).map(([id, x]) => `<option value="${id}" ${state.batch === id ? 'selected' : ''}>${x.label}</option>`).join('')}</select><div class="batch-meta"><span>${b.id}</span><span>预计 ${b.date} 到货</span></div><div class="container-type">${icon('cube')}<div><strong>40′ 高柜 · 40HQ</strong><small>容积 67.7 m³ · 示例限重 26,000 kg</small></div></div><h3 class="small-heading">待装配件</h3><div class="packing-parts">${b.lines.map(l => `<div><img src="/assets/${l.id}.svg" alt=""><span><strong>${product(l.id).name}</strong><small>${l.qty} 件 · ${product(l.id).stack ? '允许堆叠' : '不可堆叠'}</small></span><b>${round(product(l.id).volume * l.qty)}<small>m³</small></b></div>`).join('')}</div><div class="batch-total"><span>总体积 <b>${result.volume} m³</b></span><span>总重量 <b>${result.weight.toLocaleString()} kg</b></span></div><button class="btn primary block" data-action="pack" ${state.running ? 'disabled' : ''}>${icon('bolt')}${state.running ? '正在生成模拟方案…' : state.packed ? '重新模拟拼柜' : '模拟智能拼柜'}</button><p class="packing-disclaimer">使用假设包装参数与预设装填系数。装箱视图为示意，不代表经过验证的最优方案。</p></section><section class="packing-preview"><div class="packing-preview-head"><span><span class="live-dot"></span>${state.packed ? '模拟方案已生成' : '当前：顺序摆放方案'}</span><span>40HQ / ${b.id}</span></div><div class="container-stage ${state.packed ? 'optimized' : ''} ${state.running ? 'scanning' : ''}"><div class="container-ground"></div><div class="container-3d"><div class="container-floor"></div><div class="container-back"></div><div class="container-side"></div><div class="container-boxes">${Array.from({ length: state.packed ? 30 : 22 }, (_, i) => `<div class="cargo-box box-${i % 4}" style="--col:${i % 6};--row:${Math.floor(i / 6)};--delay:${i * 18}ms"><span>${['BR', 'FL', 'SU', 'LT'][i % 4]}</span></div>`).join('')}</div><div class="container-front"><span>CAUCASUS</span><small>GLOBAL PARTS / CN → GE</small></div></div><div class="stage-label"><span>12.03 m</span><span>2.35 m</span></div><div class="scan-line"></div></div><div class="packing-preview-foot"><span><i class="dot green-dot"></i>可堆叠配件</span><span><i class="dot amber-dot"></i>独立保护区</span><span>3D 装箱示意</span></div><div class="packing-results"><div><small>示例装载率</small><strong>${result.utilization}<span>%</span></strong><p>${state.packed ? '装填系数 0.92' : '装填系数 0.73'}</p></div><div><small>剩余空间</small><strong>${result.free}<span>m³</span></strong><p>按已装货物体积计算</p></div><div><small>未装入商品</small><strong>${result.unloaded.reduce((s, l) => s + l.qty, 0)}<span>件</span></strong><p>${result.unloaded.length ? '需另行安排批次' : '全部配件可装入'}</p></div></div></section></div><section class="panel comparison"><div class="panel-heading"><h2>两种方案，一眼比较</h2><span>同一采购批次 · 假设参数</span></div><div class="comparison-grid">${[['顺序摆放', basic, false], ['分区堆叠', optimized, true]].map(([label, v, active]) => `<div class="comparison-item ${active && state.packed ? 'highlight' : ''}"><div><strong>${label}</strong><span>${active ? '模拟优化方案' : '基准方案'}</span></div><div class="packing-bar"><i style="width:${state.packed || !active ? v.utilization : 0}%"></i></div><p>装载率 <b>${state.packed || !active ? v.utilization + '%' : '待生成'}</b><span>未装入 ${state.packed || !active ? v.unloaded.reduce((s, l) => s + l.qty, 0) + ' 件' : '—'}</span></p></div>`).join('')}</div>${state.packed ? `<div class="packing-outcome">${icon('check')}此批次重量在示例限重内。${optimized.unloaded.length ? optimized.unloaded.map(l => `${product(l.id).name} ${l.qty} 件`).join('、') + '尚未装入。' : '按假设参数全部可装入。'}复杂形状、重心及实际堆叠规则需后续物理数据验证。</div>` : ''}</section>`;
}

function dashboard() {
  return `<div class="dashboard-top"><div><span class="eyebrow">CAUCASUS / OPERATIONS INTELLIGENCE</span><h1>高加索汽配 · 运营全景</h1><p>货源、渠道与交付，在同一张图上。</p></div><div class="dashboard-clock"><span class="live-dot"></span>模拟数据 <strong id="live-clock"></strong><button class="icon-btn" data-action="fullscreen" aria-label="切换全屏">${icon('grid')}</button></div></div><div class="dash-metrics">${[['42', '合作经销商', '+6 本月新增', 'user'], ['3,248', '可供配件 SKU', '覆盖 18 个车型品牌', 'cube'], ['$128,460', '本月采购金额', '+18.6% 较上月', 'chart'], ['6', '在途拼柜批次', '2 批预计本月到达', 'truck']].map(([v, t, foot, i]) => `<div>${icon(i)}<span>${t}</span><strong>${v}</strong><small>${foot}</small></div>`).join('')}</div><div class="dash-grid"><section class="dash-panel map-panel"><div class="dash-panel-head"><h2>渠道网络</h2><span>GEORGIA / 42 PARTNERS</span></div><div class="georgia-map"><svg viewBox="0 0 680 310" role="img" aria-label="格鲁吉亚渠道分布示意：第比利斯18家、库塔伊西10家、巴统8家、鲁斯塔维6家"><defs><pattern id="mapgrid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0v28" fill="none" stroke="#315260" stroke-width=".5"/></pattern><linearGradient id="mapfill"><stop stop-color="#1b4a5b"/><stop offset="1" stop-color="#214756"/></linearGradient></defs><rect width="680" height="310" fill="url(#mapgrid)"/><path d="m78 66 67-16 83 34 41-8 39 21 37-12 50 29 30-8 36 34 62 18 46 50-16 28-46-11-38 24-57-15-35 10-61-18-45 7-29-24-55-10-32-38-37-13-34-45Z" fill="url(#mapfill)" stroke="#4b7b8d" stroke-width="1.5"/><path d="M186 171Q278 60 458 199M186 171Q254 168 304 145M458 199l50 30M304 145Q372 159 458 199" fill="none" stroke="#6eacb9" stroke-dasharray="5 6"/><g class="map-point"><circle cx="458" cy="199" r="22"/><circle cx="458" cy="199" r="6"/><text x="479" y="191">第比利斯</text><text x="479" y="209" class="map-sub">18 家经销商</text></g><g class="map-point"><circle cx="304" cy="145" r="17"/><circle cx="304" cy="145" r="5"/><text x="310" y="113">库塔伊西</text><text x="310" y="131" class="map-sub">10 家</text></g><g class="map-point"><circle cx="186" cy="171" r="16"/><circle cx="186" cy="171" r="5"/><text x="113" y="217">巴统</text><text x="113" y="235" class="map-sub">8 家</text></g><g class="map-point"><circle cx="508" cy="229" r="13"/><circle cx="508" cy="229" r="4"/><text x="520" y="264">鲁斯塔维 · 6 家</text></g><text x="80" y="274" class="map-sea">BLACK SEA</text></svg></div><div class="map-legend"><span><i></i>合作渠道分布示意</span><span>4 座城市 · 42 家经销商</span></div></section><section class="dash-panel"><div class="dash-panel-head"><h2>货源结构</h2><span>本月采购金额</span></div><div class="donut-wrap"><div class="donut"><div><strong>100<span>%</span></strong><small>采购货源</small></div></div></div><div class="source-legend">${[['中国采购', '70%', '$89,922', 'mint'], ['区域货源', '20%', '$25,692', 'orange'], ['拆车件', '10%', '$12,846', 'blue']].map(([n, v, a, c]) => `<div><i class="${c}"></i><span>${n}</span><b>${v}</b><small>${a}</small></div>`).join('')}</div></section><section class="dash-panel"><div class="dash-panel-head"><h2>采购趋势</h2><span>单位：千美元</span></div><div class="bar-chart">${[38, 47, 42, 65, 76, 108.3, 128.46].map((n, i) => `<div><span>${n.toFixed(i > 4 ? 1 : 0)}</span><i style="height:${n / 130 * 145}px"></i><small>${i + 4}月</small></div>`).join('')}</div><div class="chart-foot"><span>4–10 月示例采购金额</span><b>+18.6% 本月增长</b></div></section><section class="dash-panel"><div class="dash-panel-head"><h2>拼柜与交付</h2><button class="text-btn" data-nav="packing">查看拼柜 ${icon('arrow')}</button></div><div class="container-progress-list">${[['CN-GE-2610-A', '本地配送', 100, '已入库'], ['CN-GE-2610-B', '清关中', 88, '10/22 预计到货'], ['CN-GE-2611-A', '海运在途', 72, '11/20 预计到货'], ['CN-GE-2611-B', '拼柜组装', 61, '11/25 预计到货']].map(([id, s, n, t]) => `<div><span><strong>${id}</strong><small>${s}</small></span><div class="dash-progress"><i style="width:${n}%"></i></div><span><b>${n}%</b><small>${t}</small></span></div>`).join('')}</div><p class="dash-subnote">展示 4 个重点批次 · 另有 2 个在途批次</p></section></div><div class="dash-bottom"><span><i class="live-dot"></i>中国货源 · 格鲁吉亚渠道 · 本地履约</span><span>演示指标采用预设数据，不代表真实运营结果</span></div>`;
}
function accountView() {
  const r = ROLES[state.role], a = account().address;
  return `<div class="page-intro"><div><div class="eyebrow">BUSINESS ACCOUNT</div><h1>账户中心<span class="intro-dot">.</span></h1><p>你的采购身份、专属价格与收货信息。</p></div><button class="btn secondary" data-action="roles">切换演示账号${icon('arrow')}</button></div><div class="account-layout"><section class="account-card panel"><span class="avatar large">${r.initials}</span><span class="badge green">${icon('shield')}演示认证账号</span><h2>${r.name}</h2><p>${r.label} · 格鲁吉亚</p><div class="account-price"><small>当前价格方案</small><strong>${r.description}</strong><span>示例系数 ${r.factor.toFixed(2)}</span></div><div class="account-tip">${icon('help')}身份切换仅用于演示。不同账号的采购清单、订单和地址独立保存。</div><button class="text-btn" data-action="logout">${icon('logOut')}退出演示账号</button></section><section class="panel"><div class="panel-heading"><h2>收货信息</h2><span>用于配送订单的默认信息</span></div><form id="address-form" class="address-form"><label>联系人<input name="contact" required value="${esc(a.contact)}" maxlength="60" autocomplete="name"></label><label>联系电话<input name="phone" type="tel" required value="${esc(a.phone)}" maxlength="40" autocomplete="tel"></label><label>收货地址<input name="address" required value="${esc(a.address)}" maxlength="200" autocomplete="street-address"></label><button class="btn primary" type="submit">保存收货信息${icon('check')}</button><p class="form-error" id="address-error" role="alert"></p></form><div class="account-order-shortcut"><div>${icon('orders')}<span><strong>全部采购记录</strong><small>${account().orders.length} 笔订单 · 仅当前账号可见</small></span></div><button class="text-btn" data-nav="orders">查看订单${icon('arrow')}</button></div></section></div>`;
}
function render() {
  account();
  const pages = { catalog, orders, packing: packingView, dashboard, account: accountView, checkout, success };
  $('#app').innerHTML = shell(pages[state.page]());
  document.title = `${{catalog:'配件采购',orders:'我的订单',packing:'智能拼柜',dashboard:'运营大屏',account:'账户中心',checkout:'确认订单',success:'采购成功'}[state.page]} · CAUCASUS`;
  updateClock();
}
function updateClock() { const el = $('#live-clock'); if (el) el.textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false }); }
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
  return `<div class="detail-layout"><div class="detail-image"><span class="product-brand">${p.brand}</span><img src="/assets/${p.id}.svg" alt="${p.name}示意图"><span>配件外观示意 · 请以实物为准</span></div><div class="detail-copy">${badge(p)}<div class="eyebrow">${p.en}</div><h2 id="dialog-title">${p.name}</h2><p>${p.vehicle} ${p.model} · ${p.generation}</p><dl class="spec-list"><div><dt>OE 件号</dt><dd>${p.oe}</dd></div><div><dt>商品 SKU</dt><dd>${p.sku}</dd></div><div><dt>规格</dt><dd>${p.spec}</dd></div><div><dt>供给</dt><dd>${p.type === 'stock' ? `本地仓 ${p.stock} 件` : '中国采购 · 跨境预售'}</dd></div><div><dt>交付</dt><dd>${p.type === 'stock' ? '核账后备货，可配送或自提' : `预计 ${p.arrival} 到货（示例）`}</dd></div></dl><div class="detail-price"><small>${ROLES[state.role].description}</small><strong>${money(price(p, state.role))}<span>/ ${unit(p)}</span></strong></div><div class="detail-buy">${qtyControl(p.id, 1, 'detail')}<button class="btn primary" data-add="${p.id}" data-detail="true">${icon('cart')}加入采购清单</button></div><div class="inline-note">${icon('shield')}请按 OE 号与车型核对适配信息，演示数据不作为正式适配承诺。</div></div></div>`;
}
function rolesModal(logout = false) {
  return `<div class="roles-content">${logo}<div class="eyebrow">WELCOME TO CAUCASUS</div><h2 id="dialog-title">${logout ? '选择身份，开始采购' : '切换采购身份'}</h2><p>同一个入口，适合你的价格。选择预设账号体验完整流程。</p><div class="role-options">${Object.entries(ROLES).map(([id, r]) => `<button data-role="${id}" class="role-option ${id === state.role ? 'selected' : ''}"><span class="avatar">${r.initials}</span><span><strong>${r.label}</strong><small>${r.name}</small><em>${r.description} · 系数 ${r.factor.toFixed(2)}</em></span>${icon(id === state.role ? 'check' : 'arrow')}</button>`).join('')}</div><div class="inline-note">${icon('help')}这些是演示账号，未接入真实认证服务。C 端与供应商价格规则待确认。</div></div>`;
}
function cartModal() {
  const cart = account().cart;
  return `<div class="drawer-header"><div><span class="eyebrow">PROCUREMENT LIST</span><h2 id="dialog-title">采购清单 <small>${cart.length} 款 / ${countCart()} 件</small></h2></div></div><div class="drawer-body">${cart.length ? cartLines(cart, true) : empty('从一件好配件开始', '将所需商品加入清单，再一次性确认采购。')}</div>${cart.length ? `<div class="drawer-footer"><div><span>商品合计 <small>USD</small></span><strong>${money(cartTotal(cart, state.role))}</strong></div><p>按${ROLES[state.role].label}价格计算，配送费用在下一步确认。</p><button class="btn primary block" data-nav="checkout">确认采购 · 下一步${icon('arrow')}</button></div>` : ''}`;
}
function orderModal() {
  const o = account().orders.find(o => o.id === state.selected);
  if (!o) return '<h2 id="dialog-title">订单不可见</h2><p>请切换到该订单所属账号。</p>';
  const address = o.address;
  return `<div class="order-detail"><div class="eyebrow">ORDER DETAILS</div><div class="order-detail-title"><div><h2 id="dialog-title">${o.id}</h2><p>${date(o.created)} · ${ROLES[o.role].label}订单</p></div><span class="badge ${o.payment === 'paid' ? 'green' : 'amber'}">${orderStatus(o)}</span></div><div class="order-payment"><div>${icon('shield')}<span><strong>${{ pending: '等待付款', review: '付款已提交 · 等待核账', paid: '已完成模拟核账' }[o.payment]}</strong><small>演示全额结算 · ${money(o.total)} · 不发生真实扣款</small></span></div>${o.payment !== 'paid' ? `<button class="btn primary" data-payment="${o.id}">${o.payment === 'pending' ? '模拟提交付款' : '模拟核账通过'}${icon('arrow')}</button>` : '<span class="badge green">付款已确认</span>'}</div><div class="order-delivery-info">${icon(o.delivery === 'pickup' ? 'pin' : 'truck')}<span><strong>${o.delivery === 'pickup' ? '到仓自提' : '本地配送'} · ${esc(address.contact)} · ${esc(address.phone)}</strong><small>${esc(address.address)}</small></span></div>${orderGroups(o).map(t => { const timeline = stages(t, o.delivery), step = o.stages[t]; return `<section class="fulfillment"><div class="panel-heading"><h3>${t === 'stock' ? '现货履约' : '预售履约'}</h3>${t === 'presale' ? `<span>${[...new Set(o.lines.filter(l => l.type === t).map(l => product(l.id).arrival))].map(d => `预计 ${d}`).join(' / ')} · 示例批次</span>` : '<span>本地仓备货</span>'}</div><div class="timeline">${timeline.map((n, i) => `<div class="${i < step ? 'done' : i === step ? 'current' : ''}"><i>${i < step ? icon('check') : i + 1}</i><strong>${n}</strong><small>${i < step ? '模拟已完成' : i === step ? (o.payment === 'paid' ? '当前节点' : '等待核账') : '待处理'}</small></div>`).join('')}</div><div class="fulfillment-footer"><small>演示节点 · 通过下方按钮推进状态</small><button class="text-btn" data-advance="${o.id}" data-type="${t}" ${o.payment !== 'paid' || step === timeline.length - 1 ? 'disabled' : ''}>${step === timeline.length - 1 ? '该分组已完成' : '模拟下一节点'}${icon('arrow')}</button></div></section>`; }).join('')}<div class="panel-heading"><h3>商品明细</h3><span>下单时的成交价已锁定</span></div><div class="order-detail-lines">${o.lines.map(l => `<div><img src="/assets/${l.id}.svg" alt=""><span><strong>${product(l.id).name}</strong><small>OE ${product(l.id).oe}</small></span><span>${money(l.unitPrice)} × ${l.qty}</span><b>${money(l.unitPrice * l.qty)}</b></div>`).join('')}</div><div class="order-totals"><span>商品金额 <b>${money(o.subtotal)}</b></span><span>配送费 <b>${money(o.shipping)}</b></span><strong>订单总额 <b>${money(o.total)}</b></strong></div></div>`;
}
function helpModal() { return `<div class="help-content"><div class="eyebrow">DEMO WALKTHROUGH</div><h2 id="dialog-title">用一笔采购，认识高加索</h2><p>这个 Demo 的数据保存在当前浏览器中。你可以按以下顺序体验。</p><ol><li><strong>对比采购价格</strong><span>右上角切换汽修店、经销商和直营店，查看同款配件的不同价格。</span></li><li><strong>完成采购</strong><span>搜索 OE 04465-33480，加购商品，选择配送或自提后提交订单。</span></li><li><strong>查看履约进度</strong><span>打开订单，模拟提交付款、核账，再推进物流节点。</span></li><li><strong>体验配套能力</strong><span>进入智能拼柜生成模拟方案，或打开运营大屏查看渠道与货源。</span></li></ol><div class="inline-note">${icon('help')}所有付款、物流、装箱及运营数据均为模拟，刷新保留账号的清单和订单。</div><button class="btn primary" data-action="close">开始体验${icon('arrow')}</button></div>`; }
function renderModal() {
  if (!state.modal) return;
  $('#app').inert = true;
  const content = { product: productModal, roles: rolesModal, login: () => rolesModal(true), cart: cartModal, order: orderModal, help: helpModal }[state.modal]();
  $('#overlay-root').innerHTML = `<div class="overlay ${state.modal === 'cart' ? 'drawer-overlay' : ''}"><div class="modal-backdrop" data-action="close"></div><section class="modal ${state.modal === 'cart' ? 'drawer' : ''} ${state.modal === 'product' ? 'product-modal' : ''} ${state.modal === 'order' ? 'order-modal' : ''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="modal-close icon-btn" data-action="close" aria-label="关闭弹窗">${icon('close')}</button>${content}</section></div>`;
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
  $('.drawer-header h2 small').textContent = `${account().cart.length} 款 / ${countCart()} 件`;
  $('.cart-top b').textContent = countCart();
}
function changeQty(id, amount, scope, direct = false) {
  const p = product(id), max = p.type === 'stock' ? p.stock : 999;
  if (scope === 'detail') {
    const input = $('[data-qty-input][data-scope="detail"]');
    const qty = direct ? amount : Number(input.value) + amount;
    if (!Number.isInteger(qty) || qty < 1 || qty > max) { toast(`数量需为 1–${max} 的整数`, true); input.value = Math.max(1, Math.min(max, Math.floor(Number(input.value) || 1))); return; }
    input.value = qty; input.previousElementSibling.disabled = qty === 1; return;
  }
  const line = account().cart.find(l => l.id === id);
  if (!line) return;
  const qty = direct ? amount : line.qty + amount;
  if (!Number.isInteger(qty) || qty < 1 || qty > max) { toast(`数量需为 1–${max} 的整数`, true); updateCartNumbers(id); return; }
  if (qty !== line.qty) { line.qty = qty; persist(); }
  updateCartNumbers(id);
}
function addCart(id, qty = 1) {
  const cart = account().cart, old = cart.find(l => l.id === id), next = old ? cart.map(l => l.id === id ? { ...l, qty: l.qty + qty } : l) : [...cart, { id, qty }];
  try { validateCart(next); account().cart = next; persist(); render(); toast(`${product(id).name} × ${qty} 已加入清单`); } catch (e) { toast(e.message, true); }
}

document.addEventListener('click', async e => {
  const btn = e.target.closest('button, a[data-nav], [data-action]');
  if (!btn || btn.disabled) return;
  if (btn.dataset.nav) { e.preventDefault(); if (btn.dataset.nav === 'catalog' && !filteredProducts().length) { state.search = ''; state.category = '全部配件'; state.vehicle = ''; state.model = ''; state.supply = 'all'; } navigate(btn.dataset.nav); return; }
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
    o.payment = o.payment === 'pending' ? 'review' : 'paid'; persist(); render(); renderModal(); toast(o.payment === 'review' ? '模拟付款已提交，等待核账' : '模拟核账通过，可以推进交付节点'); return;
  }
  if (btn.dataset.advance) {
    const index = account().orders.findIndex(o => o.id === btn.dataset.advance);
    try { account().orders[index] = advanceOrder(account().orders[index], btn.dataset.type); persist(); render(); renderModal(); toast('模拟履约节点已更新'); } catch (e) { toast(e.message, true); } return;
  }
  const action = btn.dataset.action;
  if (action === 'close') return closeModal();
  if (['roles', 'cart', 'help'].includes(action)) return openModal(action);
  if (action === 'menu') return document.body.classList.toggle('mobile-nav');
  if (action === 'logout') return openModal('login');
  if (action === 'stock-filter') { state.supply = 'stock'; render(); $('.search-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (action === 'reset-filters') { state.search = ''; state.category = '全部配件'; state.vehicle = ''; state.model = ''; state.supply = 'all'; state.sort = 'recommended'; render(); }
  if (action === 'pack') { state.running = true; state.packed = false; render(); const batch = state.batch; await new Promise(r => setTimeout(r, 1200)); state.running = false; if (state.batch === batch) state.packed = true; if (state.page === 'packing') render(); toast('模拟装箱方案已生成'); }
  if (action === 'fullscreen') { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { toast('当前浏览器不支持全屏模式', true); } }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'vehicle-filter') { state.vehicle = el.value; state.model = ''; render(); }
  if (el.id === 'model-filter') { state.model = el.value; render(); }
  if (el.id === 'sort-filter') { state.sort = el.value; render(); }
  if (el.dataset.qtyInput) changeQty(el.dataset.qtyInput, Number(el.value), el.dataset.scope, true);
  if (el.id === 'batch-select') { state.batch = el.value; state.packed = false; render(); }
  if (el.name === 'delivery') {
    const form = $('#checkout-form');
    account().address = { contact: form.elements.contact.value, phone: form.elements.phone.value, address: state.delivery === 'delivery' ? form.elements.address.value : account().address.address };
    state.delivery = el.value; render();
  }
});
document.addEventListener('input', e => {
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
      if (!data.get('agree')) throw new Error('请确认已核对采购信息');
      const address = { contact: data.get('contact').trim(), phone: data.get('phone').trim(), address: data.get('address').trim() };
      const o = createOrder(account().cart, state.role, state.delivery, address);
      const prevCart = account().cart; account().orders.unshift(o); account().cart = [];
      if (!persist()) { account().orders.shift(); account().cart = prevCart; throw new Error('订单未提交成功：本机存储不可用，请检查存储空间后重试'); }
      state.selected = o.id; navigate('success');
    } catch (error) { $('#checkout-error').textContent = error.message; }
  }
  if (form.id === 'address-form') {
    const a = Object.fromEntries(['contact', 'phone', 'address'].map(k => [k, data.get(k).trim()]));
    if (Object.values(a).some(v => !v)) { $('#address-error').textContent = '请填写完整的收货信息'; return; }
    const prev = account().address; account().address = a;
    if (persist()) toast('默认收货信息已保存'); else account().address = prev;
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
window.addEventListener('storage', e => { if (e.key === STORE) { db = load(); account(); render(); if (state.modal) renderModal(); toast('采购数据已与其他页面同步'); } });
window.addEventListener('popstate', () => { closeModal(false); readRoute(); render(); window.scrollTo({ top: 0, behavior: 'instant' }); });
render();
persist();
