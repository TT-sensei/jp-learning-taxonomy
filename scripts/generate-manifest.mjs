// Regenerates the counts block of data/manifest.json from the actual data files.
// Counting rules mirror scripts/validate.mjs exactly:
// - byGrade counts every topic (including superseded) for each grade in its grades array.
// - activeByGrade, byArea, bySubject and bySubjectGrade count active topics only
//   (topicLifecycle !== "superseded"), again for each grade in the grades array.
// Run this after adding, merging or re-placing topics, then run scripts/validate.mjs.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const topics = readJson("data/topics.json").topics ?? [];
const dependencies = readJson("data/dependencies.json").dependencies ?? [];
const pathways = readJson("data/learning-pathways.json").pathways ?? [];
const standardsData = readJson("data/curriculum-standards.json");
const standards = standardsData.standards ?? [];
const sources = standardsData.sources ?? [];
const resources = readJson("data/resources.json").resources ?? [];
const representationModels = readJson("data/representation-models.json").models ?? [];
const mathStrands = readJson("data/math-learning-map.json").strands ?? [];

const activeTopics = topics.filter((topic) => topic.topicLifecycle !== "superseded");
const supersededTopics = topics.filter((topic) => topic.topicLifecycle === "superseded");

const byGrade = {};
const activeByGrade = {};
for (let grade = 1; grade <= 6; grade += 1) {
  const key = String(grade);
  byGrade[key] = topics.filter((topic) => topic.grades?.includes(grade)).length;
  activeByGrade[key] = activeTopics.filter((topic) => topic.grades?.includes(grade)).length;
}
const byArea = {};
for (const topic of activeTopics) {
  byArea[topic.domain] = (byArea[topic.domain] ?? 0) + 1;
}
const bySubject = {};
const bySubjectGrade = {};
for (const topic of activeTopics) {
  bySubject[topic.subject] = (bySubject[topic.subject] ?? 0) + 1;
  bySubjectGrade[topic.subject] ??= {};
  for (const grade of topic.grades ?? []) {
    const key = String(grade);
    bySubjectGrade[topic.subject][key] = (bySubjectGrade[topic.subject][key] ?? 0) + 1;
  }
}

const manifestPath = path.join(root, "data/manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.counts = {
  topics: topics.length,
  dependencies: dependencies.length,
  curriculumStandards: standards.length,
  sources: sources.length,
  resources: resources.length,
  byArea,
  byGrade,
  representationModels: representationModels.length,
  activeTopics: activeTopics.length,
  supersededTopics: supersededTopics.length,
  bySubject,
  bySubjectGrade,
  learningPathways: pathways.length,
  mathLearningStrands: mathStrands.length,
  activeByGrade
};
const today = new Date().toISOString().slice(0, 10);
manifest.updatedAt = today;
const note = `${today}: manifestの集計を scripts/generate-manifest.mjs で実データから再生成した（学習項目${topics.length}件・現行${activeTopics.length}件・関係${dependencies.length}件・出典${sources.length}件）。今後、項目の追加・統合や学年・領域の見直しをしたときは生成スクリプトを再実行し、validate.mjs の照合を通すこと。`;
manifest.notes = Array.isArray(manifest.notes) ? manifest.notes : [];
if (!manifest.notes.some((entry) => typeof entry === "string" && entry.includes("generate-manifest.mjs"))) {
  manifest.notes.push(note);
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`manifest.json を再生成しました: topics ${topics.length} / active ${activeTopics.length} / superseded ${supersededTopics.length} / dependencies ${dependencies.length} / sources ${sources.length} / pathways ${pathways.length}`);
