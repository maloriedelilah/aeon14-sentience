#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

async function htmlFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await htmlFiles(p));
    else if (e.isFile() && e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
function blocks(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => JSON.parse(m[1]));
}
function nodes(v, out = []) {
  if (Array.isArray(v)) v.forEach((x) => nodes(x, out));
  else if (v && typeof v === 'object') {
    if ('@id' in v && '@type' in v) out.push(v);
    Object.values(v).forEach((x) => nodes(x, out));
  }
  return out;
}
const dir = process.argv[2] ?? 'dist';
if (!existsSync(dir)) { console.error(`Missing ${dir}; run npm run build first.`); process.exit(1); }
const seen = new Map();
let failed = 0;
for (const file of await htmlFiles(dir)) {
  for (const graph of blocks(await readFile(file, 'utf8'))) {
    for (const node of nodes(graph)) {
      if (!node['@id']) continue;
      const signature = JSON.stringify({ type: node['@type'], name: node.name });
      const prior = seen.get(node['@id']);
      if (prior && prior.signature !== signature) {
        failed++;
        console.error(`Conflicting identity ${node['@id']} in ${prior.file} and ${file}`);
      } else if (!prior) seen.set(node['@id'], { signature, file });
    }
  }
}
if (failed) process.exit(1);
console.log(`${seen.size} canonical identities checked with no cross-page conflicts`);
