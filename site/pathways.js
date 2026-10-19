const DATA_PATH = "../data/";
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const gradeText = topic => {
  const g = [...new Set(topic.grades || [])].sort((a,b)=>a-b);
  if (!g.length) return "";
  const ranges=[]; let start=g[0], end=g[0];
  for (const n of g.slice(1)) { if(n===end+1){end=n;continue;} ranges.push([start,end]);start=end=n; }
  ranges.push([start,end]);
  return ranges.map(([a,b])=>a===b? a+"年":a+"〜"+b+"年").join("・");
};
async function load(path) {
  const response=await fetch(path);
  if(!response.ok) throw new Error(path+" の読み込みに失敗しました");
  return response.json();
}
function topicHref(id) { return "./details.html?topic="+encodeURIComponent(id); }
function stageHtml(stage, topicMap) {
  const records=(stage.topicIds||[]).map(id=>topicMap.get(id)).filter(Boolean);
  const absent=(stage.topicIds||[]).filter(id=>!topicMap.has(id));
  return '<section class="stage"><p class="stage-title">'+esc(stage.label)+'</p><div class="stage-grade">'+esc(stage.grades)+'</div>'+
    (records.length ? '<details class="topic-details"><summary>詳しい学びを見る（'+records.length+'項目）</summary><div class="topic-links">'+records.map(topic=>'<a href="'+topicHref(topic.id)+'" title="'+esc(topic.name)+'">'+esc(topic.studentName||topic.name)+'</a>').join("")+'</div></details>' : '')+
    (absent.length ? '<p class="status">詳細項目を確認中</p>' : '')+'</section>';
}
function pathwayHtml(pathway,index,topicMap) {
  const stages=pathway.stages||[];
  return '<article class="pathway"><div class="path-head"><span class="path-number">'+String(index+1).padStart(2,"0")+'</span><div><h2>'+esc(pathway.title)+'</h2><p class="question">'+esc(pathway.question)+'</p></div></div>'+
    '<p class="summary">'+esc(pathway.summary)+'</p>'+
    stages.map((stage,i)=>(i?'<div class="stage-arrow" aria-hidden="true">↓</div>':'')+stageHtml(stage,topicMap)).join("")+'</article>';
}
function connectionHtml(item) {
 return '<article class="connection"><p class="connection-flow">'+esc(item.from)+' → '+esc(item.to)+'</p><h3>'+esc(item.label)+'</h3><p>'+esc(item.description)+'</p></article>';
}
function render(data, topicData) {
 const topicMap=new Map((topicData.topics||[]).filter(topic=>topic.topicLifecycle!=="superseded").map(topic=>[topic.id,topic]));
 document.title=data.title+"｜学びの道すじ";
 document.querySelector("#page-title").textContent=data.title;
 document.querySelector("#scope").textContent=data.scope;
 document.querySelector("#pathways").innerHTML=data.pathways.map((pathway,index)=>pathwayHtml(pathway,index,topicMap)).join("");
 document.querySelector("#connections").innerHTML=data.connections.map(connectionHtml).join("");
 document.querySelector("#gaps").innerHTML=data.gaps.map(gap=>'<article><span class="gap-label">'+esc(gap.status)+'</span><h3>'+esc(gap.title)+'</h3><p>'+esc(gap.note)+'</p></article>').join("");
 document.querySelector("#design-principles").innerHTML=data.designPrinciples.map(item=>'<li>'+esc(item)+'</li>').join("");
 document.querySelector("#page-status").textContent="詳しい学びは各まとまりの中から開けます。項目の学年は確認中の候補を含みます。";
}
async function init() {
 try {
  const [pathways,topics]=await Promise.all([load(DATA_PATH+"learning-pathways.json"),load(DATA_PATH+"topics.json")]);
  render(pathways,topics);
 } catch(error) {
  console.error(error);
  document.querySelector("#page-status").textContent="学びの道すじを読み込めませんでした。通信状態を確認して、もう一度開いてください。";
 }
}
init();
