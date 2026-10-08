import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, BATCHES, product, price, cartTotal, createOrder, seedOrders, advanceOrder, orderStatus, orderGroups, stages, validateCart, packing } from '../src/domain.js';
const address = { contact: 'Giorgi', phone: '+995 555 123456', address: 'Tbilisi warehouse' };
test('角色价格以及购物车按分精确计算', () => {
  assert.equal(price(product('brake'), 'repair'), 100);
  assert.equal(price(product('brake'), 'dealer'), 65);
  assert.equal(price(product('brake'), 'store'), 55);
  assert.equal(cartTotal([{ id: 'filter', qty: 3 }], 'dealer'), 35.1);
});
test('混合订单保留成交价，配送与自提结算正确', () => {
  const lines = [{ id: 'brake', qty: 2 }, { id: 'shock', qty: 1 }];
  const o = createOrder(lines, 'dealer', 'delivery', address);
  assert.equal(o.total, 222.6);
  assert.deepEqual(orderGroups(o), ['stock', 'presale']);
  assert.equal(o.lines[0].unitPrice, 65);
  assert.equal(createOrder(lines, 'dealer', 'pickup', address).total, 210.6);
  lines[0].qty = 8; address.contact = 'Changed';
  assert.equal(o.lines[0].qty, 2);
  assert.equal(o.address.contact, 'Giorgi');
});
test('拒绝空清单、小数、负数、超库存、非法角色和缺失交付信息', () => {
  for (const cart of [[], [{ id: 'brake', qty: 1.5 }], [{ id: 'brake', qty: 0 }], [{ id: 'brake', qty: 129 }], [{ id: 'bad', qty: 1 }]]) assert.throws(() => validateCart(cart));
  assert.throws(() => createOrder([{ id: 'brake', qty: 1 }], 'unknown', 'pickup', address));
  assert.throws(() => createOrder([{ id: 'brake', qty: 1 }], 'repair', 'pickup', { ...address, phone: ' ' }));
});
test('核账前不可履约，混合订单需全部分组完成', () => {
  let o = createOrder([{ id: 'brake', qty: 1 }, { id: 'shock', qty: 1 }], 'repair', 'pickup', address);
  assert.throws(() => advanceOrder(o, 'stock'));
  o.payment = 'paid';
  for (let i = 0; i < 10; i++) o = advanceOrder(o, 'stock');
  assert.equal(o.stages.stock, stages('stock', 'pickup').length - 1);
  assert.notEqual(orderStatus(o), '已完成');
  for (let i = 0; i < 10; i++) o = advanceOrder(o, 'presale');
  assert.equal(orderStatus(o), '已完成');
});
test('演示账号种子独立且身份正确，订单编号不重复', () => {
  const a = seedOrders('repair'), b = seedOrders('dealer');
  assert.ok(a.every(o => o.role === 'repair'));
  assert.ok(b.every(o => o.role === 'dealer'));
  assert.equal(new Set([...a, ...b].map(o => o.id)).size, 6);
  a[0].lines[0].qty = 9;
  assert.equal(b[0].lines[0].qty, 12);
});
test('拼柜假设参数可追溯且装载量不超过容积', () => {
  for (const batch of Object.values(BATCHES)) {
    const basic = packing(batch, false), optimized = packing(batch, true);
    assert.ok(basic.loaded <= basic.capacity && optimized.loaded <= optimized.capacity);
    assert.ok(optimized.loaded >= basic.loaded);
    assert.ok(optimized.free >= 0 && optimized.weight < 26000);
    assert.equal(optimized.volume, Math.round(batch.lines.reduce((s, l) => s + product(l.id).volume * l.qty, 0) * 100) / 100);
    assert.ok(optimized.unloaded.every(l => Number.isInteger(l.qty) && l.qty > 0));
  }
});
