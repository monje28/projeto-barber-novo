import {mkdir, copyFile, cp} from 'node:fs/promises';
await mkdir('public', {recursive:true});
for (const file of ['index.html','arquivo.js','style.css']) await copyFile(file, 'public/' + file);
await cp('MIDEA','public/MIDEA',{recursive:true});
console.log('Arquivos públicos preparados em public/.');
