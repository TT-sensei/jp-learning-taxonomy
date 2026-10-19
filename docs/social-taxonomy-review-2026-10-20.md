# 社会科・第1回公式内容照合（2026-10-20）

## 対象と判断ルール

対象は `data/topics.json` の社会43項目。基準は文部科学省「小学校学習指導要領（平成29年告示）解説 社会編」の第2章第2節「社会科の内容構成」と、第3章の学年ごとの内容。学習指導要領コードの個別照合はまだ実施していない。

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
| (1) 都道府県の様子 | `jp.elem.social.prefecture-land` | 対応候補。都道府県の位置・地形・気候のほか、公式内容に照らして地図・交通・主な産業などの扱いを確認 |
| (2) 人々の健康や生活環境を支える事業 | `jp.elem.social.water-supply`、`jp.elem.social.waste-management` | 対応候補。公式内容に含まれる事業の範囲と、項目を分ける粒度を確認 |
| (3) 自然災害から人々を守る活動 | `jp.elem.social.disaster-prevention` | 対応候補。社会科としての行政・関係機関・地域の備えと、理科の自然事象を区別 |
| (4) 県内の伝統や文化，先人の働き | `jp.elem.social.prefecture-culture`、`jp.elem.social.community-predecessors` | 対応候補。文化・年中行事と先人の働きは別々の学習項目として整理 |
| (5) 県内の特色ある地域の様子 | `jp.elem.social.prefecture-industry` | **不足・範囲の確認が必要。** 現行の「産業と特色」だけで公式内容を十分に覆うか未確認。伝統技術を生かした地場産業、国際交流、地域資源の保護・活用などの観点を確認する |

**実施した修正：** `jp.elem.social.community-predecessors` の `grades`・`gradePlacement.candidateFirstIntroductionGrade` を3年から4年に移動した。

### 第5学年

| 公式内容 | 現在の候補項目 | 初回判断 |
|---|---|---|
| (1) 我が国の国土の様子と国民生活 | `jp.elem.social.japan-location`、`jp.elem.social.japan-landforms-climate` | 対応候補。国土の構成・位置・地形・気候と人々の生活の結び付きを確認 |
| (2) 我が国の農業や水産業における食料生産 | `jp.elem.social.agriculture`、`jp.elem.social.fisheries`、`jp.elem.social.food-life` | 対応候補。「食料生産と生活」はまとめ項目とし、生産方法の個別項目と二重に数えない |
| (3) 我が国の工業生産 | `jp.elem.social.industrial-production` | 対応候補。製造工程・工夫・輸送・貿易のうち、公式内容に直接関わる範囲を確認 |
| (4) 我が国の産業と情報との関わり | `jp.elem.social.information-industry` | 対応候補。情報を生み出し伝える産業・情報の役割を確認 |
| (5) 我が国の国土の自然環境と国民生活との関連 | `jp.elem.social.natural-environment-life`、`jp.elem.social.environment-protection`、`jp.elem.social.forestry` | 対応候補だが、個別項目の役割を要確認。森林・環境保全をどこまで独立項目として扱うかは公式内容との対応を見て判断 |

`jp.elem.social.transport-trade` は複数の産業内容を結び付ける横断的なまとまりとして有用だが、公式の独立した内容項目と同一視しない。

### 第6学年

| 公式内容 | 現在の候補項目 | 初回判断 |
|---|---|---|
| (1) 我が国の政治の働き | `jp.elem.social.constitution`、`jp.elem.social.diet`、`jp.elem.social.government-courts`、`jp.elem.social.local-government` | 対応候補。政治の働きと、憲法・国会・行政・裁判・地方自治をどの粒度で示すか確認 |
| (2) 我が国の歴史上の主な事象 | `jp.elem.social.ancient-japan`、`jp.elem.social.medieval-japan`、`jp.elem.social.unification`、`jp.elem.social.edo-society`、`jp.elem.social.modernization`、`jp.elem.social.war-and-recovery`、`jp.elem.social.postwar-japan` | 大きな時代の流れは候補としてそろうが、主な歴史事象・人物・文化の扱いが抜けていないか要確認。`war-and-recovery` と `postwar-japan` は重複の有無を確認する |
| (3) グローバル化する世界と日本の役割 | `jp.elem.social.international-relations`、`jp.elem.social.postwar-japan` | 対応候補。国際協力と戦後の発展を一つにまとめすぎていないか確認 |

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

## 今回の具体的修正

- `jp.elem.social.firefighting`：第4学年候補 → 第3学年候補
- `jp.elem.social.police-safety`：第4学年候補 → 第3学年候補
- `jp.elem.social.community-predecessors`：第3学年候補 → 第4学年候補
- 3項目の `gradePlacement.basis` を `mext-2017-social-content-structure-review-2026-10-20` に変更し、文科省解説の該当する公式内容構成を `evidence` と `gradePlacement.note` に記録。

変更は候補学年の位置合わせであり、3項目の `reviewStatus` は `needs-review` のまま。公式コードは推測で登録していない。

## 参照

- 文部科学省「小学校学習指導要領（平成29年告示）解説 社会編」第2章第2節、第3章  
  https://www.mext.go.jp/content/20230308-mxt_kyoiku02-100002607_003.pdf
- 文部科学省「小学校学習指導要領解説」掲載ページ  
  https://www.mext.go.jp/a_menu/shotou/new-cs/1387014.htm
