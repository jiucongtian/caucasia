import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import {openStore} from '../backend/store.mjs';
test('container replacement and same-PID restart recover stale locks while live stores stay exclusive',()=>{const dir=fs.mkdtempSync(os.tmpdir()+'/starlink-lock-');try{for(const record of [{pid:1,host:'retired-container'},{pid:process.pid,host:os.hostname()}]){fs.writeFileSync(dir+'/server.lock',JSON.stringify(record));const store=openStore(dir);assert.throws(()=>openStore(dir),/另一个进程/);store.close();}}finally{fs.rmSync(dir,{recursive:true,force:true});}});
