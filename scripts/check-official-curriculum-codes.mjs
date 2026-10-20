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
const officialRecords = new Map();
for (const row of rows.slice(headerIndex + 1)) {
  const code = (row[codeIndex] ?? "").trim();
  if (code) officialRecords.set(code, Object.fromEntries(headers.map((header, index) => [header, (row[index] ?? "").trim()]).filter(([header, value]) => header && value)));
}
const officialCodes = new Set(officialRecords.keys());
if (!officialCodes.size) throw new Error("公式コード列からコードを読み取れませんでした。CSV形式を確認してください。");

const codeToTopics = new Map();
for (const mapping of mappingData.mappings ?? []) {
  const codes = new Set([mapping.candidateCode, ...(mapping.candidateCodes ?? []), mapping.verifiedCode, ...(mapping.verifiedCodes ?? []), ...(mapping.officialCodes ?? []), ...(mapping.relatedParentCodes ?? [])].filter(Boolean));
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
const candidateCodes = new Set((mappingData.mappings ?? []).flatMap(mapping => [mapping.candidateCode, ...(mapping.candidateCodes ?? [])]).filter(Boolean));
const verifiedCodes = new Set((mappingData.mappings ?? []).flatMap(mapping => [mapping.verifiedCode, ...(mapping.verifiedCodes ?? []), ...(mapping.officialCodes ?? [])]).filter(Boolean));
const relatedParentCodes = new Set((mappingData.mappings ?? []).flatMap(mapping => mapping.relatedParentCodes ?? []).filter(Boolean));
const found = codes.filter(code => officialCodes.has(code));
const missing = codes.filter(code => !officialCodes.has(code));
const topicMappings = (mappingData.mappings ?? []).map(mapping => {
  const topic = topicById.get(mapping.topicId);
  const candidateCodes = [...new Set([mapping.candidateCode, ...(mapping.candidateCodes ?? [])].filter(Boolean))];
  return {
    topicId: mapping.topicId,
    topicName: topic?.name ?? "(学習項目名なし)",
    subject: topic?.subject ?? "(教科不明)",
    grades: topic?.grades ?? [],
    description: topic?.description ?? "",
    matchStatus: mapping.matchStatus ?? "unknown",
    matchType: mapping.matchType ?? "unknown",
    candidateCode: mapping.candidateCode ?? null,
    candidateCodes: mapping.candidateCodes ?? [],
    verifiedCode: mapping.verifiedCode ?? null,
    officialCodes: mapping.officialCodes ?? [],
    note: mapping.note ?? "",
    candidateChecks: allCodes.map(code => {
      const record = officialRecords.get(code) ?? null;
      const expectedSubject = topic?.subject ?? null;
      const officialSubject = record?.["教科等"] ?? null;
      const gradeMarker = code[5];
      const codeGrades = expectedSubject === "国語"
        ? ({ A: [1, 2], C: [3, 4], D: [5, 6] }[gradeMarker] ?? [])
        : (["社会", "算数", "理科"].includes(expectedSubject) && /^[1-6]$/.test(gradeMarker) ? [Number(gradeMarker)] : []);
      const gradeMatch = codeGrades.length === 0 || codeGrades.some(grade => (topic?.grades ?? []).includes(grade));
      const prefix = code.replace(/0+$/, "");
      const text = record?.["学習指導要領テキスト"] ?? "";
      const level = /^[Ａ-ＤA-D][　 ]/.test(text)
        ? "領域見出し"
        : /^\\([1-9]\\)/.test(text) || /^[（(][1-9][）)]/.test(text)
          ? "内容区分見出し"
          : "項目";
      return {
        code,
        referenceRoles: [
          ...([mapping.candidateCode, ...(mapping.candidateCodes ?? [])].includes(code) ? ["candidate"] : []),
          ...([mapping.verifiedCode, ...(mapping.verifiedCodes ?? []), ...(mapping.officialCodes ?? [])].includes(code) ? ["verified"] : []),
          ...((mapping.relatedParentCodes ?? []).includes(code) ? ["related-parent"] : [])
        ],
        existsInOfficialCsv: officialCodes.has(code),
        officialSubject,
        subjectMatch: !record || !officialSubject || !expectedSubject || officialSubject === expectedSubject,
        codeGrades,
        gradeMatch,
        mappingLevel: level,
        officialText: text,
        relatedPrefix: prefix,
        relatedOfficialRecordCount: [...officialRecords.keys()].filter(other => other !== code && other.startsWith(prefix)).length
      };
    })
  };
});
const report = {
  officialVersion: "82V12",
  sourceUrl: url,
  generatedAt: new Date().toISOString(),
  csvDataRows: rows.length - headerIndex - 1,
  officialCodeCount: officialCodes.size,
  uniqueCandidateCodeCount: candidateCodes.size,
  uniqueVerifiedCodeCount: verifiedCodes.size,
  uniqueRelatedParentCodeCount: relatedParentCodes.size,
  uniqueReferencedCodeCount: codes.length,
  exactMatches: found.length,
  missingCount: missing.length,
  exactMatchCodes: found,
  missingCodes: missing,
  subjectGradeChecks: {
    checkedAssociations: topicMappings.reduce((sum, item) => sum + item.candidateChecks.length, 0),
    subjectMismatchCount: topicMappings.reduce((sum, item) => sum + item.candidateChecks.filter(check => !check.subjectMatch).length, 0),
    gradeMismatchCount: topicMappings.reduce((sum, item) => sum + item.candidateChecks.filter(check => !check.gradeMatch).length, 0)
  },
  semanticReviewRequired: true,
  topicMappings,
  codes: codes.map(code => {
    const officialRecord = officialRecords.get(code) ?? null;
    const prefix = code.replace(/0+$/, "");
    const relatedOfficialRecords = [...officialRecords.entries()]
      .filter(([other]) => other !== code && other.startsWith(prefix))
      .map(([relatedCode, record]) => ({
        code: relatedCode,
        subject: record["教科等"] ?? "",
        no: record["No"] ?? "",
        text: record["学習指導要領テキスト"] ?? ""
      }))
      .sort((a, b) => Number(a.no || 0) - Number(b.no || 0) || a.code.localeCompare(b.code));
    return {
      code,
      existsInOfficialCsv: officialCodes.has(code),
      officialRecord,
      subtreePrefix: prefix,
      relatedOfficialRecordCount: relatedOfficialRecords.length,
      relatedOfficialRecords,
      topics: codeToTopics.get(code)
    };
  })
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
  `- 確定コード参照（重複除外）：${report.uniqueVerifiedCodeCount}`,
  `- 関連する親コード（重複除外）：${report.uniqueRelatedParentCodeCount}`,
  `- 全参照コード（重複除外）：${report.uniqueReferencedCodeCount}`,
  `- 公式CSVに完全一致：${report.exactMatches}`,
  `- 公式CSVに見つからない：${report.missingCount}`,
  "",
  `- コード候補と学習項目の関連付け：${report.subjectGradeChecks.checkedAssociations}件`,
  `- 教科不一致：${report.subjectGradeChecks.subjectMismatchCount}件`,
  `- 学年不一致：${report.subjectGradeChecks.gradeMismatchCount}件`,
  "",
  "> 注意：存在一致と教科・学年一致は機械検査です。候補コードが領域見出し・内容区分見出しの場合、学習項目との直接一致を意味しません。各候補の下位コード・公式本文を確認してください。",
  "",
  "## コードごとの照合結果",
  ""
];
for (const item of report.codes) {
  lines.push(`### ${item.existsInOfficialCsv ? "一致" : "要確認"}：${item.code}`);
  if (item.officialRecord) lines.push(`- 公式表の項目：${Object.entries(item.officialRecord).filter(([key]) => !key.includes("コード")).map(([key, value]) => `${key}=${value}`).join(" / ")}`);
  lines.push(`- 下位・関連コード候補：${item.relatedOfficialRecordCount}件（接頭部 ${item.subtreePrefix}）`);
  for (const related of item.relatedOfficialRecords) lines.push(`  - ${related.code} / No.${related.no} / ${related.text}`);
  for (const topic of item.topics) lines.push(`- ${topic.subject}・${topic.grades.join("・")}年：${topic.name}（${topic.topicId}）`);
  lines.push("");
}
fs.writeFileSync("reports/official-code-audit.md", lines.join("\n") + "\n");
console.log(`公式コード表: 82V12 / CSV行数: ${report.csvDataRows}`);
console.log(`候補コード（重複除外）: ${report.uniqueCandidateCodeCount}`);
console.log(`公式CSVに完全一致: ${report.exactMatches}`);
console.log(`公式CSVに見つからない: ${report.missingCount}`);
console.log(`教科不一致: ${report.subjectGradeChecks.subjectMismatchCount}`);
console.log(`学年不一致: ${report.subjectGradeChecks.gradeMismatchCount}`);
console.log("詳細レポート: reports/official-code-audit.md と reports/official-code-audit.json");
console.log("注意: コードの存在一致だけでは、学習項目との意味的な対応が確定したことにはなりません。");
