import { readFile, writeFile } from 'node:fs/promises';
import { messages } from '../src/locales/messages.js';
import { headers } from './locale-review.js';
const path = process.argv[2];
if (!path) throw new Error('Usage: npm run locales:import -- <reviewed.csv> [--apply]');
// RFC4180 quoted fields, including line breaks; no dependency needed.
export function parseCSV(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i+1] === '"') {field+='"'; i++;} else quoted=!quoted; }
    else if (!quoted && c === ',') {row.push(field); field='';}
    else if (!quoted && (c === '\r' || c === '\n')) { if (c==='\r' && text[i+1]==='\n') i++; row.push(field); if(row.some(Boolean)) rows.push(row);row=[];field=''; }
    else field+=c;
  }
  if (quoted) throw new Error('CSV contains an unterminated quoted field');
  if(field || row.length) {row.push(field);rows.push(row);} return rows;
}
const [head, ...rows] = parseCSV((await readFile(path,'utf8')).replace(/^\uFEFF/,''));
if (JSON.stringify(head) !== JSON.stringify(headers)) throw new Error('Keep the exported header row unchanged');
const byId = new Map(messages.map(row=>[row.id,row])); const seen = new Set(); const next = structuredClone(messages); const nextById = new Map(next.map(row=>[row.id,row])); let changes=0;
const placeholders = text => [...text.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort().join(',');
for (const row of rows) {
  if (row.length!==headers.length || !byId.has(row[0]) || seen.has(row[0])) throw new Error(`Invalid or duplicate row: ${row[0]}`);
  seen.add(row[0]); const original = byId.get(row[0]);
  if (['zh','en','ka','ru'].some((lang,i)=>row[i+2]!==original[lang])) throw new Error(`Baseline changed for ${row[0]}; use the revision columns instead`);
  if (row[12] !== '已确认') continue;
  for (const [i,lang] of ['zh','en','ka','ru'].entries()) {
    const revision = row[8+i]; if (!revision.trim()) continue;
    if (/[<>]/.test(revision) || placeholders(revision)!==placeholders(original.zh)) throw new Error(`Invalid markup or placeholders: ${row[0]}/${lang}`);
    nextById.get(row[0])[lang] = revision; changes++;
  }
}
if (seen.size!==messages.length) throw new Error('The review must contain every configured row');
if (process.argv.includes('--apply')) await writeFile('src/locales/messages.js','// Authoritative four-language copy. source is immutable legacy vocabulary; edit zh/en/ka/ru.\nexport const messages = '+JSON.stringify(next,null,2)+';\n');
console.log(`${process.argv.includes('--apply')?'Applied':'Validated'} ${changes} approved revisions; ${seen.size} entries. Original configuration ${process.argv.includes('--apply')?'updated':'unchanged'}.`);
