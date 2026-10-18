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
function renderList() {
  const topics=filteredTopics();
  const filters=currentFilters();
  $("#count").textContent=(!filters.subject&&!filters.grade&&!filters.domain&&!filters.query) ? "4教科" : topics.length+"件";
  const list=$("#items");
  list.replaceChildren();
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
    '<section class="learning-path"><div class="path-heading"><span class="path-number">01</span><div><h3>ここにつながるまで</h3><p>土台になる学び</p></div></div>'+
    relationCards(previous,"今のデータでは、つながりをまだ整理できていません。")+'</section>'+
    '<div class="current-learning"><span>いま見ている学び</span><strong>'+esc(topic.name)+'</strong><small>'+esc(gradeLabel(topic))+'</small></div>'+
    '<section class="learning-path"><div class="path-heading"><span class="path-number">02</span><div><h3>この先につながる学び</h3><p>次の学習で生きる見方</p></div></div>'+
    relationCards(next,"次につながる項目は、これから整理します。")+'</section>'+
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