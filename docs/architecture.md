# アーキテクチャ設計書

## システム構成

```
ブラウザ
  │
  ├── GET /                        トップページ（検索画面）
  ├── GET /counter/[champion]/[role]  結果ページ
  │
  └── API Routes（Next.js サーバーサイド）
        ├── GET /api/champions      チャンピオン一覧
        └── GET /api/counter        カウンターデータ集計
              │
              ├── Data Dragon CDN（チャンピオンマスター・パッチ情報）
              ├── op.gg（勝率・難易度）
              ├── lolalytics（勝率）
              └── lol.ps（勝率）
```

---

## ファイル構成

```
src/
├── types/
│   └── index.ts              型定義（Role / Champion / CounterEntry / CounterResult）
│
├── lib/
│   ├── ddragon.ts            Data Dragon API ラッパー
│   │                          - getLatestPatch()
│   │                          - getAllChampions()
│   │                          - championImageUrl()
│   ├── aggregator.ts         3サイトの結果を集計してソートする
│   ├── cache.ts              インメモリキャッシュ（TTL 4時間）
│   └── scrapers/
│       ├── opgg.ts           op.gg スクレイパー（勝率・難易度）
│       ├── lolalytics.ts     lolalytics スクレイパー（勝率）
│       └── lolps.ts          lol.ps スクレイパー（勝率）
│
├── app/
│   ├── layout.tsx            共通レイアウト（メタデータ・フォント設定）
│   ├── globals.css           CSS 変数定義・ベーススタイル
│   ├── page.tsx              トップページ（/ ）
│   ├── api/
│   │   ├── champions/route.ts   GET /api/champions
│   │   └── counter/route.ts     GET /api/counter?champion=X&role=Y
│   └── counter/
│       └── [champion]/[role]/
│           └── page.tsx      結果ページ（/counter/Darius/TOP）
│
└── components/
    ├── Header.tsx            サイトヘッダー
    ├── ChampionSearch.tsx    検索UI（テキスト入力・一覧・ロール選択）
    └── CounterList.tsx       カウンター結果リスト
```

---

## データフロー

### チャンピオン検索〜結果表示

```
1. ユーザーがチャンピオン名を入力
      │
      ▼
2. /api/champions を叩いてオートコンプリート候補を表示
      │
      ▼
3. ユーザーがチャンピオン・ロールを確定して検索ボタン押下
      │
      ▼
4. router.push('/counter/Darius/TOP') でURLが変わる
      │
      ▼
5. /counter/[champion]/[role]/page.tsx（サーバーコンポーネント）が
   /api/counter?champion=Darius&role=TOP を fetch
      │
      ▼
6. /api/counter/route.ts
   ├── キャッシュヒット → そのまま返す
   └── キャッシュミス
         ├── getAllChampions()・getLatestPatch() を並列取得
         ├── scrapeOpgg / scrapeLolalytics / scrapeLolps を並列実行
         │    （Promise.allSettled — 失敗しても他の結果で続行）
         ├── aggregateCounters() で集計・ソート
         └── setCached() してレスポンス
```

---

## 型定義

```typescript
type Role = 'TOP' | 'JG' | 'MID' | 'ADC' | 'SUP';

interface Champion {
  id: string;       // Data Dragon ID（例: "Darius"）
  nameJa: string;   // 日本語名（例: "ダリウス"）
  nameEn: string;   // 英語名（id と同値）
  roles: Role[];    // Data Dragon tags から推定したロール
}

type Difficulty = '易しい' | '普通' | '難しい';

interface CounterEntry {
  championId: string;
  nameJa: string;
  winRate: number;           // 複数サイト平均（小数第1位）
  difficulty: Difficulty | null;  // op.gg から取得
  sourceCount: number;       // 取得できたサイト数（信頼スコア）
}

interface CounterResult {
  targetChampionId: string;
  targetNameJa: string;
  role: Role;
  patch: string;             // 例: "15.12.1"
  counters: CounterEntry[];  // 最大10件、集計済みソート済み
  fetchedAt: number;         // Unix timestamp（キャッシュ管理用）
}
```

---

## 集計アルゴリズム

```
1. 各スクレイパーの結果を championId の正規化キー（小文字・英数字のみ）で名寄せ
2. 同一チャンピオンが複数サイトに存在する場合：
     winRate = 各サイトの勝率の算術平均
     sourceCount = 取得サイト数
     difficulty = op.gg の値を優先（他サイトには難易度なし）
3. ソート：sourceCount 降順 → winRate 降順
4. 上位10件を返す
```

sourceCount を第1キーにすることで、複数サイトで一致したチャンピオン（信頼性が高い）が上位に来る。

---

## デプロイ

| 項目 | 内容 |
|------|------|
| ホスティング | Vercel（無料枠） |
| デプロイトリガー | GitHub main ブランチへの push で自動デプロイ |
| 環境変数 | `NEXT_PUBLIC_BASE_URL` — 本番URL（結果ページの SSR fetch で使用） |
| キャッシュ | インメモリのため、デプロイ・コールドスタートでリセットされる |

---

## スクレイピング詳細

各スクレイパーは以下を共通仕様とする：

- `User-Agent` を一般的なブラウザ値に偽装
- タイムアウト 8秒（`AbortSignal.timeout`）
- 失敗時は空配列を返す（`Promise.allSettled` で他スクレイパーに影響しない）
- cheerio で HTML をパースし、チャンピオン ID と勝率を抽出

サイト構造の変更によりパースが失敗した場合は、そのサイトのデータをスキップして残りのサイトで集計する。

---

## 今後の拡張ポイント

- スクレイピング失敗時のエラーログ・監視
- Vercel KV 等の永続キャッシュへの移行（コールドスタート対策）
- チャンピオンごとの「なぜカウンターなのか」コメント機能
- パッチノート連動の更新通知
