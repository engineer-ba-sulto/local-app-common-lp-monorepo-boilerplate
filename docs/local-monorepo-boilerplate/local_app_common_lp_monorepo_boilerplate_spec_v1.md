# Local App Common + LP モノレポ Boilerplate 仕様書 v1（二段目）

- 作成日: 2026-07-22
- 状態: 仕様確定・コード未着手（**一段目 BP-008 完了後に実装**）
- 名前: `local-app-common-lp-monorepo-boilerplate`
- 実装先: `DemoProject/local-app-common-lp-monorepo-boilerplate/`
- 上流: 一段目 `expo-app-lp-monorepo-boilerplate`（同梱外）
- 下流 Cursor 指示書: [Cursor実装指示書 v1](./local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 所有者用意: 一段目完成物を本フォルダへ**コピー**する。エージェントは `mkdir` / `bun init` / `bun create` / 一段目からのコピーを行わない

## 1. 目的

一段目の汎用骨格の上に、みずどき／現場日報の**両方で使う共通層**だけを足した、製品分岐直前のコピー元を定義する。

| 段 | 内容 |
| --- | --- |
| 一段目 | Bun workspaces、Expo 空骨格、Drizzle 枠、Analytics **no-op**、`images` 枠コメント |
| 二段目（本仕様） | 写真共通 API ＋ PostHog 実クライアント（同意境界） |
| 製品 | 枚数上限・画面・ドメイン schema・製品イベント・通知ロジック |

## 2. 運用モデル

```text
DemoProject/expo-app-lp-monorepo-boilerplate/     ← 一段目（完了済み前提）
        │ 所有者がコピー
        ▼
DemoProject/local-app-common-lp-monorepo-boilerplate/  ← 本仕様（二段目）
        │ copy fork
        ├─► Project/houseplant-care/
        └─► Project/field-nippo/
```

### 2.1 所有者の用意手順

一段目が単独 WS で完了していること。

```bash
# DemoProject/ 配下の例
cp -R expo-app-lp-monorepo-boilerplate local-app-common-lp-monorepo-boilerplate
cd local-app-common-lp-monorepo-boilerplate
```

単独ワークスペースとして開く。エージェントはコピー・Git init を再実行しない。

## 3. 二段目で足すもの

### 3.1 写真

| 項目 | 採用 |
| --- | --- |
| 選択 | `expo-image-picker`（カメラ／ライブラリ。`expo-camera` は追加しない） |
| 保存 | `expo-file-system` で一時 URI → アプリ管理領域へコピー |
| 表示 | `expo-image`（共通 placeholder 契約。製品 UI は作らない） |
| API 置き場 | `apps/sp/src/utils/images.ts` |
| 権限文言 | `app.config.ts` の image-picker plugin に汎用日本語（製品で差し替え可） |

### 3.2 PostHog（両アプリ共通）

| 項目 | 採用 |
| --- | --- |
| SDK | PostHog React Native（Expo SDK 互換版） |
| クライアント | 一段目の `AnalyticsClient` を維持。`NoopAnalyticsClient` ＋ **同意後だけ** `PostHogAnalyticsClient` |
| 同意 | 分析同意フラグを読んで切り替え。同意前は送信 0 |
| 禁止 | Session Replay、自動イベント、画面自動収集、Feature Flags、`identify`、製品固有イベント名の確定 |
| キー | Project API Key のプレースホルダのみ（Personal / 管理キーは入れない） |

製品イベント一覧（みずどき 8 件、日報側の許可イベント）は各製品チケット（HC-014 / FN-011）で足す。

### 3.3 expo-notifications は二段目に入れない

| アプリ | 通知 |
| --- | --- |
| みずどき | MVP 必須（集約・Outbox・タップ遷移は製品側 HC-011〜013） |
| 現場日報 | **初回 MVP 外**（後続任意。FN 指示書で明示） |

共通に入れると現場日報 MVP に不要依存が乗り、みずどき固有の同日集約／Outbox も二段目に混ざる。通知は製品（主にみずどき）で実装する。

### 含めない

- 製品ドメイン schema（植物・日報）
- 枚数上限（1枚 / 1日3枚）の製品ルール
- 植物フォーム・日報編集画面
- **`expo-notifications` と予約／Outbox／集約**
- 製品固有の PostHog イベント名・プロパティ確定
- 課金・`apps/lp` の製品コピー

## 4. images API 契約（概要）

製品側が呼び出す共通関数だけを用意する。詳細シグネチャは実装時に型で固定する。

- カメラ／ライブラリから画像を1枚選ぶ（キャンセル・拒否は例外ではなく通常結果）
- 選んだ一時 URI を `documents/<subdir>/` 配下へコピーし、保存パスを返す
- `expo-image` 向けの表示用 URI / placeholder 契約
- 参照セットを渡して未参照ファイルを best-effort cleanup（失敗でアプリを落とさない）

`subdir` や参照集合の渡し方は製品が決める。二段目は汎用ヘルパに留める。

## 5. Analytics API 契約（概要）

- 同意 OFF / 未設定 → Noop（送信しない）
- 同意 ON → PostHog `capture` のみ（手動イベント）
- 分析失敗は端末内保存や画面操作を失敗させない
- イベント名とプロパティは呼び出し側（製品）が渡す。二段目は輸送層だけ

## 6. 下流製品

| 製品 | 複製先 | 継続 |
| --- | --- | --- |
| みずどき | `Project/houseplant-care/` | houseplant-care Cursor 指示書 v2（同梱外） |
| 現場日報 | `Project/field-nippo/` | field-nippo Cursor 指示書 v1（同梱外） |

## 7. 正本の優先順位

1. 本仕様書
2. Cursor 実装指示書（チケット一覧含む）
3. 一段目仕様（衝突時は本仕様の「足す／含めない」を優先）
