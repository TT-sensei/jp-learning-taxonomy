# AI-REFERENCE｜小学校 学びの地図

## 目的

このリポジトリは、日本の小学校で扱う学習内容と、その前後・関連・発展の関係を整理するためのデータセットです。教材・学習アプリを設計するときに参照できます。

## 重要な注意

- データは更新中です。全項目・全関係が確認済みとは限りません。
- 学年の候補は、公式の学年配当を保証するものではありません。
- 関係データは必修の一本道を意味しません。
- related-learning は前提知識を意味しません。
- 復習候補は、前提関係だけから自動確定しないでください。
- 出典URLがあることと、第三者資料の文章・図版を再利用できることは別です。
- 学習項目の細分化と、アプリ内の問題・ステージの細分化を混同しないでください。

## データファイル

| ファイル | 内容 |
| --- | --- |
| data/topics.json | 学習項目。topics 配列を参照 |
| data/dependencies.json | 学習項目間の関係。dependencies 配列を参照 |
| data/learning-support.json | つまずきと復習支援。確認済みの supportCases のみ利用 |
| data/learning-pathways.json | 教科別に大きな学びのまとまり・段階を見渡す編集上の道すじ |
| data/representation-models.json | 図・式・表などの表現モデル |
| data/curriculum-standards.json | 公式資料・領域・出典 |
| data/curriculum-code-mapping.json | 公式コード候補と確認状況 |
| data/manifest.json | データ版・集計・更新履歴 |

## 学習項目の読み方

- id：安定した参照ID。アプリ内の独自IDと混同せず保存する。
- subject / domain：教科と領域。
- name：内部・編集用の学習項目名。
- studentName / studentDescription：子ども向け表示名・説明。
- grades：関連候補として記録された学年。確定配当と解釈しない。
- gradePlacement：初出候補・継続候補・根拠・確認状態。
- reviewStatus：学習項目自体の確認状態。
- topicLifecycle：superseded の項目は通常の一覧から除外し、後継IDをたどる。

## 学びの道すじの読み方

- pathways は教科ごとの大きな学びのまとまりを表す。subject / id / title / question / summary を確認する。
- stages は道すじの段階。topicIds は topics.json の安定IDを参照する。
- 1つの学習項目が複数の道すじに含まれることがある。道すじは唯一の順序や授業配列ではない。
- grades の表示は目安・候補であり、公式の学年配当ではない。
- 現在の収録対象は国語・算数・社会・理科・生活・音楽・図画工作・家庭・体育・外国語活動・外国語・特別の教科 道徳・総合的な学習の時間・特別活動。学年や単元順は出版社の一例を全国共通とはみなさず、総合的な学習の時間のテーマは各学校が定める。

## 学習関係の読み方

from は関係の起点、to は関係の到達先です。prerequisite と recommended-prerequisite は通常、from が先に学ぶ候補、to が支えられる側です。

- prerequisite：必要性が高い前提候補。必修順序と断定する前に根拠を確認する。
- recommended-prerequisite：理解を助ける推奨前提。
- related-learning：関連する学び。方向性や前後関係を意味しない。
- extension：発展する学び。
- application：別の場面・単元で活用する学び。
- recurring-development：学年をまたいで繰り返し育つ技能・見方。

evidenceType と reviewStatus を必ず併読してください。editorial / needs-review の関係を公式に明記された関係として説明しないでください。

## 公式コード対応の読み方

`data/curriculum-code-mapping.json` は、topics.json の各レコードに対応する確認枠です。

- `not-checked`：個別の公式コード照合をしていない。コードを推測して補完しない。
- `candidate`：公式コード表でコードの存在や教科・学年帯を確認した候補。学習項目との意味的な一致が未確定の場合がある。
- `verified`：公式コード表での存在と、学習項目との意味的な対応を確認したもの。
- `no-direct-match`：個別項目に直接対応するコードがないと判断したもの。候補や確定コードを同時に登録しない。

`curriculum-standards.json` の `project-subject-reference` や `project-domain-reference` は、データを整理するためのプロジェクト独自IDです。文部科学省の公式コードと同一視しないでください。コードの存在確認と、個別の学習内容との意味的な一致確認も分けて扱います。

## 教材開発での推奨手順

1. 対象の学習項目を id で特定する。
2. reviewStatus と gradePlacement.status を確認する。
3. 学習目標・説明・領域・表現モデルを取得する。
4. 関係データから前提候補・関連・発展・活用を別々に取得する。
5. つまずきと復習先を使う場合は、data/learning-support.json の supportCases を確認し、reviewStatus が reviewed または published のケースだけを根拠付きで利用する。空配列なら、診断・復習対応は未整備として扱う。
6. 教科書・学習指導要領・授業の実態と照合する。
7. アプリ独自の問題IDとタクソノミーIDの対応をアプリ側に保持する。

## 静的JSONの取得例

公開後は GitHub Pages のデータURLを fetch で取得できます。リポジトリのブランチや公開設定によってURLは変わるため、公開URLは README と manifest を確認してください。

例：
- topics.json を取得し、topics 配列から対象 id を探す。
- dependencies.json を取得し、to が対象IDの関係を前提候補、from が対象IDの関係を後続候補として取得する。
- related-learning は from / to の両方向から取得する。

## AIの出力ルール

- 未確認の学年配当や関係を確定事項として書かない。
- 「前提候補」「関連」「発展」を言い換えて混同しない。
- データにない学習項目ID・出典・公式コードを作らない。
- 参照先が存在しない場合は、推測で補完せず未登録と報告する。
- 既存IDを変更・再利用しない。
- 学習指導要領の長文転載ではなく、独自の要約と出典表示を用いる。
