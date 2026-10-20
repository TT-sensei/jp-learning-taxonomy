# 公式学習指導要領コードの照合手順

## 実行

リポジトリのルートで Node.js 20 以上を使い、次を実行します。

```sh
node scripts/validate.mjs
node scripts/check-official-curriculum-codes.mjs
```

GitHub Actions の「Validate learning data」でも、push・pull request・手動実行時に同じ検査を行います。

## 結果の読み方

- 「公式CSVに完全一致」は、候補コードが文部科学省の公式CSVに存在することを示します。
- 「公式CSVに見つからない」は、版の差、CSVの形式、コード表記などを調べる必要がある候補です。
- 公式CSVに存在しても、プロジェクト独自の学習項目と意味が一致するとは限りません。教科・学年・内容を確認してから `verifiedCode` を設定します。
- 対応する公式項目がない独自技能・横断項目には、無理にコードを割り当てません。

## 参照元

- [文部科学省 82V12 CSV](https://www.mext.go.jp/content/20230901-mxt_syoto01-000010374_27.csv)
- [文部科学省 82V12 Excel](https://www.mext.go.jp/content/20230901-mxt_syoto01-000010374_28.xlsx)

照合スクリプトはコードの存在確認を行うものであり、意味的な対応の自動認定は行いません。
