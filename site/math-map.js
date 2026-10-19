const esc = value => String(value ?? "").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
async function load(path){const response=await fetch(path);if(!response.ok)throw new Error(path+" の読み込みに失敗しました");return response.json();}
function topicUrl(id){return "./details.html?topic="+encodeURIComponent(id);}
function strandHtml(strand,index,topicMap){
 const items=(strand.topicIds||[]).map(id=>topicMap.get(id)).filter(Boolean);
 return '<article class="strand"><div class="strand-head"><span class="number">'+String(index+1).padStart(2,"0")+'</span><div><h2>'+esc(strand.title)+'</h2><p class="question">'+esc(strand.question)+'</p></div></div><p class="summary">'+esc(strand.summary)+'</p><div class="flow">'+esc(strand.flow)+'</div><details class="topics"><summary>関連する詳しい学びを見る（'+items.length+'項目）</summary><div class="topic-links">'+items.map(t=>'<a href="'+topicUrl(t.id)+'" title="'+esc(t.name)+'">'+esc(t.studentName||t.name)+'</a>').join("")+'</div></details></article>';
}
function connectionHtml(c){return '<article class="connection"><p class="flow">'+esc(c.from)+' → '+esc(c.to)+'</p><h3>'+esc(c.label)+'</h3><p>'+esc(c.description)+'</p></article>';}
async function init(){
 try{
  const [data,topicData]=await Promise.all([load("../data/math-learning-map.json"),load("../data/topics.json")]);
  const topicMap=new Map(topicData.topics.filter(t=>t.subject==="算数"&&t.topicLifecycle!=="superseded").map(t=>[t.id,t]));
  document.querySelector("#strands").innerHTML=data.strands.map((s,i)=>strandHtml(s,i,topicMap)).join("");
  document.querySelector("#connections").innerHTML=data.connections.map(connectionHtml).join("");
  document.querySelector("#page-status").textContent="学びのまとまりから詳しい項目を開けます。分類や学年は整理中の候補を含みます。";
 }catch(error){console.error(error);document.querySelector("#page-status").textContent="データを読み込めませんでした。通信状態を確認して、もう一度開いてください。";}
}
init();
