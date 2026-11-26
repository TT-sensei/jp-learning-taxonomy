// Dependency-free JSON Schema check for the dataset files.
// Supports the subset of JSON Schema used by schema/*.json in this repository:
// type, enum, pattern, minLength, minItems, maxItems, uniqueItems, minimum,
// maximum, required, properties, additionalProperties and items.
// Validates topics, dependencies and the learning-support file so that the
// published schemas and the actual data cannot silently drift apart.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const errors = [];

const typeOf = (value) => {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "number";
  return typeof value;
};

function check(value, schema, at) {
  if (!schema || typeof schema !== "object") return;
  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    errors.push(`${at}: 値 ${JSON.stringify(value)} は enum ${JSON.stringify(schema.enum)} に含まれません。`);
  }
  if (schema.type) {
    const actual = typeOf(value);
    const ok = schema.type === "number" ? actual === "integer" || actual === "number" : actual === schema.type;
    if (!ok) {
      errors.push(`${at}: 型が ${schema.type} ではありません（実際: ${actual}）。`);
      return;
    }
  }
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${at}: minLength ${schema.minLength} 未満です。`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${at}: pattern ${schema.pattern} に一致しません。`);
    if (schema.format === "uri") {
      try {
        new URL(value);
      } catch {
        errors.push(`${at}: uri 形式ではありません。`);
      }
    }
  }
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${at}: minimum ${schema.minimum} 未満です。`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${at}: maximum ${schema.maximum} を超えています。`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${at}: minItems ${schema.minItems} 未満です。`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${at}: maxItems ${schema.maxItems} を超えています。`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(`${at}: uniqueItems ですが重複があります。`);
    if (schema.items) value.forEach((item, index) => check(item, schema.items, `${at}[${index}]`));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required ?? []) {
      if (!(key in value)) errors.push(`${at}: 必須項目 ${key} がありません。`);
    }
    const properties = schema.properties ?? {};
    for (const [key, subSchema] of Object.entries(properties)) {
      if (key in value) check(value[key], subSchema, `${at}.${key}`);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) errors.push(`${at}: スキーマに未定義の項目 ${key} があります。`);
      }
    } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) check(value[key], schema.additionalProperties, `${at}.${key}`);
      }
    }
  }
}

const topicSchema = readJson("schema/topic.schema.json");
(readJson("data/topics.json").topics ?? []).forEach((topic, index) => check(topic, topicSchema, `topics[${index}] ${topic.id ?? ""}`));
const dependencySchema = readJson("schema/dependency.schema.json");
(readJson("data/dependencies.json").dependencies ?? []).forEach((edge, index) => check(edge, dependencySchema, `dependencies[${index}] ${edge.id ?? ""}`));
const supportSchema = readJson("schema/learning-support.schema.json");
check(readJson("data/learning-support.json"), supportSchema, "learning-support");

if (errors.length) {
  console.error("スキーマ検証エラー:");
  for (const error of errors) console.error("- " + error);
  process.exitCode = 1;
} else {
  console.log("スキーマ検証 OK（topics / dependencies / learning-support）");
}
