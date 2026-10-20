# 社会科・公式内容照合と修正記録（2026-10-20）

## 対象と判断ルール

対象は `data/topics.json` の社会44項目（横断的な技能を含む）。基準は文部科学省「小学校学習指導要領（平成29年告示）解説 社会編」の第2章第2節「社会科の内容構成」と、第3章の学年ごとの内容。学習指導要領コードの個別照合はまだ実施していない。

公式解説：https://www.mext.go.jp/content/20230308-mxt_kyoiku02-100002607_003.pdf

このレビューでは、公式の学年・内容構成がはっきり確認できたものをもとに候補学年のずれを修正した。項目の細かな説明やコードがすべて確認済みという意味ではない。データの `reviewStatus` は引き続き `needs-review` とする。

## 公式内容と現在の項目の対応案

### 第3学年

| 公式内容 | 現在の候補項目 | 初回判断 |
|---|---|---|
| (1) 身近な地域や市区町村の様子 | `jp.elem.social.local-area`、`jp.elem.social.local-map` | 対応候補。位置・地形・土地利用・交通・主な公共施設などの範囲を項目説明と照合する |
| (2) 地域に見られる生産や販売の仕事 | `jp.elem.social.municipality-work` | 対応候補。生産・販売の仕事と地域の生活との関連が中心 |
| (3) 地域の安全を守る働き | `jp.elem.social.firefighting`、`jp.elem.social.police-safety` | 対応候補。この内容は現在のデータで第4学年に置かれていたため、第3学年へ移動 |
| (4) 市の様子の移り変わり | `jp.elem.social.municipality-change` | 対応候補。時間の経過による市や人々の生活の変化を中心に照合 |

**実施した修正：** `jp.elem.social.firefighting` と `jp.elem.social.police-safety` の `grades`・`gradePlacement.candidateFirstIntroductionGrade` を4年から3年に移動した。

### 第4学年

| 公式内容 | 現在の候補項目 | 初回判断 |
|---|---|---|
| (1) 都道府県の様子 | `jp.elem.social.prefecture-land` | 内容範囲を修正。都道府県の名称・位置、県の位置、地形、主な産業、交通網、主な都市の位置を中心にする。「気候」をこの項目の中心には置かず、第5学年の国土の地形・気候との重複を避ける |
| (2) 人々の健康や生活環境を支える事業 | `jp.elem.social.water-supply`、`jp.elem.social.waste-management` | 2項目の名称・説明を公式の選択条件に沿って修正。供給事業は飲料水・電気・ガスから1つ、廃棄物処理はごみ・下水から1つを選んで扱う内容であり、全項目を各地域で別々に扱う必須項目とはしない |
| (3) 自然災害から人々を守る活動 | `jp.elem.social.disaster-prevention` | 対応候補。社会科としての行政・関係機関・地域の備えと、理科の自然事象を区別 |
| (4) 県内の伝統や文化，先人の働き | `jp.elem.social.prefecture-culture`、`jp.elem.social.community-predecessors` | 対応候補。文化・年中行事と先人の働きは別々の学習項目として整理 |
| (5) 県内の特色ある地域の様子 | `jp.elem.social.prefecture-industry` | 第2回照合で項目名・説明を修正。地場産業、国際交流、自然・伝統文化などの地域資源の保護・活用、まちづくりや観光産業、人々の協力関係を明示。詳細な授業事例の網羅確認は継続する |

**実施した修正：** `jp.elem.social.community-predecessors` の `grades`・`gradePlacement.candidateFirstIntroductionGrade` を3年から4年に移動した。

### 第5学年

| 公式内容 | 現在の候補項目 | 初回判断 |
|---|---|---|
| (1) 我が国の国土の様子と国民生活 | `jp.elem.social.japan-location`、`jp.elem.social.japan-landforms-climate` | 対応候補。国土の構成・位置・地形・気候と人々の生活の結び付きを確認 |
| (2) 我が国の農業や水産業における食料生産 | `jp.elem.social.agriculture`、`jp.elem.social.fisheries`、`jp.elem.social.food-life` | 対応候補。「食料生産と生活」はまとめ項目とし、生産方法の個別項目と二重に数えない |
| (3) 我が国の工業生産 | `jp.elem.social.industrial-production` | 対応候補。製造工程・工夫・輸送・貿易のうち、公式内容に直接関わる範囲を確認 |
| (4) 我が国の産業と情報との関わり | `jp.elem.social.information-industry` | 対応候補。情報を生み出し伝える産業・情報の役割を確認 |
| (5) 我が国の国土の自然環境と国民生活との関連 | `jp.elem.social.national-disaster-prevention`、`jp.elem.social.forestry`、`jp.elem.social.environment-protection` | 第2回照合で、自然災害・森林資源・公害防止の3観点を分けて明示。従来の項目では国土全体の自然災害と国・都道府県の対策が独立して見えなかったため、`jp.elem.social.national-disaster-prevention` を追加。`jp.elem.social.natural-environment-life` は第5学年内容（1）の自然条件と人々の生活に対応する横断的な項目として役割を区別 |

