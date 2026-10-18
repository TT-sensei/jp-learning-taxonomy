const state = { topics: [], dependencies: [], standards: null, selected: null };
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const relationNames = {
  "prerequisite":"土台になる学び",
  "recommended-prerequisite":"先に学ぶと役立つ",
  "related-learning":"つながる学び",
  "extension":"発展する学び",
  "application":"活用する学び",
  "recurring-development":"くり返し育つ力"
};
const statusNames = {"draft":"草案","needs-review":"確認中","reviewed":"確認済み","published":"公開"};
function gradeLabel(topic) {
  const grades = (topic.grades || []).slice().sort((a,b)=>a-b);
  if (!grades.length) return "学年確認中";
  return grades.map(g=>g+"年").join("・");
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
    const haystack = [topic.name,topic.description,topic.domain,topic.subject].join(" ").toLocaleLowerCase("ja");
    return (!f.subject || topic.subject===f.subject) &&
      (!f.grade || (topic.grades||[]).includes(f.grade)) &&
      (!f.domain || topic.domain===f.domain) &&
      (!f.query || haystack.includes(f.query));
  }).sort((a,b)=>topicGrade(a)-topicGrade(b)||a.domain.localeCompare(b.domain,"ja")||a.name.localeCompare(b.name,"ja"));
}
function renderDomainOptions() {
  const subject = $("#subject").value;
  const relevant = state.topics.filter(t=>!subject||t.subject===subject).map(t=>t.domain);
  const previous = $("#domain").value;
  fillSelect("#domain", relevant, "すべての領域");
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
      '<strong>'+esc(topic.name)+'</strong>'+
      '<span class="path-kind">'+esc(relationNames[edge.type]||"関連する学び")+'</span>'+
      '<span class="path-why">'+esc(edge.rationale||"")+'</span></button>';
  }).join("")+'</div>'+
  (items.length>limit?'<p class="muted small-note">ほかに'+(items.length-limit)+'件の関係があります。必要なものだけを表示しています。</p>':'');
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
      const domain=topic.domain||"領域未分類";
      if(!groups.has(domain))groups.set(domain,[]);
      groups.get(domain).push(topic);
    });
    return '<section class="grade-lane"><header class="grade-lane-head"><span>'+grade+'年</span><small>初出候補 '+topics.length+'件</small></header>'+
      [...groups.entries()].map(([domain,items])=>'<div class="grade-lane-group"><h3>'+esc(domain)+'</h3>'+
        items.map(topic=>{
          const continuing=gradeListLabel(topic.gradePlacement?.candidateContinuingGrades||[]);
          return '<button type="button" class="grade-topic'+(state.selected===topic.id?' is-selected':'')+'" data-topic-id="'+esc(topic.id)+'" aria-pressed="'+(state.selected===topic.id)+'">'+
            '<strong>'+esc(topic.name)+'</strong>'+
            (continuing?'<span class="grade-topic-continuation">継続候補：'+esc(continuing)+'</span>':'')+
            '<span>つながりを見る →</span></button>';
        }).join("")+'</div>').join("")+
      (topics.length?'':'<p class="grade-lane-empty">初出候補はありません</p>')+'</section>';
  }).join("");
  return '<div class="grade-map-intro"><strong>'+esc(subject)+'の学年マップ</strong><p>項目は「初めて扱う学年の候補」に1回だけ配置しています。継続して学ぶ候補は各項目内に表示し、項目の重複で学年ごとの数が膨らまないようにしました。項目を選ぶと、前後のつながりが右側に表示されます。</p><small>初出学年・継続学年とも確認中の候補です。公式の学年配当や、実際の授業順を確定したものではありません。</small></div>'+
    '<div class="grade-map-scroll" role="region" aria-label="'+esc(subject)+'の1年生から6年生の初出学年候補マップ" tabindex="0">'+lanes+'</div>';
}
function renderList() {
  const topics=filteredTopics();
  const filters=currentFilters();
  $("#count").textContent=(!filters.subject&&!filters.grade&&!filters.domain&&!filters.query) ? "4教科" : topics.length+"件";
  const list=$("#items");
  list.replaceChildren();
  if(filters.subject&&!filters.grade&&!filters.domain&&!filters.query){
    list.innerHTML=renderGradeMap(filters.subject);
    list.querySelectorAll("[data-topic-id]").forEach(button=>button.addEventListener("click",()=>renderDetail(button.dataset.topicId)));
    return;
  }
  if(!filters.subject&&!filters.grade&&!filters.domain&&!filters.query){
    const subjects=[...new Set(state.topics.map(t=>t.subject))].sort((a,b)=>a.localeCompare(b,"ja"));
    list.innerHTML='<div class="subject-picks">'+subjects.map(subject=>'<button type="button" class="subject-pick" data-subject="'+esc(subject)+'"><span class="subject-pick-label">教科</span><strong>'+esc(subject)+'</strong><span>学びのつながりを見る →</span></button>').join("")+'</div><p class="empty-note">まず教科を選んでみてください。学年や学習のまとまりを絞り込んで、項目を選ぶと前後の学びをたどれます。</p>';
    list.querySelectorAll("[data-subject]").forEach(button=>button.addEventListener("click",()=>{
      $("#subject").value=button.dataset.subject;
      renderDomainOptions();
      renderList();
      const first=filteredTopics()[0];
      if(first)renderDetail(first.id);
    }));
    return;
  }
  if(!topics.length){
    list.innerHTML='<p class="empty-note">項目が見つかりません。教科・学年・領域を変えてみてください。</p>';
    return;
  }
  const groups=new Map();
  topics.forEach(topic=>{
    const key=topic.domain||"領域未分類";
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(topic);
  });
  for(const [domain,items] of groups){
    const section=document.createElement("section");
    section.className="domain-group";
    section.innerHTML='<div class="domain-heading"><h2>'+esc(domain)+'</h2><span>'+items.length+'</span></div>'+
      '<div class="topic-grid">'+items.map(topic=>
        '<button type="button" class="topic-card'+(state.selected===topic.id?' is-selected':'')+'" data-topic-id="'+esc(topic.id)+'" aria-pressed="'+(state.selected===topic.id)+'">'+
        '<span class="topic-grade">'+esc(gradeLabel(topic))+'</span><strong>'+esc(topic.name)+'</strong>'+
        '<span class="topic-description">'+esc(topic.description||"")+'</span></button>'
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
      '<strong>'+esc(topic.name)+'</strong>'+
      '<span class="flow-why">'+esc(edge.rationale||"")+'</span></button>';
  }).join("")+'</div>'+
  (items.length>3?'<p class="muted small-note">ほかに'+(items.length-3)+'件のつながりがあります。</p>':'');
}
function renderDetail(id) {
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
    '<div class="detail-topline"><span class="subject-chip">'+esc(topic.subject)+'</span><span class="review-chip">'+esc(statusNames[topic.reviewStatus]||"確認中")+'</span></div>'+
    '<p class="detail-grade">'+esc(gradeLabel(topic))+'　／　'+esc(topic.domain)+'</p>'+
    '<h2>'+esc(topic.name)+'</h2><p class="detail-description">'+esc(topic.description||"")+'</p>'+
    '<section class="progression-map" aria-label="学びの道すじ">'+
      '<div class="progression-title"><span class="progression-mark">学びの道すじ</span><p>つながりを選ぶと、その学びを中心に道すじをたどれます。</p></div>'+
      '<div class="progression-stage"><div class="stage-label"><span>01</span><strong>これまで</strong></div>'+flowNodes(previous,"前につながる学びは、まだ整理中です。","previous")+'</div>'+
      '<div class="flow-arrow" aria-hidden="true">↓</div>'+
      '<div class="progression-stage is-current"><div class="stage-label"><span>02</span><strong>いま</strong></div>'+
        '<div class="flow-current"><span>'+esc(gradeLabel(topic))+'</span><strong>'+esc(topic.name)+'</strong><small>選択中の学び</small></div></div>'+
      '<div class="flow-arrow" aria-hidden="true">↓</div>'+
      '<div class="progression-stage"><div class="stage-label"><span>03</span><strong>この先</strong></div>'+flowNodes(next,"次につながる学びは、これから整理します。","next")+'</div>'+
    '</section>'+
    '<details class="source-details"><summary>出典・確認状況</summary><p class="muted">学習項目とつながりは確認中の候補です。公式の必修順序を示すものではありません。</p><ul>'+(sourceLinks||"<li>出典情報は未登録です。</li>")+'</ul><p class="muted small-note">項目ID：'+esc(topic.id)+'</p></details>';
  $("#detail").querySelectorAll("[data-topic-id]").forEach(button=>button.addEventListener("click",()=>renderDetail(button.dataset.topicId)));
  renderList();
  $("#detail").scrollIntoView({behavior:"smooth",block:"nearest"});
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
    $("#subject").addEventListener("change",()=>{renderDomainOptions();renderList();const first=filteredTopics()[0];if(first)renderDetail(first.id);});
    $("#grade").addEventListener("change",()=>{renderList();const first=filteredTopics()[0];if(first)renderDetail(first.id);});
    $("#domain").addEventListener("change",()=>{renderList();const first=filteredTopics()[0];if(first)renderDetail(first.id);});
    $("#query").addEventListener("input",()=>{renderList();});
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