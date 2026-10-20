# JP Learning Taxonomy（日本版 学習タクソノミー）

日本の小学校で学ぶ内容を、学習項目・学年候補・領域・項目間の関係・出典とともに整理し、教材づくりや学びの見通しに再利用できるデータと学習マップを目指すプロジェクトです。

**公開サイト：** [学習マップ](site/)  
**EDU KIT：** [教材設計・共通基盤](https://tt-sensei.github.io/edu-kit/)

> **現在は開発・レビュー中です。** データには未確認の学年候補、項目候補、関係候補が含まれます。学習指導要領の正式な学年配当・必修順序を保証するものではありません。候補と確認済みの情報を区別して利用してください。

## このプロジェクトでできること

- 教科・学年・学習内容から項目を探す
- 項目を中心に、前提・関連・発展の候補をたどる
- 子ども向けの表示名・説明と、編集・出典管理用の情報を分けて管理する
- TT-sensei の教材や他の学習支援ツールから、共通 ID と JSON データを再利用する

## いまの状態

国語・社会・算数・理科を中心に分類と学習項目の草案を作り、共通の学習マップへ統合しています。生活、音楽、図画工作、家庭、体育、外国語活動、外国語、道徳、総合的な学習の時間、特別活動も対象候補ですが、全教科の内容が完成した状態ではありません。

学習指導要領コードの対応は、コードが公式表に存在すること、教科・学年が一致すること、項目の意味が対応することを分けて扱います。候補コードを自動的に確定扱いにしません。最新の判定は [コード対応表](data/curriculum-code-mapping.json) と [コード候補・登録状況の記録](docs/curriculum-code-candidates-2026-10-21.md) を確認してください。社会科の対応確認記録は [社会科コード照合記録](docs/social-studies-code-crosswalk-draft-2026-10-20.md) です。算数の学年配当・公式内容の確認状況は [算数学年配当監査メモ](docs/math-grade-placement-audit-2026-10-21.md) と [学年配当の根拠データ](data/grade-placement-review-math-a.json) を参照してください。

## まず見るファイル

| ファイル | 役割 |
| --- | --- |
| [`data/topics.json`](data/topics.json) | 共通の学習項目 |
| [`data/dependencies.json`](data/dependencies.json) | 項目間の関係 |
| [`data/curriculum-standards.json`](data/curriculum-standards.json) | 公式資料・出典・領域参照 |
| [`data/curriculum-code-mapping.json`](data/curriculum-code-mapping.json) | 公式コードの候補・確認状況 |
| [`data/representation-models.json`](data/representation-models.json) | 算数などの表現モデル |
| [`data/manifest.json`](data/manifest.json) | データセットの情報 |
| [`schema/`](schema/) | データ形式の仕様 |
| [`scripts/`](scripts/) | 検証・照合スクリプト |
| [`site/`](site/) | 静的な学習マップ |
| [`PROVENANCE.md`](PROVENANCE.md) | 出典と確認方針 |
| [`LICENSE-DATA.md`](LICENSE-DATA.md) | データの利用条件の方針 |

## 開発・検証

Node.js が使える環境でリポジトリのルートから実行します。

```sh
node scripts/validate.mjs
node scripts/check-official-curriculum-codes.mjs
```

1つ目はデータの参照整合性などを検査します。2つ目は文部科学省の公式CSVを取得して、登録されたコード参照の存在・関連情報を確認し、照合レポートを生成します。ネットワークや配布元の形式により公式CSVを取得できない場合、2つ目は失敗することがあります。コードの存在確認だけで意味的な対応が確定するわけではありません。

GitHub Actions の **Validate learning data** ワークフローでも検査を実行します。詳細レポートが生成された場合は、実行ページの Artifacts に `official-code-audit-report` が表示されます。

## 学習内容の整理方針

- 日本の小学校学習指導要領を基準にする。
- 公式の記述、プロジェクト独自の分類、独自の横断技能を区別する。
- 項目を必要以上に細分化せず、重複・抜け・学年候補を継続して点検する。
- 前提・関連・発展を区別し、すべてを必ず通る一本道として表現しない。
- 根拠のない関係やコードを確定扱いにしない。
- 学習指導要領や第三者資料の文章を大量転載せず、出典を示し、説明は独自の表現で作成する。
- 子ども向けの表示は、日常的で意味が伝わる言葉を使う。

## 主なレビュー記録

`docs/` には、各教科の監査、項目間の関係、表現モデル、子ども向け表現、公式コードの照合などの作業記録があります。日付付きの記録は、作業の経緯を追うために残しています。過去の記録に書かれた件数や状態が現在と異なる場合は、最新の共通データと新しい監査記録を優先してください。

整理の対象候補と判断理由は [リポジトリ整理・README更新記録](docs/repository-cleanup-review-2026-10-21.md) を参照してください。

## ライセンスと出典

ソースコードのライセンスと、学習項目データ・文章・外部資料の利用条件は同じとは限りません。再利用前に [LICENSE](LICENSE)、[LICENSE-DATA.md](LICENSE-DATA.md)、[PROVENANCE.md](PROVENANCE.md) を確認してください。URLや出典の記載だけで、第三者資料の再配布が許可されるわけではありません。
