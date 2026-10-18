const state = { topics: [], dependencies: [], standards: null, selected: null };
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const relationNames = {
  "prerequisite":"先に身につけたいこと",
  "recommended-prerequisite":"先に学ぶと分かりやすい",
  "related-learning":"関係のある学び",
  "extension":"さらに考えを広げる",
  "application":"学んだことを使う",
  "recurring-development":"くり返し使って深める"
};

const furigana = {
  "図画工作":"ずがこうさく","総合的な学習の時間":"そうごうてきながくしゅうのじかん","外国語活動":"がいこくごかつどう",
  "問題解決":"もんだいかいけつ","学習内容":"がくしゅうないよう","学習項目":"がくしゅうこうもく","学習指導要領":"がくしゅうしどうようりょう",
  "都道府県":"とどうふけん","原稿用紙":"げんこうようし","音読":"おんどく","朗読":"ろうどく","索引":"さくいん","神話":"しんわ","古典":"こてん",
  "観察":"かんさつ","実験":"じっけん","物質":"ぶっしつ","情報":"じょうほう","資料":"しりょう","地域":"ちいき","国土":"こくど","産業":"さんぎょう",
  "政治":"せいじ","国際":"こくさい","歴史":"れきし","生命":"せいめい","地球":"ちきゅう","関係":"かんけい","文章":"ぶんしょう","表現":"ひょうげん",
  "読書":"どくしょ","仮名":"かな","漢字":"かんじ","目次":"もくじ","確認":"かくにん","出典":"しゅってん","目安":"めやす","項目":"こうもく",
  "学習":"がくしゅう","教科":"きょうか","学年":"がくねん","算数":"さんすう","国語":"こくご","社会":"しゃかい","理科":"りか","生活":"せいかつ",
  "音楽":"おんがく","家庭":"かてい","体育":"たいいく","外国語":"がいこくご","道徳":"どうとく","特別活動":"とくべつかつどう",
  "図書館":"としょかん","昔話":"むかしばなし","文章中":"ぶんしょうちゅう","割合":"わりあい","速さ":"はやさ","図形":"ずけい","測定":"そくてい",
  "前提":"ぜんてい","発展":"はってん","関連":"かんれん","内容":"ないよう","分類":"ぶんるい","領域":"りょういき","継続":"けいぞく",
  "都道府県の":"とどうふけんの","都道府県":"とどうふけん","問題":"もんだい","解説":"かいせつ","順番":"じゅんばん","出典情報":"しゅってんじょうほう",
  "見方":"みかた","考え方":"かんがえかた","考える":"かんがえる","考え":"かんがえ","伝える":"つたえる","話し合い":"はなしあい","話す":"はなす","聞く":"きく","書く":"かく","読む":"よむ","調べる":"しらべる","比べる":"くらべる","説明":"せつめい","理由":"りゆう","目的":"もくてき","工夫":"くふう","特徴":"とくちょう","違い":"ちがい","共通":"きょうつう","大切":"たいせつ","自分":"じぶん","相手":"あいて","友達":"ともだち","言葉":"ことば","意味":"いみ","使い方":"つかいかた","使う":"つかう","身につける":"みにつける","身近":"みぢか","気づく":"きづく","見つける":"みつける","見通し":"みとおし","広げる":"ひろげる","深める":"ふかめる","振り返る":"ふりかえる","知識":"ちしき","理解":"りかい","活用":"かつよう","比較":"ひかく","分析":"ぶんせき","整理":"せいり","判断":"はんだん","表し方":"あらわしかた","計算":"けいさん","小数":"しょうすう","分数":"ぶんすう","整数":"せいすう","数直線":"すうちょくせん","単位":"たんい","面積":"めんせき","体積":"たいせき","角度":"かくど","統計":"とうけい","平均":"へいきん","規則性":"きそくせい","数量":"すうりょう","単元":"たんげん","授業":"じゅぎょう","課題":"かだい","予想":"よそう","仮説":"かせつ","結果":"けっか","結論":"けつろん","方法":"ほうほう","手順":"てじゅん","記録":"きろく","植物":"しょくぶつ","動物":"どうぶつ","成長":"せいちょう","季節":"きせつ","天気":"てんき","気温":"きおん","空気":"くうき","磁石":"じしゃく","温度":"おんど","状態":"じょうたい","性質":"せいしつ","人々":"ひとびと","文化":"ぶんか","伝統":"でんとう","農業":"のうぎょう","工業":"こうぎょう","漁業":"ぎょぎょう","交通":"こうつう","防災":"ぼうさい","安全":"あんぜん","憲法":"けんぽう","選挙":"せんきょ","時代":"じだい","人物":"じんぶつ","出来事":"できごと","平和":"へいわ","環境":"かんきょう","資源":"しげん","国際社会":"こくさいしゃかい","世界遺産":"せかいいさん","地図":"ちず","方位":"ほうい","地形":"ちけい","気候":"きこう","人口":"じんこう","自然":"しぜん","災害":"さいがい","材料":"ざいりょう","作品":"さくひん","鑑賞":"かんしょう","音色":"ねいろ","旋律":"せんりつ","演奏":"えんそう","運動":"うんどう","健康":"けんこう","協力":"きょうりょく","約束":"やくそく","役割":"やくわり","責任":"せきにん","思いやり":"おもいやり","家庭生活":"かていせいかつ","食事":"しょくじ","調理":"ちょうり","衣服":"いふく","消費":"しょうひ","英語":"えいご","発音":"はつおん","会話":"かいわ","質問":"しつもん","紹介":"しょうかい","気持ち":"きもち","物語":"ものがたり","登場人物":"とうじょうじんぶつ","場面":"ばめん","情景":"じょうけい","心情":"しんじょう","筆者":"ひっしゃ","主張":"しゅちょう","要点":"ようてん","要旨":"ようし","段落":"だんらく","構成":"こうせい","引用":"いんよう","根拠":"こんきょ","意見":"いけん","感想":"かんそう","事実":"じじつ","想像":"そうぞう","比喩":"ひゆ","擬音語":"ぎおんご","擬態語":"ぎたいご","敬語":"けいご","主語":"しゅご","述語":"じゅつご","修飾語":"しゅうしょくご","文法":"ぶんぽう","熟語":"じゅくご","送り仮名":"おくりがな","同音異義語":"どうおんいぎご","慣用句":"かんようく","四字熟語":"よじじゅくご","辞典":"じてん","辞書":"じしょ","見出し":"みだし","検索":"けんさく","文末":"ぶんまつ","句読点":"くとうてん","改行":"かいぎょう","表記":"ひょうき","書式":"しょしき","読み手":"よみて","書き手":"かきて","発表":"はっぴょう","発言":"はつげん","賛成":"さんせい","反対":"はんたい","意図":"いと","要約":"ようやく","情報源":"じょうほうげん","信頼性":"しんらいせい","著作権":"ちょさくけん","個人情報":"こじんじょうほう","尊重":"そんちょう","多様性":"たようせい","公平":"こうへい","公正":"こうせい","協働":"きょうどう","対話":"たいわ","探究":"たんきゅう","教科横断":"きょうかおうだん","低学年":"ていがくねん","中学年":"ちゅうがくねん","高学年":"こうがくねん","発展的":"はってんてき","具体的":"ぐたいてき","継続的":"けいぞくてき","年表":"ねんぴょう","写真":"しゃしん","映像":"えいぞう","動画":"どうが","新聞":"しんぶん","図書":"としょ","自由研究":"じゆうけんきゅう","探究活動":"たんきゅうかつどう","問題意識":"もんだいいしき","解決方法":"かいけつほうほう","解決策":"かいけつさく","判断材料":"はんだんざいりょう","根拠資料":"こんきょしりょう","学年別":"がくねんべつ","学年ごと":"がくねんごと","内容別":"ないようべつ","領域別":"りょういきべつ","関連項目":"かんれんこうもく","前提関係":"ぜんていかんけい","学習順序":"がくしゅうじゅんじょ","未確認":"みかくにん","未完了":"みかんりょう","妥当性":"だとうせい","網羅性":"もうらせい","参照先":"さんしょうさき","対応関係":"たいおうかんけい","学習マップ":"がくしゅうまっぷ","学習過程":"がくしゅうかてい","学習活動":"がくしゅうかつどう","学習目標":"がくしゅうもくひょう","自己評価":"じこひょうか","分類表":"ぶんるいひょう","関連図":"かんれんず","関係図":"かんけいず","学習環境":"がくしゅうかんきょう","学習支援":"がくしゅうしえん","適切":"てきせつ","効果的":"こうかてき","言語文化":"げんごぶんか","言語活動":"げんごかつどう","文学":"ぶんがく","説明文":"せつめいぶん","詩歌":"しいか","短歌":"たんか","俳句":"はいく","古文":"こぶん","漢文":"かんぶん","音声":"おんせい","発声":"はっせい","読解":"どっかい","語彙":"ごい","語句":"ごく","文節":"ぶんせつ","単語":"たんご","品詞":"ひんし","語感":"ごかん","類義語":"るいぎご","対義語":"たいぎご","接続語":"せつぞくご","指示語":"しじご","主題":"しゅだい","中心人物":"ちゅうしんじんぶつ","人物像":"じんぶつぞう","描写":"びょうしゃ","展開":"てんかい","語り手":"かたりて","作者":"さくしゃ","著者":"ちょしゃ","論理的":"ろんりてき","説得力":"せっとくりょく","具体例":"ぐたいれい","文脈":"ぶんみゃく","接続詞":"せつぞくし","仮名遣い":"かなづかい","筆記具":"ひっきぐ","姿勢":"しせい","点画":"てんかく","字体":"じたい","字形":"じけい","筆順":"ひつじゅん","配当":"はいとう","手紙":"てがみ","報告文":"ほうこくぶん","意見文":"いけんぶん","読書生活":"どくしょせいかつ","情報活用":"じょうほうかつよう","情報モラル":"じょうほうもらる","著作物":"ちょさくぶつ","信ぴょう性":"しんぴょうせい","発信者":"はっしんしゃ","受け手":"うけて","目的に応じて":"もくてきにおうじて","表現方法":"ひょうげんほうほう","表現効果":"ひょうげんこうか","学年配当":"がくねんはいとう","学習者":"がくしゅうしゃ","学び方":"まなびかた","学習方法":"がくしゅうほうほう","学び合う":"まなびあう","学び合い":"まなびあい","学習者":"がくしゅうしゃ","学年マップ":"がくねんまっぷ","学習項目":"がくしゅうこうもく","学習内容":"がくしゅうないよう","読み方":"よみかた","選択中":"せんたくちゅう","現在":"げんざい","今見ている":"いまみている","見ている":"みている","見たい":"みたい","気になる":"きになる","知りたい":"しりたい","難しい":"むずかしい","選んで":"えらんで","前に":"まえに","先に":"さきに","この先":"このさき","関係する学び":"かんけいするまなび","先に学ぶ":"さきにまなぶ","使って広げる":"つかってひろげる","読みやすい":"よみやすい","見やすい":"みやすい","分かりやすい":"わかりやすい","わかりやすい":"わかりやすい"
};

