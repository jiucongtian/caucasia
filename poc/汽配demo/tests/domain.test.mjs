import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRODUCTS, BATCHES, product, price, unit, cartTotal, createOrder, seedOrders, advanceOrder, orderStatus, stages, validateCart, packing } from '../src/domain.js';
import { CATALOG_MEDIA, catalogImage, catalogFallback } from '../src/catalog-media.js';

const address = { contact: 'Giorgi', phone: '+995 555 123456', address: 'Tbilisi warehouse' };

test('订单目录完整且品牌映射覆盖简写车型', () => {
  assert.equal(PRODUCTS.length, 93);
  assert.equal(new Set(PRODUCTS.map(p => p.sourceRow)).size, 93);
  assert.deepEqual(product('order-005').fitments.map(f => f.brand), ['方程豹', '方程豹']);
  assert.deepEqual(product('order-035').fitments.map(f => f.model), ['启源Q05', '启源Q07', '深蓝S05', '深蓝S07']);
  assert.equal(product('order-059').model, '元PLUS');
  assert.equal(product('order-072').model, '宋PLUS');
  assert.equal(product('order-086').model, '海豹06');
  assert.equal(product('order-010').fitments.some(f => f.model === '海'), false);
  assert.ok(PRODUCTS.every(p => p.price > 0 && p.description && p.imageKey));
});

test('滤芯、油液及常见零件的图片品类和计价单位对应', () => {
  const expected = {
    1: ['oil-filter', '件'], 3: ['engine-air', '件'], 6: ['cabin-air', '件'],
    9: ['reducer-filter', '件'], 12: ['fluid', '瓶'], 15: ['brake-pad', '副'],
    25: ['disc', '件'], 46: ['control-arm', '件'], 48: ['shock', '件'],
    50: ['bearing', '件'], 52: ['stabilizer-link', '件'], 53: ['bumper', '件'],
    54: ['lamp', '件'], 55: ['grille', '件'], 56: ['fender', '件'], 57: ['tie-rod', '件']
  };
  for (const [row, [imageKey, itemUnit]] of Object.entries(expected)) {
    const item = PRODUCTS.find(p => p.sourceRow === Number(row));
    assert.equal(item.imageKey, imageKey, `source row ${row} image`);
    assert.equal(unit(item), itemUnit, `source row ${row} unit`);
  }
  assert.ok(PRODUCTS.filter(p => p.category === '油液养护').every(p => unit(p) === '瓶'));
  assert.ok(PRODUCTS.filter(p => p.name.includes('刹车片')).every(p => unit(p) === '副'));
  assert.ok(PRODUCTS.filter(p => p.name.includes('滤')).every(p => unit(p) === '件'));
});

test('每个商品均使用存在的实物照片，失败回退仍为照片', () => {
  assert.equal(Object.keys(CATALOG_MEDIA).length, 16);
  for (const item of PRODUCTS) {
    const photo = CATALOG_MEDIA[item.imageKey];
    assert.ok(photo?.page && photo.credit, item.name);
    const src = catalogImage(item);
    assert.match(src, /\.(?:jpg|webp)$/i, item.name);
    assert.match(catalogFallback(item), /\.(?:jpe?g|webp)(?:\?|$)/i, item.name);
    const bytes = readFileSync(new URL(`../${src.replace(/^\.\//, '')}`, import.meta.url));
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    const webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    assert.ok(jpeg || webp, `${item.name}: invalid photo`);
  }
});

test('演示角色价格和订单金额按商品计算', () => {
  assert.equal(price(product('order-001'), 'repair'), 18);
  assert.equal(price(product('order-001'), 'dealer'), 11.7);
  assert.equal(cartTotal([{ id: 'order-001', qty: 3 }], 'dealer'), 35.1);
  const lines = [{ id: 'order-001', qty: 2 }, { id: 'order-015', qty: 1 }];
  const order = createOrder(lines, 'dealer', 'delivery', address);
  assert.equal(order.total, 79.6);
  assert.equal(order.lines[0].unitPrice, 11.7);
  lines[0].qty = 8;
  address.contact = 'Changed';
  assert.equal(order.lines[0].qty, 2);
  assert.equal(order.address.contact, 'Giorgi');
});

test('校验数量、库存与履约', () => {
  for (const cart of [[], [{ id: 'order-001', qty: 1.5 }], [{ id: 'order-001', qty: 0 }], [{ id: 'order-001', qty: 121 }], [{ id: 'brake', qty: 1 }]]) assert.throws(() => validateCart(cart));
  let order = createOrder([{ id: 'order-001', qty: 1 }], 'repair', 'pickup', { contact: 'Giorgi', phone: '+995 555 123456', address: 'Tbilisi warehouse' });
  assert.throws(() => advanceOrder(order, 'stock'));
  order.payment = 'paid';
  for (let i = 0; i < 10; i++) order = advanceOrder(order, 'stock');
  assert.equal(order.stages.stock, stages('stock', 'pickup').length - 1);
  assert.equal(orderStatus(order), '已完成');
  assert.deepEqual(seedOrders('repair'), []);
});

test('拼柜演示批次只引用新目录商品', () => {
  for (const batch of Object.values(BATCHES)) {
    assert.ok(batch.lines.every(line => product(line.id)));
    const basic = packing(batch, false), optimized = packing(batch, true);
    assert.ok(basic.loaded <= basic.capacity && optimized.loaded <= optimized.capacity);
    assert.ok(optimized.loaded >= basic.loaded);
  }
});
