import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {messages} from '../src/translations.js';
import {languages,initialLanguage,translate,localizedName,localizedDescription,switchLanguageURL} from '../src/i18n.js';
import {safeReturn,filterVehicles} from '../src/domain.js';
test('Georgian default, explicit URL priority, valid saved preference and invalid preference fallback',()=>{
 assert.equal(initialLanguage('/',null),'ka');assert.equal(initialLanguage('/','invalid'),'ka');assert.equal(initialLanguage('/','ru'),'ru');assert.equal(initialLanguage('/ka/vehicles','ru'),'ka');assert.deepEqual(languages.map(x=>x.id),['ka','ru','en','zh']);
});
test('switch locale keeps model, filters and safe return route without changing IDs or values',()=>{
 const url=switchLanguageURL('/ka/vehicles/han','?returnTo='+encodeURIComponent('/ka/vehicles?brand=byd&max=30000')+'&foo=1','ru');
 const parsed=new URL(url,'https://example.test');assert.equal(parsed.pathname,'/ru/vehicles/han');assert.equal(parsed.searchParams.get('returnTo'),'/ru/vehicles?brand=byd&max=30000');assert.equal(parsed.searchParams.get('foo'),'1');assert.equal(safeReturn('/ru/vehicles?brand=byd'),'/ru/vehicles?brand=byd');assert.equal(safeReturn('/ka/favorites'),'/ka/favorites');assert.equal(safeReturn('//evil.test'),null);assert.throws(()=>switchLanguageURL('/ka','','xx'));
});
test('all public UI labels have nonempty Georgian/Russian translations and preserve allowed HTML',()=>{
 const source=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const keys=[...source.matchAll(/\bt\('((?:\\.|[^'\\])*)','((?:\\.|[^'\\])*)'\)/g)].map(m=>m[1]);
 keys.push('搜索车源','应用筛选');
 for(const m of source.matchAll(/(?:title|sectionHead)\('([^']+)'/g))keys.push(m[1]);
 for(const key of new Set(keys)){assert.ok(messages[key],`Missing key: ${key}`);for(const lang of ['ka','ru']){assert.ok(messages[key][lang]?.trim(),`${lang}: ${key}`);assert.ok(!/[\u4e00-\u9fff]/.test(messages[key][lang]),`Chinese fallback in ${key}`);assert.equal((messages[key][lang].match(/<br>/g)||[]).length,(key.match(/<br>/g)||[]).length,`line breaks: ${key}`);assert.ok(!/<(?!br>)/.test(messages[key][lang]));}}
 assert.equal(translate('ka','首页','Home'),'მთავარი');assert.equal(translate('ru','车源','Vehicles'),'Автомобили');assert.equal(translate('en','首页','Home'),'Home');
});
test('localized vehicle content falls back without mutating inventory and is searchable in new languages',()=>{
 const car={id:'test',code:'SL-TEST',brand:'byd',zh:'车型',en:'Model',ka:'მოდელი',ru:'Модель',descriptionZh:'中文',descriptionEn:'English',descriptionKa:'ქართული აღწერა',descriptionRu:'Русское описание',price:12345,date:'2026-11',mileage:1,energy:'ev'};const original=JSON.stringify(car);
 assert.equal(localizedName(car,'ka'),'მოდელი');assert.equal(localizedName({...car,ka:''},'ka'),'Model');assert.deepEqual(localizedDescription(car,'ru'),{text:'Русское описание',language:'ru'});assert.deepEqual(localizedDescription({...car,descriptionKa:''},'ka'),{text:'English',language:'en'});assert.equal(filterVehicles([car],{q:'Модель'})[0].id,'test');assert.equal(filterVehicles([car],{q:'მოდელი'})[0].id,'test');assert.equal(JSON.stringify(car),original);
});
