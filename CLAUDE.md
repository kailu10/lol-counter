@AGENTS.md

# このプロジェクトのルール

## 環境変数

- 環境変数の実値は **絶対にソースコードに直接書かない**
- 実値は `.env.local` に記載する（`.gitignore` により Git 管理対象外）
- テンプレートとして `.env.local.example` を維持する（実値は書かない）
- Vercel 本番環境の変数は `vercel env add` コマンドで設定する
- コード内では必ず `process.env.VARIABLE_NAME` で参照する

## Git / GitHub へのコミット前チェック

- APIキー・シークレット・トークン・パスワード等がコードに含まれていないか確認する
- `git diff --staged` で差分を確認してからコミットする
- `.env*` ファイルは `.gitignore` に含まれているが、念のためステージングに含まれていないか確認する