function rubyHTML(value) {
  const source = String(value ?? "");
  const words = Object.keys(furigana).sort((a,b)=>b.length-a.length);
  const pattern = new RegExp(words.join("|"), "g");
  let result = "", last = 0, match;
  while ((match = pattern.exec(source)) !== null) {
    result += esc(source.slice(last, match.index));
    result += '<ruby>' + esc(match[0]) + '<rt>' + esc(furigana[match[0]]) + '</rt></ruby>';
    last = match.index + match[0].length;
  }
  return result + esc(source.slice(last));
}
function subjectClass(subject) {
  return ({ "国語":"japanese","社会":"social","算数":"math","理科":"science","生活":"life","音楽":"music","図画工作":"art","家庭":"home","体育":"pe","外国語":"foreign","外国語活動":"foreign","道徳":"moral","総合的な学習の時間":"general","特別活動":"general" })[subject] || "general";
}

function topicTitle(topic) { return topic.studentName || topic.name; }
function topicText(topic) { return topic.studentDescription || topic.description || ""; }
function domainLabel(domain) {
  const labels = {
    "我が国の言語文化に関する事項":"言葉・文字・本",
    "言葉の特徴や使い方に関する事項":"言葉の意味や使い方",
    "情報の扱い方に関する事項":"情報を集めて整理する",
    "話すこと・聞くこと":"話す・聞く",
    "読むこと":"読む",
    "書くこと":"書く",
    "A 数と計算":"数と計算",
    "B 図形":"図形",
    "C 測定（第1〜3学年を中心とする）":"長さ・かさ・時間などを測る",
    "C 変化と関係（第4〜6学年を中心とする）":"割合・速さ・変わり方",
    "D データの活用":"表・グラフ・データ",
    "横断的な数学的活動（プロジェクト独自の分類）":"図・式・考え方を使う",
    "調査・資料活用（横断）":"資料を使って調べる",
    "第3学年":"3年生で学ぶこと",
    "第4学年":"4年生で学ぶこと",
    "第5学年":"5年生で学ぶこと",
    "第6学年":"6年生で学ぶこと",
    "A 物質・エネルギー":"物の性質・電気や力",
    "B 生命・地球":"生き物・地球や宇宙",
    "問題解決の力・科学的な探究":"調べ方・考え方"
  };
  return labels[domain] || domain || "まとまり未分類";
}
const socialTopicGroups = {
  "地域のようす": ["municipality-change","local-area","municipality-work","community-predecessors","local-map"],
  "くらしを支えるしくみ": ["waste-management","water-supply","firefighting","police-safety","disaster-prevention"],
  "都道府県のようす": ["prefecture-culture","prefecture-land","prefecture-industry"],
  "日本の国土と自然": ["japan-location","japan-landforms-climate","natural-environment-life"],
  "産業と環境": ["environment-protection","transport-trade","industrial-production","information-industry","food-life","forestry","fisheries","agriculture"],
  "歴史のうつりかわり": ["edo-society","unification","war-and-recovery","ancient-japan","postwar-japan","medieval-japan","modernization"],
  "政治と世界": ["diet","international-relations","local-government","government-courts","constitution"],
  "資料を使って調べる": ["fieldwork-interview","evidence-explanation","decision-civic","compare-regions","maps-globes","statistics-graphs","timeline-sources"]
};
function topicGroup(topic) {
  if (topic.subject === "社会") {
    for (const [label, fragments] of Object.entries(socialTopicGroups)) {
      if (fragments.some(fragment => topic.id.endsWith("." + fragment))) return label;
    }
  }
  return domainLabel(topic.domain);
}
function studentRationale(text) {
  let value = String(text || "");
  const replacements = [
    ["数量の関係","数や量のつながり"],["数量","数や量"],["位取り","数字の位のしくみ"],
    ["加法","たし算"],["減法","ひき算"],["乗法","かけ算"],["除法","わり算"],
    ["等分除・包含除","同じ数ずつ分ける場面・何人分あるかを考える場面"],
    ["叙述","文章中の言葉や文"],["要旨","大事な内容"],["関係を捉える","関係を考える"],
    ["関係を捉え","関係を考え"],["捉える","考える"],["把握する","つかむ"],
    ["関連付ける","結び付ける"],["活用する","使う"],["理解してから","分かってから"]
  ];
  for (const [from, to] of replacements) value = value.split(from).join(to);
  return value;
}
function gradeLabel(topic) {
  const grades = (topic.grades || []).slice().sort((a,b)=>a-b);
  if (!grades.length || topic.gradePlacement?.basis === "japanese-taxonomy-draft") return "学年は確認中";
  const label = gradeListLabel(grades).replace(/年/g,"年生");
  return topic.gradePlacement?.status === "reviewed" ? label : "目安：" + label;
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
    const haystack = [topicTitle(topic),topicText(topic),topic.name,topic.description,topicGroup(topic),domainLabel(topic.domain),topic.domain,topic.subject].join(" ").toLocaleLowerCase("ja");
    return (!f.subject || topic.subject===f.subject) &&
      (!f.grade || topic.gradePlacement?.basis === "japanese-taxonomy-draft" || (topic.grades||[]).includes(f.grade)) &&
      (!f.domain || topicGroup(topic)===f.domain) &&
      (!f.query || haystack.includes(f.query));
  }).sort((a,b)=>topicGrade(a)-topicGrade(b)||a.domain.localeCompare(b.domain,"ja")||a.name.localeCompare(b.name,"ja"));
}
function renderDomainOptions() {
  const subject = $("#subject").value;
  const relevant = state.topics.filter(t=>!subject||t.subject===subject).map(topicGroup);
  const previous = $("#domain").value;
  fillSelect("#domain", relevant, "すべてのまとまり");
  if ([...$("#domain").options].some(o=>o.value===previous)) $("#domain").value=previous;
}
function renderFilters() {
  fillSelect("#subject", state.topics.map(t=>t.subject), "すべての教科");
  $("#subject").value = "";
  renderDomainOptions();
}
function relationCandidates(topic, group) {
  const edges = state.dependencies.filter(edge => {
    const incoming = edge.to === topic.id;
    const outgoing = edge.from === topic.id;
    if (!incoming && !outgoing) return false;
    if (group === "prior") return incoming && ["prerequisite","recommended-prerequisite"].includes(edge.type);
    if (group === "related") return ["related-learning","recurring-development"].includes(edge.type);
    if (group === "future") return outgoing && ["prerequisite","recommended-prerequisite","extension","application"].includes(edge.type);
    return false;
  });
  return edges
    .map(edge => ({edge, topic:state.topics.find(item=>item.id===(edge.from===topic.id?edge.to:edge.from))}))
    .filter(item=>item.topic && item.topic.topicLifecycle!=="superseded")
    .sort((a,b)=>{
      const current=topicGrade(topic);
      const da=Math.abs(topicGrade(a.topic)-current), db=Math.abs(topicGrade(b.topic)-current);
      if(da!==db) return da-db;
      if(a.topic.subject!==b.topic.subject) return a.topic.subject.localeCompare(b.topic.subject,"ja");
      return (a.topic.domain||"").localeCompare(b.topic.domain||"","ja");
    });
}
function relationLabel(edge, group) {
  if (group === "prior") return edge.type === "prerequisite" ? "先に身につけたいこと" : "先に学ぶと分かりやすい";
  if (group === "future") {
    if (edge.type === "extension") return "さらに考えを広げる";
    if (edge.type === "application") return "学んだことを使う";
    if (edge.type === "recommended-prerequisite") return "次に学ぶと分かりやすい";
    return "この学びを土台にする";
  }
  return relationNames[edge.type] || "関係のある学び";
}
function relationCards(items, empty, limit=3) {
  if (!items.length) return '<p class="empty-note">'+esc(empty)+'</p>';
  return '<div class="path-cards">'+items.slice(0,limit).map(item=>{
    const topic=item.topic, edge=item.edge;
    return '<button type="button" class="path-card" data-subject="'+esc(topic.subject)+'" data-topic-id="'+esc(topic.id)+'">'+
      '<span class="path-grade">'+rubyHTML(gradeLabel(topic))+'</span>'+
      '<strong>'+rubyHTML(topicTitle(topic))+'</strong>'+
      '<span class="path-kind">'+esc(relationNames[edge.type]||"関連する学び")+'</span>'+
      '<span class="path-why">'+esc(edge.studentRationale || studentRationale(edge.rationale))+'</span></button>';
  }).join("")+'</div>'+
  (items.length>limit?'<p class="muted small-note">'+rubyHTML("ほかにも")+(items.length-limit)+rubyHTML("件のつながりがあるよ。")+'</p>':'');
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
      const domain=topicGroup(topic)||"まとまり未分類";
      if(!groups.has(domain))groups.set(domain,[]);
      groups.get(domain).push(topic);
    });
    return '<section class="grade-lane"><header class="grade-lane-head"><span>'+grade+'年</span><small>この学年から学ぶかも・'+topics.length+'こ</small></header>'+
      [...groups.entries()].map(([domain,items])=>'<div class="grade-lane-group"><h3>'+rubyHTML(domain)+'</h3>'+
        items.map(topic=>{
          const candidateGrade=Number(topic.gradePlacement?.candidateFirstIntroductionGrade)||Math.min(...(topic.grades||[99]));
          const continuingGrades=(topic.gradePlacement?.candidateContinuingGrades||[]).length?topic.gradePlacement.candidateContinuingGrades:(topic.grades||[]).filter(g=>g!==candidateGrade);
          const continuing=gradeListLabel(continuingGrades);
          return '<button type="button" class="grade-topic'+(state.selected===topic.id?' is-selected':'')+'" data-subject="'+esc(topic.subject)+'" data-topic-id="'+esc(topic.id)+'" aria-pressed="'+(state.selected===topic.id)+'">'+
            '<strong>'+rubyHTML(topicTitle(topic))+'</strong>'+
            (continuing?'<span class="grade-topic-continuation">'+rubyHTML("このあとも学ぶかも")+'：'+rubyHTML(continuing)+'</span>':'')+
            '<span>つながりを見る →</span></button>';
        }).join("")+'</div>').join("")+
      (topics.length?'':'<p class="grade-lane-empty">この学年から学ぶ項目は、まだ登録されていないよ。</p>')+'</section>';
  }).join("");
  return '<div class="grade-map-intro"><strong>'+rubyHTML(subject+"の学年マップ")+'</strong><p>'+rubyHTML("それぞれの学びを、学び始める学年の目安に1回ずつ置いています。あとでまた使う学びは、カードに表示しています。項目を選ぶと、前や次につながる学びが見られます。")+'</p><small>'+rubyHTML("学年は見直し中の目安です。必ずこの学年・順番で学ぶという意味ではありません。")+'</small></div>'+
    '<div class="grade-map-scroll" role="region" aria-label="'+rubyHTML(subject)+'の1年生から6年生までの学びのマップ" tabindex="0">'+lanes+'</div>';
}
function renderList() {
  const topics=filteredTopics();
  const filters=currentFilters();
  $("#count").textContent=(!filters.subject&&!filters.grade&&!filters.domain&&!filters.query) ? [...new Set(state.topics.map(t=>t.subject))].length+"教科" : topics.length+"件";
  const list=$("#items");
  list.replaceChildren();
  if(filters.subject&&!filters.grade&&!filters.domain&&!filters.query && !(filters.subject==="国語" && state.topics.filter(topic=>topic.subject==="国語").every(topic=>topic.gradePlacement?.basis==="japanese-taxonomy-draft"))){
    list.innerHTML=renderGradeMap(filters.subject);
    list.querySelectorAll("[data-topic-id]").forEach(button=>button.addEventListener("click",()=>renderDetail(button.dataset.topicId)));
    return;
  }
  if(!filters.subject&&!filters.grade&&!filters.domain&&!filters.query){
    const subjects=[...new Set(state.topics.map(t=>t.subject))].sort((a,b)=>a.localeCompare(b,"ja"));
    list.innerHTML='<div class="subject-picks">'+subjects.map(subject=>'<button type="button" class="subject-pick" data-subject="'+esc(subject)+'"><span class="subject-pick-label">'+rubyHTML("教科")+'</span><strong>'+rubyHTML(subject)+'</strong><span>'+rubyHTML("学びのつながりを見る")+' →</span></button>').join("")+'</div><p class="empty-note">まず教科を選んでみてください。学年や学習内容のまとまりをしぼって、項目を選ぶと前後の学びをたどれます。</p>';
    list.querySelectorAll("[data-subject]").forEach(button=>button.addEventListener("click",()=>{
      $("#subject").value=button.dataset.subject;
      renderDomainOptions();
      renderList();
      syncDetailToFilters(false);
    }));
    return;
  }
  if(!topics.length){
    list.innerHTML='<p class="empty-note">'+rubyHTML("見つからなかったよ。教科や学年を変えたり、別の言葉で探したりしてみよう。")+'</p>';
    return;
  }
  if(filters.subject==="国語" && filters.grade && state.topics.filter(topic=>topic.subject==="国語").every(topic=>topic.gradePlacement?.basis==="japanese-taxonomy-draft")){
    const note=document.createElement("p");
    note.className="empty-note grade-review-note";
    note.textContent="国語の学年ごとの整理は確認中です。今は学年でしぼらず、学習内容のまとまりや言葉から探してね。";
    list.append(note);
  }
  const groups=new Map();
  topics.forEach(topic=>{
    const key=topicGroup(topic)||"まとまり未分類";
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(topic);
  });
  for(const [domain,items] of groups){
    const section=document.createElement("section");
    section.className="domain-group";
    section.innerHTML='<div class="domain-heading"><h2>'+rubyHTML(domain)+'</h2><span>'+items.length+'</span></div>'+
      '<div class="topic-grid">'+items.map(topic=>
        '<button type="button" class="topic-card'+(state.selected===topic.id?' is-selected':'')+'" data-subject="'+esc(topic.subject)+'" data-topic-id="'+esc(topic.id)+'" aria-pressed="'+(state.selected===topic.id)+'">'+
        '<span class="topic-grade">'+rubyHTML(gradeLabel(topic))+'</span><strong>'+rubyHTML(topicTitle(topic))+'</strong>'+
        '<span class="topic-description">'+rubyHTML(topicText(topic))+'</span></button>'
      ).join("")+'</div>';
    list.append(section);
  }
  list.querySelectorAll("[data-topic-id]").forEach(button=>button.addEventListener("click",()=>renderDetail(button.dataset.topicId)));
}
function flowNodes(items, empty, group) {
  if (!items.length) return '<p class="flow-empty">'+rubyHTML(empty)+'</p>';
  return '<div class="flow-nodes">'+items.slice(0,3).map(item=>{
    const topic=item.topic, edge=item.edge;
    return '<button type="button" class="flow-node" data-subject="'+esc(topic.subject)+'" data-topic-id="'+esc(topic.id)+'">'+
      '<span class="flow-grade">'+rubyHTML(topic.subject+"・"+gradeLabel(topic))+'</span>'+
      '<strong>'+rubyHTML(topicTitle(topic))+'</strong>'+
      '<span class="path-kind">'+rubyHTML(relationLabel(edge,group))+'</span>'+
      '<span class="flow-why"><b>'+rubyHTML("どうつながる？")+'</b> '+rubyHTML(edge.studentRationale || studentRationale(edge.rationale))+'</span></button>';
  }).join("")+'</div>'+
  (items.length>3?'<p class="muted small-note">'+rubyHTML("ほかにも")+(items.length-3)+rubyHTML("件のつながりがあるよ。")+'</p>':'');
}
function navigateToConnectedTopic(id) {
  const topic = state.topics.find(item => item.id === id);
  if (!topic) return;
  $("#subject").value = topic.subject;
  renderDomainOptions();
  $("#grade").value = "";
  $("#domain").value = topicGroup(topic);
  $("#query").value = "";
  renderList();
  renderDetail(id);
}
function syncDetailToFilters(scroll = false) {
  const visible = filteredTopics();
  const current = visible.find(topic => topic.id === state.selected);
  const next = current || visible[0];
  if (next) {
    renderDetail(next.id, scroll);
  } else {
    state.selected = null;
    $("#detail").innerHTML = '<p class="muted">見つからなかったよ。教科や学年を変えたり、別の言葉で探したりしてみよう。</p>';
  }
}
function renderDetail(id, scroll = true) {
  const topic=state.topics.find(item=>item.id===id);
  if(!topic) return;
  state.selected=id;
  $("#detail").dataset.subject=topic.subject;
  const previous=relationCandidates(topic,"prior");
  const related=relationCandidates(topic,"related");
  const next=relationCandidates(topic,"future");
  const sourceLinks=(topic.evidence||[]).map(evidence=>{
    const source=(state.standards?.sources||[]).find(s=>s.id===evidence.sourceId);
    const link=source?'<a href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.title)+'</a>':esc(evidence.sourceId);
    return '<li>'+link+'<span class="source-note">'+esc(evidence.note||"")+'</span></li>';
  }).join("");
  $("#detail").innerHTML=
    '<div class="detail-topline"><span class="subject-chip" data-subject="'+esc(topic.subject)+'">'+rubyHTML(topic.subject)+'</span></div>'+
    '<p class="detail-grade">'+rubyHTML(gradeLabel(topic))+'　／　'+rubyHTML(topicGroup(topic))+'</p>'+
    '<h2>'+rubyHTML(topicTitle(topic))+'</h2><p class="detail-description">'+rubyHTML(topicText(topic))+'</p>'+
    '<section class="progression-map" aria-label="学びのつながり">'+
      '<div class="progression-title"><span class="progression-mark">'+rubyHTML("学びのつながり")+'</span><p>'+rubyHTML("「先に学ぶ」「関係する」「使って広げる」を分けているよ。必ずこの順番で学ぶという意味ではないよ。")+'</p></div>'+
      '<div class="progression-stage"><div class="stage-label"><span>01</span><strong>'+rubyHTML("先に学ぶとよいこと")+'</strong></div>'+flowNodes(previous,"先に学ぶとよい項目は、まだ登録されていないよ。ほかにも必要な学びがあるかもしれないね。","prior")+'</div>'+
      '<div class="progression-stage is-current"><div class="stage-label"><span>02</span><strong>'+rubyHTML("今見ている学び")+'</strong></div>'+
        '<div class="flow-current"><span>'+rubyHTML(topic.subject+"・"+gradeLabel(topic))+'</span><strong>'+rubyHTML(topicTitle(topic))+'</strong><small>'+rubyHTML("今、見ている学び")+'</small></div></div>'+
      '<div class="progression-stage"><div class="stage-label"><span>03</span><strong>'+rubyHTML("関係する学び")+'</strong></div>'+flowNodes(related,"関係する学びは、まだ登録されていないよ。","related")+'</div>'+
      '<div class="progression-stage"><div class="stage-label"><span>04</span><strong>'+rubyHTML("この学びから広がること")+'</strong></div>'+flowNodes(next,"使ったり、さらに考えを広げたりする学びは、まだ登録されていないよ。","future")+'</div>'+
    '</section>'+
    '<details class="source-details"><summary>先生・保護者向けの確認情報</summary><p class="muted">学びのつながりは確認中です。必ずこの順番で学ぶ、という意味ではありません。</p><ul>'+(sourceLinks||"<li>出典情報は未登録です。</li>")+'</ul></details>';
  $("#detail").querySelectorAll("[data-topic-id]").forEach(button=>button.addEventListener("click",()=>navigateToConnectedTopic(button.dataset.topicId)));
  renderList();
  if (scroll) $("#detail").scrollIntoView({behavior:"smooth",block:"nearest"});
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
    $("#subject").addEventListener("change",()=>{renderDomainOptions();renderList();syncDetailToFilters(false);});
    $("#grade").addEventListener("change",()=>{renderList();syncDetailToFilters(false);});
    $("#domain").addEventListener("change",()=>{renderList();syncDetailToFilters(false);});
    $("#query").addEventListener("input",()=>{renderList();syncDetailToFilters(false);});
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