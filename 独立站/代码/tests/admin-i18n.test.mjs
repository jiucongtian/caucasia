import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {adminMessages} from '../admin/messages.js';
import {messages} from '../src/translations.js';
import {tr,errorMessage,collectVehicle} from '../admin/i18n.js';
test('admin dictionaries cover template messages and preserve interpolation tokens',()=>{
 for(const [key,entry] of Object.entries(adminMessages))for(const lang of ['en','ka','ru']){assert.ok(entry[lang],`${lang}: ${key}`);assert.deepEqual([...entry[lang].matchAll(/\{\w+\}/g)].map(m=>m[0]).sort(),[...key.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort());}
 const source=fs.readFileSync(new URL('../admin/admin.js',import.meta.url),'utf8');for(const [,key] of source.matchAll(/\bt\('([^']+)'/g))assert.ok(adminMessages[key]||messages[key],key);
 assert.match(errorMessage('en','price 数值无效'),/USD/);assert.equal(tr('ru','照片 {n}',{n:2}).includes('2'),true);
});
test('language rerender snapshot preserves all content, version, flags and image order',()=>{const data=new FormData();for(const [k,v] of Object.entries({zh:'中文',en:'English',ka:'ქართული',ru:'Русский',descriptionKa:'ხაზი 1\nხაზი 2',price:'23000.50',mileage:'12',seats:'5',featured:'on'}))data.set(k,v);const images=['/uploads/second.jpg','/uploads/first.jpg'];const value=collectVehicle(data,{id:'existing',version:7,demo:true},images);assert.equal(value.version,7);assert.equal(value.ka,'ქართული');assert.equal(value.descriptionKa,'ხაზი 1\nხაზი 2');assert.equal(value.price,23000.5);assert.equal(value.demo,false);assert.equal(value.featured,true);assert.deepEqual(value.images,images);assert.notEqual(value.images,images);});
