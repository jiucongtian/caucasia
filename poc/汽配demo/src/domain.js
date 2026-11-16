import { ORDER_PRODUCTS } from './order-catalog.js';

export const ROLES = {
  repair: { label: '汽修店', name: 'Tbilisi Auto Service', initials: 'TA', factor: 1, description: '维修门店采购价', address: '格鲁吉亚 · 第比利斯 · Akaki Tsereteli Ave 116', contact: 'Giorgi', phone: '+995 555 01 28 36' },
  dealer: { label: '经销商', name: 'Caucasus Parts Distribution', initials: 'CP', factor: .65, description: '经销商采购价', address: '格鲁吉亚 · 库塔伊西 · Chavchavadze Ave 34', contact: 'David', phone: '+995 555 02 38 46' },
  store: { label: '直营店', name: 'Starlink 第比利斯直营店', initials: 'CA', factor: .55, description: '直营店内部价', address: '格鲁吉亚 · 第比利斯 · Kakheti Highway 12', contact: 'Nika', phone: '+995 555 03 48 56' }
};
export const PRODUCTS = ORDER_PRODUCTS;
export const product = id => PRODUCTS.find(p => p.id === id);
export const unit = p => p.spec.includes('瓶') ? '瓶' : p.spec.includes('副') ? '副' : p.spec.includes('套') ? '套' : p.spec.includes('条') ? '条' : '件';
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
    if (p.type === 'stock' && line.qty > p.stock) throw Object.assign(new Error(`${p.name} 最多可采购 ${p.stock} ${unit(p)}`), { code: 'STOCK_LIMIT', partName: p.name, limit: p.stock, unit: unit(p) });
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
  if (!ROLES[role]) throw new Error('请选择采购身份');
  return [];
}
export const BATCHES = {
  november: { label: '订单滤清与制动配件', id: 'ORD-20261009-A', date: '2026-11-20', lines: [{ id: 'order-001', qty: 100 }, { id: 'order-003', qty: 100 }, { id: 'order-015', qty: 100 }, { id: 'order-025', qty: 100 }] },
  december: { label: '订单保养与制动配件', id: 'ORD-20261009-B', date: '2026-12-05', lines: [{ id: 'order-035', qty: 100 }, { id: 'order-036', qty: 100 }, { id: 'order-042', qty: 100 }, { id: 'order-043', qty: 100 }] }
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
