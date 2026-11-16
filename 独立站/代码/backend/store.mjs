import fs from 'node:fs';
import path from 'node:path';
import {randomUUID,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {brands,vehicles} from '../src/data.js';
export const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
export function atomic(file,value){const temp=file+'.'+randomUUID()+'.tmp';try{fs.writeFileSync(temp,JSON.stringify(value,null,2),{mode:0o600});fs.renameSync(temp,file);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
export function passwordRecord(password){if(typeof password!=='string'||password.length<12||password.length>128)fail(400,'密码须为12至128个字符');const salt=randomBytes(16).toString('hex');return {salt,hash:scryptSync(password,salt,64).toString('hex')};}
export function checkPassword(password,record){if(typeof password!=='string'||password.length>128)return false;return timingSafeEqual(scryptSync(password,record.salt,64),Buffer.from(record.hash,'hex'));}
export function openStore(dir){
 fs.mkdirSync(dir,{recursive:true,mode:0o700});fs.mkdirSync(path.join(dir,'uploads'),{recursive:true});
 const lock=path.join(dir,'server.lock');
 if(fs.existsSync(lock)){const pid=Number(fs.readFileSync(lock,'utf8'));let alive=true;try{process.kill(pid,0);}catch(e){if(e.code==='ESRCH')alive=false;}if(alive)throw new Error('数据目录已被另一个进程使用');fs.unlinkSync(lock);}
 fs.writeFileSync(lock,String(process.pid),{flag:'wx',mode:0o600});
 const file=path.join(dir,'catalog.json');
 try{
 if(!fs.existsSync(file))atomic(file,{schema:1,vehicles:vehicles.map(v=>({...v,status:'published',descriptionZh:'演示车型，非真实库存。',descriptionEn:'Illustrative vehicle, not live inventory.',version:1,updatedAt:new Date().toISOString()}))});
 let db=JSON.parse(fs.readFileSync(file,'utf8'));if(db.schema!==1||!Array.isArray(db.vehicles))throw new Error('车辆数据格式错误，已停止启动以保护数据');
 const assetNames=new Set(vehicles.flatMap(v=>[v.image,...v.images]));
 function validate(input,old){
  if(!input||typeof input!=='object'||Array.isArray(input))fail(400,'车辆数据格式无效');
  const text=(key,max,required=false)=>{const v=input[key]??(['ka','ru','descriptionKa','descriptionRu'].includes(key)?old?.[key]:'')??'';if(typeof v!=='string'||v.length>max||(required&&!v.trim()))fail(400,`${key} 内容缺失或过长`);return v.trim();};
  const number=(key,max)=>{const v=input[key];if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max)fail(400,`${key} 数值无效`);if(['mileage','seats'].includes(key)&&!Number.isInteger(v))fail(400,`${key} 必须是整数`);if(key==='seats'&&v<1)fail(400,'座位数至少为1');return v;};
  const select=(key,list)=>{if(!list.includes(input[key]))fail(400,`${key} 选项无效`);return input[key];};
  const status=select('status',['draft','published','archived']);
  const images=input.images;if(!Array.isArray(images)||images.length>20||images.some(x=>typeof x!=='string'))fail(400,'每辆车最多20张图片');
  for(const image of images){if(assetNames.has(image))continue;if(!/^\/uploads\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(image)||!fs.existsSync(path.join(dir,image)))fail(400,'图片不存在或来源无效');}
  const date=text('date',7);if(date&&!/^(19|20)\d{2}-(0[1-9]|1[0-2])$/.test(date))fail(400,'车辆年月无效');
  if(status==='published'&&(!images.length||!date||!text('descriptionZh',10000)))fail(400,'上架前请填写车辆年月、中文描述并上传至少一张图片');
  const id=old?.id||randomUUID();return {id,code:old?.code||'SL-'+id.slice(0,8).toUpperCase(),brand:select('brand',brands.map(b=>b.id)),zh:text('zh',120,true),en:text('en',120)||text('zh',120,true),ka:text('ka',120),ru:text('ru',120),date,mileage:number('mileage',5000000),price:number('price',10000000),energy:select('energy',['ev','phev','hybrid','gas']),body:select('body',['sedan','suv','mpv','hatchback','pickup']),seats:number('seats',60),transmission:select('transmission',['auto','manual']),descriptionZh:text('descriptionZh',10000),descriptionEn:text('descriptionEn',10000),descriptionKa:text('descriptionKa',10000),descriptionRu:text('descriptionRu',10000),images:[...new Set(images)],image:images[0]||'',featured:input.featured===true,demo:input.demo===true,status,version:(old?.version||0)+1,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
 }
 return {dir,list:()=>structuredClone(db.vehicles),save(input,id){if(!input||typeof input!=='object'||Array.isArray(input))fail(400,'车辆数据格式无效');const old=id?db.vehicles.find(v=>v.id===id):null;if(id&&!old)fail(404,'车辆不存在');if(old&&input.version!==old.version)fail(409,'车辆已被其他窗口修改，请重新加载后编辑');const car=validate(input,old);const next={...db,vehicles:old?db.vehicles.map(v=>v.id===id?car:v):[car,...db.vehicles]};atomic(file,next);db=next;return car;},close(){fs.unlinkSync(lock);}};
 }catch(e){fs.unlinkSync(lock);throw e;}
}
