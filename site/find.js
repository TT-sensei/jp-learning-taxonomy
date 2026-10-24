(() => {
"use strict";
const $=s=>document.querySelector(s);
const query=$("#query"),results=$("#results"),count=$("#count"),empty=$("#empty"),title=$("#list-title");
const subjectButtons=[...document.querySelectorAll("[data-subject]")],gradeButtons=[...document.querySelectorAll("[data-grade]")];
let topics=[],selectedSubject="",selectedGrade="";
const params=new URLSearchParams(window.location.search);
selectedSubject=params.get("subject")||"";
selectedGrade=params.get("grade")||"";
query.value=params.get("q")||"";
const esc=s=>String(s??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[c]));
const name=t=>t.studentName||t.name||"学習項目";
const desc=t=>t.studentDescription||t.description||"";
function syncChoices(){
 subjectButtons.forEach(b=>{const on=b.dataset.subject===selectedSubject;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
 gradeButtons.forEach(b=>{const on=b.dataset.grade===selectedGrade;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on))});
 title.textContent=(selectedSubject||"すべての教科")+(selectedGrade?"・"+selectedGrade+"年生":"");
}
function render(){
 syncChoices();
 const q=query.value.trim().toLocaleLowerCase();
 const found=topics.filter(t=>{
  if(t.topicLifecycle==="superseded"||t.status==="superseded")return false;
  if(selectedSubject&&t.subject!==selectedSubject)return false;
  if(selectedGrade&&!(t.grades||[]).map(String).includes(selectedGrade))return false;
  const hay=[name(t),t.name,t.description,t.studentDescription,t.domain,t.cluster,t.subject].filter(Boolean).join(" ").toLocaleLowerCase();
  return !q||hay.includes(q);
 }).sort((a,b)=>String(a.domain||a.cluster||"その他").localeCompare(String(b.domain||b.cluster||"その他"),"ja")||String(a.cluster||"").localeCompare(String(b.cluster||""),"ja")||name(a).localeCompare(name(b),"ja"));
 count.textContent=found.length+"項目";
 const groups=new Map();
 found.slice(0,250).forEach(t=>{const group=t.domain||t.cluster||"その他の学習内容";if(!groups.has(group))groups.set(group,[]);groups.get(group).push(t)});
 results.innerHTML=[...groups.entries()].map(([group,items])=>'<section class="domain-group"><h3 class="domain-title">'+esc(group)+' <span>('+items.length+')</span></h3><ul class="topic-list">'+items.map(t=>'<li class="topic-row"><div class="topic-main"><div class="topic-meta"><span class="tag">'+esc(t.subject||"教科未設定")+'</span><span class="tag">'+esc((t.grades||[]).map(g=>g+"年").join("・")||"学年の目安なし")+'</span></div><h3>'+esc(name(t))+'</h3><p>'+esc(desc(t))+'</p></div><a href="./details.html?topic='+encodeURIComponent(t.id)+'">詳しく見る →</a></li>').join("")+'</ul></section>').join("");
 empty.hidden=found.length!==0;
 if(found.length>250)count.textContent="250件以上（条件をしぼってください）";
}
subjectButtons.forEach(b=>b.addEventListener("click",()=>{selectedSubject=b.dataset.subject;render()}));
gradeButtons.forEach(b=>b.addEventListener("click",()=>{selectedGrade=b.dataset.grade;render()}));
query.addEventListener("input",render);
$("#clear").addEventListener("click",()=>{selectedSubject="";selectedGrade="";query.value="";render();query.focus()});
fetch("../data/topics.json").then(r=>{if(!r.ok)throw Error("data");return r.json()}).then(d=>{topics=d.topics||[];render()}).catch(()=>{count.textContent="読み込みに失敗しました";empty.hidden=false;empty.textContent="学習データを読み込めませんでした。時間をおいて再度お試しください。"});
})();