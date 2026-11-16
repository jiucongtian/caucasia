import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {createApp} from '../backend/app.mjs';
import {atomic,passwordRecord} from '../backend/store.mjs';
const listen=server=>new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve('http://127.0.0.1:'+server.address().port)));
const close=server=>new Promise(resolve=>server.close(resolve));
test('admin lifecycle: access controls, uploads, publication, optimistic locking and restart persistence',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'starlink-test-'));const password=randomBytes(24).toString('hex');atomic(path.join(dir,'admin.json'),passwordRecord(password));let server=createApp({dataDir:dir});let base=await listen(server),cookie='',csrf='';
 const request=async(url,method='GET',value,extra={})=>fetch(base+url,{method,headers:{Origin:base,Cookie:cookie,'X-CSRF-Token':csrf,...(value!==undefined?{'Content-Type':'application/json'}:{}),...extra},body:value===undefined?undefined:JSON.stringify(value)});
 try{
  assert.equal((await request('/api/admin/vehicles')).status,401);
  assert.equal((await request('/api/admin/login','POST',{username:'admin',password:'wrong'})).status,401);
  assert.equal((await request('/api/admin/login','POST',{username:'admin',password},{Origin:'https://other.example'})).status,403);
  const login=await request('/api/admin/login','POST',{username:'admin',password});assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/HttpOnly/);csrf=(await login.json()).csrf;
  assert.equal((await request('/api/admin/vehicles','POST',{}, {'X-CSRF-Token':''})).status,403);
  assert.equal((await request('/api/admin/vehicles','POST',null)).status,400);
  const malicious=await fetch(base+'/api/admin/uploads',{method:'POST',headers:{Origin:base,Cookie:cookie,'X-CSRF-Token':csrf,'Content-Type':'image/png'},body:'<svg onload="alert(1)"></svg>'});assert.equal(malicious.status,415);
  const image=fs.readFileSync(new URL('../public/assets/logo.png',import.meta.url));const upload=await fetch(base+'/api/admin/uploads',{method:'POST',headers:{Origin:base,Cookie:cookie,'X-CSRF-Token':csrf},body:image});assert.equal(upload.status,201);const imageURL=(await upload.json()).url;assert.equal((await request(imageURL)).status,200);
  const draft={brand:'byd',zh:'测试车辆 <img onerror=alert(1)>',en:'Test vehicle',ka:'ქართული მოდელი',ru:'Русская модель',descriptionKa:'ქართული აღწერა',descriptionRu:'Русское описание',date:'2026-11',mileage:12,price:28000,energy:'ev',body:'suv',seats:5,transmission:'auto',descriptionZh:'配置描述\n第二行',descriptionEn:'Description',images:[imageURL],featured:true,demo:false,status:'draft'};
  for(const lang of ['zh','en','ka','ru']){const single={...draft,zh:'',en:'',ka:'',ru:'',descriptionZh:'',descriptionEn:'',descriptionKa:'',descriptionRu:'',status:'published',[lang]:'Only '+lang,['description'+({zh:'Zh',en:'En',ka:'Ka',ru:'Ru'}[lang])]:'Description '+lang};const result=await request('/api/admin/vehicles','POST',single);assert.equal(result.status,201);const saved=(await result.json()).vehicle;assert.equal(saved[lang],single[lang]);for(const other of ['zh','en','ka','ru'].filter(k=>k!==lang))assert.equal(saved[other],'');assert.equal((await request('/api/admin/vehicles','POST',{...single,[lang]:''})).status,400);assert.equal((await request('/api/admin/vehicles','POST',{...single,['description'+({zh:'Zh',en:'En',ka:'Ka',ru:'Ru'}[lang])]:''})).status,400);}
  const created=await request('/api/admin/vehicles','POST',draft);assert.equal(created.status,201);let vehicle=(await created.json()).vehicle;const id=vehicle.id;
  const publicRows=async()=> (await (await request('/api/vehicles')).json()).vehicles;
  assert.ok(!(await publicRows()).some(v=>v.id===id));assert.equal((await request('/api/admin/vehicles')).status,200);
  assert.equal((await request('/api/admin/vehicles/'+id,'PUT',{...vehicle,images:[],status:'published'})).status,400);
  assert.equal((await request('/api/admin/vehicles/'+id,'PUT',{...vehicle,images:['/uploads/not-real.jpg']})).status,400);
  let response=await request('/api/admin/vehicles/'+id,'PUT',{...vehicle,status:'published'});assert.equal(response.status,200);const stale=vehicle;vehicle=(await response.json()).vehicle;
  assert.equal((await publicRows()).find(v=>v.id===id).descriptionZh,draft.descriptionZh);
  assert.equal((await request('/api/admin/vehicles/'+id,'PUT',{...stale,price:1})).status,409);
  assert.equal((await request('/var/admin.json')).status,404);assert.equal((await request('/backend/store.mjs')).status,404);assert.equal((await request('/package.json')).status,404);
  await close(server);server=createApp({dataDir:dir});base=await listen(server);
  assert.equal((await publicRows()).find(v=>v.id===id).price,28000);assert.equal((await publicRows()).find(v=>v.id===id).descriptionKa,'ქართული აღწერა');assert.equal((await publicRows()).find(v=>v.id===id).ru,'Русская модель');for(const route of ['/ka','/ru','/ka/vehicles/'+id,'/ru/vehicles/'+id])assert.equal((await request(route)).status,200);assert.equal((await request(imageURL)).status,200);assert.equal((await request('/api/admin/session')).status,401);
  const again=await request('/api/admin/login','POST',{username:'admin',password});cookie=again.headers.get('set-cookie').split(';')[0];csrf=(await again.json()).csrf;
  const legacy={...vehicle,status:'archived'};delete legacy.ka;delete legacy.ru;delete legacy.descriptionKa;delete legacy.descriptionRu;response=await request('/api/admin/vehicles/'+id,'PUT',legacy);assert.equal(response.status,200);assert.ok(!(await publicRows()).some(v=>v.id===id));assert.equal((await response.json()).vehicle.descriptionRu,'Русское описание');
  assert.equal((await request('/api/admin/logout','POST')).status,200);assert.equal((await request('/api/admin/vehicles')).status,401);
 }finally{await close(server);fs.rmSync(dir,{recursive:true,force:true});}
});
test('failed login throttles repeated password guesses',async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'starlink-rate-'));atomic(path.join(dir,'admin.json'),passwordRecord(randomBytes(16).toString('hex')));const server=createApp({dataDir:dir}),base=await listen(server);try{for(let i=0;i<10;i++){const r=await fetch(base+'/api/admin/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({username:'no',password:'wrong'})});assert.equal(r.status,401);}const r=await fetch(base+'/api/admin/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'});assert.equal(r.status,429);}finally{await close(server);fs.rmSync(dir,{recursive:true,force:true});}});
