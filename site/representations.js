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
    console.error("算数の表し方マップの初期化に失敗しました。", error);
    $("#summary").textContent = "データを読み込めませんでした。";
    $("#models").replaceChildren();
    const message = document.createElement("div");
    message.className = "load-error";
    message.setAttribute("role", "alert");
    message.innerHTML = "<strong>表し方マップを読み込めませんでした。</strong><p>通信状態を確認して、もう一度お試しください。</p>";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "retry-button";
    retry.textContent = "もう一度読み込む";
    retry.addEventListener("click", () => window.location.reload());
    message.append(retry);
    $("#models").append(message);
  }
}

init();
