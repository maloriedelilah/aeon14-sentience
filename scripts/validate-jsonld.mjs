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
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
}

function walk(v, defined, refs) {
  if (Array.isArray(v)) return v.forEach((x) => walk(x, defined, refs));
  if (!v || typeof v !== 'object') return;
  if ('@id' in v && '@type' in v) defined.add(v['@id']);
  else if ('@id' in v) refs.add(v['@id']);
  for (const [k, x] of Object.entries(v)) if (k !== '@id' && k !== '@type') walk(x, defined, refs);
}

const dir = process.argv[2] ?? 'dist';
if (!existsSync(dir)) { console.error(`Missing ${dir}; run npm run build first.`); process.exit(1); }
const files = await htmlFiles(dir);
let failed = 0;
for (const file of files) {
  const defined = new Set();
  const refs = new Set();
  try {
    for (const raw of blocks(await readFile(file, 'utf8'))) walk(JSON.parse(raw), defined, refs);
    const dangling = [...refs].filter((id) => !defined.has(id));
    if (dangling.length) { failed++; console.error(`FAIL ${file}: dangling @id ${dangling.join(', ')}`); }
  } catch (err) { failed++; console.error(`FAIL ${file}: ${err.message}`); }
}
if (failed) { console.error(`${failed} page(s) failed JSON-LD validation`); process.exit(1); }
console.log(`${files.length}/${files.length} pages passed`);
