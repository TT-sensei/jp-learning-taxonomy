import fs from "node:fs";
import path from "node:path";

const mappingData = JSON.parse(fs.readFileSync("data/curriculum-code-mapping.json", "utf8"));
const topicsData = JSON.parse(fs.readFileSync("data/topics.json", "utf8"));
const topicById = new Map(topicsData.topics.map(topic => [topic.id, topic]));
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

const response = await fetch(url, { headers: { "User-Agent": "TT-sensei-curriculum-code-audit/1.0" } });
if (!response.ok) throw new Error(`公式CSV取得失敗: HTTP ${response.status}`);
const bytes = new Uint8Array(await response.arrayBuffer());
let decoded = new TextDecoder("utf-8").decode(bytes);
if (decoded.includes("\uFFFD")) decoded = new TextDecoder("windows-31j").decode(bytes);
const rows = parseCsv(decoded);
const headerIndex = rows.findIndex(row => row.some(cell => cell.replace(/^\uFEFF/, "").includes("学習指導要領コード")));
if (headerIndex < 0) throw new Error("CSV内に「学習指導要領コード」列を見つけられません。列名を確認してください。");
const headers = rows[headerIndex].map(v => v.replace(/^\uFEFF/, "").trim());
const codeIndex = headers.findIndex(v => v.includes("学習指導要領コード"));
const officialCodes = new Set(rows.slice(headerIndex + 1).map(row => (row[codeIndex] ?? "").trim()).filter(Boolean));
if (!officialCodes.size) throw new Error("公式コード列からコードを読み取れませんでした。CSV形式を確認してください。");

const codeToTopics = new Map();
for (const mapping of mappingData.mappings ?? []) {
  const codes = new Set([mapping.candidateCode, ...(mapping.candidateCodes ?? [])].filter(Boolean));
  const topic = topicById.get(mapping.topicId);
  for (const code of codes) {
    if (!codeToTopics.has(code)) codeToTopics.set(code, []);
    codeToTopics.get(code).push({
      topicId: mapping.topicId,
      name: topic?.name ?? "(学習項目名なし)",
      subject: topic?.subject ?? "(教科不明)",
      grades: topic?.grades ?? [],
      matchStatus: mapping.matchStatus ?? "unknown",
      note: mapping.note ?? ""
    });
  }
}
const codes = [...codeToTopics.keys()].sort();
const found = codes.filter(code => officialCodes.has(code));
const missing = codes.filter(code => !officialCodes.has(code));
const report = {
  officialVersion: "82V12",
  sourceUrl: url,
  generatedAt: new Date().toISOString(),
  csvDataRows: rows.length - headerIndex - 1,
  officialCodeCount: officialCodes.size,
  uniqueCandidateCodeCount: codes.length,
  exactMatches: found.length,
  missingCount: missing.length,
  exactMatchCodes: found,
  missingCodes: missing,
  semanticReviewRequired: true,
  codes: codes.map(code => ({ code, existsInOfficialCsv: officialCodes.has(code), topics: codeToTopics.get(code) }))
};
fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/official-code-audit.json", JSON.stringify(report, null, 2) + "\n");
const lines = [
  "# 公式学習指導要領コード照合レポート",
  "",
  `- 公式版：82V12`,
  `- 照合日時（UTC）：${report.generatedAt}`,
  `- 公式CSVのデータ行数：${report.csvDataRows}`,
  `- 公式コード数：${report.officialCodeCount}`,
  `- 候補コード（重複除外）：${report.uniqueCandidateCodeCount}`,
  `- 公式CSVに完全一致：${report.exactMatches}`,
  `- 公式CSVに見つからない：${report.missingCount}`,
  "",
  "> 注意：存在一致はコードの実在確認にすぎません。学習項目との意味的な対応は、教科・学年・内容を見て別途確認してください。",
  "",
  "## コードごとの照合結果",
  ""
];
for (const item of report.codes) {
  lines.push(`### ${item.existsInOfficialCsv ? "一致" : "要確認"}：${item.code}`);
  for (const topic of item.topics) lines.push(`- ${topic.subject}・${topic.grades.join("・")}年：${topic.name}（${topic.topicId}）`);
  lines.push("");
}
fs.writeFileSync("reports/official-code-audit.md", lines.join("\n") + "\n");
console.log(`公式コード表: 82V12 / CSV行数: ${report.csvDataRows}`);
console.log(`候補コード（重複除外）: ${report.uniqueCandidateCodeCount}`);
console.log(`公式CSVに完全一致: ${report.exactMatches}`);
console.log(`公式CSVに見つからない: ${report.missingCount}`);
console.log("詳細レポート: reports/official-code-audit.md と reports/official-code-audit.json");
console.log("注意: コードの存在一致だけでは、学習項目との意味的な対応が確定したことにはなりません。");
