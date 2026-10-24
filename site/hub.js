(() => {
  "use strict";

  const TOPICS_URL = "../data/topics.json";
  const RELATIONS_URL = "../data/dependencies.json";
  const SUBJECTS = ["国語", "算数", "社会", "理科"];
  const SUBJECT_MARKS = { "国語": "言", "算数": "数", "社会": "社", "理科": "理" };
  const SUBJECT_DESCRIPTIONS = {
    "国語": "言葉・文字・読む・書く",
    "算数": "数・図形・変化・データ",
    "社会": "地域・国土・産業・歴史",
    "理科": "生命・地球・粒子・エネルギー"
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));

  const state = {
    topics: [],
    dependencies: [],
    topicById: new Map(),
    connections: new Map(),
    subject: "",
    grade: "",
    query: ""
  };

  function isActiveTopic(topic) {
    return topic && topic.topicLifecycle !== "superseded" && topic.status !== "superseded";
  }

  function titleOf(topic) {
    return topic.studentName || topic.name || "学習項目";
  }

  function descriptionOf(topic) {
    return topic.studentDescription || topic.description || "";
  }

  const socialTopicGroups = {
    "地域のようす": ["municipality-change", "local-area", "municipality-work", "community-predecessors", "local-map"],
    "くらしを支えるしくみ": ["waste-management", "water-supply", "firefighting", "police-safety", "disaster-prevention"],
    "都道府県のようす": ["prefecture-culture", "prefecture-land", "prefecture-industry"],
    "日本の国土と自然": ["japan-location", "japan-landforms-climate", "natural-environment-life"],
    "産業と環境": ["environment-protection", "transport-trade", "industrial-production", "information-industry", "food-life", "forestry", "fisheries", "agriculture"],
    "歴史のうつりかわり": ["edo-society", "unification", "war-and-recovery", "ancient-japan", "postwar-japan", "medieval-japan", "modernization"],
    "政治と世界": ["diet", "international-relations", "local-government", "government-courts", "constitution"],
    "資料を使って調べる": ["fieldwork-interview", "evidence-explanation", "decision-civic", "compare-regions", "maps-globes", "statistics-graphs", "timeline-sources"]
  };

  function groupOf(topic) {
    if (topic.subject === "社会") {
      for (const [label, fragments] of Object.entries(socialTopicGroups)) {
        if (fragments.some(fragment => String(topic.id || "").endsWith("." + fragment))) return label;
      }
      const grades = gradeValues(topic);
      const firstGrade = grades.length ? grades[0] : 0;
      return ({ 3: "地域のくらし", 4: "地域と都道府県", 5: "国土・産業", 6: "歴史・政治" })[firstGrade] || "社会の学び";
    }
    if (topic.subject === "算数") {
      const domain = String(topic.domain || "");
      if (domain === "A 数と計算") return "数と計算";
      if (domain === "B 図形") return "図形";
      if (domain.startsWith("C 測定")) return "長さ・かさ・時間を測る";
      if (domain.startsWith("C 変化と関係")) return "割合・速さ・変わり方";
      if (domain === "D データの活用") return "表・グラフ・データ";
      if (domain.includes("横断的な数学的活動")) return "考え方・問題解決";
    }
    return String(topic.cluster || topic.domain || topic.area || "学びのまとまり");
  }

  function gradeValues(topic) {
    return [...new Set((topic.grades || []).map(Number).filter(n => n >= 1 && n <= 6))]
      .sort((a, b) => a - b);
  }

  function formatGradeRanges(values) {
    const grades = [...new Set((values || []).map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= 6))]
      .sort((a, b) => a - b);
    if (!grades.length) return "";
    const ranges = [];
    let start = grades[0];
    let end = grades[0];
    grades.slice(1).forEach(grade => {
      if (grade === end + 1) end = grade;
      else { ranges.push([start, end]); start = end = grade; }
    });
    ranges.push([start, end]);
    return ranges.map(([a, b]) => a === b ? a + "年" : a + "〜" + b + "年").join("・");
  }

  function gradeLabel(topic) {
    const placement = topic.gradePlacement || {};
    const first = Number(placement.candidateFirstIntroductionGrade);
    const continuing = (placement.candidateContinuingGrades || []).filter(g => Number(g) > first);
    if (Number.isInteger(first) && first >= 1 && first <= 6) {
      const label = "初出候補 " + first + "年";
      const ongoing = formatGradeRanges(continuing);
      return ongoing ? label + " · 継続候補 " + ongoing : label;
    }
    return formatGradeRanges(gradeValues(topic)) || "学年の目安";
  }

  function normalizeSearchText(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .toLocaleLowerCase("ja")
      .replace(/[\s　、，。・：:;；「」『』（）()【】［］]/g, "");
  }

  function addConnection(topicId, kind, otherId) {
    if (!topicId || !otherId || topicId === otherId) return;
    const other = state.topicById.get(otherId);
    if (!other) return;
    if (!state.connections.has(topicId)) {
      state.connections.set(topicId, { before: new Map(), related: new Map(), future: new Map(), application: new Map(), applied: new Map() });
    }
    state.connections.get(topicId)[kind].set(otherId, other);
  }

  function buildConnections() {
    state.connections.clear();
    const beforeTypes = new Set(["prerequisite", "recommended-prerequisite"]);
    const futureTypes = new Set(["prerequisite", "recommended-prerequisite", "extension"]);
    const relatedTypes = new Set(["related-learning", "recurring-development"]);

    state.dependencies.forEach(edge => {
      const from = state.topicById.get(edge.from);
      const to = state.topicById.get(edge.to);
      if (!from || !to) return;

      if (beforeTypes.has(edge.type)) addConnection(edge.to, "before", edge.from);
      if (futureTypes.has(edge.type)) addConnection(edge.from, "future", edge.to);

      if (relatedTypes.has(edge.type)) {
        addConnection(edge.from, "related", edge.to);
        addConnection(edge.to, "related", edge.from);
      }

      // Application links point from a learning item to a context where it is used.
      // Show the two directions with different labels so neither is mistaken for a prerequisite.
      if (edge.type === "application") {
        addConnection(edge.from, "application", edge.to);
        addConnection(edge.to, "applied", edge.from);
      }
    });

    state.connections.forEach(groups => {
      Object.keys(groups).forEach(kind => {
        const sorted = [...groups[kind].values()].sort((a, b) => {
          const gradeA = Math.min(...(gradeValues(a).length ? gradeValues(a) : [99]));
          const gradeB = Math.min(...(gradeValues(b).length ? gradeValues(b) : [99]));
          return gradeA - gradeB || titleOf(a).localeCompare(titleOf(b), "ja");
        });
        groups[kind] = sorted;
      });
    });
  }

  function connectionsFor(topic, kind) {
    return state.connections.get(topic.id)?.[kind] || [];
  }

  function matchesQuery(topic, query) {
    if (!query) return true;
    const terms = query.trim().split(/[\s　、，,]+/).map(normalizeSearchText).filter(Boolean);
    if (!terms.length) return true;
    const linkedNames = ["before", "related", "future", "application", "applied"]
      .flatMap(kind => connectionsFor(topic, kind).map(titleOf));
    const haystack = normalizeSearchText([
      topic.id, topic.name, topic.studentName, topic.description, topic.studentDescription,
      topic.subject, topic.domain, topic.cluster, topic.area, topic.keywords, linkedNames
    ].flat(Infinity).filter(Boolean).join(" "));
    return terms.every(term => haystack.includes(term));
  }

  function getFilteredTopics() {
    return state.topics.filter(topic => {
      if (state.subject && topic.subject !== state.subject) return false;
      if (state.grade && !gradeValues(topic).includes(Number(state.grade))) return false;
      return matchesQuery(topic, state.query);
    }).sort((a, b) => {
      const subjectA = SUBJECTS.indexOf(a.subject);
      const subjectB = SUBJECTS.indexOf(b.subject);
      const rankA = subjectA < 0 ? 99 : subjectA;
      const rankB = subjectB < 0 ? 99 : subjectB;
      const gradeA = Math.min(...(gradeValues(a).length ? gradeValues(a) : [99]));
      const gradeB = Math.min(...(gradeValues(b).length ? gradeValues(b) : [99]));
      return rankA - rankB ||
        groupOf(a).localeCompare(groupOf(b), "ja") ||
        gradeA - gradeB ||
        titleOf(a).localeCompare(titleOf(b), "ja");
    });
  }

  function updateSubjectCounts() {
    const counts = new Map();
    state.topics.forEach(topic => counts.set(topic.subject, (counts.get(topic.subject) || 0) + 1));
    $$("[data-subject-count]").forEach(node => {
      const subject = node.dataset.subjectCount;
      node.textContent = subject === "すべて"
        ? String(state.topics.length)
        : String(counts.get(subject) || 0);
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
    const search = $("#topic-search");
    if (search && search.value !== state.query) search.value = state.query;
  }

  function relationRow(topic, kind, label, cssClass, arrow, limit = 2) {
    const items = connectionsFor(topic, kind);
    if (!items.length) return "";
    const shown = items.slice(0, limit).map(item => {
      const url = "./details.html?topic=" + encodeURIComponent(item.id);
      return '<a class="connection-link" href="' + esc(url) + '" title="' + esc(titleOf(item)) + '">' +
        esc(titleOf(item)) + '</a>';
    }).join("");
    const extra = items.length > limit
      ? '<span class="connection-more">ほか' + (items.length - limit) + '件</span>'
      : "";
    return '<div class="connection-row ' + cssClass + '">' +
      '<span class="connection-label">' + arrow + esc(label) + '</span>' +
      '<div class="connection-items">' + shown + extra + '</div></div>';
  }

  function topicCard(topic) {
    const title = titleOf(topic);
    const description = descriptionOf(topic);
    const url = "./details.html?topic=" + encodeURIComponent(topic.id || "");
    const domain = groupOf(topic);
    const relations = [
      relationRow(topic, "before", "前に学ぶ", "connection-before", "← "),
      relationRow(topic, "related", "関係する", "connection-related", "↔ "),
      relationRow(topic, "future", "この先", "connection-future", "→ "),
      relationRow(topic, "application", "使う場面", "connection-application", "↗ "),
      relationRow(topic, "applied", "ここで使う学び", "connection-applied", "↙ ")
    ].join("");

    return '<article class="topic-card" data-subject="' + esc(topic.subject || "") + '">' +
      '<a class="topic-main" href="' + esc(url) + '">' +
        '<span class="topic-meta"><span class="topic-subject">' + esc(topic.subject || "教科") + '</span>' +
        '<span class="topic-grade">' + esc(gradeLabel(topic)) + '</span>' +
        '<span class="topic-domain">' + esc(domain) + '</span></span>' +
        '<strong class="topic-title">' + esc(title) + '</strong>' +
        (description ? '<span class="topic-description">' + esc(description) + '</span>' : '') +
        '<span class="topic-open">くわしく見る <span aria-hidden="true">→</span></span>' +
      '</a>' +
      (relations ? '<div class="topic-connections" aria-label="この学びのつながり">' + relations + '</div>' : '') +
    '</article>';
  }

  function groupTopicsByCluster(topics) {
    const groups = new Map();
    topics.forEach(topic => {
      const key = groupOf(topic);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(topic);
    });
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], "ja"));
  }

  function renderSubjectSection(subject, topics, open) {
    const count = topics.length;
    const mark = SUBJECT_MARKS[subject] || subject.slice(0, 1);
    const desc = SUBJECT_DESCRIPTIONS[subject] || "学習内容とつながり";
    const content = groupTopicsByCluster(topics).map(([cluster, items]) => {
      return '<section class="cluster-section">' +
        '<h3 class="cluster-heading"><span>' + esc(cluster) + '</span><span class="cluster-count">' + items.length + '項目</span></h3>' +
        '<div class="topic-list">' + items.map(topicCard).join("") + '</div>' +
      '</section>';
    }).join("");

    return '<details class="subject-sheet subject-' + esc(subjectClass(subject)) + '"' +
      (open ? ' open' : '') + '>' +
      '<summary class="subject-summary">' +
        '<span class="subject-mark" aria-hidden="true">' + esc(mark) + '</span>' +
        '<span class="subject-summary-text"><strong>' + esc(subject) + '</strong><small>' + esc(desc) + '</small></span>' +
        '<span class="subject-summary-count">' + count + '<small>項目</small></span>' +
        '<span class="subject-chevron" aria-hidden="true">›</span>' +
      '</summary>' +
      '<div class="subject-content">' + (content || '<p class="empty-note">この条件に合う学習項目はありません。</p>') + '</div>' +
    '</details>';
  }

  function subjectClass(subject) {
    return ({ "国語": "japanese", "算数": "math", "社会": "social", "理科": "science" })[subject] || "other";
  }

  function emptyState(title, description) {
    return '<div class="empty-state"><span class="empty-mark" aria-hidden="true">？</span>' +
      '<strong>' + esc(title) + '</strong><p>' + esc(description) + '</p>' +
      '<button type="button" id="reset-from-empty" class="secondary-button">条件をリセットする</button></div>';
  }

  function boardTopicCard(topic) {
    const title = titleOf(topic);
    const url = "./details.html?topic=" + encodeURIComponent(topic.id || "");
    const links = [];
    const before = connectionsFor(topic, "before");
    const future = connectionsFor(topic, "future");
    const related = connectionsFor(topic, "related");
    if (before.length) {
      const item = before[0];
      links.push('<a class="map-link map-before" href="./details.html?topic=' + encodeURIComponent(item.id) + '" title="前に学ぶ：' + esc(titleOf(item)) + '">← ' + esc(titleOf(item)) + '</a>');
    }
    if (future.length) {
      const item = future[0];
      links.push('<a class="map-link map-future" href="./details.html?topic=' + encodeURIComponent(item.id) + '" title="この先：' + esc(titleOf(item)) + '">' + esc(titleOf(item)) + ' →</a>');
    }
    if (!before.length && !future.length && related.length) {
      const item = related[0];
      links.push('<a class="map-link map-related" href="./details.html?topic=' + encodeURIComponent(item.id) + '" title="関係する：' + esc(titleOf(item)) + '">↔ ' + esc(titleOf(item)) + '</a>');
    }
    const relCount = before.length + future.length + related.length;
    return '<article class="map-topic subject-' + esc(subjectClass(topic.subject)) + '">' +
      '<a class="map-topic-title" href="' + esc(url) + '">' + esc(title) + '</a>' +
      (links.length ? '<div class="map-topic-links">' + links.join("") + '</div>' : '') +
      '<span class="map-topic-meta">' + esc(gradeLabel(topic)) + (relCount ? ' · <span aria-label="つながり ' + relCount + '件">↔ ' + relCount + '</span>' : '') + '</span>' +
    '</article>';
  }

  function renderGradeBoard(topics, filtered) {
    const grades = [1, 2, 3, 4, 5, 6];
    const boardTopics = new Map(grades.map(grade => [grade, topics.filter(topic => gradeValues(topic).includes(grade))]));
    const subjects = state.subject ? [state.subject] : SUBJECTS;
    const cells = grades.map(grade => {
      const gradeTopics = boardTopics.get(grade);
      const gradeSubjects = subjects.filter(subject => gradeTopics.some(topic => topic.subject === subject));
      const content = gradeSubjects.map(subject => {
        const items = gradeTopics.filter(topic => topic.subject === subject)
          .sort((a,b) => groupOf(a).localeCompare(groupOf(b),"ja") || titleOf(a).localeCompare(titleOf(b),"ja"));
        return '<section class="map-subject-lane subject-' + esc(subjectClass(subject)) + '">' +
          '<h3 class="map-subject-heading"><span>' + esc(SUBJECT_MARKS[subject] || subject.slice(0,1)) + '</span>' + esc(subject) + '<small>' + items.length + '</small></h3>' +
          '<div class="map-topic-stack">' + items.map(boardTopicCard).join("") + '</div>' +
        '</section>';
      }).join("");
      const selected = state.grade === String(grade);
      return '<section class="grade-column' + (selected ? ' is-selected' : '') + '" aria-label="' + grade + '年生">' +
        '<button type="button" class="grade-column-heading" data-grade-filter="' + grade + '" aria-pressed="' + selected + '">' +
          '<span class="grade-number">' + grade + '</span><span class="grade-word">年生</span><small>' + gradeTopics.length + '項目</small>' +
        '</button>' +
        (content || '<p class="map-empty">この学年の項目はありません</p>') +
      '</section>';
    }).join("");
    return '<div class="grade-board-wrap"><div class="grade-board" aria-label="1年生から6年生への学習の見通し">' + cells + '</div></div>';
  }

  function renderResults() {
    const results = $("#results");
    const count = $("#results-count");
    const title = $("#results-title");
    const description = $("#results-description");
    if (!results || !count || !title || !description) return;

    const filtered = getFilteredTopics();
    const isFiltered = Boolean(state.subject || state.grade || state.query.trim());
    const allTopics = state.topics;
    const subjectsWithItems = SUBJECTS.filter(subject => allTopics.some(topic => topic.subject === subject));
    const filterParts = [];
    if (state.subject) filterParts.push(state.subject);
    if (state.grade) filterParts.push(state.grade + "年");
    if (state.query.trim()) filterParts.push("「" + state.query.trim() + "」");

    const active = [];
    if (state.subject) active.push(["教科：" + state.subject, "subject"]);
    if (state.grade) active.push(["学年：" + state.grade + "年", "grade"]);
    if (state.query.trim()) active.push(["言葉：" + state.query.trim(), "query"]);
    $("#active-filters").innerHTML = active.map(([label, type]) =>
      '<button type="button" class="active-filter" data-remove-filter="' + type + '">' +
      esc(label) + '<span aria-hidden="true">×</span></button>').join("");
    $("#active-filters").hidden = active.length === 0;

    title.textContent = "学年ごとの学びのつながり";
    description.textContent = isFiltered
      ? filterParts.join("・") + "に合う項目を表示しています。学年の見出しから、ほかの学年へ移動できます。"
      : "左から右へ、1年生から6年生へ。カードを押すと、学びのつながりを詳しく見られます。";
    count.textContent = isFiltered ? filtered.length + "項目" : allTopics.length + "項目・" + subjectsWithItems.length + "教科";

    // The year control highlights a column rather than hiding the other years.
    // Subject and text search narrow the board; the full progression stays visible.
    const boardData = allTopics.filter(topic =>
      (!state.subject || topic.subject === state.subject) &&
      matchesQuery(topic, state.query)
    );
    if (!boardData.length) {
      results.innerHTML = emptyState("見つかりませんでした", "教科を変えるか、検索する言葉を少し変えてみてください。");
      results.setAttribute("aria-busy", "false");
      return;
    }
    count.textContent = boardData.length + "項目";
    if (state.grade && !state.query.trim()) {
      description.textContent = state.grade + "年生の列を強調しています。ほかの学年と見比べながら、学びのつながりをたどれます。";
    }
    results.innerHTML = renderGradeBoard(boardData, isFiltered);
    results.setAttribute("aria-busy", "false");
  }
  function setSubject(subject) {
    state.subject = subject;
    syncFilterUI();
    renderResults();
  }

  function setGrade(grade) {
    state.grade = grade;
    syncFilterUI();
    renderResults();
  }

  function resetFilters() {
    state.subject = "";
    state.grade = "";
    state.query = "";
    syncFilterUI();
    renderResults();
  }

  function removeFilter(type) {
    if (type === "subject") state.subject = "";
    if (type === "grade") state.grade = "";
    if (type === "query") state.query = "";
    syncFilterUI();
    renderResults();
  }

  function bindEvents() {
    $("#subject-filters").addEventListener("click", event => {
      const button = event.target.closest("[data-subject-filter]");
      if (button) setSubject(button.dataset.subjectFilter || "");
    });
    $("#grade-filters").addEventListener("click", event => {
      const button = event.target.closest("[data-grade-filter]");
      if (button) setGrade(button.dataset.gradeFilter || "");
    });
    $("#topic-search").addEventListener("input", event => {
      state.query = event.target.value || "";
      renderResults();
    });
    $("#clear-filters").addEventListener("click", resetFilters);
    $("#active-filters").addEventListener("click", event => {
      const button = event.target.closest("[data-remove-filter]");
      if (button) removeFilter(button.dataset.removeFilter);
    });
    $("#results").addEventListener("click", event => {
      const gradeButton = event.target.closest("[data-grade-filter]");
      if (gradeButton) {
        setGrade(gradeButton.dataset.gradeFilter || "");
        return;
      }
      if (event.target.closest("#reset-from-empty")) resetFilters();
    });
  }

  async function init() {
    try {
      const [topicsResponse, relationsResponse] = await Promise.all([
        fetch(TOPICS_URL),
        fetch(RELATIONS_URL).catch(() => null)
      ]);
      if (!topicsResponse.ok) throw new Error("topics.json could not be loaded.");

      const topicsData = await topicsResponse.json();
      let relationsData = { dependencies: [] };
      if (relationsResponse && relationsResponse.ok) {
        try { relationsData = await relationsResponse.json(); } catch (_) { relationsData = { dependencies: [] }; }
      }

      state.topics = (topicsData.topics || []).filter(isActiveTopic);
      state.dependencies = relationsData.dependencies || [];
      state.topicById = new Map(state.topics.map(topic => [topic.id, topic]));
      buildConnections();
      updateSubjectCounts();
      bindEvents();
      syncFilterUI();
      renderResults();
    } catch (error) {
      console.error("学習内容の読み込みに失敗しました。", error);
      $("#results-count").textContent = "読込失敗";
      $("#results-title").textContent = "学習内容を読み込めませんでした";
      $("#results-description").textContent = "ページを再読み込みしてみてください。";
      $("#results").innerHTML = '<div class="load-error"><strong>学習内容を表示できませんでした。</strong><p>通信状態を確認して、もう一度お試しください。</p><button type="button" id="retry-load" class="secondary-button">もう一度読み込む</button></div>';
      $("#results").setAttribute("aria-busy", "false");
      $("#results").addEventListener("click", () => window.location.reload(), { once: true });
    }
  }

  init();
})();