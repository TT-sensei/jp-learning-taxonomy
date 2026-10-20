# 公式学習指導要領コードの照合手順

## 実行

リポジトリのルートで Node.js 20 以上を使い、次を実行します。

```sh
node scripts/validate.mjs
node scripts/check-official-curriculum-codes.mjs
```

GitHub Actions の「Validate learning data」でも、push・pull request・手動実行時に同じ検査を行います。実行できた場合は、詳細レポート `official-code-audit-report` を Actions の Artifacts から取得できます。レポートには候補・確認済み・関連コードの区分、公式本文、親区分の下位コード、関連する学習項目、教科・学年の自動チェック結果が含まれます。

## 結果の読み方

- 「公式CSVに完全一致」は、候補・確認済み・関連コードの参照値が文部科学省の公式CSVに存在することを示します。
- 「公式CSVに見つからない」は、版の差、CSVの形式、コード表記などを調べる必要がある参照です。
- `candidateCode` / `candidateCodes` は意味的な対応が未確定の候補コードです。
- `verifiedCode` / `verifiedCodes` は、コード表本文・教科・学年と学習項目の対応を個別に確認したコードです。公式の独立した単元名がプロジェクトの項目名と同一だという意味ではありません。
- `relatedParentCodes` / `relatedOfficialCodes` は、独自の細分化や横断技能・まとめ項目の根拠をたどるための参照コードであり、直接対応の確定を表しません。
- 教科・学年の自動一致は必要な検査ですが、意味対応の判断に代わるものではありません。

## 参照元

- [文部科学省 82V12 CSV](https://www.mext.go.jp/content/20230901-mxt_syoto01-000010374_27.csv)
- [文部科学省 82V12 Excel](https://www.mext.go.jp/content/20230901-mxt_syoto01-000010374_28.xlsx)

照合スクリプトはコードの存在・教科・学年・関連する公式記述の確認を支援しますが、意味的な対応を自動認定しません。現在の社会科照合の判定と根拠は [社会科コード照合記録](social-studies-code-crosswalk-draft-2026-10-20.md) に記載しています。
