import {createApp} from './backend/app.mjs';
const server=createApp();
server.listen(Number(process.env.PORT||5188),process.env.HOST||'127.0.0.1',()=>console.log(`Starlink: http://${process.env.HOST||'127.0.0.1'}:${server.address().port} — 后台 /admin`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
