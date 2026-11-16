import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {atomic,passwordRecord} from './store.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=process.env.STARLINK_DATA_DIR||path.join(path.basename(root)==='dist'?path.dirname(root):root,'var');
if(fs.existsSync(path.join(dir,'server.lock')))throw new Error('请先停止服务，再设置或重置密码');
if(!process.stdin.isTTY)throw new Error('请在交互终端运行；不要将密码写入命令参数');
function secret(prompt){return new Promise(resolve=>{process.stdout.write(prompt);let value='';process.stdin.setRawMode(true);process.stdin.resume();const listener=chunk=>{for(const c of chunk.toString()){if(c==='\u0003'){process.stdin.setRawMode(false);process.exit(1);}if(c==='\r'||c==='\n'){process.stdin.off('data',listener);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');resolve(value);return;}if(c==='\u007f')value=value.slice(0,-1);else if(c>=' ')value+=c;}};process.stdin.on('data',listener);});}
const first=await secret('设置 admin 密码（12–128字符，输入不回显）：');const second=await secret('再次输入密码：');if(first!==second)throw new Error('两次密码不一致，未修改');fs.mkdirSync(dir,{recursive:true,mode:0o700});atomic(path.join(dir,'admin.json'),passwordRecord(first));console.log('管理员密码已保存为加盐哈希。运行 npm run dev 后访问 /admin。');
