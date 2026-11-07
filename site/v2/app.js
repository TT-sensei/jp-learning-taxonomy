(() => {
"use strict";
const DATA={topics:"../../data/topics.json",relations:"../../data/dependencies.json"};
const state={grade:"all",subject:"all",query:"",topics:[],relations:[],activeId:null};
const $=id=>document.getElementById(id);
const activeTopics=()=>state.topics.filter(t=>t.topicLifecycle!=="superseded");
const gradesFor=t=>{const p=t.gradePlacement||{};return [...new Set([p.candidateFirstIntroductionGrade,...(p.candidateContinuingGrades||[]),...(t.grades||[])].filter(n=>Number.isInteger(n)&&n>=1&&n<=6))].sort((a,b)=>a-b)};
const gradeLabel=t=>{const p=t.gradePlacement||{};if(p.candidateFirstIntroductionGrade)return p.candidateFirstIntroductionGrade+"年ごろ";const gs=gradesFor(t);return gs.length?gs.join("・")+"年":"学年未整理"};
const relationLabel=type=>({"prerequisite":"学習の前提候補","recommended-prerequisite":"学ぶと役立つ","related-learning":"関連する学び","extension":"発展する学び","application":"活用する学び","recurring-development":"繰り返し育つ力"})[type]||"学習のつながり";
const statusLabel=status=>({"published":"公開確認済み","reviewed":"内容確認済み","needs-review":"確認中","draft":"下書き"})[status]||"状態未設定";
function make(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text??"");return n}
function topicMap(){return new Map(activeTopics().map(t=>[t.id,t]))}
function matches(t){if(state.subject!=="all"&&t.subject!==state.subject)return false;if(state.grade!=="all"&&!gradesFor(t).includes(Number(state.grade)))return false;if(state.query){const q=state.query.toLocaleLowerCase("ja");const hay=[t.name,t.studentName,t.description,t.studentDescription,t.domain,t.cluster].join(" ").toLocaleLowerCase("ja");if(!hay.includes(q))return false}return true}
function setSelected(root,key,value){root.querySelectorAll("button").forEach(b=>{const yes=b.dataset[key]===value;b.classList.toggle("is-selected",yes);b.setAttribute("aria-pressed",String(yes))})}
function renderCounts(){const ts=activeTopics();$("count-all").textContent=ts.length;["国語","算数","社会","理科"].forEach(s=>{$("count-"+s).textContent=ts.filter(t=>t.subject===s).length})}
function renderList(){
const found=activeTopics().filter(matches);$("result-total").textContent=found.length+"項目";$("results-description").textContent=state.subject==="all"?"収録中の教科から、学習内容を見比べられます。":state.subject+"の学習内容を、分野ごとに見渡せます。";
const root=$("results");root.replaceChildren();$("empty-state").hidden=found.length>0;const groups=new Map();
found.forEach(t=>{const k=t.domain||"分野未整理";if(!groups.has(k))groups.set(k,[]);groups.get(k).push(t)});
[...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0],"ja")).forEach(([domain,topics])=>{const section=make("section","topic-group"),heading=make("h3","",domain);heading.append(make("span","",topics.length+"項目"));section.append(heading);const list=make("div","topic-list");
topics.sort((a,b)=>(gradesFor(a)[0]||9)-(gradesFor(b)[0]||9)||(a.name||"").localeCompare(b.name||"","ja"));
topics.forEach(t=>{const b=make("button","topic-card");b.type="button";b.setAttribute("aria-label",(t.studentName||t.name)+"のつながりを見る");b.append(make("span","grade-tag",gradeLabel(t)));const copy=make("span","");copy.append(make("strong","",t.studentName||t.name),make("small","",t.studentDescription||t.description||""));b.append(copy,make("span","open-mark","›"));b.addEventListener("click",()=>openDetail(t.id));list.append(b)});section.append(list);root.append(section)});
}
function connectionItem(t,r){const b=make("button","connection-item");b.type="button";b.append(make("strong","",t.studentName||t.name),make("small","",relationLabel(r.type)+" ・ "+statusLabel(r.reviewStatus)));b.addEventListener("click",()=>openDetail(t.id));return b}
function fillConnections(id,relations,map){const root=$(id);root.replaceChildren();if(!relations.length){root.append(make("p","connection-empty","現在、表示できるつながりはありません。"));return}relations.forEach(r=>{const t=map.get(r.topicId);if(t)root.append(connectionItem(t,r))})}
function openDetail(id){
const map=topicMap(),t=map.get(id);if(!t)return;state.activeId=id;
const incoming=state.relations.filter(r=>r.to===id&&["prerequisite","recommended-prerequisite"].includes(r.type));
const outgoing=state.relations.filter(r=>r.from===id&&["extension","application"].includes(r.type));
const related=state.relations.filter(r=>(r.from===id||r.to===id)&&["related-learning","recurring-development"].includes(r.type));
$("detail-meta").textContent=[t.subject,gradeLabel(t),t.domain,statusLabel(t.reviewStatus)].filter(Boolean).join(" ・ ");$("detail-title").textContent=t.studentName||t.name;$("detail-description").textContent=t.studentDescription||t.description||"説明は準備中です。";
const goals=Array.isArray(t.learningGoals)?t.learningGoals:[];$("goal-panel").hidden=goals.length===0;$("goal-list").replaceChildren(...goals.map(g=>make("li","",g)));
fillConnections("before-list",incoming.map(r=>({...r,topicId:r.from})),map);fillConnections("after-list",outgoing.map(r=>({...r,topicId:r.to})),map);fillConnections("related-list",related.map(r=>({...r,topicId:r.from===id?r.to:r.from})),map);
$("current-card").replaceChildren(make("strong","",t.studentName||t.name),make("p","",t.description||""));$("detail-section").hidden=false;$("detail-section").scrollIntoView({behavior:"smooth",block:"start"});if(history.replaceState)history.replaceState(null,"","#topic="+encodeURIComponent(id));
}
function closeDetail(){state.activeId=null;$("detail-section").hidden=true;if(history.replaceState)history.replaceState(null,"",location.pathname+location.search)}
function bind(){
$("grade-filters").addEventListener("click",e=>{const b=e.target.closest("button[data-grade]");if(!b)return;state.grade=b.dataset.grade;setSelected($("grade-filters"),"grade",state.grade);renderList()});
$("subject-filters").addEventListener("click",e=>{const b=e.target.closest("button[data-subject]");if(!b)return;state.subject=b.dataset.subject;setSelected($("subject-filters"),"subject",state.subject);renderList()});
$("topic-search").addEventListener("input",e=>{state.query=e.target.value.trim();renderList()});
$("reset-button").addEventListener("click",()=>{state.grade="all";state.subject="all";state.query="";$("topic-search").value="";setSelected($("grade-filters"),"grade","all");setSelected($("subject-filters"),"subject","all");renderList()});
$("close-detail").addEventListener("click",closeDetail);
window.addEventListener("hashchange",()=>{const m=location.hash.match(/^#topic=(.+)$/);if(m)openDetail(decodeURIComponent(m[1]));else closeDetail()});
}
async function init(){try{const [a,b]=await Promise.all([fetch(DATA.topics),fetch(DATA.relations)]);if(!a.ok||!b.ok)throw new Error("学習データを読み込めませんでした。");const [td,rd]=await Promise.all([a.json(),b.json()]);state.topics=Array.isArray(td.topics)?td.topics:[];state.relations=Array.isArray(rd.dependencies)?rd.dependencies:[];renderCounts();renderList();$("dataset-status").textContent="学習項目 "+activeTopics().length+"件 ・ つながり "+state.relations.length+"件";bind();const m=location.hash.match(/^#topic=(.+)$/);if(m)openDetail(decodeURIComponent(m[1]))}catch(err){$("dataset-status").textContent="データを読み込めません";$("results").replaceChildren(make("p","loading",err.message+" ページを再読み込みしてください。"));console.error(err)}}
init();
})();