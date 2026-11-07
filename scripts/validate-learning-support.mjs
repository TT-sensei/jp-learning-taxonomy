import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const topicsData = readJson("data/topics.json");
const supportData = readJson("data/learning-support.json");
const topicIds = new Set((topicsData.topics || []).map((topic) => topic.id));
const caseIds = new Set();
const errors = [];

if (!Array.isArray(supportData.supportCases)) errors.push("supportCases must be an array.");
if (!["not-started", "draft", "reviewing", "reviewed"].includes(supportData.status)) {
  errors.push("Unknown learning-support dataset status.");
}

for (const item of supportData.supportCases || []) {
  if (!item.id || caseIds.has(item.id)) errors.push("Missing or duplicate support case id: " + (item.id || "(empty)"));
  caseIds.add(item.id);
  if (!topicIds.has(item.topicId)) errors.push("Unknown topicId in " + item.id + ": " + item.topicId);
  for (const target of item.reviewTargets || []) {
    if (!topicIds.has(target.topicId)) errors.push("Unknown review target in " + item.id + ": " + target.topicId);
    if (target.topicId === item.topicId) errors.push("A support case cannot recommend itself: " + item.id);
  }
  if (item.reviewStatus === "published" && (!Array.isArray(item.evidence) || item.evidence.length === 0)) {
    errors.push("Published support case requires evidence: " + item.id);
  }
  if (item.reviewStatus === "published" && item.evidenceType === "unknown") {
    errors.push("Published support case cannot have unknown evidence type: " + item.id);
  }
}

if (errors.length) {
  console.error("Learning support validation failed:");
  errors.forEach((error) => console.error("- " + error));
  process.exit(1);
}
console.log("Learning support validation passed (" + (supportData.supportCases || []).length + " support cases).");
