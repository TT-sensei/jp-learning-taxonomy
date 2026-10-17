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
          .filter((topic) => topic && (!selectedGrade || topic.grades.includes(selectedGrade)));
        return { model, relatedTopics };
      }).filter(({ relatedTopics }) => relatedTopics.length > 0);

      $("#summary").textContent = selectedGrade
        ? `${selectedGrade}年に関連する表現モデル ${cards.length}種類 · 対応は確認中`
        : `${cards.length}種類の表現モデル · 対応する学習項目が登録されたものを表示`;

      $("#models").innerHTML = cards.map(({ model, relatedTopics }) => {
        const applicableGrades = [...new Set(relatedTopics.flatMap((topic) => topic.grades))]
          .sort((a, b) => a - b);
        return `
          <article class="model-card">
            <p class="model-meta">関連項目の学年：${esc(applicableGrades.map((grade) => grade + "年").join("・"))}</p>
            <h2>${esc(model.name)}</h2>
            <p>${esc(model.purpose)}</p>
            <h3>関連する学習項目</h3>
            <ul>${relatedTopics.map((topic) => `
              <li>${esc(topic.name)} <span class="model-meta">${esc(topic.grades.map((grade) => grade + "年").join("・"))}</span></li>
            `).join("")}</ul>
            <p class="model-meta">表現モデルと項目の対応：確認中</p>
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
