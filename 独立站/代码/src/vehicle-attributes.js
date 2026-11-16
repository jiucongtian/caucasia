import {escapeHTML as esc} from './domain.js';
const L=(zh,en,ka,ru)=>({zh,en,ka,ru});
const unknown=L('待确认','Not confirmed','დასაზუსტებელია','Не уточнено');
const yesNo=[['unknown',unknown],['yes',L('有','Yes','არის','Да')],['no',L('无','No','არ არის','Нет')]];
const equipment=[['unknown',unknown],['present',L('配备','Equipped','აღჭურვილია','Есть')],['absent',L('未配备','Not equipped','არ არის აღჭურვილი','Нет')]];
const documents=[['unknown',unknown],['provided',L('已提供','Provided','წარმოდგენილია','Предоставлено')],['missing',L('未提供','Not provided','არ არის წარმოდგენილი','Не предоставлено')],['na',L('不适用','Not applicable','არ ვრცელდება','Не применимо')]];
export const attributeGroups={
 specs:L('补充车辆参数','Additional specifications','დამატებითი მახასიათებლები','Дополнительные характеристики'),
 equipment:L('主要配置','Main equipment','ძირითადი აღჭურვილობა','Основное оснащение'),
 condition:L('车况与历史','Condition & history','მდგომარეობა და ისტორია','Состояние и история'),
 documents:L('资料状态','Document availability','დოკუმენტების ხელმისაწვდომობა','Наличие документов')
};
export const attributeHelp=L('未填写或待确认的项目不在商品页展示。配置和资料状态由商家录入，不代表平台已核验；“已提供”不代表已验证真实性。证件原件请通过线下安全渠道核对，不要上传到公开车辆图集。','Blank or unconfirmed fields are hidden on the vehicle page. Equipment and document statuses are seller-reported, not platform verification. “Provided” does not verify authenticity. Check original documents privately; do not upload them to the public vehicle gallery.','შეუვსებელი ან დაუზუსტებელი ველები ავტომობილის გვერდზე არ ჩანს. აღჭურვილობისა და დოკუმენტების სტატუსს უთითებს გამყიდველი; ეს არ ნიშნავს პლატფორმის შემოწმებას. „წარმოდგენილია“ არ ადასტურებს ნამდვილობას. ორიგინალები შეამოწმეთ პირადად და არ ატვირთოთ საჯარო გალერეაში.','Незаполненные и неуточнённые поля не отображаются на странице автомобиля. Оснащение и наличие документов указаны продавцом и не означают проверку платформой. «Предоставлено» не подтверждает подлинность. Оригиналы проверяйте лично, не загружайте их в публичную галерею.');
export const publicAttributeHelp=L('以下配置、车况和资料状态由商家维护，资料已提供不代表已核验，详情与原件请联系商家确认。','Equipment, condition and document statuses are maintained by the seller. Provided documents are not necessarily verified. Contact the seller to check details and originals.','აღჭურვილობის, მდგომარეობისა და დოკუმენტების სტატუსს უთითებს გამყიდველი. წარმოდგენილი დოკუმენტი არ ნიშნავს შემოწმებულს. დეტალებისა და ორიგინალების დასაზუსტებლად დაუკავშირდით გამყიდველს.','Оснащение, состояние и наличие документов указаны продавцом. Предоставленные документы не обязательно проверены. Уточните детали и оригиналы у продавца.');
export const attributeError=L('车辆扩展信息无效，请检查填写格式和范围。','Invalid vehicle details. Check formats and ranges.','ავტომობილის დამატებითი მონაცემები არასწორია. შეამოწმეთ ფორმატი და დიაპაზონი.','Некорректные данные автомобиля. Проверьте формат и диапазон.');
export const attributeLabel=(label,lang)=>label[lang]||label.en;
const f=(key,group,label,type,options={})=>({key,group,label,type,...options});
export const attributeFields=[
 f('trim','specs',L('配置版本 / 款型','Trim / version','კომპლექტაცია / ვერსია','Комплектация / версия'),'text',{maxLength:120}),
 f('firstRegistration','specs',L('首次登记年月','First registration','პირველი რეგისტრაცია','Первая регистрация'),'month'),
 f('powerHp','specs',L('最大马力（匹）','Power (hp)','სიმძლავრე (ცხ.ძ.)','Мощность (л.с.)'),'number',{max:3000,step:1}),
 f('displacementL','specs',L('排量（L）','Displacement (L)','ძრავის მოცულობა (ლ)','Объём двигателя (л)'),'number',{max:20,step:0.001}),
 f('drive','specs',L('驱动形式','Drivetrain','ამძრავი','Привод'),'select',{options:[['unknown',unknown],['fwd',L('前驱','FWD','წინა','Передний')],['rwd',L('后驱','RWD','უკანა','Задний')],['awd',L('四驱','AWD / 4WD','სრული','Полный')]]}),
 f('steering','specs',L('方向盘位置','Steering position','საჭის მდებარეობა','Расположение руля'),'select',{options:[['unknown',unknown],['left',L('左舵','Left-hand drive','მარცხენა','Слева')],['right',L('右舵','Right-hand drive','მარჯვენა','Справа')]]}),
 f('color','specs',L('车身颜色','Exterior colour','ძარის ფერი','Цвет кузова'),'select',{options:[['unknown',unknown],['black',L('黑色','Black','შავი','Чёрный')],['white',L('白色','White','თეთრი','Белый')],['silver',L('银色','Silver','ვერცხლისფერი','Серебристый')],['grey',L('灰色','Grey','ნაცრისფერი','Серый')],['blue',L('蓝色','Blue','ლურჯი','Синий')],['red',L('红色','Red','წითელი','Красный')],['green',L('绿色','Green','მწვანე','Зелёный')],['other',L('其他','Other','სხვა','Другой')]]}),
 f('batteryKwh','specs',L('电池容量（kWh）','Battery capacity (kWh)','ბატარეის მოცულობა (kWh)','Ёмкость батареи (кВт⋅ч)'),'number',{max:500,step:0.1}),
 f('rangeKm','specs',L('标称纯电续航（km）','Rated electric range (km)','ნომინალური ელექტრო სვლა (კმ)','Заявленный электрический запас хода (км)'),'number',{max:3000,step:1}),
 f('rangeStandard','specs',L('续航测试标准','Range test standard','სვლის ტესტის სტანდარტი','Стандарт измерения запаса хода'),'select',{options:[['unknown',unknown],...['CLTC','WLTP','NEDC','EPA'].map(v=>[v,L(v,v,v,v)])]}),
 f('cruise','equipment',L('定速巡航','Cruise control','კრუიზ-კონტროლი','Круиз-контроль'),'select',{options:equipment}),
 f('adaptiveCruise','equipment',L('自适应巡航','Adaptive cruise control','ადაპტური კრუიზ-კონტროლი','Адаптивный круиз-контроль'),'select',{options:equipment}),
 f('rearCamera','equipment',L('倒车影像','Reversing camera','უკანა ხედვის კამერა','Камера заднего вида'),'select',{options:equipment}),
 f('camera360','equipment',L('360°全景影像','360° camera','360° კამერა','Камеры 360°'),'select',{options:equipment}),
 f('multifunctionWheel','equipment',L('多功能方向盘','Multifunction steering wheel','მრავალფუნქციური საჭე','Многофункциональный руль'),'select',{options:equipment}),
 f('sunroof','equipment',L('天窗','Sunroof','ლუქი','Люк'),'select',{options:equipment}),
 f('navigation','equipment',L('导航','Navigation','ნავიგაცია','Навигация'),'select',{options:equipment}),
 f('ledLights','equipment',L('LED大灯','LED headlights','LED ფარები','Светодиодные фары'),'select',{options:equipment}),
 f('leatherSeats','equipment',L('真皮座椅','Leather seats','ტყავის სავარძლები','Кожаные сиденья'),'select',{options:equipment}),
 f('keyless','equipment',L('无钥匙进入','Keyless entry','გასაღების გარეშე შესვლა','Бесключевой доступ'),'select',{options:equipment}),
 f('heatedSeats','equipment',L('座椅加热','Heated seats','სავარძლების გათბობა','Подогрев сидений'),'select',{options:equipment}),
 f('ventilatedSeats','equipment',L('座椅通风','Ventilated seats','სავარძლების ვენტილაცია','Вентиляция сидений'),'select',{options:equipment}),
 f('powerTailgate','equipment',L('电动尾门','Power tailgate','ელექტრო საბარგული','Электропривод багажника'),'select',{options:equipment}),
 f('laneAssist','equipment',L('车道保持辅助','Lane keeping assist','ზოლის შენარჩუნების დამხმარე','Удержание в полосе'),'select',{options:equipment}),
 f('accident','condition',L('事故记录','Accident history','ავარიის ისტორია','История ДТП'),'select',{options:yesNo}),
 f('flood','condition',L('泡水记录','Flood history','დატბორვის ისტორია','Следы затопления'),'select',{options:yesNo}),
 f('fire','condition',L('火烧记录','Fire history','ხანძრის ისტორია','Следы пожара'),'select',{options:yesNo}),
 f('repaint','condition',L('补漆记录','Repainting history','გადაღებვის ისტორია','История перекраски'),'select',{options:yesNo}),
 f('structuralRepair','condition',L('结构件维修记录','Structural repairs','კონსტრუქციული შეკეთება','Ремонт силовых элементов'),'select',{options:yesNo}),
 f('transferCount','condition',L('过户次数','Ownership transfers','მფლობელის ცვლილებები','Количество переоформлений'),'number',{max:50,step:1}),
 f('batterySoh','condition',L('电池健康度 SOH（%）','Battery health SOH (%)','ბატარეის ჯანმრთელობა SOH (%)','Состояние батареи SOH (%)'),'number',{max:100,step:0.1}),
 f('inspectionDate','condition',L('最近检测日期','Latest inspection date','ბოლო შემოწმების თარიღი','Дата последней проверки'),'date'),
 f('keyCount','documents',L('钥匙数量（把）','Number of keys','გასაღებების რაოდენობა','Количество ключей'),'number',{max:20,step:1}),
 f('registration','documents',L('行驶证 / 注册凭证','Vehicle registration document','ავტომობილის რეგისტრაციის მოწმობა','Свидетельство о регистрации'),'select',{options:documents}),
 f('title','documents',L('登记证书 / 所有权文件','Title / ownership document','საკუთრების დოკუმენტი','Документ о праве собственности'),'select',{options:documents}),
 f('nameplate','documents',L('铭牌资料','Manufacturer plate','მწარმოებლის ფირფიტა','Табличка изготовителя'),'select',{options:documents}),
 f('serviceRecords','documents',L('维保记录','Service records','სერვისის ჩანაწერები','История обслуживания'),'select',{options:documents}),
 f('inspectionReport','documents',L('检测报告','Inspection report','შემოწმების ანგარიში','Отчёт о проверке'),'select',{options:documents}),
 f('insuranceRecords','documents',L('出险记录','Insurance claim records','სადაზღვევო შემთხვევების ჩანაწერები','История страховых случаев'),'select',{options:documents}),
 f('exportDocuments','documents',L('出口资料','Export documents','საექსპორტო დოკუმენტები','Экспортные документы'),'select',{options:documents}),
 f('customsDocuments','documents',L('清关资料','Customs documents','განბაჟების დოკუმენტები','Таможенные документы'),'select',{options:documents})
];
const defaultValue=field=>field.type==='select'?'unknown':'';
export function validateAttributes(input,previous={}){
 if(input===undefined)return {...previous};
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('vehicle_attributes_invalid');
 const keys=new Set(attributeFields.map(f=>f.key));if(Object.keys(input).some(k=>!keys.has(k)))throw new Error('vehicle_attributes_invalid');
 const result={};for(const field of attributeFields){let v=Object.hasOwn(input,field.key)?input[field.key]:(previous[field.key]??defaultValue(field));
  if(field.type==='number'){if(v===''){}else if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>field.max||(field.step===1&&!Number.isInteger(v)))throw new Error('vehicle_attributes_invalid');}
  else if(typeof v!=='string')throw new Error('vehicle_attributes_invalid');
  else if(field.type==='select'){if(!field.options.some(([k])=>k===v))throw new Error('vehicle_attributes_invalid');}
  else if(field.type==='text'){v=v.trim();if(v.length>field.maxLength)throw new Error('vehicle_attributes_invalid');}
  else if(v){const pattern=field.type==='month'?/^(19|20)\d{2}-(0[1-9]|1[0-2])$/:/^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;if(!pattern.test(v)||(field.type==='date'&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v))throw new Error('vehicle_attributes_invalid');}
  result[field.key]=v;
 }return result;
}
export function collectAttributes(data,previous={}){const result={...previous};for(const f of attributeFields){const key='attr_'+f.key;if(data.has(key)){const v=data.get(key);result[f.key]=f.type==='number'&&v!==''?Number(v):v;}}return result;}
export function attributeEditor(values={},lang='ka'){
 return Object.entries(attributeGroups).map(([group,label])=>`<section class="panel attribute-panel"><h2>${esc(attributeLabel(label,lang))}</h2>${group==='specs'?`<p class="muted">${esc(attributeLabel(attributeHelp,lang))}</p>`:''}<div class="form-grid">${attributeFields.filter(f=>f.group===group).map(f=>{const v=values[f.key]??defaultValue(f),name='attr_'+f.key;return `<label for="${name}">${esc(attributeLabel(f.label,lang))}</label>`+ (f.type==='select'?`<select id="${name}" name="${name}">${f.options.map(([k,l])=>`<option value="${k}" ${v===k?'selected':''}>${esc(attributeLabel(l,lang))}</option>`).join('')}</select>`:`<input id="${name}" name="${name}" type="${f.type}" value="${esc(v)}" ${f.type==='number'?`min="0" max="${f.max}" step="${f.step}"`:f.type==='text'?`maxlength="${f.maxLength}"`:''}>`);}).map(html=>`<div class="attribute-field">${html}</div>`).join('')}</div></section>`).join('');
}
export function attributeSections(values={},lang='ka'){
 return Object.entries(attributeGroups).map(([group,label])=>{
  const fields=attributeFields.filter(f=>{
   if(f.group!==group)return false;
   const v=values[f.key];
   if(group==='equipment')return v==='present';
   if(f.type==='select')return v!=='unknown'&&f.options.some(([k])=>k===v);
   if(f.type==='number')return typeof v==='number'&&Number.isFinite(v);
   return typeof v==='string'&&v.trim()!=='';
  });
  if(!fields.length)return '';
  const content=group==='equipment'
   ? '<ul class="equipment-list">'+fields.map(f=>'<li>'+esc(attributeLabel(f.label,lang))+'</li>').join('')+'</ul>'
   : '<dl class="spec-grid">'+fields.map(f=>{const v=values[f.key],text=f.type==='select'?attributeLabel(f.options.find(([k])=>k===v)[1],lang):String(v);return '<div><dt>'+esc(attributeLabel(f.label,lang))+'</dt><dd>'+esc(text)+'</dd></div>';}).join('')+'</dl>';
  return '<section class="panel detail-section"><h2>'+esc(attributeLabel(label,lang))+'</h2>'+(group==='documents'?'<p class="muted">'+esc(attributeLabel(publicAttributeHelp,lang))+'</p>':'')+content+'</section>';
 }).join('');
}
