(() => {
  "use strict";
  const DATA_URL = "../data/topics.json";
  const SUBJECTS = ["国語", "算数", "社会", "理科"];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const state = { topics: [], subject: "", grade: "", query: "", sort: "subject", showAll: false, visible: 36 };
  const subjectOrder = new Map(SUBJECTS.map((name, index) => [name, index]));

  function isActiveTopic(topic) {
    return topic && topic.topicLifecycle !== "superseded" && topic.status !== "superseded";
  }

  function gradeLabel(grades) {
    const values = [...new Set((grades || []).map(Number).filter(n => n >= 1 && n <= 6))].sort((a, b) => a - b);
    if (!values.length) return "学年確認中";
    const ranges = [];
    let start = values[0], end = values[0];
    values.slice(1).forEach(n => {
      if (n === end + 1) { end = n; return; }
      ranges.push([start, end]);
      start = end = n;
    });
    ranges.push([start, end]);
    return ranges.map(([a, b]) => a === b ? a + "年の目安" : a + "〜" + b + "年の目安").join("・");
  }

  function updateSubjectCounts() {
    SUBJECTS.forEach(subject => {
      const count = state.topics.filter(topic => topic.subject === subject).length;
      $$("[data-subject-count]").filter(node => node.dataset.subjectCount === subject).forEach(node => {
        node.textContent = count + "項目";
      });
    });
  }

  function syncFilterUI() {
    $$("[data-subject-filter]").forEach(button => {
      const active = button.dataset.subjectFilter === state.subject;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    $$("[data-grade-filter]").forEach(button => {
      const active = button.dataset.gradeFilter === state.grade;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    $$("[data-subject-pick]").forEach(button => {
      const active = button.dataset.subjectPick === state.subject;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const search = $("#topic-search");
    if (search && search.value !== state.query) search.value = state.query;
  }

  function normalizeSearchText(value) {
    return String(value ?? "").normalize("NFKC").toLocaleLowerCase("ja").replace(/[\s　、，。・：:;；「」『』（）()【】［］]/g, "");
  }

  function matchesQuery(topic, query) {
    if (!query) return true;
    const evidenceNotes = (topic.evidence || []).map(item => [item.sourceId, item.note]);
    const haystack = normalizeSearchText([
      topic.id, topic.name, topic.studentName, topic.description, topic.studentDescription,
      topic.subject, topic.domain, topic.cluster, topic.area, topic.keywords,
      topic.topicType, topic.reviewStatus, topic.gradePlacement?.note, evidenceNotes
    ].flat(Infinity).filter(Boolean).join(" "));
    const terms = query.trim().split(/[\s　、，,]+/).map(normalizeSearchText).filter(Boolean);
    return terms.every(term => haystack.includes(term));
  }

  function getFilteredTopics() {
    return state.topics.filter(topic => {
      if (state.subject && topic.subject !== state.subject) return false;
      if (state.grade && !(topic.grades || []).map(Number).includes(Number(state.grade))) return false;
      return matchesQuery(topic, state.query.trim());
    }).sort((a, b) => {
      const gradeA = Math.min(...((a.grades || []).length ? a.grades.map(Number) : [99]));
      const gradeB = Math.min(...((b.grades || []).length ? b.grades.map(Number) : [99]));
      const subjectDiff = (subjectOrder.get(a.subject) ?? 99) - (subjectOrder.get(b.subject) ?? 99);
      const clusterA = String(a.cluster || a.domain || a.area || "まとまり確認中");
      const clusterB = String(b.cluster || b.domain || b.area || "まとまり確認中");
      const titleA = String(a.studentName || a.name || "");
      const titleB = String(b.studentName || b.name || "");
      if (state.sort === "grade") {
        return gradeA - gradeB || subjectDiff || titleA.localeCompare(titleB, "ja");
      }
      if (state.sort === "cluster") {
        return subjectDiff || clusterA.localeCompare(clusterB, "ja") || gradeA - gradeB || titleA.localeCompare(titleB, "ja");
      }
      if (state.sort === "relevance" && state.query.trim()) {
        const terms = state.query.trim().split(/[\s　、，,]+/).map(normalizeSearchText).filter(Boolean);
        const score = topic => {
          const title = normalizeSearchText([topic.studentName, topic.name].filter(Boolean).join(" "));
          return terms.reduce((sum, term) => sum + (title.includes(term) ? 5 : 0), 0);
        };
        const relevance = score(b) - score(a);
        if (relevance) return relevance;
      }
      return subjectDiff || gradeA - gradeB || titleA.localeCompare(titleB, "ja");
    });
  }

  function topicCard(topic) {
    const label = topic.studentName || topic.name || "名前のない学習項目";
    const description = topic.studentDescription || topic.description || "詳しい説明は確認中です。";
    const grades = gradeLabel(topic.grades);
    const domain = topic.cluster || topic.domain || topic.area || "";
    const url = "./details.html?topic=" + encodeURIComponent(topic.id || "");
    return '<article class="result-card"><a class="result-link" href="' + esc(url) + '" aria-label="' + esc(label + "の詳しい学びを見る") + '">' +
      '<span class="result-meta"><span class="result-subject">' + esc(topic.subject || "教科確認中") + '</span><span class="result-grade">' + esc(grades) + '</span>' +
      (domain ? '<span class="result-domain">' + esc(domain) + '</span>' : '') + '</span>' +
      '<strong class="result-title">' + esc(label) + '</strong><span class="result-description">' + esc(description) + '</span><span class="result-open">詳しい学びとつながりを見る →</span></a></article>';
  }

  function emptyState(title, description, buttonLabel) {
    return '<div class="empty-state"><span class="empty-state-mark" aria-hidden="true">？</span><strong>' + esc(title) + '</strong><p>' + esc(description) + '</p>' +
      (buttonLabel ? '<button id="show-all-topics" type="button" class="secondary-button">' + esc(buttonLabel) + '</button>' : '') + '</div>';
  }

  function resultGroupLabel(topic) {
    if (state.sort === "grade") {
      const grades = [...new Set((topic.grades || []).map(Number).filter(n => n >= 1 && n <= 6))].sort((a, b) => a - b);
      return grades.length ? grades[0] + "年ごろの学び" : "学年確認中";
    }
    if (state.sort === "cluster") {
      return (topic.subject || "教科確認中") + "｜" + (topic.cluster || topic.domain || topic.area || "まとまり確認中");
    }
    if (state.sort === "relevance" && state.query.trim()) return "検索との関連が高い順";
    return topic.subject || "教科確認中";
  }

  function renderResults() {
    const results = $("#results");
    const count = $("#results-count");
    const title = $("#results-title");
    const description = $("#results-description");
    if (!results || !count) return;

    const hasFilter = Boolean(state.subject || state.grade || state.query.trim() || state.showAll);
    const active = [];
    if (state.subject) active.push(["教科：" + state.subject, "subject"]);
    if (state.grade) active.push(["学年：" + state.grade + "年", "grade"]);
    if (state.query.trim()) active.push(["言葉：" + state.query.trim(), "query"]);
    $("#active-filters").innerHTML = active.map(([label, type]) => '<button type="button" class="active-filter" data-remove-filter="' + type + '">' + esc(label) + ' <span aria-hidden="true">×</span></button>').join("");
    $("#active-filters").hidden = active.length === 0;
    if (!hasFilter) {
      count.textContent = "未選択";
      title.textContent = "学びを見つけよう";
      description.textContent = "まずは教科・学年・言葉のどれかを選んでみてください。";
      results.innerHTML = emptyState("どこから探してみる？", "上の教科カードを選ぶか、学年や言葉で検索してください。項目を開くと、前提や関連する学びをたどれます。", "全教科の項目をすべて見る");
      results.setAttribute("aria-busy", "false");
      return;
    }

    const list = getFilteredTopics();
    count.textContent = list.length + "項目";
    title.textContent = state.subject ? state.subject + "の学習項目" : (state.grade ? state.grade + "年生の学び" : (state.query.trim() ? "検索結果" : "全教科の学習項目"));
    const criteria = [];
    if (state.subject) criteria.push(state.subject);
    if (state.grade) criteria.push(state.grade + "年");
    if (state.query.trim()) criteria.push("「" + state.query.trim() + "」");
    description.textContent = criteria.length ? criteria.join("・") + "に合う項目です。気になる項目を開くと、学びのつながりをたどれます。" : "教科をこえて、登録されている学習項目を表示しています。";
    if (!list.length) {
      results.innerHTML = emptyState("見つかりませんでした", "条件を少し変えるか、別の言葉で探してみてください。", "");
      results.setAttribute("aria-busy", "false");
      return;
    }

    const visible = list.slice(0, state.visible);
    let html = "";
    let previousGroup = "";
    visible.forEach(topic => {
      const group = resultGroupLabel(topic);
      if (group !== previousGroup) {
        html += '<h4 class="result-group-heading">' + esc(group) + '</h4>';
        previousGroup = group;
      }
      html += topicCard(topic);
    });
    if (visible.length < list.length) {
      html += '<div class="more-row"><button type="button" id="show-more-topics" class="more-button">さらに見る（あと' + (list.length - visible.length) + '項目）</button></div>';
    }
    results.innerHTML = html;
    results.setAttribute("aria-busy", "false");
  }

  function chooseSubject(subject, shouldScroll) {
    state.subject = subject;
    state.showAll = false;
    state.visible = 36;
    syncFilterUI();
    renderResults();
    if (shouldScroll) $("#explorer").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function chooseGrade(grade) {
    state.grade = grade;
    state.showAll = false;
    state.visible = 36;
    syncFilterUI();
    renderResults();
  }

  function resetFilters() {
    state.subject = "";
    state.grade = "";
    state.query = "";
    state.showAll = false;
    state.visible = 36;
    syncFilterUI();
    renderResults();
  }

  function bindEvents() {
    $("#subject-filters").addEventListener("click", event => {
      const button = event.target.closest("[data-subject-filter]");
      if (!button) return;
      chooseSubject(button.dataset.subjectFilter || "", false);
    });
    $("#grade-filters").addEventListener("click", event => {
      const button = event.target.closest("[data-grade-filter]");
      if (!button) return;
      chooseGrade(button.dataset.gradeFilter || "");
    });
    $$("[data-subject-pick]").forEach(button => {
      button.addEventListener("click", () => chooseSubject(button.dataset.subjectPick || "", true));
    });
    $("#topic-search").addEventListener("input", event => {
      state.query = event.target.value || "";
      state.showAll = false;
      state.visible = 36;
      renderResults();
    });
    $("#results-sort").addEventListener("change", event => {
      state.sort = event.target.value || "subject";
      state.visible = 36;
      renderResults();
    });
    $("#clear-filters").addEventListener("click", resetFilters);
    $("[data-query-pick]").forEach(button => button.addEventListener("click", () => {
      state.query = button.dataset.queryPick || "";
      state.showAll = false;
      state.visible = 36;
      syncFilterUI();
      renderResults();
      $("#explorer").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    $("#active-filters").addEventListener("click", event => {
      const button = event.target.closest("[data-remove-filter]");
      if (!button) return;
      if (button.dataset.removeFilter === "subject") state.subject = "";
      if (button.dataset.removeFilter === "grade") state.grade = "";
      if (button.dataset.removeFilter === "query") state.query = "";
      state.showAll = false;
      state.visible = 36;
      syncFilterUI();
      renderResults();
    });
    $("#results").addEventListener("click", event => {
      if (event.target.closest("#show-all-topics")) {
        state.showAll = true;
        state.visible = 36;
        renderResults();
      } else if (event.target.closest("#show-more-topics")) {
        state.visible += 36;
        renderResults();
      }
    });
  }

  async function init() {
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error("学習データを読み込めませんでした。");
      const data = await response.json();
      state.topics = (data.topics || []).filter(isActiveTopic);
      updateSubjectCounts();
      bindEvents();
      syncFilterUI();
      renderResults();
    } catch (error) {
      console.error("学びの地図の初期化に失敗しました。", error);
      $("#results-count").textContent = "読み込み失敗";
      $("#results-title").textContent = "学習データを読み込めませんでした";
      $("#results-description").textContent = "通信状態を確認して、もう一度お試しください。";
      $("#results").innerHTML = '<div class="load-error"><strong>学習項目を表示できませんでした。</strong><p>ページを再読み込みしてください。問題が続く場合は、詳しい学習マップから探すこともできます。</p><a href="./details.html">詳しい学習マップを開く →</a></div>';
      $("#results").setAttribute("aria-busy", "false");
      $$("[data-subject-count]").forEach(node => node.textContent = "読込失敗");
    }
  }

  init();
})();