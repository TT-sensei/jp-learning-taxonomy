(() => {
"use strict";
const $=s=>document.querySelector(s);
const query=$("#query"),subject=$("#subject"),grade=$("#grade"),results=$("#results"),count=$("#count"),empty=$("#empty");
let topics=[];
const params=new URLSearchParams(window.location.search);
query.value=params.get("q")||"";
subject.value=params.get("subject")||"";
grade.value=params.get("grade")||"";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const name=t=>t.studentName||t.name||"学習項目";
const desc=t=>t.studentDescription||t.description||"";
function render(){
 const q=query.value.trim().toLocaleLowerCase();
 const found=topics.filter(t=>{
  if(t.topicLifecycle==="superseded"||t.status==="superseded")return false;
  if(subject.value&&t.subject!==subject.value)return false;
  if(grade.value&&!(t.grades||[]).map(String).includes(grade.value))return false;
  const hay=[name(t),t.name,t.description,t.studentDescription,t.domain,t.cluster,t.subject].filter(Boolean).join(" ").toLocaleLowerCase();
  return !q||hay.includes(q);
 }).sort((a,b)=>String(a.subject).localeCompare(String(b.subject),"ja")||name(a).localeCompare(name(b),"ja"));
 count.textContent=found.length+"件";
 results.innerHTML=found.slice(0,100).map(t=>'<article class="result-card"><div class="meta"><span class="tag">'+esc(t.subject)+'</span><span class="tag">'+esc((t.grades||[]).map(g=>g+"年").join("・")||"学年の目安なし")+'</span></div><h3>'+esc(name(t))+'</h3><p>'+esc(desc(t))+'</p><a href="./details.html?topic='+encodeURIComponent(t.id)+'">詳しい説明・関連する学びを見る →</a></article>').join("");
 empty.hidden=found.length!==0;
}
[query,subject,grade].forEach(el=>el.addEventListener("input",render));
$("#clear").addEventListener("click",()=>{query.value="";subject.value="";grade.value="";render();query.focus()});
document.querySelectorAll("[data-query]").forEach(b=>b.addEventListener("click",()=>{query.value=b.dataset.query;render();query.focus()}));
fetch("../data/topics.json").then(r=>{if(!r.ok)throw Error("data");return r.json()}).then(d=>{topics=d.topics||[];render()}).catch(()=>{count.textContent="読み込みに失敗しました";empty.hidden=false;empty.textContent="学習データを読み込めませんでした。時間をおいて再度お試しください。"});
})();