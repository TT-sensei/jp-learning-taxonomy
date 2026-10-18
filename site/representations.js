const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(path + " を読み込めませんでした");
  return response.json();
}

async function init() {
  try {
    const [modelData, topicData] = await Promise.all([
      loadJson("../data/representation-models.json"),
      loadJson("../data/topics.json")
    ]);
    const topicsById = new Map(topicData.topics.map((topic) => [topic.id, topic]));

    function render() {
      const selectedGrade = Number($("#grade-filter").value) || 0;
      const cards = (modelData.models || []).map((model) => {
        const relatedTopics = (model.topicIds || [])
          .map((id) => topicsById.get(id))
          .filter((topic) => topic && topic.topicLifecycle !== "superseded" && (!selectedGrade || (topic.grades || []).includes(selectedGrade)));
        return { model, relatedTopics };
      }).filter(({ relatedTopics }) => relatedTopics.length > 0);

      $("#summary").textContent = selectedGrade
        ? `${selectedGrade}年に関連する表し方 ${cards.length}種類（学年との対応は確認中）`
        : `${cards.length}種類の表し方を表示中（学習項目とのつながりは確認中）`;

      $("#models").innerHTML = cards.map(({ model, relatedTopics }) => {
        const numberOfRelatedTopics = relatedTopics.length;
        return `
          <article class="model-card">
            <p class="model-meta">関連する学び：${esc(numberOfRelatedTopics)}件</p>
            <h2>${esc(model.studentName || model.name)}</h2>
            <p class="model-purpose">${esc(model.studentPurpose || model.purpose)}</p>
            <h3>こんな学びで使う</h3>
            <ul>${relatedTopics.map((topic) => `
              <li>
                <strong class="model-topic-title">${esc(topic.studentName || topic.name)}</strong>
                <p class="model-topic-description">${esc(topic.studentDescription || topic.description || "")}</p>
              </li>
            `).join("")}</ul>
          </article>`;
      }).join("");

      if (!cards.length) {
        $("#models").innerHTML = '<p class="muted">この学年に関連づけられた項目は、まだ登録されていません。</p>';
      }
    }

    $("#grade-filter").addEventListener("change", render);
    render();
  } catch (error) {
    $("#summary").textContent = "データを読み込めませんでした。";
    $("#models").textContent = error.message;
  }
}

init();
