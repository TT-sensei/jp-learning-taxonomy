(() => {
"use strict";
const DATA={topics:"../../data/topics.json",relations:"../../data/dependencies.json",pathways:"../../data/learning-pathways.json",support:"../../data/learning-support.json"};
const state={grade:"all",subject:"all",query:"",topics:[],relations:[],pathways:[],supportCases:[],activeId:null,openPathwaySubjects:new Set()};
const $=id=>document.getElementById(id);
const activeTopics=()=>state.topics.filter(t=>t.topicLifecycle!=="superseded");
const gradesFor=t=>{const p=t.gradePlacement||{};return [...new Set([p.candidateFirstIntroductionGrade,...(p.candidateContinuingGrades||[]),...(t.grades||[])].filter(n=>Number.isInteger(n)&&n>=1&&n<=6))].sort((a,b)=>a-b)};
const gradeLabel=t=>{if(t.subject==="国語")return gradeBandLabel(t);if(Array.isArray(t.gradeBandProgression)&&t.gradeBandProgression.length)return [...new Set(t.gradeBandProgression.map(x=>x.label).filter(Boolean))].join("・");return gradeRangeLabel(t)};
const gradeRangeLabel=t=>{if(t.subject==="国語")return gradeBandLabel(t);if(Array.isArray(t.gradeBandProgression)&&t.gradeBandProgression.length)return [...new Set(t.gradeBandProgression.map(x=>x.label).filter(Boolean))].join("・");const gs=gradesFor(t);if(!gs.length)return"学年未整理";if(gs.length===1)return gs[0]+"年ごろ";return gs[0]+"〜"+gs[gs.length-1]+"年"};
function gradeBandLabel(t){
const gs=new Set((t.grades||[]).filter(g=>Number.isInteger(g)&&g>=1&&g<=6));
const bands=[{label:"低学年",grades:[1,2]},{label:"中学年",grades:[3,4]},{label:"高学年",grades:[5,6]}];
return bands.filter(b=>b.grades.some(g=>gs.has(g))).map(b=>b.label).join("・")||"学年帯未整理";
}
function compactGradeList(values){
const nums=[...new Set((values||[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=6))].sort((a,b)=>a-b);
if(!nums.length)return"";
const ranges=[];let start=nums[0],end=nums[0];
for(const n of nums.slice(1)){if(n===end+1){end=n;continue}ranges.push(start===end?String(start):start+"〜"+end);start=end=n}
ranges.push(start===end?String(start):start+"〜"+end);
return ranges.join("・")+"年";
}
function gradePlacementSummary(t){
if(t.subject==="国語")return "学年帯の目安 "+gradeBandLabel(t);
if(Array.isArray(t.gradeBandProgression)&&t.gradeBandProgression.length){
const labels=[...new Set(t.gradeBandProgression.map(x=>x.label).filter(Boolean))];
return "発展の目安 "+labels.join(" → ");
}
const p=t.gradePlacement||{},first=p.candidateFirstIntroductionGrade;
const continuingGrades=(p.candidateContinuingGrades||[]).length?p.candidateContinuingGrades:gradesFor(t).filter(g=>g!==first);
const continuing=compactGradeList(continuingGrades);
if(Number.isInteger(first))return "初出候補 "+first+"年"+(continuing?" ／ 継続候補 "+continuing:"");
return "学年の目安 "+gradeRangeLabel(t);
}
const relationLabel=type=>({"prerequisite":"学習の前提候補","recommended-prerequisite":"学ぶと役立つ","related-learning":"関連する学び","extension":"発展する学び","application":"活用する学び","recurring-development":"繰り返し育つ力"})[type]||"学習のつながり";
const statusLabel=status=>({"published":"公開確認済み","reviewed":"内容確認済み","needs-review":"確認中","draft":"下書き"})[status]||"状態未設定";
function make(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text??"");return n}
function topicMap(){return new Map(activeTopics().map(t=>[t.id,t]))}
function matches(t){if(state.subject!=="all"&&t.subject!==state.subject)return false;if(state.grade!=="all"&&!gradesFor(t).includes(Number(state.grade)))return false;if(state.query){const q=state.query.toLocaleLowerCase("ja");const hay=[t.subject,t.name,t.studentName,t.description,t.studentDescription,t.domain,t.cluster].join(" ").toLocaleLowerCase("ja");if(!hay.includes(q))return false}return true}
function setSelected(root,key,value){root.querySelectorAll("button").forEach(b=>{const yes=b.dataset[key]===value;b.classList.toggle("is-selected",yes);b.setAttribute("aria-pressed",String(yes))})}
function renderCounts(){const ts=activeTopics();document.querySelectorAll("#subject-filters .subject-card[data-subject]").forEach(button=>{const subject=button.dataset.subject;const target=$("count-"+subject);if(target)target.textContent=subject==="all"?ts.length:ts.filter(t=>t.subject===subject).length})}
function renderPathways(){
const root=$("pathways-list");
root.replaceChildren();
const map=topicMap();
const q=state.query.toLocaleLowerCase("ja");
const pathText=p=>[p.subject,p.title,p.question,p.summary,...(p.stages||[]).flatMap(s=>[s.label,s.description])].filter(Boolean).join(" ").toLocaleLowerCase("ja");
const stageTopics=(stage,p)=>{
const visible=(stage.topicIds||[]).map(id=>map.get(id)).filter(Boolean);
const gradeFiltered=visible.filter(t=>state.grade==="all"||gradesFor(t).includes(Number(state.grade)));
const textHit=q&&pathText(p).includes(q);
return gradeFiltered.filter(t=>!q||textHit||[t.name,t.studentName,t.description,t.studentDescription,t.domain,t.cluster].filter(Boolean).join(" ").toLocaleLowerCase("ja").includes(q));
};
const paths=state.pathways.filter(p=>{
if(state.subject!=="all"&&p.subject!==state.subject)return false;
return (p.stages||[]).some(stage=>stageTopics(stage,p).length>0);
});
if(!paths.length){
root.append(make("p","connection-empty",state.pathways.length?"条件に合う道すじがありません。学年や検索語を変えてみてください。":"学びの道すじデータは準備中です。"));
return;
}
const buildPathCard=p=>{
const card=make("article","pathway-card");
card.append(make("span","pathway-subject",p.subject||"教科未設定"),make("h3","",p.title),make("p","pathway-question",p.question||""),make("p","pathway-summary",p.summary||""));
const stages=make("div","pathway-stages");
(p.stages||[]).forEach(stage=>{
const matched=stageTopics(stage,p);
if(!matched.length)return;
const block=make("section","pathway-stage");
block.append(make("h4","",stage.label||"学びのまとまり"),make("small","",stage.grades||""));
if(stage.description)block.append(make("p","pathway-stage-description",stage.description));
const items=make("div","pathway-topics");
matched.forEach(t=>{
const b=make("button","pathway-topic",t.studentName||t.name);
b.type="button";
b.setAttribute("aria-label",(t.studentName||t.name)+"の学習内容を見る");
b.addEventListener("click",()=>openDetail(t.id));
items.append(b);
});
block.append(items);
stages.append(block);
});
card.append(stages);
return card;
};
if(state.subject==="all"){
const groups=new Map();
paths.forEach(p=>{const key=p.subject||"その他";if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p)});
[...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0],"ja")).forEach(([subject,items])=>{
const details=make("details","pathway-subject-group");
details.open=state.openPathwaySubjects.has(subject);
details.addEventListener("toggle",()=>{if(details.open)state.openPathwaySubjects.add(subject);else state.openPathwaySubjects.delete(subject)});
const summary=make("summary","pathway-subject-summary");
summary.append(make("strong","pathway-subject-title",subject),make("span","pathway-subject-count",items.length+"本の道すじ"));
details.append(summary);
const cards=make("div","pathway-grid pathway-subject-content");
items.forEach(p=>cards.append(buildPathCard(p)));
details.append(cards);
root.append(details);
});
}else{
paths.forEach(p=>root.append(buildPathCard(p)));
}
}
function renderList(){
const found=activeTopics().filter(matches);$("result-total").textContent=found.length+"項目";$("results-description").textContent=(state.subject==="all"?"収録中の教科から、学習内容を見比べられます。":state.subject+"の学習内容を、分野ごとに見渡せます。")+(state.grade==="all"?"":" "+state.grade+"年生で学ぶ・深める内容を表示しています。初めて学ぶ学年が下の内容も含まれます。");
const root=$("results");root.replaceChildren();$("empty-state").hidden=found.length>0;const groups=new Map();
found.forEach(t=>{const domain=t.domain||"分野未整理";const k=t.subject+"｜"+domain;if(!groups.has(k))groups.set(k,{subject:t.subject,domain,topics:[]});groups.get(k).topics.push(t)});
const domainOrder={"理科":["A 物質・エネルギー","B 生命・地球","問題解決の力・科学的な探究","横断的な見方・関連概念"],"社会":["第3学年","第4学年","第5学年","第6学年","調査・資料活用（横断）"]};
const domainRank=(subject,domain)=>{const i=(domainOrder[subject]||[]).indexOf(domain);return i<0?99:i};
[...groups.values()].sort((a,b)=>a.subject.localeCompare(b.subject,"ja")||domainRank(a.subject,a.domain)-domainRank(b.subject,b.domain)||a.domain.localeCompare(b.domain,"ja")).forEach(({subject,domain,topics})=>{const section=make("section","topic-group"),heading=make("h3","",subject+" ／ "+domain);heading.append(make("span","",topics.length+"項目"));section.append(heading);const list=make("div","topic-list");
topics.sort((a,b)=>(gradesFor(a)[0]||9)-(gradesFor(b)[0]||9)||(a.name||"").localeCompare(b.name||"","ja"));
topics.forEach(t=>{const b=make("button","topic-card");b.type="button";b.setAttribute("aria-label",(t.studentName||t.name)+"のつながりを見る");b.append(make("span","grade-tag",gradeRangeLabel(t)));const copy=make("span","topic-card-copy");copy.append(make("strong","",""+(t.studentName||t.name)),make("small","",t.studentDescription||t.description||""),make("small","grade-placement-mini",gradePlacementSummary(t)));b.append(copy,make("span","open-mark","›"));b.addEventListener("click",()=>openDetail(t.id));list.append(b)});section.append(list);root.append(section)});
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
const teacherNote=$("teacher-note"),teacherNoteText=$("teacher-note-text");
const fullDescription=t.description||"";
teacherNote.hidden=!fullDescription||fullDescription===(t.studentDescription||"");
teacherNoteText.textContent=fullDescription;
const hasBandProgression=Array.isArray(t.gradeBandProgression)&&t.gradeBandProgression.length>0;
const isJapaneseGradeBand=t.subject==="国語";
$("detail-grade-note").textContent=hasBandProgression?"学年ごとの一律配当ではなく、学年段階に応じた学びの深まりを示しています。題材や学校の計画によって扱いは異なります。":isJapaneseGradeBand?"国語は1・2年、3・4年、5・6年の学年帯で内容が示されています。この表示は学年帯の目安で、個別の学年や年間の配当を確定するものではありません。":"初出・継続学年は学びを見渡すための候補です。公式の一律配当や、必ずこの順番で学ぶことを示すものではありません。";
const progressionPanel=$("grade-progression"),progressionList=$("grade-progression-list");
progressionList.replaceChildren();
const progression=hasBandProgression?t.gradeBandProgression:[];
progressionPanel.hidden=progression.length===0;
progression.forEach(stage=>{
const card=make("article","grade-progression-step");
const yearLabel=String(stage.gradeBand||"").replace("-","〜")+"年";
card.append(make("span","grade-progression-label",stage.label||yearLabel),make("small","grade-progression-year",yearLabel),make("p","grade-progression-description",stage.description||""));
progressionList.append(card);
});
const goals=Array.isArray(t.learningGoals)?t.learningGoals:[];$("goal-panel").hidden=goals.length===0;$("goal-list").replaceChildren(...goals.map(g=>make("li","",g)));
const cases=state.supportCases.filter(c=>c.topicId===id);$("support-panel").hidden=cases.length===0;const supportList=$("support-list");supportList.replaceChildren();cases.forEach(c=>{const card=make("article","support-case");const head=make("button","support-case-head",c.studentPrompt||c.difficulty);head.type="button";head.setAttribute("aria-expanded","false");const body=make("div","support-case-body");body.hidden=true;head.addEventListener("click",()=>{body.hidden=!body.hidden;head.setAttribute("aria-expanded",String(!body.hidden))});body.append(make("p","support-lead","戻るとよい学び"));const tg=make("div","support-targets");(c.reviewTargets||[]).forEach(rt=>{const tt=map.get(rt.topicId);if(!tt)return;const b=make("button","connection-item");b.type="button";b.append(make("strong","",tt.studentName||tt.name),make("small","",gradeRangeLabel(tt)));if(rt.reason)b.append(make("span","cross-subject-reason",rt.reason));b.addEventListener("click",()=>openDetail(tt.id));tg.append(b)});body.append(tg);if(Array.isArray(c.supportSteps)&&c.supportSteps.length){body.append(make("p","support-lead","学び直しのじゅんばん"));const ol=make("ol","support-steps");c.supportSteps.forEach(s=>ol.append(make("li","",s)));body.append(ol)}card.append(head,body);supportList.append(card)});
fillConnections("before-list",incoming.map(r=>({...r,topicId:r.from})),map,"この学びより前に決まった学びは、まだありません。関連する学びも見てみよう。");fillConnections("after-list",outgoing.map(r=>({...r,topicId:r.to})),map,"この先は、関連する学びや道すじで広げてみよう。");fillConnections("related-list",related.map(r=>({...r,topicId:r.from===id?r.to:r.from})),map);
const crossPanel=$("cross-subject-panel"),crossList=$("cross-subject-list");crossList.replaceChildren();crossPanel.hidden=crossSubject.length===0;crossSubject.forEach(r=>{const topicId=r.from===id?r.to:r.from,other=map.get(topicId);if(!other)return;const b=make("button","connection-item cross-subject-item");b.type="button";b.append(make("strong","",other.studentName||other.name),make("small","",other.subject+" ・ "+relationLabel(r.type)));if(r.studentRationale||r.rationale)b.append(make("span","cross-subject-reason",r.studentRationale||r.rationale));b.addEventListener("click",()=>openDetail(other.id));crossList.append(b)});
$("detail-section").hidden=false;$("detail-section").scrollIntoView({behavior:"smooth",block:"start"});if(history.replaceState)history.replaceState(null,"","#topic="+encodeURIComponent(id));
}
function closeDetail(){state.activeId=null;$("detail-section").hidden=true;if(history.replaceState)history.replaceState(null,"",location.pathname+location.search)}
function bind(){
$("grade-filters").addEventListener("click",e=>{const b=e.target.closest("button[data-grade]");if(!b)return;state.grade=b.dataset.grade;setSelected($("grade-filters"),"grade",state.grade);renderPathways();renderList()});
$("subject-filters").addEventListener("click",e=>{const b=e.target.closest("button[data-subject]");if(!b)return;state.subject=b.dataset.subject;setSelected($("subject-filters"),"subject",state.subject);renderPathways();renderList()});
$("topic-search").addEventListener("input",e=>{state.query=e.target.value.trim();renderPathways();renderList()});
$("reset-button").addEventListener("click",()=>{state.grade="all";state.subject="all";state.query="";$("topic-search").value="";setSelected($("grade-filters"),"grade","all");setSelected($("subject-filters"),"subject","all");renderPathways();renderList()});
$("close-detail").addEventListener("click",closeDetail);
window.addEventListener("hashchange",()=>{const m=location.hash.match(/^#topic=(.+)$/);if(m)openDetail(decodeURIComponent(m[1]));else closeDetail()});
}
async function init(){
const warnings=[];
try{
const topicResponse=await fetch(DATA.topics);
if(!topicResponse.ok)throw new Error("学習項目データを読み込めませんでした。");
const topicData=await topicResponse.json();
if(!Array.isArray(topicData.topics)||topicData.topics.length===0)throw new Error("学習項目データが空か、形式が正しくありません。");
const loadOptional=async(url,label)=>{
try{const response=await fetch(url);if(!response.ok)throw new Error("HTTP "+response.status);return await response.json()}
catch(error){warnings.push(label+"を読み込めませんでした");console.warn(label+"の読み込みに失敗しました",error);return null}
};
const [relationData,pathwayData,supportData]=await Promise.all([
loadOptional(DATA.relations,"学習のつながり"),
loadOptional(DATA.pathways,"学びの道すじ"),
loadOptional(DATA.support,"学び直し")
]);
state.topics=topicData.topics;
state.relations=Array.isArray(relationData?.dependencies)?relationData.dependencies:[];
state.pathways=Array.isArray(pathwayData?.pathways)?pathwayData.pathways:[];
state.supportCases=Array.isArray(supportData?.supportCases)?supportData.supportCases:[];
renderCounts();
renderPathways();
renderList();
const status="学習項目 "+activeTopics().length+"件 ・ つながり "+state.relations.length+"件 ・ 道すじ "+state.pathways.length+"本";
$("dataset-status").textContent=status+(warnings.length?" ・ "+warnings.join("／"):"");
$("dataset-status").classList.toggle("is-warning",warnings.length>0);
bind();
const m=location.hash.match(/^#topic=(.+)$/);
if(m)openDetail(decodeURIComponent(m[1]));
}catch(err){
$("dataset-status").textContent="データを読み込めません";
$("dataset-status").classList.add("is-warning");
$("results").replaceChildren(make("p","loading",err.message+" ページを再読み込みしてください。"));
$("pathways-list").replaceChildren(make("p","loading","学びの道すじを表示できません。"));
console.error(err);
}
}
init();
})();