`jp.elem.social.transport-trade` は複数の産業内容を結び付ける横断的なまとまりとして有用だが、公式の独立した内容項目と同一視しない。

### 第6学年

| 公式内容 | 現在の候補項目 | 初回判断 |
|---|---|---|
| (1) 我が国の政治の働き | `jp.elem.social.constitution`、`jp.elem.social.diet`、`jp.elem.social.government-courts`、`jp.elem.social.local-government` | 対応候補。政治の働きと、憲法・国会・行政・裁判・地方自治をどの粒度で示すか確認 |
| (2) 我が国の歴史上の主な事象 | `jp.elem.social.ancient-japan`、`jp.elem.social.medieval-japan`、`jp.elem.social.unification`、`jp.elem.social.edo-society`、`jp.elem.social.modernization`、`jp.elem.social.war-and-recovery`、`jp.elem.social.postwar-japan` | 大きな時代の流れは候補としてそろうが、主な歴史事象・人物・文化の扱いが抜けていないか要確認。`war-and-recovery` と `postwar-japan` は重複の有無を確認する |
| (3) グローバル化する世界と日本の役割 | `jp.elem.social.international-relations` | 説明文を修正し、日本とつながりの深い国々の人々の生活の多様性、文化・習慣の違いの尊重、国際交流、国際連合と日本の国際協力を明示。`postwar-japan` は歴史内容（2）の戦後の出発と国民生活の向上を扱う候補とし、内容（3）そのものとは区別 |

この段階では「時代の一覧がある」ことと「公式内容を網羅している」ことを同一視しない。公式解説の主な歴史事象や内容の取扱いを項目単位で照合する必要がある。

## 横断的な調査・資料活用

以下の7項目は、公式の学年別内容そのものではなく、複数の内容で使われる技能・見方を見渡すためのプロジェクト独自の整理とする。

- `jp.elem.social.fieldwork-interview`
- `jp.elem.social.evidence-explanation`
- `jp.elem.social.decision-civic`
- `jp.elem.social.compare-regions`
- `jp.elem.social.maps-globes`
- `jp.elem.social.statistics-graphs`
- `jp.elem.social.timeline-sources`

これらは授業で必要な力として残すが、公式の内容項目と同じ階層に見えないよう、データと画面で「横断的な技能」として表示する。内容項目への関係は、根拠を記録した編集上の提案として扱う。

## 第2回：項目の範囲・不足・重複の再照合

### 第4学年：都道府県の学習

文部科学省解説の第4学年内容（1）は、都道府県の名称と位置、県の地理的位置、県全体の地形や主な産業、交通網、主な都市の位置を扱う。そこで `jp.elem.social.prefecture-land` の説明をこの範囲に合わせた。「気候」を中心に置く表現は第5学年の国土の地形・気候と混同しやすいため外した。

内容（2）「人々の健康や生活環境を支える事業」では、内容の取扱いにより供給事業は飲料水・電気・ガスから一つ、廃棄物処理はごみ・下水から一つを選んで取り上げる。したがって、共通データでは `water-supply` と `waste-management` の項目名・説明を選択可能な公式のまとまりに合わせ、電気・ガス・下水を別々の必修項目として追加するのではなく、地域の指導計画による事例選択を明記した。これは不足ではなく、公式の選択条件をデータに反映するための修正である。

内容（5）「県内の特色ある地域の様子」では、地場産業、国際交流、自然環境や伝統文化などの地域資源を守り生かす地域、まちづくりや観光などが扱われる。`jp.elem.social.prefecture-industry` はこの内容が伝わるよう、名称・説明・子ども向け表示を更新した。`jp.elem.social.prefecture-culture` は文化財や年中行事の継承に焦点を置き、特色ある地域の資源活用や観光との重複を抑える。

### 第5学年：国土の自然環境と国民生活

