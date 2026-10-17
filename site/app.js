const state = { topics: [], dependencies: [], standards: null, selected: null };
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const relationNames = {
  "prerequisite":"前提となる学習",
  "recommended-prerequisite":"先に学ぶと役立つ",
  "related-learning":"関連する学習",
  "extension":"発展",
  "application":"活用",
  "recurring-development":"くり返し育つ力"
};
const statusNames = {"draft":"草案","needs-review":"確認中","reviewed":"確認済み","published":"公開"};
async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(path + " を読み込めませんでした");
  return response.json();
}
function fillSelect(selector, values, firstLabel) {
  const select = $(selector);
  select.replaceChildren();
  const first = document.createElement("option");
  first.value = "";
  first.textContent = firstLabel;
  select.append(first);
  [...new Set(values)].sort((a,b)=>a.localeCompare(b,"ja")).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}
function renderFilters() {
  fillSelect("#subject", state.topics.map(t=>t.subject), "すべて");
  fillSelect("#domain", state.topics.map(t=>t.domain), "すべての領域");
}
function filteredTopics() {
  const query = $("#query").value.trim().toLocaleLowerCase("ja");
  const subject = $("#subject").value;
  const grade = Number($("#grade").value) || 0;
  const domain = $("#domain").value;
  return state.topics.filter((topic) => {
    const text = [topic.name,topic.description,topic.domain,topic.subject,topic.id].join(" ").toLocaleLowerCase("ja");
    return (!query || text.includes(query)) &&
      (!subject || topic.subject === subject) &&
      (!grade || topic.grades.includes(grade)) &&
      (!domain || topic.domain === domain);
  }).sort((a,b)=>a.grades[0]-b.grades[0] || a.domain.localeCompare(b.domain,"ja") || a.name.localeCompare(b.name,"ja"));
}
function renderList() {
  const topics = filteredTopics();
  $("#count").textContent = topics.length + " 件の学習項目";
  const list = $("#items");
  list.replaceChildren();
  if (!topics.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "該当する項目がありません。絞り込みを変えてみてください。";
    list.append(empty);
    return;
  }
  topics.forEach((topic) => {
    const button = document.createElement("button");
    button.className = "topic";
    button.type = "button";
    button.setAttribute("aria-pressed", String(state.selected===topic.id));
    button.innerHTML = '<strong>' + esc(topic.name) + '</strong><small>' +
      esc(topic.subject + " · " + topic.grades.map((g) => g + "年").join("・")) +
      '</small><small>' + esc(topic.domain) + '</small><span class="status">' +
      esc(statusNames[topic.reviewStatus] || topic.reviewStatus) + '</span>';
    button.addEventListener("click", () => renderDetail(topic.id));
    list.append(button);
  });
}
function renderDetail(id) {
  const topic = state.topics.find((item) => item.id === id);
  if (!topic) return;
  state.selected = id;
  const incoming = state.dependencies.filter((edge) => edge.to === id);
  const outgoing = state.dependencies.filter((edge) => edge.from === id);
  const findTopic = (topicId) => state.topics.find((item) => item.id === topicId);
  const relationList = (edges, key, empty) => edges.length
    ? '<ul>' + edges.map((edge) => {
        const related = findTopic(edge[key]);
        if (!related) return "";
        return '<li><a href="#" class="related-topic" data-topic-id="' + esc(related.id) + '">' + esc(related.name) +
          '</a><span class="relation-type"> · ' + esc(relationNames[edge.type] || edge.type) + '</span>' +
          '<span class="relation-reason">' + esc(edge.rationale) + '</span></li>';
      }).join("") + '</ul>'
    : '<p class="muted">' + empty + '</p>';
  const sourceLinks = (topic.evidence || []).map((evidence) => {
    const source = (state.standards?.sources || []).find((s) => s.id === evidence.sourceId);
    const link = source ? '<a class="source-link" href="' + esc(source.url) + '" target="_blank" rel="noopener noreferrer">' + esc(source.title) + '</a>' : esc(evidence.sourceId);
    return '<li>' + link + '<span class="relation-reason">' + esc(evidence.note) + '</span></li>';
  }).join("");
  $("#detail").innerHTML =
    '<span class="tag">' + esc(topic.subject) + '</span><span class="tag">' + esc(statusNames[topic.reviewStatus] || topic.reviewStatus) + '</span>' +
    '<h2>' + esc(topic.name) + '</h2><p>' + esc(topic.description) + '</p>' +
    '<p class="muted">対象学年：' + esc(topic.grades.map((g) => g + "年").join("・")) + '<br>' + esc(topic.domain) + '</p>' +
    '<h3>この項目につながる前の学習</h3>' + relationList(incoming, "from", "登録された関係はありません。") +
    '<h3>この項目からつながる学習</h3>' + relationList(outgoing, "to", "登録された関係はありません。") +
    '<h3>出典・確認メモ</h3><ul>' + (sourceLinks || "<li>出典情報は未登録です。</li>") + '</ul>' +
    '<p class="muted">項目 ID：' + esc(topic.id) + '</p>';
  $("#detail").querySelectorAll(".related-topic").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const nextId = link.getAttribute("data-topic-id");
      const nextTopic = findTopic(nextId);
      if (nextTopic) {
        renderDetail(nextId);
        const query = $("#query");
        query.value = "";
        renderList();
      }
    });
  });
  renderList();
}
async function init() {
  try {
    const [topics, dependencies, standards] = await Promise.all([
      loadJson("../data/topics.json"),
      loadJson("../data/dependencies.json"),
      loadJson("../data/curriculum-standards.json")
    ]);
    state.topics = topics.topics || [];
    state.dependencies = dependencies.dependencies || [];
    state.standards = standards;
    renderFilters();
    renderList();
    if (state.topics[0]) renderDetail(state.topics[0].id);
    ["#query","#subject","#grade","#domain"].forEach((selector) => {
      $(selector).addEventListener(selector==="#query" ? "input":"change", renderList);
    });
  } catch (error) {
    $("#count").textContent = "データを読み込めませんでした。";
    $("#items").textContent = error.message + " GitHub Pages またはローカル HTTP サーバーで開いてください。";
  }
}
init();
