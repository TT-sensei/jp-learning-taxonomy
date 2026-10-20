import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const markdownFiles = [];
const siteFiles = [];
const ignored = new Set([".git", "node_modules"]);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile()) {
      const rel = path.relative(root, full).split(path.sep).join("/");
      if (rel.endsWith(".md")) markdownFiles.push(rel);
      if (rel.startsWith("site/") && /\.(?:html|js)$/.test(rel)) siteFiles.push(rel);
    }
  }
}
walk(root);

const errors = [];
const counts = { markdownFiles: markdownFiles.length, markdownLinks: 0, siteFiles: siteFiles.length, siteReferences: 0 };

function check(source, raw, countKey) {
  let target = raw.trim().replace(/^<|>$/g, "");
  if (!target || target.startsWith("#") || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target)) return;
  target = target.split("#")[0].split("?")[0];
  if (!target) return;
  try { target = decodeURIComponent(target); } catch {}
  if (target.includes("${") || target.includes("{{")) return;
  const resolved = path.resolve(path.dirname(path.join(root, source)), target);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return;
  counts[countKey]++;
  if (!fs.existsSync(resolved)) errors.push(`${source}: リンク先がありません: ${raw}`);
}

for (const file of markdownFiles) {
  let body = fs.readFileSync(path.join(root, file), "utf8");
  body = body.replace(/^\s*```[\s\S]*?^\s*```\s*$/gm, "");
  body = body.replace(/`[^`]*`/g, "");
  const linkPattern = /!?\[[^\]]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+[^)]*)?\)/g;
  for (const match of body.matchAll(linkPattern)) check(file, match[1], "markdownLinks");
}

for (const file of siteFiles) {
  const body = fs.readFileSync(path.join(root, file), "utf8");
  const refs = [];
  if (file.endsWith(".html")) {
    for (const m of body.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) refs.push(m[1]);
  } else {
    for (const m of body.matchAll(/\bfetch\s*\(\s*["']([^"']+)["']/g)) refs.push(m[1]);
    for (const m of body.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/g)) refs.push(m[1]);
  }
  for (const ref of refs) {
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(ref)) continue;
    check(file, ref, "siteReferences");
  }
}

console.log(`Markdown files: ${counts.markdownFiles}; local links checked: ${counts.markdownLinks}`);
console.log(`Static-site HTML/JS files: ${counts.siteFiles}; local references checked: ${counts.siteReferences}`);
if (errors.length) {
  console.error(`Broken local references: ${errors.length}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("All checked local references exist.");
}
