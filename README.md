# LoL カウンターピック

League of Legends のチャンピオンごとのカウンターピックを素早く確認できるウェブツール。エメラルド以下のランク帯に特化し、複数サイトのデータを集計して信頼性の高い情報を提供する。

## 機能

- チャンピオン名（日本語・英語）によるテキスト検索
- ロール別チャンピオン一覧からの選択（TOP / JG / MID / ADC / SUP）
- カウンターTop10を勝率・難易度・信頼スコア付きで表示
- 検索結果をURLで共有可能（例：`/counter/Darius/TOP`）
- Riot Data Dragon から最新パッチのチャンピオン情報・画像を自動取得

## 技術スタック

| 項目 | 採用技術 |
|------|---------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| スクレイピング | cheerio |
| ホスティング | Vercel |

## ドキュメント

- [仕様書](docs/spec.md) — 機能要件・データ仕様・UI仕様
- [アーキテクチャ設計書](docs/architecture.md) — システム構成・データフロー・ファイル構成

## 開発手順

```bash
npm install
npm run dev
```

`http://localhost:3000` で確認できる。

## デプロイ

GitHub リポジトリを Vercel に連携するだけで自動デプロイされる。環境変数 `NEXT_PUBLIC_BASE_URL` に本番URLを設定すること。

```
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```
