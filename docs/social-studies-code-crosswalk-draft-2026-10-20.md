# 小学校社会科コード照合の作業メモ（2026-10-20）

社会科44項目の内容対応候補を整理するための作業記録。これは公式コードの確定表ではない。

## 版の確認

文部科学省の現行掲載版は82V12。学習指導要領LODの小学校版として確認できたのは82V10・82V11で、82V12は一覧で確認できない。LODは本文・階層の探索補助として使い、コードをそのまま確定登録しない。

82V11から82V12への公式修正箇所一覧では、コード表No.2966～2967および3022のコードの一部が変更されている。社会科に該当するかは未確認。

## 参照

- 文科省：https://www.mext.go.jp/a_menu/other/data_00001.htm
- 修正箇所一覧：https://www.mext.go.jp/content/20220311-mxt_syoto01-000010374_10.pdf
- 学習指導要領LOD：https://jp-cos.github.io/Dataset

## 方針

82V12のコード表を取得できるまでは、公式コードを推測して追加しない。社会科項目は「公式内容の対応候補」「独自に分割・統合した項目」「技能・横断項目」に分けて検討し、本文の対応とコードの確定を別々に記録する。


## 社会科44項目の仮分類一覧

以下は既存の根拠メモから作った作業用分類で、公式コード照合の結果ではない。特に「公式内容の対応候補」もコード確定を意味しない。

| 学年・範囲 | 項目名 | topic ID | 仮分類 | 根拠メモから抽出した対応区分 |
|---|---|---|---|---|
| 第3学年 | 市区町村の移り変わり | `jp.elem.social.municipality-change` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第3学年 | 身近な地域や市区町村の様子 | `jp.elem.social.local-area` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第3学年 | 地域の人々の仕事と生産・販売 | `jp.elem.social.municipality-work` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第4学年 | 地域の発展に尽くした先人 | `jp.elem.social.community-predecessors` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第3学年 | 地域を表す地図と方位 | `jp.elem.social.local-map` | 技能・横断項目 | 個別の公式内容区分は要確認 |
| 調査・資料活用（横断） | 観察・聞き取り・現地調査 | `jp.elem.social.fieldwork-interview` | 技能・横断項目 | 個別の公式内容区分は要確認 |
| 調査・資料活用（横断） | 資料を根拠に説明する | `jp.elem.social.evidence-explanation` | 技能・横断項目 | 個別の公式内容区分は要確認 |
| 調査・資料活用（横断） | 社会の課題について考え判断する | `jp.elem.social.decision-civic` | 技能・横断項目 | 個別の公式内容区分は要確認 |
| 調査・資料活用（横断） | 地域や時代を比較する | `jp.elem.social.compare-regions` | 技能・横断項目 | 個別の公式内容区分は要確認 |
| 調査・資料活用（横断） | 地図・地球儀を読み取る | `jp.elem.social.maps-globes` | 技能・横断項目 | 個別の公式内容区分は要確認 |
| 調査・資料活用（横断） | 統計・グラフを読み取る | `jp.elem.social.statistics-graphs` | 技能・横断項目 | 個別の公式内容区分は要確認 |
| 調査・資料活用（横断） | 年表・歴史資料を読み取る | `jp.elem.social.timeline-sources` | 技能・横断項目 | 個別の公式内容区分は要確認 |
| 第4学年 | 廃棄物の処理と再利用 | `jp.elem.social.waste-management` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第4学年 | 飲料水・電気・ガスの供給 | `jp.elem.social.water-supply` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第3学年 | 火災から地域を守る | `jp.elem.social.firefighting` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第3学年 | 事故や事件から地域を守る | `jp.elem.social.police-safety` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第4学年 | 自然災害から地域を守る | `jp.elem.social.disaster-prevention` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第4学年 | 地域に伝わる文化・年中行事 | `jp.elem.social.prefecture-culture` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第4学年 | 都道府県の位置・地形と交通・主な産業 | `jp.elem.social.prefecture-land` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第4学年 | 県内の特色ある地域とまちづくり | `jp.elem.social.prefecture-industry` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第5学年 | 環境を守る取組 | `jp.elem.social.environment-protection` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第5学年 | 交通網と物流 | `jp.elem.social.transport-trade` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第5学年 | 工業生産と貿易 | `jp.elem.social.industrial-production` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第5学年 | 自然災害と国土の保全 | `jp.elem.social.national-disaster-prevention` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第5学年 | 自然環境と人々のくらし | `jp.elem.social.natural-environment-life` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第5学年 | 情報産業と情報活用 | `jp.elem.social.information-industry` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第5学年 | 食料生産とわたしたちの生活 | `jp.elem.social.food-life` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第5学年 | 森林資源と林業 | `jp.elem.social.forestry` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第5学年 | 水産業の生産 | `jp.elem.social.fisheries` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第5学年 | 日本の国土の位置と広がり | `jp.elem.social.japan-location` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第5学年 | 日本の地形と気候 | `jp.elem.social.japan-landforms-climate` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第5学年 | 農業の生産と食料 | `jp.elem.social.agriculture` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第6学年 | 江戸幕府と社会の安定 | `jp.elem.social.edo-society` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第6学年 | 国会・選挙と法律や予算 | `jp.elem.social.diet` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第6学年 | つながりの深い国々のくらしと日本の国際協力 | `jp.elem.social.international-relations` | 公式内容の対応候補 | 個別の公式内容区分は要確認 |
| 第6学年 | 戦国の世の統一 | `jp.elem.social.unification` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第6学年 | 戦争と人々の暮らし | `jp.elem.social.war-and-recovery` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第6学年 | 国や地方公共団体の政治と住民のくらし | `jp.elem.social.local-government` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第6学年 | 内閣・裁判所と三権の関係 | `jp.elem.social.government-courts` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第6学年 | 日本の国の形成と古代の文化 | `jp.elem.social.ancient-japan` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第6学年 | 戦後の日本の出発とくらしの向上 | `jp.elem.social.postwar-japan` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第6学年 | 日本国憲法と政治の基本 | `jp.elem.social.constitution` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第6学年 | 武士の政治と社会の変化 | `jp.elem.social.medieval-japan` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
| 第6学年 | 明治の改革と近代日本の発展 | `jp.elem.social.modernization` | 独自の分割・統合候補 | 個別の公式内容区分は要確認 |
