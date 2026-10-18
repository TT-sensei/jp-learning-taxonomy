# 自動ふりがなの試験導入

## 目的

学習マップの説明文に、辞書への手入力だけに頼らないふりがな表示を試験導入する。既存のふりがな辞書は削除せず、自動解析が使えない場合の表示として残す。

## 使い方

1. 学習マップを開く。
2. ページ下部の「自動ふりがなを試す」を押す。
3. Kuroshiro と Kuromoji の辞書データが読み込まれるまで待つ。
4. 学習項目を選び、説明文やつながりの表示を確認する。

初回は辞書ファイルのダウンロードが発生する。初期表示の速度を守るため、ボタンを押すまで日本語解析用の大きな辞書を読み込まない。

## 配置と通信

- ブラウザ用 JavaScript と辞書ファイルは `site/vendor/kuroshiro/` に置く。
- 公開時の実行処理はブラウザ内で行い、文章を外部 API に送信しない。
- 外部 CDN から実行時に読み込まない。
- GitHub Actions は配布ファイルを取得してリポジトリに保存するためにのみ使う。サイトの利用時に Actions は動かない。

## ライセンス

Kuroshiro と Kuroshiro Analyzer は MIT ライセンス、Kuromoji.js は Apache License 2.0 で配布される。Kuromoji の辞書データには独自の NOTICE が付属するため、辞書ファイルと一緒に保存する。具体的な配布ファイルとライセンス文は `site/vendor/kuroshiro/` に収録する。

- Kuroshiro: https://github.com/hexenq/kuroshiro
- Kuroshiro Analyzer for Kuromoji: https://github.com/hexenq/kuroshiro-analyzer-kuromoji
- Kuromoji.js: https://github.com/takuyaa/kuromoji.js

## 注意点

日本語解析器は読み方を推定するもので、文脈に応じた読みを常に正しく判定するわけではない。「人気」のような多義的な読みは、実際の表示を確認する必要がある。自動解析が失敗した場合は、従来の辞書方式の表示を維持する。

自動ふりがなはまず選択中の学習項目の詳細欄に適用し、一覧全体を一度に解析しない。読み込み時間と読みの正確さを確認してから、適用範囲を広げる。
