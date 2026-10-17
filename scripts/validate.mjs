import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const topicsData = readJson("data/topics.json");
const dependenciesData = readJson("data/dependencies.json");
const standardsData = readJson("data/curriculum-standards.json");
const resourcesData = readJson("data/resources.json");
const representationData = readJson("data/representation-models.json");
const manifestData = readJson("data/manifest.json");
const codeMappingData = readJson("data/curriculum-code-mapping.json");
const errors = [];
const report = [];
const uniqueMap = (items, key, label) => {
  const map = new Map();
  for (const item of items) {
    const value = item[key];
    if (map.has(value)) errors.push(`重複した ${label}: ${value}`);
    map.set(value, item);
  }
  return map;
};

const topics = topicsData.topics ?? [];
const dependencies = dependenciesData.dependencies ?? [];
const standards = standardsData.standards ?? [];
const sources = standardsData.sources ?? [];
const resources = resourcesData.resources ?? [];
const representationModels = representationData.models ?? [];
const codeMappings = codeMappingData.mappings ?? [];
const topicById = uniqueMap(topics, "id", "topic ID");
const edgeById = uniqueMap(dependencies, "id", "dependency ID");
const standardById = uniqueMap(standards, "id", "standard ID");
const sourceById = uniqueMap(sources, "id", "source ID");
const resourceById = uniqueMap(resources, "id", "resource ID");
const representationById = uniqueMap(representationModels, "id", "representation model ID");
const mappingByTopicId = uniqueMap(codeMappings, "topicId", "code mapping topic ID");
const topicTypes = new Set(["concept","skill","practice","expression","appreciation","inquiry","attitude","experience","application","other"]);
const topicStatuses = new Set(["draft","needs-review","reviewed","published"]);
const edgeTypes = new Set(["prerequisite","recommended-prerequisite","related-learning","extension","application","recurring-development"]);

for (const topic of topics) {
  if (!/^[a-z0-9][a-z0-9.-]+$/.test(topic.id ?? "")) errors.push(`不正な topic ID: ${topic.id}`);
  for (const key of ["subject","domain","name","description"]) {
    if (typeof topic[key] !== "string" || !topic[key].trim()) errors.push(`${topic.id}: ${key} が空です。`);
  }
  if (!topicTypes.has(topic.topicType)) errors.push(`${topic.id}: 未定義の topicType ${topic.topicType}`);
  if (!topicStatuses.has(topic.reviewStatus)) errors.push(`${topic.id}: 未定義の reviewStatus ${topic.reviewStatus}`);
  if (!Array.isArray(topic.grades) || topic.grades.length === 0 || topic.grades.some(g => !Number.isInteger(g) || g < 1 || g > 6)) {
    errors.push(`${topic.id}: grades は1〜6の整数の配列にしてください。`);
  }
  for (const standardId of topic.curriculumStandards ?? []) {
    if (!standardById.has(standardId)) errors.push(`${topic.id}: 未登録の standard ID ${standardId}`);
  }
  for (const evidence of topic.evidence ?? []) {
    if (!sourceById.has(evidence.sourceId)) errors.push(`${topic.id}: 未登録の source ID ${evidence.sourceId}`);
  }
  for (const resourceId of topic.resourceIds ?? []) {
    if (!resourceById.has(resourceId)) errors.push(`${topic.id}: 未登録の resource ID ${resourceId}`);
  }
}
for (const edge of dependencies) {
  if (!edgeTypes.has(edge.type)) errors.push(`${edge.id}: 未定義の relation type ${edge.type}`);
  if (!topicById.has(edge.from)) errors.push(`${edge.id}: from に未登録の topic ID ${edge.from}`);
  if (!topicById.has(edge.to)) errors.push(`${edge.id}: to に未登録の topic ID ${edge.to}`);
}
for (const standard of standards) {
  if (!sourceById.has(standard.sourceId)) errors.push(`${standard.id}: 未登録の source ID ${standard.sourceId}`);
}
for (const source of sources) {
  if (!source.title || !source.publisher || !source.url) errors.push(`${source.id}: 出典の必須情報が不足しています。`);
}
const representedTopicIds = new Set(representationModels.flatMap(model => model.topicIds ?? []));
for (const model of representationModels) {
  if (!model.name || !model.purpose) errors.push(`${model.id}: 表現モデルの name / purpose が不足しています。`);
  for (const topicId of model.topicIds ?? []) {
    if (!topicById.has(topicId)) errors.push(`${model.id}: 未登録の topic ID ${topicId}`);
  }
}

