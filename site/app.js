const state = { topics: [], dependencies: [], standards: null, selected: null };
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const relationNames = {
  "prerequisite":"先に身につけたいこと",
  "recommended-prerequisite":"先に学ぶと分かりやすい",
  "related-learning":"関係のある学び",
  "extension":"さらに考えを広げる",
  "application":"学んだことを使う",
  "recurring-development":"くり返し使って深める"
};
function topicTitle(topic) { return topic.studentName || topic.name; }
function topicText(topic) { return topic.studentDescription || topic.description || ""; }
function domainLabel(domain) {
  const labels = {
    "我が国の言語文化に関する事項":"言葉・文字・本",
    "言葉の特徴や使い方に関する事項":"言葉の意味や使い方",
    "情報の扱い方に関する事項":"情報を集めて整理する",
    "話すこと・聞くこと":"話す・聞く",
    "読むこと":"読む",
    "書くこと":"書く",
    "A 数と計算":"数と計算",
    "B 図形":"図形",
    "C 測定（第1〜3学年を中心とする）":"長さ・かさ・時間などを測る",
    "C 変化と関係（第4〜6学年を中心とする）":"割合・速さ・変わり方",
    "D データの活用":"表・グラフ・データ",
    "横断的な数学的活動（プロジェクト独自の分類）":"図・式・考え方を使う",
    "調査・資料活用（横断）":"資料を使って調べる",
    "第3学年":"3年生で学ぶこと",
    "第4学年":"4年生で学ぶこと",
    "第5学年":"5年生で学ぶこと",
    "第6学年":"6年生で学ぶこと",
    "A 物質・エネルギー":"物の性質・電気や力",
    "B 生命・地球":"生き物・地球や宇宙",
    "問題解決の力・科学的な探究":"調べ方・考え方"
  };
  return labels[domain] || domain || "まとまり未分類";
}
const socialTopicGroups = {
  "地域のようす": ["municipality-change","local-area","municipality-work","community-predecessors","local-map"],
  "くらしを支えるしくみ": ["waste-management","water-supply","firefighting","police-safety","disaster-prevention"],
  "都道府県のようす": ["prefecture-culture","prefecture-land","prefecture-industry"],
  "日本の国土と自然": ["japan-location","japan-landforms-climate","natural-environment-life"],
  "産業と環境": ["environment-protection","transport-trade","industrial-production","information-industry","food-life","forestry","fisheries","agriculture"],
  "歴史のうつりかわり": ["edo-society","unification","war-and-recovery","ancient-japan","postwar-japan","medieval-japan","modernization"],
  "政治と世界": ["diet","international-relations","local-government","government-courts","constitution"],
  "資料を使って調べる": ["fieldwork-interview","evidence-explanation","decision-civic","compare-regions","maps-globes","statistics-graphs","timeline-sources"]
};
function topicGroup(topic) {
  if (topic.subject === "社会") {
    for (const [label, fragments] of Object.entries(socialTopicGroups)) {
      if (fragments.some(fragment => topic.id.endsWith("." + fragment))) return label;
    }
  }
  return domainLabel(topic.domain);
}
function studentRationale(text) {
  let value = String(text || "");
  const replacements = [
    ["数量の関係","数や量のつながり"],["数量","数や量"],["位取り","数字の位のしくみ"],
    ["加法","たし算"],["減法","ひき算"],["乗法","かけ算"],["除法","わり算"],
    ["等分除・包含除","同じ数ずつ分ける場面・何人分あるかを考える場面"],
    ["叙述","文章中の言葉や文"],["要旨","大事な内容"],["関係を捉える","関係を考える"],
    ["関係を捉え","関係を考え"],["捉える","考える"],["把握する","つかむ"],
    ["関連付ける","結び付ける"],["活用する","使う"],["理解してから","分かってから"]
  ];
  for (const [from, to] of replacements) value = value.split(from).join(to);
  return value;
}
function gradeLabel(topic) {
  const grades = (topic.grades || []).slice().sort((a,b)=>a-b);
  if (!grades.length) return "学年は確認中";
  const label = gradeListLabel(grades).replace(/年/g,"年生");
  return topic.gradePlacement?.status === "reviewed" ? label : "目安：" + label;
}
function topicGrade(topic) {
  return Number(topic.gradePlacement?.candidateFirstIntroductionGrade) || Math.min(...(topic.grades || [99]));
}
function fillSelect(selector, values, firstLabel) {
  const select = $(selector);
  select.replaceChildren();
  const first = document.createElement("option");
  first.value = "";
  first.textContent = firstLabel;
  select.append(first);
  [...new Set(values)].sort((a,b)=>a.localeCompare(b,"ja")).forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}
