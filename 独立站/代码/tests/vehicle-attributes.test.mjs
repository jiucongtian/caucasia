import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAttributes,collectAttributes,attributeFields,attributeGroups,attributeHelp,attributeError,attributeSections,attributeEditor} from '../src/vehicle-attributes.js';
import {collectVehicle,errorMessage} from '../admin/i18n.js';
test('unknown remains distinct from no, missing documents and zero; partial and legacy edits preserve data',()=>{
 const old=validateAttributes({accident:'no',sunroof:'absent',registration:'missing',keyCount:0,batterySoh:98.5});
 assert.equal(old.flood,'unknown');assert.equal(old.transferCount,'');assert.equal(old.keyCount,0);
 assert.deepEqual(validateAttributes(undefined,old),old);assert.equal(validateAttributes({registration:'provided'},old).batterySoh,98.5);assert.equal(validateAttributes({batterySoh:''},old).batterySoh,'');assert.equal(validateAttributes({accident:'unknown'},old).accident,'unknown');
 const html=attributeSections(old,'zh');assert.match(html,/未配备/);assert.match(html,/未提供/);assert.match(html,/待确认/);assert.match(html,/<dd>0<\/dd>/);
});
test('validate enum, numbers, dates, nested input and escape free text',()=>{
 for(const value of [null,[],{other:true},{accident:true},{registration:'verified'},{batterySoh:101},{keyCount:1.5},{powerHp:-1},{rangeKm:'120'},{inspectionDate:'2026-02-30'},{firstRegistration:'2026-13'},{trim:'x'.repeat(121)}])assert.throws(()=>validateAttributes(value),/vehicle_attributes_invalid/);
 assert.equal(validateAttributes({inspectionDate:'2024-02-29'}).inspectionDate,'2024-02-29');const car=validateAttributes({trim:'<img src=x onerror=alert(1)>'});assert.ok(!attributeSections(car,'en').includes('<img'));assert.ok(!attributeEditor(car,'en').includes('<img'));
});
test('all structured labels and choices cover four languages',()=>{
 const labels=[...Object.values(attributeGroups),attributeHelp,attributeError,...attributeFields.flatMap(f=>[f.label,...(f.options||[]).map(o=>o[1])])];for(const label of labels)for(const language of ['zh','en','ka','ru'])assert.ok(label[language]?.trim());for(const language of ['en','ka','ru'])assert.ok(!/[\u4e00-\u9fff]/.test(attributeSections({},language)));assert.ok(!errorMessage('ru','vehicle_attributes_invalid').includes('vehicle_attributes_invalid'));
});
test('form collection preserves attributes during language switches without flattening or losing unknowns',()=>{
 const data=new FormData();for(const [k,v] of Object.entries({attr_trim:'Long range',attr_keyCount:'0',attr_batterySoh:'',attr_rearCamera:'present',attr_registration:'provided',price:'100',mileage:'0',seats:'5'}))data.set(k,v);
 const value=collectVehicle(data,{version:3,attributes:{sunroof:'absent'}},[]);assert.equal(value.attributes.keyCount,0);assert.equal(value.attributes.batterySoh,'');assert.equal(value.attributes.sunroof,'absent');assert.equal(value.attributes.registration,'provided');assert.equal(value.version,3);assert.equal(Object.hasOwn(value,'attr_trim'),false);assert.equal(collectAttributes(data).rearCamera,'present');
});