for (const topic of topics) {
  const strictPrerequisites = dependencies
    .filter(edge => edge.type === "prerequisite" && edge.to === topic.id)
    .map(edge => edge.from).sort();
  const listedPrerequisites = [...(topic.prerequisiteIds ?? [])].sort();
  if (JSON.stringify(strictPrerequisites) !== JSON.stringify(listedPrerequisites)) {
    errors.push(`${topic.id}: prerequisiteIds と dependencies.json の prerequisite 関係が一致しません。`);
  }
}

// Only strict prerequisite edges are expected to form a directed acyclic graph.
const strictGraph = new Map(topics.map(topic => [topic.id, []]));
for (const edge of dependencies.filter(edge => edge.type === "prerequisite")) {
  if (strictGraph.has(edge.from) && strictGraph.has(edge.to)) strictGraph.get(edge.from).push(edge.to);
}
const visiting = new Set();
const visited = new Set();
function visit(node) {
  if (visiting.has(node)) {
    errors.push(`前提関係に循環があります: ${node}`);
    return;
  }
  if (visited.has(node)) return;
  visiting.add(node);
  for (const next of strictGraph.get(node) ?? []) visit(next);
  visiting.delete(node);
  visited.add(node);
}
for (const topic of topics) visit(topic.id);

const byDomain = {};
for (const topic of topics) byDomain[topic.domain] = (byDomain[topic.domain] ?? 0) + 1;
report.push(`学習項目: ${topics.length}`);
report.push(`関係: ${dependencies.length}`);
report.push(`出典: ${sources.length}`);
report.push(`領域参照: ${standards.length}`);
report.push(`表現モデル: ${representationModels.length}`);
report.push(`表現モデルに関連づけられた学習項目: ${representedTopicIds.size}/${topics.length}`);
report.push(`公式コード未照合の項目: ${codeMappings.filter(item => item.matchStatus === "not-checked").length}/${topics.length}`);
if (manifestData.counts?.topics !== topics.length) errors.push("manifest.json の topics 件数が topics.json と一致しません。");
if (manifestData.counts?.dependencies !== dependencies.length) errors.push("manifest.json の dependencies 件数が dependencies.json と一致しません。");
if (manifestData.counts?.representationModels !== representationModels.length) errors.push("manifest.json の representationModels 件数が実データと一致しません。");
if (manifestData.counts?.sources !== sources.length) errors.push("manifest.json の sources 件数が実データと一致しません。");
if (manifestData.counts?.curriculumStandards !== standards.length) errors.push("manifest.json の curriculumStandards 件数が実データと一致しません。");
if (codeMappings.length !== topics.length) errors.push("curriculum-code-mapping.json の対応枠数が topics.json の項目数と一致しません。");
for (const item of codeMappings) {
  if (!topicById.has(item.topicId)) errors.push(`コード対応表に未登録の topic ID ${item.topicId}`);
  if (!["not-checked","candidate","verified","no-direct-match"].includes(item.matchStatus)) errors.push(`${item.topicId}: 未定義の matchStatus ${item.matchStatus}`);
}
report.push(`教科・領域別: ${JSON.stringify(byDomain)}`);
if (errors.length) {
  console.error("検証エラー:");
  for (const error of errors) console.error("- " + error);
  process.exitCode = 1;
} else {
  console.log("データ参照チェック OK");
  for (const line of report) console.log(line);
}
