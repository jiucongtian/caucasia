export const ROLES = {
  repair: { label: '汽修店', name: 'Tbilisi Auto Service', initials: 'TA', factor: 1, description: '维修门店采购价', address: '格鲁吉亚 · 第比利斯 · Akaki Tsereteli Ave 116', contact: 'Giorgi', phone: '+995 555 01 28 36' },
  dealer: { label: '经销商', name: 'Caucasus Parts Distribution', initials: 'CP', factor: .65, description: '经销商采购价', address: '格鲁吉亚 · 库塔伊西 · Chavchavadze Ave 34', contact: 'David', phone: '+995 555 02 38 46' },
  store: { label: '直营店', name: 'Caucasus 第比利斯直营店', initials: 'CA', factor: .55, description: '直营店内部价', address: '格鲁吉亚 · 第比利斯 · Kakheti Highway 12', contact: 'Nika', phone: '+995 555 03 48 56' }
};
export const PRODUCTS = [
  { id: 'brake', name: '陶瓷前刹车片套装', en: 'CERAMIC BRAKE PADS', brand: 'BOSCH', oe: '04465-33480', sku: 'CA-BR-001', category: '制动系统', vehicle: 'Toyota', model: 'Camry', generation: 'XV70 · 2018–2024', spec: '前轮 · 4 片 / 套', price: 100, stock: 128, type: 'stock', arrival: '本地仓现货', volume: .012, weight: 2.2, stack: true, tag: '采购优选', color: '#e5b24e' },
  { id: 'filter', name: '高效机油滤清器', en: 'OIL FILTER', brand: 'MANN-FILTER', oe: '11427566327', sku: 'CA-FL-002', category: '滤清系统', vehicle: 'BMW', model: '3 Series', generation: 'F30 · 2012–2019', spec: '滤芯 + 密封圈 · 1 套', price: 18, stock: 356, type: 'stock', arrival: '本地仓现货', volume: .004, weight: .35, stack: true, tag: '高频补货', color: '#dfb454' },
  { id: 'disc', name: '通风前制动盘', en: 'VENTILATED BRAKE DISC', brand: 'BREMBO', oe: '43512-06090', sku: 'CA-BR-003', category: '制动系统', vehicle: 'Toyota', model: 'Camry', generation: 'XV70 · 2018–2024', spec: '直径 296 mm · 1 件', price: 86, stock: 64, type: 'stock', arrival: '本地仓现货', volume: .021, weight: 7.8, stack: true, tag: '', color: '#8396a4' },
  { id: 'shock', name: '前悬挂减震器', en: 'FRONT SHOCK ABSORBER', brand: 'SACHS', oe: '54651-C1000', sku: 'CA-SU-004', category: '悬挂系统', vehicle: 'Hyundai', model: 'Sonata', generation: 'LF · 2015–2019', spec: '前左 · 气压式 · 1 件', price: 124, stock: 0, type: 'presale', arrival: '2026-11-20', volume: .038, weight: 4.6, stack: true, tag: '预售专享', color: '#c64c3b' },
  { id: 'lamp', name: 'LED 前大灯总成', en: 'LED HEADLIGHT ASSEMBLY', brand: 'DEPO', oe: '92101-D3000', sku: 'CA-LT-005', category: '照明系统', vehicle: 'Hyundai', model: 'Tucson', generation: 'TL · 2016–2021', spec: '左侧 · LED · 1 件', price: 248, stock: 0, type: 'presale', arrival: '2026-11-20', volume: .085, weight: 3.4, stack: false, tag: '', color: '#8dabb8' },
  { id: 'plug', name: '铱金火花塞', en: 'IRIDIUM SPARK PLUG', brand: 'NGK', oe: '22401-ED815', sku: 'CA-IG-006', category: '点火系统', vehicle: 'Nissan', model: 'X-Trail', generation: 'T32 · 2014–2022', spec: '铱金电极 · 4 支 / 套', price: 42, stock: 210, type: 'stock', arrival: '本地仓现货', volume: .003, weight: .24, stack: true, tag: '', color: '#c4cad1' },
  { id: 'belt', name: '发动机多楔传动皮带', en: 'SERPENTINE DRIVE BELT', brand: 'CONTINENTAL', oe: '90916-02680', sku: 'CA-EN-007', category: '发动机系统', vehicle: 'Toyota', model: 'RAV4', generation: 'XA50 · 2019–2024', spec: '6PK · EPDM 橡胶 · 1 条', price: 32, stock: 92, type: 'stock', arrival: '本地仓现货', volume: .007, weight: .28, stack: true, tag: '', color: '#434b52' },
  { id: 'pump', name: '发动机冷却水泵', en: 'ENGINE WATER PUMP', brand: 'AISIN', oe: '16100-39466', sku: 'CA-CO-008', category: '冷却系统', vehicle: 'Toyota', model: 'RAV4', generation: 'XA50 · 2019–2024', spec: '机械式 · 含密封垫 · 1 套', price: 76, stock: 0, type: 'presale', arrival: '2026-12-05', volume: .025, weight: 1.5, stack: true, tag: '下一批次', color: '#7f9fab' }
];
export const product = id => PRODUCTS.find(p => p.id === id);
export const unit = p => p.spec.includes('套') ? '套' : p.spec.includes('条') ? '条' : '件';
export const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
export const price = (p, role) => round(p.price * ROLES[role].factor);
export const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
export function cartTotal(cart, role) { return round(cart.reduce((sum, line) => sum + price(product(line.id), role) * line.qty, 0)); }
export function validateCart(cart) {
  if (!Array.isArray(cart) || !cart.length) throw new Error('请先选择要采购的商品');
  const ids = new Set();
  for (const line of cart) {
    const p = product(line.id);
    if (!p || ids.has(line.id) || !Number.isInteger(line.qty) || line.qty < 1 || line.qty > 999) throw new Error('商品数量需为 1–999 的整数');
    ids.add(line.id);
    if (p.type === 'stock' && line.qty > p.stock) throw new Error(`${p.name} 最多可采购 ${p.stock} 件`);
  }
}
export function createOrder(cart, role, delivery, address, now = new Date()) {
  if (!ROLES[role]) throw new Error('请选择采购身份');
  validateCart(cart);
  if (!['delivery', 'pickup'].includes(delivery)) throw new Error('请选择交付方式');
  if (!address || !address.contact?.trim() || !address.phone?.trim() || !address.address?.trim()) throw new Error('请填写联系人、联系电话和交付地址');
  const lines = cart.map(line => ({ ...line, unitPrice: price(product(line.id), role), type: product(line.id).type }));
  const subtotal = cartTotal(cart, role), shipping = delivery === 'delivery' ? 12 : 0;
  const id = `CA-${now.toISOString().slice(0, 10).replaceAll('-', '')}-${globalThis.crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  return { id, role, created: now.toISOString(), lines, subtotal, shipping, total: round(subtotal + shipping), delivery, address: { ...address }, payment: 'pending', stages: { stock: 0, presale: 0 } };
}
export function orderGroups(order) { return ['stock', 'presale'].filter(type => order.lines.some(l => l.type === type)); }
export function stages(type, delivery) {
  if (type === 'presale') return ['待采购 / 拼柜', '已发运', '清关中', '已入本地仓', delivery === 'pickup' ? '待自提' : '本地配送', delivery === 'pickup' ? '已提货' : '已完成'];
  return ['待备货', delivery === 'pickup' ? '待自提' : '已出库', ...(delivery === 'pickup' ? [] : ['运输中']), delivery === 'pickup' ? '已提货' : '已完成'];
}
export function orderStatus(order) {
  if (order.payment === 'pending') return '待付款';
  if (order.payment === 'review') return '待核账';
  const groups = orderGroups(order);
  if (groups.every(t => order.stages[t] === stages(t, order.delivery).length - 1)) return '已完成';
  if (groups.includes('presale')) return '预售履约中';
  return stages('stock', order.delivery)[order.stages.stock];
}
export function advanceOrder(order, type) {
  if (order.payment !== 'paid') throw new Error('请先完成模拟核账');
  if (!orderGroups(order).includes(type)) throw new Error('该订单没有此履约分组');
  return { ...order, stages: { ...order.stages, [type]: Math.min(order.stages[type] + 1, stages(type, order.delivery).length - 1) } };
}
export function seedOrders(role) {
  const r = ROLES[role], a = { contact: r.contact, phone: r.phone, address: r.address };
  return [
    { items: [{ id: 'brake', qty: 12 }, { id: 'filter', qty: 24 }], d: 'delivery', date: '2026-10-06T08:24:00Z', payment: 'paid', stock: 2, presale: 0 },
    { items: [{ id: 'shock', qty: 10 }, { id: 'lamp', qty: 6 }], d: 'delivery', date: '2026-10-03T10:15:00Z', payment: 'paid', stock: 0, presale: 1 },
    { items: [{ id: 'plug', qty: 8 }], d: 'pickup', date: '2026-10-01T07:30:00Z', payment: 'paid', stock: 2, presale: 0 }
  ].map((s, i) => ({ ...createOrder(s.items, role, s.d, a, new Date(s.date)), id: `CA-${s.date.slice(0, 10).replaceAll('-', '')}-${role.toUpperCase()}0${i + 1}`, payment: s.payment, stages: { stock: s.stock, presale: s.presale } }));
}
export const BATCHES = {
  november: { label: '11 月联合采购批次', id: 'CN-GE-2611', date: '2026-11-20', lines: [{ id: 'shock', qty: 700 }, { id: 'lamp', qty: 160 }, { id: 'brake', qty: 700 }, { id: 'filter', qty: 2400 }] },
  december: { label: '12 月补货采购批次', id: 'CN-GE-2612', date: '2026-12-05', lines: [{ id: 'pump', qty: 520 }, { id: 'disc', qty: 560 }, { id: 'belt', qty: 800 }, { id: 'plug', qty: 600 }] }
};
export function packing(batch, optimized = true) {
  const volume = round(batch.lines.reduce((s, l) => s + product(l.id).volume * l.qty, 0));
  const weight = round(batch.lines.reduce((s, l) => s + product(l.id).weight * l.qty, 0));
  const capacity = 67.7, packingFactor = optimized ? .92 : .73;
  const usable = capacity * packingFactor;
  const loadedRatio = Math.min(1, usable / volume);
  const loaded = round(volume * loadedRatio);
  return { volume, weight, capacity, loaded, utilization: Math.round(loaded / capacity * 100), free: round(capacity - loaded), packingFactor, unloaded: batch.lines.map(l => ({ ...l, qty: l.qty - Math.floor(l.qty * loadedRatio) })).filter(l => l.qty > 0), arrangement: optimized ? '分区堆叠' : '顺序摆放' };
}
