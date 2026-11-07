(() => {
"use strict";
const DATA={topics:"../../data/topics.json",relations:"../../data/dependencies.json",pathways:"../../data/learning-pathways.json"};
const state={grade:"all",subject:"all",query:"",topics:[],relations:[],pathways:[],activeId:null};
const $=id=>document.getElementById(id);
const activeTopics=()=>state.topics.filter(t=>t.topicLifecycle!=="superseded");
const gradesFor=t=>{const p=t.gradePlacement||{};return [...new Set([p.candidateFirstIntroductionGrade,...(p.candidateContinuingGrades||[]),...(t.grades||[])].filter(n=>Number.isInteger(n)&&n>=1&&n<=6))].sort((a,b)=>a-b)};
const gradeLabel=t=>{const p=t.gradePlacement||{};if(p.candidateFirstIntroductionGrade)return p.candidateFirstIntroductionGrade+"年ごろ";const gs=gradesFor(t);return gs.length?gs.join("・")+"年":"学年未整理"};
const gradeRangeLabel=t=>{const gs=gradesFor(t);if(!gs.length)return"学年未整理";if(gs.length===1)return gs[0]+"年ごろ";return gs[0]+"〜"+gs[gs.length-1]+"年"};
const relationLabel=type=>({"prerequisite":"学習の前提候補","recommended-prerequisite":"学ぶと役立つ","related-learning":"関連する学び","extension":"発展する学び","application":"活用する学び","recurring-development":"繰り返し育つ力"})[type]||"学習のつながり";
const statusLabel=status=>({"published":"公開確認済み","reviewed":"内容確認済み","needs-review":"確認中","draft":"下書き"})[status]||"状態未設定";
function make(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text??"");return n}
function topicMap(){return new Map(activeTopics().map(t=>[t.id,t]))}
function matches(t){if(state.subject!=="all"&&t.subject!==state.subject)return false;if(state.grade!=="all"&&!gradesFor(t).includes(Number(state.grade)))return false;if(state.query){const q=state.query.toLocaleLowerCase("ja");const hay=[t.name,t.studentName,t.description,t.studentDescription,t.domain,t.cluster].join(" ").toLocaleLowerCase("ja");if(!hay.includes(q))return false}return true}
function setSelected(root,key,value){root.querySelectorAll("button").forEach(b=>{const yes=b.dataset[key]===value;b.classList.toggle("is-selected",yes);b.setAttribute("aria-pressed",String(yes))})}
function renderCounts(){const ts=activeTopics();document.querySelectorAll("#subject-filters .subject-card[data-subject]").forEach(button=>{const subject=button.dataset.subject;const target=$("count-"+subject);if(target)target.textContent=subject==="all"?ts.length:ts.filter(t=>t.subject===subject).length})}
function renderPathways(){
const section=$("pathways-section"),root=$("pathways-list");
const visible=true;
section.hidden=!visible;
if(!visible)return;
root.replaceChildren();
const map=topicMap();
const paths=state.pathways.filter(p=>state.subject!=="all"&&p.subject===state.subject&&p.stages?.some(stage=>stage.topicIds?.some(id=>map.has(id))));
if(state.subject==="all"){root.append(make("p","connection-empty","教科を選ぶと、その教科の大きな道すじを見渡せます。"));return}if(!paths.length){root.append(make("p","connection-empty","この教科の道すじデータは準備中です。"));return}
paths.forEach(p=>{
const card=make("article","pathway-card");
card.append(make("span","pathway-subject",p.subject||"教科未設定"),make("h3","",p.title),make("p","pathway-question",p.question||""),make("p","pathway-summary",p.summary||""));
const stages=make("div","pathway-stages");
p.stages.forEach(stage=>{
const nums=(stage.grades||"").match(/\d+/g)?.map(Number)||[];
if(state.grade!=="all"&&nums.length){const g=Number(state.grade);const lo=Math.min(...nums),hi=Math.max(...nums);if(g<lo||g>hi)return;}
const matched=(stage.topicIds||[]).map(id=>map.get(id)).filter(t=>t&& (state.grade==="all"||gradesFor(t).includes(Number(state.grade))));
if(!matched.length)return;
const block=make("section","pathway-stage");
block.append(make("h4","",stage.label),make("small","",stage.grades||""));
if(stage.description)block.append(make("p","pathway-stage-description",stage.description));
const items=make("div","pathway-topics");
matched.forEach(t=>{const b=make("button","pathway-topic",t.studentName||t.name);b.type="button";b.addEventListener("click",()=>openDetail(t.id));items.append(b)});
block.append(items);stages.append(block);
});
card.append(stages);root.append(card);
});
}
function renderList(){
const found=activeTopics().filter(matches);$("result-total").textContent=found.length+"項目";$("results-description").textContent=(state.subject==="all"?"収録中の教科から、学習内容を見比べられます。":state.subject+"の学習内容を、分野ごとに見渡せます。")+(state.grade==="all"?"":" "+state.grade+"年生で学ぶ・深める内容を表示しています。初めて学ぶ学年が下の内容も含まれます。");
const root=$("results");root.replaceChildren();$("empty-state").hidden=found.length>0;const groups=new Map();
found.forEach(t=>{const domain=t.domain||"分野未整理";const k=t.subject+"｜"+domain;if(!groups.has(k))groups.set(k,{subject:t.subject,domain,topics:[]});groups.get(k).topics.push(t)});
[...groups.values()].sort((a,b)=>a.subject.localeCompare(b.subject,"ja")||a.domain.localeCompare(b.domain,"ja")).forEach(({subject,domain,topics})=>{const section=make("section","topic-group"),heading=make("h3","",subject+" ／ "+domain);heading.append(make("span","",topics.length+"項目"));section.append(heading);const list=make("div","topic-list");
topics.sort((a,b)=>(gradesFor(a)[0]||9)-(gradesFor(b)[0]||9)||(a.name||"").localeCompare(b.name||"","ja"));
topics.forEach(t=>{const b=make("button","topic-card");b.type="button";b.setAttribute("aria-label",(t.studentName||t.name)+"のつながりを見る");b.append(make("span","grade-tag",gradeRangeLabel(t)));const copy=make("span","");copy.append(make("strong","",t.studentName||t.name),make("small","",t.studentDescription||t.description||""));b.append(copy,make("span","open-mark","›"));b.addEventListener("click",()=>openDetail(t.id));list.append(b)});section.append(list);root.append(section)});
}
function connectionItem(t,r){const b=make("button","connection-item");b.type="button";b.append(make("strong","",t.studentName||t.name),make("small","",relationLabel(r.type)));b.addEventListener("click",()=>openDetail(t.id));return b}
function fillConnections(id,relations,map,emptyText){const root=$(id);root.replaceChildren();if(!relations.length){root.append(make("p","connection-empty",emptyText||"現在、表示できるつながりはありません。"));return}relations.forEach(r=>{const t=map.get(r.topicId);if(t)root.append(connectionItem(t,r))})}
function openDetail(id){
const map=topicMap(),t=map.get(id);if(!t)return;state.activeId=id;
const incoming=state.relations.filter(r=>r.to===id&&["prerequisite","recommended-prerequisite"].includes(r.type));
const outgoing=state.relations.filter(r=>r.from===id&&["prerequisite","recommended-prerequisite","extension","application"].includes(r.type));
const related=state.relations.filter(r=>(r.from===id||r.to===id)&&["related-learning","recurring-development"].includes(r.type)&&map.get(r.from===id?r.to:r.from)?.subject===t.subject);
const crossSubject=state.relations.filter(r=>(r.from===id||r.to===id)&&map.get(r.from===id?r.to:r.from)&&map.get(r.from===id?r.to:r.from).subject!==t.subject);
$("detail-meta").textContent=[t.subject,gradeLabel(t),t.domain].filter(Boolean).join(" ・ ");$("detail-title").textContent=t.studentName||t.name;$("detail-description").textContent=t.studentDescription||t.description||"説明は準備中です。";
const goals=Array.isArray(t.learningGoals)?t.learningGoals:[];$("goal-panel").hidden=goals.length===0;$("goal-list").replaceChildren(...goals.map(g=>make("li","",g)));
fillConnections("before-list",incoming.map(r=>({...r,topicId:r.from})),map,"この学びより前に決まった学びは、まだありません。関連する学びも見てみよう。");fillConnections("after-list",outgoing.map(r=>({...r,topicId:r.to})),map,"この先は、関連する学びや道すじで広げてみよう。");fillConnections("related-list",related.map(r=>({...r,topicId:r.from===id?r.to:r.from})),map);
const crossPanel=$("cross-subject-panel"),crossList=$("cross-subject-list");crossList.replaceChildren();crossPanel.hidden=crossSubject.length===0;crossSubject.forEach(r=>{const topicId=r.from===id?r.to:r.from,other=map.get(topicId);if(!other)return;const b=make("button","connection-item cross-subject-item");b.type="button";b.append(make("strong","",other.studentName||other.name),make("small","",other.subject+" ・ "+relationLabel(r.type)));if(r.studentRationale||r.rationale)b.append(make("span","cross-subject-reason",r.studentRationale||r.rationale));b.addEventListener("click",()=>openDetail(other.id));crossList.append(b)});
$("current-card").replaceChildren(make("strong","",t.studentName||t.name),make("p","",t.description||""));$("detail-section").hidden=false;$("detail-section").scrollIntoView({behavior:"smooth",block:"start"});if(history.replaceState)history.replaceState(null,"","#topic="+encodeURIComponent(id));
}
function closeDetail(){state.activeId=null;$("detail-section").hidden=true;if(history.replaceState)history.replaceState(null,"",location.pathname+location.search)}
function bind(){
$("grade-filters").addEventListener("click",e=>{const b=e.target.closest("button[data-grade]");if(!b)return;state.grade=b.dataset.grade;setSelected($("grade-filters"),"grade",state.grade);renderPathways();renderList()});
$("subject-filters").addEventListener("click",e=>{const b=e.target.closest("button[data-subject]");if(!b)return;state.subject=b.dataset.subject;setSelected($("subject-filters"),"subject",state.subject);renderPathways();renderList()});
$("topic-search").addEventListener("input",e=>{state.query=e.target.value.trim();renderList()});
$("reset-button").addEventListener("click",()=>{state.grade="all";state.subject="all";state.query="";$("topic-search").value="";setSelected($("grade-filters"),"grade","all");setSelected($("subject-filters"),"subject","all");renderPathways();renderList()});
$("close-detail").addEventListener("click",closeDetail);
window.addEventListener("hashchange",()=>{const m=location.hash.match(/^#topic=(.+)$/);if(m)openDetail(decodeURIComponent(m[1]));else closeDetail()});
}
async function init(){try{const [a,b,c]=await Promise.all([fetch(DATA.topics),fetch(DATA.relations),fetch(DATA.pathways)]);if(!a.ok||!b.ok||!c.ok)throw new Error("学習データを読み込めませんでした。");const [td,rd,pd]=await Promise.all([a.json(),b.json(),c.json()]);state.topics=Array.isArray(td.topics)?td.topics:[];state.relations=Array.isArray(rd.dependencies)?rd.dependencies:[];state.pathways=Array.isArray(pd.pathways)?pd.pathways:[];renderCounts();renderPathways();renderList();$("dataset-status").textContent="学習項目 "+activeTopics().length+"件 ・ つながり "+state.relations.length+"件 ・ 道すじ "+state.pathways.length+"件";bind();const m=location.hash.match(/^#topic=(.+)$/);if(m)openDetail(decodeURIComponent(m[1]))}catch(err){$("dataset-status").textContent="データを読み込めません";$("results").replaceChildren(make("p","loading",err.message+" ページを再読み込みしてください。"));console.error(err)}}
init();
})();