import {mkdir,cp,copyFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const file of ['index.html','server.mjs','package.json'])await copyFile(file,'dist/'+file);
for(const dir of ['src','admin','backend','public'])await cp(dir,'dist/'+dir,{recursive:true});
console.log('Built full server application in dist/; run node dist/server.mjs. Persistent var/ stays outside dist.');
