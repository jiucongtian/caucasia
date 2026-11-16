import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,randomUUID} from 'node:crypto';
import {openStore,checkPassword,fail} from './store.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
const json=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));};
async function body(req,max=128*1024){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>max)fail(413,'上传内容超过限制');chunks.push(chunk);}return Buffer.concat(chunks);}
async function payload(req){if(!req.headers['content-type']?.startsWith('application/json'))fail(415,'请求格式必须为JSON');try{return JSON.parse((await body(req)).toString());}catch(e){if(e.status)throw e;fail(400,'JSON格式错误');}}
function imageType(b){if(b.length>24&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'png';if(b.length>12&&b[0]===255&&b[1]===216&&b[2]===255&&b.at(-2)===255&&b.at(-1)===217)return 'jpg';if(b.length>16&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')return 'webp';fail(415,'仅支持JPEG、PNG、WebP图片');}
export function createApp({dataDir=process.env.STARLINK_DATA_DIR||path.join(path.basename(root)==='dist'?path.dirname(root):root,'var'),secure=process.env.COOKIE_SECURE==='1'}={}){
 const store=openStore(dataDir),sessions=new Map(),attempts=new Map();
 const cookie=(token,max=28800)=>`sl_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${max}${secure?'; Secure':''}`;
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' blob:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  try{
   const url=new URL(req.url,'http://localhost'),p=decodeURIComponent(url.pathname),mutation=!['GET','HEAD'].includes(req.method);
   if(p.startsWith('/api/')){
    if(mutation){let origin;try{origin=new URL(req.headers.origin);}catch{}if(!origin||origin.host!==req.headers.host||!['http:','https:'].includes(origin.protocol))fail(403,'请求来源无效，请刷新后台重试');}
    if(p==='/api/vehicles'&&req.method==='GET')return json(res,200,{vehicles:store.list().filter(v=>v.status==='published')});
    if(p==='/api/admin/login'&&req.method==='POST'){
     const ip=req.socket.remoteAddress,now=Date.now();for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);
     let rate=attempts.get(ip);if(!rate){rate={count:0,until:now+15*60*1000};attempts.set(ip,rate);}if(rate.count>=10)fail(429,'尝试次数过多，请15分钟后重试');rate.count++;
     const input=await payload(req),file=path.join(dataDir,'admin.json');if(!fs.existsSync(file))fail(503,'请先在服务器运行 npm run admin:setup 设置管理员密码');
     if(!input||input.username!=='admin'||!checkPassword(input.password,JSON.parse(fs.readFileSync(file,'utf8'))))fail(401,'用户名或密码错误');
     attempts.delete(ip);for(const [k,v] of sessions)if(v.expires<now)sessions.delete(k);if(sessions.size>=100) sessions.delete(sessions.keys().next().value);
     const token=randomBytes(32).toString('hex'),csrf=randomBytes(24).toString('hex');sessions.set(token,{csrf,expires:now+8*3600000});res.setHeader('Set-Cookie',cookie(token));return json(res,200,{csrf});
    }
    const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('sl_admin='))?.slice(9),session=sessions.get(token);
    if(!session||session.expires<Date.now()){sessions.delete(token);fail(401,'请先登录管理员账号');}
    if(mutation&&req.headers['x-csrf-token']!==session.csrf)fail(403,'会话校验失败，请重新登录');
    if(p==='/api/admin/session'&&req.method==='GET')return json(res,200,{csrf:session.csrf});
    if(p==='/api/admin/logout'&&req.method==='POST'){sessions.delete(token);res.setHeader('Set-Cookie',cookie('',0));return json(res,200,{ok:true});}
    if(p==='/api/admin/vehicles'&&req.method==='GET')return json(res,200,{vehicles:store.list()});
    if(p==='/api/admin/vehicles'&&req.method==='POST')return json(res,201,{vehicle:store.save(await payload(req))});
    const match=p.match(/^\/api\/admin\/vehicles\/([a-zA-Z0-9-]+)$/);
    if(match&&req.method==='PUT')return json(res,200,{vehicle:store.save(await payload(req),match[1])});
    if(p==='/api/admin/uploads'&&req.method==='POST'){
     const bytes=await body(req,8*1024*1024),ext=imageType(bytes);const filename=randomUUID()+'.'+ext;fs.writeFileSync(path.join(dataDir,'uploads',filename),bytes,{flag:'wx',mode:0o600});return json(res,201,{url:'/uploads/'+filename});
    }
    fail(404,'接口不存在');
   }
   if(mutation)fail(405,'不支持此请求方法');
   let target;
   if(p==='/'||/^\/(ka|ru|zh|en)(\/[^.]*)?$/.test(p))target=path.join(root,'index.html');
   else if(p==='/admin'||p==='/admin/')target=path.join(root,'admin/index.html');
   else if(/^\/(src|admin)\/[a-zA-Z0-9-]+\.(js|css)$/.test(p))target=path.join(root,p);
   else if(/^\/assets\/[a-zA-Z0-9-]+\.(png|jpg|webp|svg)$/.test(p))target=path.join(root,'public',p);
   else if(/^\/uploads\/[a-f0-9-]{36}\.(png|jpg|webp)$/.test(p))target=path.join(dataDir,p);
   else fail(404,'Not found');
   if(!fs.existsSync(target))fail(404,'Not found');const content=fs.readFileSync(target);res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.writeHead(200);res.end(req.method==='HEAD'?undefined:content);
  }catch(e){json(res,e.status||500,{error:e.status?e.message:'服务器处理失败，请检查服务器日志'});if(!e.status)console.error('Request failed:',e.message);}
 });
 server.on('close',()=>store.close());return server;
}
