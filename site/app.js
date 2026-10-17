const state = { topics: [], dependencies: [], selected: null };
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(path + " を読み込めませんでした");
  return response.json();
}
function renderSubjects() {
  const select = $("#subject");
  [...new Set(state.topics.map((topic) => topic.subject))].sort().forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    select.append(option);
  });
}
function filteredTopics() {
  const query = $("#query").value.trim().toLocaleLowerCase("ja");
  const subject = $("#subject").value;
  return state.topics.filter((topic) => {
    const text = [topic.name, topic.description, topic.domain, topic.subject].join(" ").toLocaleLowerCase("ja");
    return (!query || text.includes(query)) && (!subject || topic.subject === subject);
  });
}
function renderList() {
  const topics = filteredTopics();
  $("#count").textContent = topics.length + " 件の学習項目（試作）";
  const list = $("#items");
  list.replaceChildren();
  if (!topics.length) {
    list.innerHTML = '<p class="muted">該当する項目がありません。</p>';
    return;
  }
  topics.forEach((topic) => {
    const button = document.createElement("button");
    button.className = "topic";
    button.type = "button";
    button.innerHTML = '<strong>' + esc(topic.name) + '</strong><small>' + esc(topic.subject + " · " + topic.domain + " · " + topic.grades.map((g) => g + "年").join("・")) + '</small>';
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
    ? '<ul>' + edges.map((edge) => { const related = findTopic(edge[key]); return related ? '<li>' + esc(related.name) + ' <span class="muted">(' + esc(edge.type) + ')</span></li>' : ''; }).join('') + '</ul>'
    : '<p class="muted">' + empty + '</p>';
  $("#detail").innerHTML = '<span class="tag">' + esc(topic.subject) + '</span><span class="tag">' + esc(topic.reviewStatus) + '</span><h2>' + esc(topic.name) + '</h2><p>' + esc(topic.description) + '</p><p class="muted">対象学年：' + esc(topic.grades.map((g) => g + "年").join("・")) + '</p><h3>この項目につながる前の学習</h3>' + relationList(incoming, "from", "登録された関係はありません。") + '<h3>この項目からつながる学習</h3>' + relationList(outgoing, "to", "登録された関係はありません。") + '<p class="muted">項目 ID：' + esc(topic.id) + '</p>';
}
async function init() {
  try {
    const [topics, dependencies] = await Promise.all([loadJson("../data/topics.json"), loadJson("../data/dependencies.json")]);
    state.topics = topics.topics || [];
    state.dependencies = dependencies.dependencies || [];
    renderSubjects();
    renderList();
    if (state.topics[0]) renderDetail(state.topics[0].id);
    $("#query").addEventListener("input", renderList);
    $("#subject").addEventListener("change", renderList);
  } catch (error) {
    $("#count").textContent = "データを読み込めませんでした。";
    $("#items").textContent = error.message + " GitHub Pages またはローカル HTTP サーバーで開いてください。";
  }
}
init();