公式内容（5）には、自然災害と国土保全、森林資源の働き、公害の防止と生活環境という観点がある。従来の社会項目には森林・環境保全に関する項目はあったが、自然災害の発生と自然条件の関係、国や都道府県の対策を第5学年で学ぶ項目が明確に存在しなかった。そのため `jp.elem.social.national-disaster-prevention` を新設した。

第4学年の `jp.elem.social.disaster-prevention` は地域の行政・関係機関・住民の活動を扱い、新設項目は国土全体の自然条件と保全、国・都道府県による対策を扱う。両者は同じ項目の重複ではなく、対象範囲の広がりとして `related-learning` の関係を追加した。これは編集上の提案であり、公式に定められた前提順序ではない。

### 第6学年：歴史・国際理解の範囲

第6学年の歴史内容（2）は、時代の大きな流れに加えて、狩猟・採集や農耕、古墳と大和政権、大陸文化・大化の改新・大仏造営、貴族文化、源平の戦い・鎌倉幕府・元との戦い、室町文化、キリスト教の伝来と天下統一、江戸幕府・参勤交代・鎖国、町人文化・新しい学問、明治維新・文明開化、憲法制定・日清日露戦争・条約改正、第二次世界大戦・日本国憲法・戦後の生活向上などを、選択した人物や文化遺産を中心に扱う。小学校の歴史は全事象を網羅する通史ではないが、現在の広い時代別項目だけでは各内容が画面で伝わりにくいため、説明文に主な事象を具体的に記載した。

`jp.elem.social.war-and-recovery` は戦争と人々の生活への影響、`jp.elem.social.postwar-japan` は戦後の改革・民主的な国家の出発・国民生活の向上に焦点を分けた。これらは公式内容（2）の内部をプロジェクト独自に分けた学習項目であり、別々の公式内容項目を意味しない。`jp.elem.social.international-relations` には、つながりの深い国々のくらしや文化の違い、国際交流、国際連合と国際協力を明記し、公式内容（3）の要素が欠けて見えないようにした。

### データ整合性の再点検

- 前回の学年候補変更に伴う `domain` の更新漏れが3件見つかったため、`firefighting`・`police-safety` を「第3学年」、`community-predecessors` を「第4学年」にそろえた。
- 新設した自然災害の項目に、公式コードを推測して登録していない。対応表のコード欄は未確認のままにする。
- 第2回の説明文修正を含め、全項目の `reviewStatus` は `needs-review` のまま。今回は内容との対応候補を改善した段階であり、社会科全44項目の全面的な公式コード照合・レビュー完了を示すものではない。

## 今回の具体的修正・再照合結果

- `jp.elem.social.firefighting`：第4学年候補 → 第3学年候補
- `jp.elem.social.police-safety`：第4学年候補 → 第3学年候補
- `jp.elem.social.community-predecessors`：第3学年候補 → 第4学年候補
- 3項目の `gradePlacement.basis` を `mext-2017-social-content-structure-review-2026-10-20` に変更し、文科省解説の該当する公式内容構成を `evidence` と `gradePlacement.note` に記録。
- 第4学年の都道府県・特色ある地域の説明範囲を再整理し、第5学年の自然災害・国土保全の候補項目を追加。
- 第6学年の歴史的事象と国際協力の説明文を具体化し、戦争・戦後の出発・国際協力の役割を区別。
- 学年変更後に古いままだった3項目の `domain` 表示を修正。

変更は候補学年の位置合わせであり、3項目の `reviewStatus` は `needs-review` のまま。公式コードは推測で登録していない。

## 参照

- 文部科学省「小学校学習指導要領（平成29年告示）解説 社会編」第2章第2節、第3章  
  https://www.mext.go.jp/content/20230308-mxt_kyoiku02-100002607_003.pdf
- 文部科学省「小学校学習指導要領解説」掲載ページ  
  https://www.mext.go.jp/a_menu/shotou/new-cs/1387014.htm
- 節別の本文・解説を探す際の閲覧補助（非公式。根拠資料そのものは上記の文部科学省資料）  
  第4学年（5）：https://cosnavi.jp/js2017/202_shakai/3-2-2-5.htm  
  第5学年（5）：https://cosnavi.jp/js2017/202_shakai/3-3-2-5.htm  
  第6学年（2）：https://cosnavi.jp/js2017/202_shakai/3-4-2-2.htm  
  第6学年（3）：https://cosnavi.jp/js2017/202_shakai/3-4-2-3.htm
