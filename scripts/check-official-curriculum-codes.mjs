import fs from "node:fs";

const codeMapping = JSON.parse(fs.readFileSync("data/curriculum-code-mapping.json", "utf8"));
const url = "https://www.mext.go.jp/content/20230901-mxt_syoto01-000010374_27.csv";

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && field.length === 0) quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  return rows.filter(r => r.some(v => v.trim()));
}

const response = await fetch(url);
if (!response.ok) throw new Error(`公式CSV取得失敗: HTTP ${response.status}`);
const bytes = new Uint8Array(await response.arrayBuffer());
let decoded = new TextDecoder("utf-8").decode(bytes);
if (decoded.includes("\uFFFD")) decoded = new TextDecoder("windows-31j").decode(bytes);
const rows = parseCsv(decoded);
const headerIndex = rows.findIndex(row => row.some(cell => cell.includes("学習指導要領コード")));
if (headerIndex < 0) throw new Error("CSV内に「学習指導要領コード」列を見つけられません。列名を確認してください。");
const headers = rows[headerIndex].map(v => v.trim());
const codeIndex = headers.findIndex(v => v.includes("学習指導要領コード"));
const officialCodes = new Set(rows.slice(headerIndex + 1).map(row => (row[codeIndex] ?? "").trim()).filter(Boolean));
const candidateCodes = new Set();
for (const item of codeMapping.mappings ?? []) {
  if (item.candidateCode) candidateCodes.add(item.candidateCode);
  for (const code of item.candidateCodes ?? []) candidateCodes.add(code);
}
const found = [...candidateCodes].filter(code => officialCodes.has(code));
const missing = [...candidateCodes].filter(code => !officialCodes.has(code));
console.log(`公式コード表: 82V12 / CSV行数: ${rows.length - headerIndex - 1}`);
console.log(`候補コード（重複除外）: ${candidateCodes.size}`);
console.log(`公式CSVに完全一致: ${found.length}`);
console.log(`公式CSVに見つからない: ${missing.length}`);
if (missing.length) console.log("要確認候補（先頭30件）:", missing.slice(0, 30).join(", "));
console.log("注意: コードの存在一致だけでは、学習項目との意味的な対応が確定したことにはなりません。");
if (!officialCodes.size) throw new Error("公式コード列からコードを読み取れませんでした。CSV形式を確認してください。");