function currentFilters() {
  return { subject: $("#subject").value, grade: Number($("#grade").value)||0, domain: $("#domain").value, query: $("#query").value.trim().toLocaleLowerCase("ja") };
}
function filteredTopics() {
  const f = currentFilters();
  return state.topics.filter(topic => {
    const haystack = [topicTitle(topic),topicText(topic),topic.name,topic.description,topicGroup(topic),domainLabel(topic.domain),topic.domain,topic.subject].join(" ").toLocaleLowerCase("ja");
    return (!f.subject || topic.subject===f.subject) &&
      (!f.grade || (topic.grades||[]).includes(f.grade)) &&
      (!f.domain || topicGroup(topic)===f.domain) &&
      (!f.query || haystack.includes(f.query));
  }).sort((a,b)=>topicGrade(a)-topicGrade(b)||a.domain.localeCompare(b.domain,"ja")||a.name.localeCompare(b.name,"ja"));
}
function renderDomainOptions() {
  const subject = $("#subject").value;
  const relevant = state.topics.filter(t=>!subject||t.subject===subject).map(topicGroup);
  const previous = $("#domain").value;
  fillSelect("#domain", relevant, "すべてのまとまり");
  if ([...$("#domain").options].some(o=>o.value===previous)) $("#domain").value=previous;
}
function renderFilters() {
  fillSelect("#subject", state.topics.map(t=>t.subject), "すべての教科");
  $("#subject").value = "";
  renderDomainOptions();
}
function relationCandidates(topic, direction) {
  const key = direction==="previous" ? "to" : "from";
  const relatedKey = direction==="previous" ? "from" : "to";
  return state.dependencies
    .filter(edge=>edge[key]===topic.id)
    .map(edge=>({edge, topic:state.topics.find(t=>t.id===edge[relatedKey])}))
    .filter(item=>item.topic && item.topic.subject===topic.subject && item.topic.topicLifecycle!=="superseded")
    .sort((a,b)=>{
      const current=topicGrade(topic);
      const da=Math.abs(topicGrade(a.topic)-current), db=Math.abs(topicGrade(b.topic)-current);
      if(da!==db) return da-db;
      return (a.topic.domain||"").localeCompare(b.topic.domain||"","ja");
    });
}
function relationCards(items, empty, limit=3) {
  if (!items.length) return '<p class="empty-note">'+esc(empty)+'</p>';
  return '<div class="path-cards">'+items.slice(0,limit).map(item=>{
    const topic=item.topic, edge=item.edge;
    return '<button type="button" class="path-card" data-topic-id="'+esc(topic.id)+'">'+
      '<span class="path-grade">'+esc(gradeLabel(topic))+'</span>'+
      '<strong>'+esc(topicTitle(topic))+'</strong>'+
      '<span class="path-kind">'+esc(relationNames[edge.type]||"関連する学び")+'</span>'+
      '<span class="path-why">'+esc(edge.studentRationale || studentRationale(edge.rationale))+'</span></button>';
  }).join("")+'</div>'+
  (items.length>limit?'<p class="muted small-note">ほかにも'+(items.length-limit)+'件のつながりがあるよ。</p>':'');
}
function gradeListLabel(grades) {
  const sorted=[...new Set((grades||[]).filter(g=>Number.isInteger(g)&&g>=1&&g<=6))].sort((a,b)=>a-b);
  if(!sorted.length)return "";
  const ranges=[];
  let start=sorted[0],end=sorted[0];
  for(const grade of sorted.slice(1)){
    if(grade===end+1){end=grade;continue;}
    ranges.push([start,end]);start=end=grade;
  }
  ranges.push([start,end]);
  return ranges.map(([a,b])=>a===b?a+"年":a+"〜"+b+"年").join("・");
}
function renderGradeMap(subject) {
  const subjectTopics=state.topics.filter(topic=>topic.subject===subject && topic.topicLifecycle!=="superseded");
  const lanes=[1,2,3,4,5,6].map(grade=>{
    const topics=subjectTopics.filter(topic=>(Number(topic.gradePlacement?.candidateFirstIntroductionGrade)||Math.min(...(topic.grades||[99])))===grade)
      .sort((a,b)=>(a.domain||"").localeCompare(b.domain||"","ja")||a.name.localeCompare(b.name,"ja"));
    const groups=new Map();
    topics.forEach(topic=>{
      const domain=topicGroup(topic)||"まとまり未分類";
      if(!groups.has(domain))groups.set(domain,[]);
      groups.get(domain).push(topic);
    });
    return '<section class="grade-lane"><header class="grade-lane-head"><span>'+grade+'年</span><small>この学年から学ぶかも・'+topics.length+'こ</small></header>'+
      [...groups.entries()].map(([domain,items])=>'<div class="grade-lane-group"><h3>'+esc(domain)+'</h3>'+
        items.map(topic=>{
          const candidateGrade=Number(topic.gradePlacement?.candidateFirstIntroductionGrade)||Math.min(...(topic.grades||[99]));
          const continuingGrades=(topic.gradePlacement?.candidateContinuingGrades||[]).length?topic.gradePlacement.candidateContinuingGrades:(topic.grades||[]).filter(g=>g!==candidateGrade);
          const continuing=gradeListLabel(continuingGrades);
          return '<button type="button" class="grade-topic'+(state.selected===topic.id?' is-selected':'')+'" data-topic-id="'+esc(topic.id)+'" aria-pressed="'+(state.selected===topic.id)+'">'+
            '<strong>'+esc(topicTitle(topic))+'</strong>'+
            (continuing?'<span class="grade-topic-continuation">このあとも学ぶかも：'+esc(continuing)+'</span>':'')+
            '<span>つながりを見る →</span></button>';
        }).join("")+'</div>').join("")+
      (topics.length?'':'<p class="grade-lane-empty">この学年から学ぶ項目は、まだ登録されていないよ。</p>')+'</section>';
  }).join("");
  return '<div class="grade-map-intro"><strong>'+esc(subject)+'の学年マップ</strong><p>それぞれの学びを、学び始める学年の目安に1回ずつ置いています。あとでまた使う学びは、カードに表示しています。項目を選ぶと、前や次につながる学びが見られます。</p><small>学年は見直し中の目安です。必ずこの学年・順番で学ぶという意味ではありません。</small></div>'+
    '<div class="grade-map-scroll" role="region" aria-label="'+esc(subject)+'の1年生から6年生までの学びのマップ" tabindex="0">'+lanes+'</div>';
}
function renderList() {
  const topics=filteredTopics();
  const filters=currentFilters();
  $("#count").textContent=(!filters.subject&&!filters.grade&&!filters.domain&&!filters.query) ? [...new Set(state.topics.map(t=>t.subject))].length+"教科" : topics.length+"件";
  const list=$("#items");
  list.replaceChildren();
  if(filters.subject&&!filters.grade&&!filters.domain&&!filters.query && !(filters.subject==="国語" && state.topics.filter(topic=>topic.subject==="国語").every(topic=>topic.gradePlacement?.basis==="japanese-taxonomy-draft"))){
    list.innerHTML=renderGradeMap(filters.subject);
    list.querySelectorAll("[data-topic-id]").forEach(button=>button.addEventListener("click",()=>renderDetail(button.dataset.topicId)));
    return;
  }
  if(!filters.subject&&!filters.grade&&!filters.domain&&!filters.query){
    const subjects=[...new Set(state.topics.map(t=>t.subject))].sort((a,b)=>a.localeCompare(b,"ja"));
    list.innerHTML='<div class="subject-picks">'+subjects.map(subject=>'<button type="button" class="subject-pick" data-subject="'+esc(subject)+'"><span class="subject-pick-label">教科</span><strong>'+esc(subject)+'</strong><span>学びのつながりを見る →</span></button>').join("")+'</div><p class="empty-note">まず教科を選んでみてください。学年や学習内容のまとまりをしぼって、項目を選ぶと前後の学びをたどれます。</p>';
    list.querySelectorAll("[data-subject]").forEach(button=>button.addEventListener("click",()=>{
      $("#subject").value=button.dataset.subject;
      renderDomainOptions();
      renderList();
      syncDetailToFilters(false);
    }));
    return;
  }
  if(!topics.length){
    list.innerHTML='<p class="empty-note">見つからなかったよ。教科や学年を変えたり、別の言葉で探したりしてみよう。</p>';
    return;
  }
  const groups=new Map();
  topics.forEach(topic=>{
    const key=topicGroup(topic)||"まとまり未分類";
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(topic);
  });
  for(const [domain,items] of groups){
    const section=document.createElement("section");
    section.className="domain-group";
    section.innerHTML='<div class="domain-heading"><h2>'+esc(domain)+'</h2><span>'+items.length+'</span></div>'+
      '<div class="topic-grid">'+items.map(topic=>
        '<button type="button" class="topic-card'+(state.selected===topic.id?' is-selected':'')+'" data-topic-id="'+esc(topic.id)+'" aria-pressed="'+(state.selected===topic.id)+'">'+
        '<span class="topic-grade">'+esc(gradeLabel(topic))+'</span><strong>'+esc(topicTitle(topic))+'</strong>'+
        '<span class="topic-description">'+esc(topicText(topic))+'</span></button>'
      ).join("")+'</div>';
    list.append(section);
  }
  list.querySelectorAll("[data-topic-id]").forEach(button=>button.addEventListener("click",()=>renderDetail(button.dataset.topicId)));
}
function flowNodes(items, empty, direction) {
  if (!items.length) return '<p class="flow-empty">'+esc(empty)+'</p>';
  return '<div class="flow-nodes">'+items.slice(0,3).map(item=>{
    const topic=item.topic, edge=item.edge;
    return '<button type="button" class="flow-node" data-topic-id="'+esc(topic.id)+'">'+
      '<span class="flow-grade">'+esc(gradeLabel(topic))+'</span>'+
      '<strong>'+esc(topicTitle(topic))+'</strong>'+
      '<span class="flow-why"><b>どうつながる？</b> '+esc(edge.studentRationale || studentRationale(edge.rationale))+'</span></button>';
  }).join("")+'</div>'+
  (items.length>3?'<p class="muted small-note">ほかにも'+(items.length-3)+'件のつながりがあるよ。</p>':'');
}
function syncDetailToFilters(scroll = false) {
  const visible = filteredTopics();
  const current = visible.find(topic => topic.id === state.selected);
  const next = current || visible[0];
  if (next) {
    renderDetail(next.id, scroll);
  } else {
    state.selected = null;
    $("#detail").innerHTML = '<p class="muted">見つからなかったよ。教科や学年を変えたり、別の言葉で探したりしてみよう。</p>';
  }
}
function renderDetail(id, scroll = true) {
  const topic=state.topics.find(item=>item.id===id);
  if(!topic) return;
  state.selected=id;
  const previous=relationCandidates(topic,"previous");
  const next=relationCandidates(topic,"next");
  const sourceLinks=(topic.evidence||[]).map(evidence=>{
    const source=(state.standards?.sources||[]).find(s=>s.id===evidence.sourceId);
    const link=source?'<a href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.title)+'</a>':esc(evidence.sourceId);
    return '<li>'+link+'<span class="source-note">'+esc(evidence.note||"")+'</span></li>';
  }).join("");
  $("#detail").innerHTML=
    '<div class="detail-topline"><span class="subject-chip">'+esc(topic.subject)+'</span></div>'+
    '<p class="detail-grade">'+esc(gradeLabel(topic))+'　／　'+esc(topicGroup(topic))+'</p>'+
    '<h2>'+esc(topicTitle(topic))+'</h2><p class="detail-description">'+esc(topicText(topic))+'</p>'+
    '<section class="progression-map" aria-label="学びの道すじ">'+
      '<div class="progression-title"><span class="progression-mark">学びの道すじ</span><p>前や次のカードを選ぶと、学びの道すじをたどれるよ。</p></div>'+
      '<div class="progression-stage"><div class="stage-label"><span>01</span><strong>前に学んだこと</strong></div>'+flowNodes(previous,"前につながる学びは、まだ調べているところだよ。","previous")+'</div>'+
      '<div class="flow-arrow" aria-hidden="true">↓</div>'+
      '<div class="progression-stage is-current"><div class="stage-label"><span>02</span><strong>今見ている学び</strong></div>'+
        '<div class="flow-current"><span>'+esc(gradeLabel(topic))+'</span><strong>'+esc(topicTitle(topic))+'</strong><small>今、見ている学び</small></div></div>'+
      '<div class="flow-arrow" aria-hidden="true">↓</div>'+
      '<div class="progression-stage"><div class="stage-label"><span>03</span><strong>これから学ぶこと</strong></div>'+flowNodes(next,"次につながる学びは、これから調べていくよ。","next")+'</div>'+
    '</section>'+
    '<details class="source-details"><summary>先生・保護者向けの確認情報</summary><p class="muted">学びのつながりは確認中です。必ずこの順番で学ぶ、という意味ではありません。</p><ul>'+(sourceLinks||"<li>出典情報は未登録です。</li>")+'</ul></details>';
  $("#detail").querySelectorAll("[data-topic-id]").forEach(button=>button.addEventListener("click",()=>renderDetail(button.dataset.topicId)));
  renderList();
  if (scroll) $("#detail").scrollIntoView({behavior:"smooth",block:"nearest"});
}
async function init() {
  try {
    const [topics,dependencies,standards]=await Promise.all([
      loadJson("../data/topics.json"),loadJson("../data/dependencies.json"),loadJson("../data/curriculum-standards.json")
    ]);
    state.topics=(topics.topics||[]).filter(topic=>topic.topicLifecycle!=="superseded");
    state.dependencies=dependencies.dependencies||[];
    state.standards=standards;
    renderFilters();
    renderList();
    const first=filteredTopics()[0];
    if($("#subject").value && first) renderDetail(first.id);
    $("#subject").addEventListener("change",()=>{renderDomainOptions();renderList();syncDetailToFilters(false);});
    $("#grade").addEventListener("change",()=>{renderList();syncDetailToFilters(false);});
    $("#domain").addEventListener("change",()=>{renderList();syncDetailToFilters(false);});
    $("#query").addEventListener("input",()=>{renderList();syncDetailToFilters(false);});
  } catch(error) {
    $("#count").textContent="読み込みエラー";
    $("#items").textContent=error.message+" GitHub Pages またはローカル HTTP サーバーで開いてください。";
  }
}
async function loadJson(path) {
  const response=await fetch(path);
  if(!response.ok) throw new Error(path+" を読み込めませんでした");
  return response.json();
}
init();