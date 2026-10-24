(() => {
"use strict";
const $=s=>document.querySelector(s);
const view=$("#view"),pageTitle=$("#page-title"),pageDescription=$("#page-description"),breadcrumbs=$("#breadcrumbs"),gradeWrap=$("#grade-filter"),gradeSelect=$("#grade"),query=$("#query"),status=$("#status");
const params=new URLSearchParams(location.search);
let topics=[],subject=params.get("subject")||"",domain="",grade=params.get("grade")||"",searchMode=false;
const subjects=[
 {name:"国語",icon:"📖",desc:"読む・書く・話す・言葉"},
 {name:"算数",icon:"📐",desc:"数と計算・図形・変化と関係"},
 {name:"理科",icon:"🔬",desc:"生命・地球・物質・エネルギー"},
 {name:"社会",icon:"🌏",desc:"地域・歴史・政治・国際"}
];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const name=t=>t.studentName||t.name||"学習項目";
const desc=t=>t.studentDescription||t.description||"";
const activeTopics=()=>topics.filter(t=>t.topicLifecycle!=="superseded"&&t.status!=="superseded"&&(!grade||(t.grades||[]).map(String).includes(grade)));
function setHeader(){
 gradeWrap.hidden=!subject;
 const crumbs=[];
 crumbs.push('<button type="button" data-back="subjects" class="'+(!subject?"current":"")+'">教科</button>');
 if(subject)crumbs.push('<span aria-hidden="true">›</span><button type="button" data-back="domains" class="'+(subject&&!domain?"current":"")+'">'+esc(subject)+'</button>');
 if(domain)crumbs.push('<span aria-hidden="true">›</span><span class="current">'+esc(domain)+'</span>');
 breadcrumbs.innerHTML=crumbs.join("");
 breadcrumbs.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.back==="subjects"){subject="";domain="";grade="";gradeSelect.value="";}else domain="";render()}));
 if(!subject){pageTitle.textContent="どの教科を見てみる？";pageDescription.textContent="気になる教科を選んで、学びの地図をたどってみよう。"}
 else if(!domain){pageTitle.textContent=subject+"の学び";pageDescription.textContent="まずは大きな学習のまとまりから選ぼう。細かな項目は、次の画面で見られるよ。"}
 else{pageTitle.textContent=domain;pageDescription.textContent=subject+"の「"+domain+"」にある学習内容。気になる項目を開いてみよう。"}
}
function card(title,description,icon,attrs,cls=""){
 return '<button type="button" class="tile '+cls+'" '+attrs+'><span class="tile-icon" aria-hidden="true">'+icon+'</span><span class="tile-title">'+esc(title)+'</span><span class="tile-desc">'+esc(description)+'</span><span class="tile-arrow" aria-hidden="true">↗</span></button>';
}
function renderSubjects(){
 view.innerHTML='<div class="tile-grid subject-grid">'+subjects.map(s=>card(s.name,s.desc,s.icon,'data-subject="'+esc(s.name)+'"')).join("")+'</div>';
 view.querySelectorAll("[data-subject]").forEach(b=>b.addEventListener("click",()=>{subject=b.dataset.subject;domain="";grade="";gradeSelect.value="";render()}));
 status.textContent="教科をひとつ選んでね。";
}
function renderDomains(list){
 const counts=new Map();
 list.filter(t=>t.subject===subject).forEach(t=>{const d=t.domain||t.cluster||"その他の学習内容";counts.set(d,(counts.get(d)||0)+1)});
 const entries=[...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0],"ja"));
 if(!entries.length){view.innerHTML='<p class="empty">この条件に合う学習内容がありません。学年を変えてみてね。</p>';status.textContent="";return}
 view.innerHTML='<div class="tile-grid domain-grid">'+entries.map(([d,n],i)=>card(d,n+"個の学習内容","✦",'data-domain="'+esc(d)+'"',"domain-tile")).join("")+'</div>';
 view.querySelectorAll("[data-domain]").forEach(b=>b.addEventListener("click",()=>{domain=b.dataset.domain;render()}));
 status.textContent="大きなまとまりを選ぶと、その中の学習内容が見られるよ。";
}
function renderTopics(list){
 const found=list.filter(t=>t.subject===subject&&(t.domain||t.cluster||"その他の学習内容")===domain);
 if(!found.length){view.innerHTML='<p class="empty">この条件に合う学習内容がありません。学年を変えてみてね。</p>';status.textContent="";return}
 view.innerHTML='<div class="topic-stack">'+found.map(t=>'<a class="topic-card" href="./details.html?topic='+encodeURIComponent(t.id)+'"><div><div class="topic-meta">'+esc((t.grades||[]).map(g=>g+"年").join("・")||"学年の目安なし")+'</div><h3>'+esc(name(t))+'</h3><p>'+esc(desc(t))+'</p></div><span class="topic-arrow" aria-hidden="true">→</span></a>').join("")+'</div>';
 status.textContent=found.length+"件の学習内容";
}
function renderSearch(list){
 const q=query.value.trim().toLocaleLowerCase();
 const found=list.filter(t=>[name(t),t.name,t.description,t.studentDescription,t.domain,t.cluster,t.subject].filter(Boolean).join(" ").toLocaleLowerCase().includes(q));
 view.innerHTML=found.length?'<div class="topic-stack">'+found.slice(0,100).map(t=>'<a class="topic-card" href="./details.html?topic='+encodeURIComponent(t.id)+'"><div><div class="topic-meta">'+esc(t.subject||"教科")+' · '+esc((t.grades||[]).map(g=>g+"年").join("・"))+' · '+esc(t.domain||t.cluster||"")+'</div><h3>'+esc(name(t))+'</h3><p>'+esc(desc(t))+'</p></div><span class="topic-arrow" aria-hidden="true">→</span></a>').join("")+'</div>':'<p class="empty">見つかりませんでした。別の言葉で試してみてね。</p>';
 status.textContent=found.length+"件";
}
function render(){
 setHeader();
 const list=activeTopics();
 if(query.value.trim()){renderSearch(list);return}
 if(!subject){renderSubjects();return}
 if(!domain){renderDomains(list);return}
 renderTopics(list);
}
gradeSelect.addEventListener("change",()=>{grade=gradeSelect.value;render()});
query.addEventListener("input",()=>{render()});
$("#clear-search").addEventListener("click",()=>{query.value="";render();query.focus()});
fetch("../data/topics.json").then(r=>{if(!r.ok)throw Error("data");return r.json()}).then(d=>{topics=d.topics||[];if(!subjects.some(s=>s.name===subject))subject="";render()}).catch(()=>{view.innerHTML='<p class="empty">学習データを読み込めませんでした。時間をおいて再度お試しください。</p>';status.textContent=""});
})();