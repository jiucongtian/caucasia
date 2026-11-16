export const headers = ['文案键', '使用场景', '中文', 'English', 'ქართული（格鲁吉亚语）', 'Русский（俄语）', '占位符说明', '校对要点', '中文修订', '英文修订', '格鲁吉亚语修订', '俄语修订', '审校状态', '审校人', '备注'];
const contexts = {load:'公共筛选',persist:'浏览器保存提示',setRole:'角色/供给',empty:'空状态',shell:'导航/页眉/页脚',catalog:'商品目录与搜索',qtyControl:'数量控件',cartLines:'采购清单商品',checkout:'确认订单',success:'采购成功',orders:'订单列表',packingView:'拼柜规划',dashboard:'运营大屏',accountView:'账户中心',productModal:'商品详情',rolesModal:'身份切换',cartModal:'采购清单',orderModal:'订单详情/物流',helpModal:'演示指南',renderModal:'弹窗辅助功能',changeQty:'数量验证',addCart:'操作反馈/表单验证',data:'商品/角色/履约基础词汇',date:'格鲁吉亚日期兼容' };
export function reviewNote(row) {
  if (/跨境预售|预售/.test(row.zh)) return '指进口备货预订，不表示已在本地仓；确认当地行业惯用说法。';
  if (/核账/.test(row.zh)) return '指核验采购订单付款，不是财务审计、对账单或银行结算。';
  if (/直营/.test(row.zh)) return '指公司自营分支门店，区别于独立经销商；确认当地业务组织名称。';
  if (/经销/.test(row.zh)) return '对应Distributor/დისტრიბუტორი/Дистрибьютор；核对业务是否实际更接近批发商。';
  if (/拼柜|装填|堆叠|装箱|40HQ/.test(row.zh)) return '区分集货、装载规划与堆叠；这是假设参数模拟，不能表达为已验证AI最优方案。';
  if (/拆车件/.test(row.zh)) return '指从车辆拆解取得的二手配件，不等同于再制造件。';
  if (/自提/.test(row.zh)) return '买家到指定仓库取货，不是门店配送或货到付款。';
  if (/^data\./.test(row.id) && /刹车|制动|滤|减震|大灯|火花塞|皮带|水泵|轮|气压|电极|密封|橡胶/.test(row.zh)) return '按汽配目录核对名称、左右/前后、整件/总成/套装与计量单位。产品及适配为演示数据。';
  if (/地址|第比利斯|库塔伊西|Akaki|Kakheti|Chavchavadze/.test(row.zh)) return '地名按当地惯用拼写；地址是演示样例，不代表真实营业地址。';
  if (/\{\w+\}/.test(row.zh)) return '保留花括号内变量名；可以调整变量在句中的顺序，核对单复数与变格。';
  if (/[A-Z]{3,}/.test(row.zh)) return '品牌、OE、SKU、车型代号保持原样；标题按当地界面语气改写。';
  return '核对当地B2B采购界面的自然表达、用语一致性及按钮长度。';
}
const parameterNotes = {"setRole.4aa3af5e": "v0=采购身份", "shell.235ca7f0": "v12=采购身份", "catalog.075bd6b2": "v0=本地库存数量", "catalog.11580a5d": "v0=本地化日期", "catalog.238d50e3": "v1=商品名称", "catalog.fb3fa90f": "v4=商品名称", "catalog.e9d5810e": "v20=商品名称", "catalog.4ae454c3": "v18=匹配商品款数", "qtyControl.a574103c": "v6=商品名称", "cartLines.62d5f916": "v0=数量", "cartLines.3e914605": "v1=商品名称", "checkout.5199890d": "v5=本地化USD金额", "checkout.96727ef6": "v13=商品款数；v14=总数量", "checkout.573dfcec": "v18=采购身份", "orders.7b34a69b": "v5=首个商品名称；v6=商品款数", "orders.797bbae4": "v7=总数量；v8=交付方式", "orders.22aa816b": "v3=账号名称", "packingView.e6270a64": "v2=数量；v3=堆叠规则", "packingView.f846838f": "v5=未装入数量或待生成状态", "packingView.87647d55": "v0=商品名称；v1=数量", "packingView.ecbbad88": "v1=装载结果说明", "packingView.473ecb82": "v3=本地化到货日期", "accountView.0276d7e1": "v4=采购身份", "accountView.0e36e50e": "v6=价格系数", "accountView.d5b6d4a7": "v14=订单笔数", "productModal.406aeb2e": "v0=本地库存数量", "productModal.e51b5aec": "v0=本地化到货日期", "productModal.475a7577": "v2=商品名称", "rolesModal.740295bb": "v5=价格方案；v6=价格系数", "cartModal.70d3632a": "v1=采购身份", "cartModal.0d0c2d62": "v0=商品款数；v1=总数量", "orderModal.a6b5bc55": "v0=本地化预计日期", "orderModal.7aef1806": "v0=预计日期列表", "orderModal.dd997a3a": "v1=本地化下单时间；v2=采购身份", "orderModal.a3c03261": "v7=本地化USD总额", "changeQty.c1d76d5b": "v0=最大可采购数量", "addCart.6022b87b": "v0=商品名称；v1=数量", "data.a4d4b817": "name=商品名称；count=库存上限"};
export function reviewRows(messages) {
  return messages.map(row => [row.id, contexts[row.context] || row.context, row.zh, row.en, row.ka, row.ru, parameterNotes[row.id] || '', reviewNote(row), '', '', '', '', '待专业审校', '', '']);
}
