import { mkdir, writeFile } from 'node:fs/promises';
import { messages } from '../src/locales/messages.js';
import { headers, reviewRows } from './locale-review.js';
const quote = value => '"' + String(value).replaceAll('"', '""') + '"';
await mkdir('srs/localization', {recursive:true});
await writeFile('srs/localization/四语文案对照校对表.csv', '\uFEFF' + [headers, ...reviewRows(messages)].map(row => row.map(quote).join(',')).join('\r\n')+'\r\n');
console.log(`Exported ${messages.length} copy entries.`);
