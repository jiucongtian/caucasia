import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openStore} from '../backend/store.mjs';
import {filterVehicles,priceValue} from '../src/domain.js';
import {collectVehicle} from '../admin/i18n.js';

test('sourcing listings preserve unknown numbers without weakening actual-stock validation',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'starlink-sourcing-'));
 let store=openStore(dir);
 try{
  const input={listingType:'sourcing',brand:'deepal',zh:'S05',descriptionZh:'可按需求采购',date:'',price:null,mileage:null,seats:null,energy:'multiple',body:'suv',transmission:'unknown',status:'published',images:['/assets/car-1.webp']};
  const saved=store.save(input);assert.equal(saved.price,null);assert.equal(saved.mileage,null);assert.equal(saved.date,'');
  assert.throws(()=>store.save({...input,listingType:'stock'}));
  assert.throws(()=>store.save({...input,images:[]}));
  assert.throws(()=>store.save({...input,price:-1}));
  assert.throws(()=>store.save({...input,listingType:'invalid'}));
  const old={...saved};delete old.listingType;
  assert.equal(store.save(old,saved.id).listingType,'sourcing');
  store.close();store=openStore(dir);assert.equal(store.list().find(v=>v.id===saved.id).price,null);
 }finally{store.close();fs.rmSync(dir,{recursive:true,force:true});}
});

test('unknown price/mileage/date do not become zero or match numeric filters; known zero remains valid',()=>{
 const rows=[{id:'unknown',brand:'byd',price:null,mileage:null,date:''},{id:'zero',brand:'byd',price:0,mileage:0,date:'2024-01'},{id:'priced',brand:'byd',price:10,mileage:10,date:'2025-01'}];
 assert.equal(priceValue(rows[0]),null);
 for(const sort of ['price-asc','price-desc','mileage'])assert.equal(filterVehicles(rows,{sort}).at(-1).id,'unknown');
 for(const params of [{min:'0'},{max:'100'},{mileageMax:'100'},{from:'2020-01'},{to:'2030-01'}])assert.ok(!filterVehicles(rows,params).some(v=>v.id==='unknown'));
 assert.ok(filterVehicles(rows,{max:'0'}).some(v=>v.id==='zero'));
 const data=new FormData();data.set('listingType','sourcing');for(const key of ['price','mileage','seats'])data.set(key,'');
 const collected=collectVehicle(data,{},[]);assert.equal(collected.price,null);assert.equal(collected.mileage,null);assert.equal(collected.seats,null);
});
