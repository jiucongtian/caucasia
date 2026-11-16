import test from 'node:test';
import assert from 'node:assert/strict';
import {vehicles} from '../src/data.js';
import {filterVehicles,validateRanges,priceValue,safeReturn,escapeHTML} from '../src/domain.js';
test('brand + powertrain + budget intersect, including GEL amounts',()=>{
 assert.deepEqual(filterVehicles(vehicles,{brand:'changan',energy:'ev',max:'22000'}).map(c=>c.id),['nevo-a06']);
 assert.equal(filterVehicles(vehicles,{brand:'changan',energy:'ev',max:'22000'},'GEL').length,0);
 assert.equal(filterVehicles(vehicles,{brand:'changan',energy:'ev',max:'60000'},'GEL').length,1);
 assert.equal(priceValue(vehicles[0],'GEL'),66960);
});
test('date and mileage filters, sorting and no-result cases',()=>{
 const rows=filterVehicles(vehicles,{from:'2025-04',mileageMax:'9000',sort:'price-asc'});
 assert.ok(rows.every(c=>c.date>='2025-04'&&c.mileage<=9000));
 assert.ok(rows.every((c,i)=>!i||rows[i-1].price<=c.price));
 assert.equal(filterVehicles(vehicles,{q:'unknown-model'}).length,0);
 assert.equal(filterVehicles(vehicles,{q:'SL-DEMO-001'})[0].id,'han');
});
test('reject reversed numeric and date ranges',()=>{
 assert.equal(validateRanges(new URLSearchParams({min:'200',max:'100'})),false);
 assert.equal(validateRanges(new URLSearchParams({from:'2025-12',to:'2024-01'})),false);
 assert.equal(validateRanges(new URLSearchParams({mileageMin:'100',mileageMax:'0'})),false);
 assert.equal(validateRanges(new URLSearchParams({min:'0',max:'100'})),true);
});
test('return navigation stays within catalog and text is escaped',()=>{
 assert.equal(safeReturn('//evil.example'),null);
 assert.equal(safeReturn('javascript:alert(1)'),null);
 assert.equal(safeReturn('/zh/vehicles?brand=byd'),'/zh/vehicles?brand=byd');
 assert.equal(escapeHTML('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');
});
