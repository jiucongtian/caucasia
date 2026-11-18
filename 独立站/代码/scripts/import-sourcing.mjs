// Credentials are read from stdin, never command arguments or reports.
// node scripts/import-sourcing.mjs <origin> <manifest.json> [--apply] < credentials.json
import fs from 'node:fs';
import path from 'node:path';
const [originArg,manifestPath,mode]=process.argv.slice(2);
if(!originArg||!manifestPath||!['--apply',undefined].includes(mode))throw new Error('Usage: import-sourcing.mjs <origin> <manifest.json> [--apply]');
const origin=new URL(originArg).origin;
if(!origin.startsWith('https://')&&!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw new Error('HTTPS required');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
let input='';for await(const chunk of process.stdin)input+=chunk;
const credentials=JSON.parse(input);input='';
let cookie='',csrf='';
async function api(route,method='GET',body){
 const raw=Buffer.isBuffer(body);
 const r=await fetch(origin+route,{method,headers:{Origin:origin,Cookie:cookie,'X-CSRF-Token':csrf,...(body?{'Content-Type':raw?'application/octet-stream':'application/json'}:{})},body:body?(raw?body:JSON.stringify(body)):undefined});
 const d=await r.json();if(!r.ok)throw new Error(`${route}: ${r.status} ${d.error||'request failed'}`);
 if(route==='/api/admin/login'){cookie=r.headers.get('set-cookie').split(';')[0];csrf=d.csrf;}
 return d;
}
const normalized=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
const report={origin,started:new Date().toISOString(),mode:mode==='--apply'?'apply':'dry-run',skipped:[],created:[],planned:[]};
const reportDir=path.resolve('var/import-reports');
fs.mkdirSync(reportDir,{recursive:true,mode:0o700});
const reportFile=path.join(reportDir,`sourcing-${Date.now()}.json`);
const saveReport=()=>fs.writeFileSync(reportFile,JSON.stringify(report,null,2),{mode:0o600});
try{
 await api('/api/admin/login','POST',{username:credentials.username,password:credentials.password});
 let rows=(await api('/api/admin/vehicles')).vehicles;
 // Validate all local assets before creating any records.
 for(const item of manifest.items)for(const asset of item.assets){const file=path.resolve(path.dirname(manifestPath),asset.file);if(!file.startsWith(path.resolve(path.dirname(manifestPath))+path.sep))throw new Error('Invalid asset path');const data=fs.readFileSync(file);if(!data.length||data.length>8*1024*1024)throw new Error('Invalid image size: '+asset.file);}
 if(mode==='--apply')fs.writeFileSync(path.join(reportDir,`before-${Date.now()}.json`),JSON.stringify(rows,null,2),{mode:0o600});
 for(const item of manifest.items){
  const aliases=new Set([item.record.zh,item.record.en,...item.expectedExistingAliases].filter(Boolean).map(normalized));
  const matches=rows.filter(v=>v.brand===item.record.brand&&[v.zh,v.en,v.ka,v.ru].some(n=>aliases.has(normalized(n))));
  if(matches.length){report.skipped.push({row:item.row,model:item.sourceModel,ids:matches.map(v=>v.id)});continue;}
  report.planned.push({row:item.row,model:item.sourceModel,status:item.record.status});
  if(mode!=='--apply')continue;
  const images=[];
  for(const asset of item.assets){const uploaded=await api('/api/admin/uploads','POST',fs.readFileSync(path.resolve(path.dirname(manifestPath),asset.file)));images.push(uploaded.url);}
  const vehicle=(await api('/api/admin/vehicles','POST',{...item.record,images})).vehicle;
  report.created.push({row:item.row,model:item.sourceModel,id:vehicle.id,status:vehicle.status,images:vehicle.images});rows.push(vehicle);saveReport();
 }
 const current=(await api('/api/admin/vehicles')).vehicles;
 for(const item of report.created){const actual=current.find(v=>v.id===item.id);if(!actual||actual.price!==null||actual.mileage!==null||actual.listingType!=='sourcing')throw new Error('Import verification failed: '+item.model);for(const url of actual.images){const response=await fetch(origin+url);if(!response.ok)throw new Error('Image unavailable: '+url);}}
 report.finished=new Date().toISOString();saveReport();
 console.log(JSON.stringify({mode:report.mode,skipped:report.skipped.length,planned:report.planned.length,created:report.created.length,report:reportFile}));
}catch(error){report.error=error.message;saveReport();throw error;}finally{if(csrf)await api('/api/admin/logout','POST').catch(()=>{});}
