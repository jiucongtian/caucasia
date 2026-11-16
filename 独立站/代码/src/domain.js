import {brands,rates} from './data.js';
export function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export const priceValue=(car,currency='USD')=>Math.round(car.price*(rates[currency]||1));
export function filterVehicles(cars,params,currency='USD'){
 const p=params instanceof URLSearchParams?params:new URLSearchParams(params);
 const q=(p.get('q')||'').trim().toLowerCase();
 const rows=cars.filter(c=>{
  const b=brands.find(b=>b.id===c.brand);
  if(q&&!`${c.zh} ${c.en} ${b.zh} ${b.en} ${c.code}`.toLowerCase().includes(q))return false;
  if(p.get('brand')&&p.get('brand')!==c.brand)return false;
  if(p.get('model')&&p.get('model')!==c.id)return false;
  if(p.get('energy')&&p.get('energy')!==c.energy)return false;
  if(p.get('from')&&c.date<p.get('from'))return false;
  if(p.get('to')&&c.date>p.get('to'))return false;
  const price=priceValue(c,currency);
  for(const [key,value,lower] of [['min',price,true],['max',price,false],['mileageMin',c.mileage,true],['mileageMax',c.mileage,false]]){
   if(p.get(key)&&Number.isFinite(Number(p.get(key)))&&(lower?value<Number(p.get(key)):value>Number(p.get(key))))return false;
  }
  return true;
 });
 const sort=p.get('sort');
 rows.sort((a,b)=>sort==='price-asc'?a.price-b.price:sort==='price-desc'?b.price-a.price:sort==='mileage'?a.mileage-b.mileage:b.date.localeCompare(a.date));
 return rows;
}
export function validateRanges(p){
 for(const [a,b] of [['min','max'],['mileageMin','mileageMax']])if(p.get(a)&&p.get(b)&&Number(p.get(a))>Number(p.get(b)))return false;
 if(p.get('from')&&p.get('to')&&p.get('from')>p.get('to'))return false;
 return true;
}
export function safeReturn(value){return typeof value==='string'&&/^\/(zh|en)\/(vehicles|favorites)(\?|$)/.test(value)?value:null;}
