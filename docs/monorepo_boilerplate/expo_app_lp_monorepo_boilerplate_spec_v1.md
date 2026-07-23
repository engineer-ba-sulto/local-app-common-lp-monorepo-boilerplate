# Expo App + LP モノレポ Boilerplate 仕様書 v1

- 作成日: 2026-07-22
- 状態: 仕様確定・コード未着手
- 名前: `expo-app-lp-monorepo-boilerplate`
- 実装先: `DemoProject/expo-app-lp-monorepo-boilerplate/`
- 所有者用意: 下記コマンドでルート・`apps/lp`・`apps/sp` をスキャフォールド。エージェントは `mkdir` / `bun init` / `bun create` を再実行しない
- 下流 Cursor 指示書: [Cursor実装指示書 v1](./expo_app_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 参考（別物）: four-app-monorepo-boilerplate（同梱外。相対リンクしない）

## 1. 目的

みずどき（観葉植物管理）と現場日報など、**日本向け iPhone ローカルアプリ + App Store 向け LP** を量産するための、コピー用モノレポ骨格を定義する。

| アプリ | 役割 | 最終ゴール | 初回実装 |
| --- | --- | --- | --- |
| `apps/sp` | Expo / React Native / TypeScript の iPhone アプリ | App Store 公開可能なローカル完結 MVP | **今回の実装対象** |
| `apps/lp` | Astro の静的 LP | Cloudflare 等への公開、ASO・ストア誘導 | **枠だけ。中身は後続** |

既存の `four-app-monorepo-boilerplate`（api / web / sp / lp）はフルスタック向け。本仕様は **sp + lp のみ** に絞り、端末内 SQLite アプリ向けの薄い骨格を置く。

## 2. 運用モデル（二段構え）

```text
【一段目・汎用】いま実装する
DemoProject/expo-app-lp-monorepo-boilerplate/
├── apps/sp/   ← bun create expo-app
└── apps/lp/   ← bun create cloudflare
        │ copy
        ▼
【二段目・2アプリ共通】一段目完了後に別パックで定義・実装
DemoProject/local-app-common-lp-monorepo-boilerplate/   ← 二段目。一段目をコピーして共通層を足す
（expo-image-picker、写真 API、PostHog 輸送層。指示書 LC-000〜LC-006。通知は含めない）
        │ copy fork
        ├─► Project/houseplant-care/   ← みずどき（独立 Git・ドメイン実装）
        └─► Project/field-nippo/       ← 現場日報（独立 Git・ドメイン実装）
```

- **一段目（本仕様）:** 汎用骨格。製品差分やメディア本実装を入れない。完成させる。
- **二段目（後続パック）:** 一段目をコピーし、みずどき／現場日報の**両方で使う共通実装**だけ足す（`expo-image-picker` など）。製品ドメインは入れない。
- **製品:** 二段目からコピーして、各 Cursor 継続指示書でドメイン実装する。
- 複製後は **共有パッケージのランタイム結合を残さない**（コピーして分岐）。
- 各製品リポジトリは単独ワークスペースで開き、親 `Engineer-BA-Sulto-Cursor` から `Project/` / `DemoProject/` 配下のコード操作をしない。

### 2.1 所有者の用意手順（正本）

`DemoProject/` 配下で次を実行する（対話プロンプトは所有者が選択）。

```bash
mkdir expo-app-lp-monorepo-boilerplate
cd expo-app-lp-monorepo-boilerplate
bun init
bun create cloudflare@latest apps/lp
bun create expo-app ./apps/sp
```

その後、当該フォルダを単独ワークスペースとして開く。

- **エージェントは上記を再実行しない**（`mkdir` / `bun init` / `bun create cloudflare` / `bun create expo-app`）。
- create 済みの成果物を、本仕様の workspaces・Biome・mprocs・folder 構成へ寄せるのが BP-001 以降の仕事。
- 製品ドメイン（植物・日報）および `expo-image-picker` 本実装は本一段目に入れない（二段目以降）。

## 3. 技術スタック

### 3.1 ルート（モノレポ）

| 項目 | 採用 |
| --- | --- |
| JS ランタイム / PM | **Bun**（`npm` / `pnpm` / `yarn` / `npx` 禁止） |
| workspaces | ルート `package.json` の `workspaces`: `apps/*`（必要なら後から `packages/*`） |
| Bun install | ルート `bunfig.toml` で `linker = "isolated"`（`DemoProject/four-app-monorepo-boilerplate/bunfig.toml` と同型） |
| 並列 dev | **mprocs**。ルート `mprocs.yaml` + `bun run dev`（sp / lp を pane 分割起動。four-app の mprocs を sp/lp に縮小） |
| formatter / linter | Biome（ルート設定を共有） |
| テスト | Bun test（`apps/sp` の unit）。Expo UI 実機は別枠 |

### 3.2 apps/sp（初回実装）

| 項目 | 採用 |
| --- | --- |
| スキャフォールド | 所有者が `bun create expo-app ./apps/sp` |
| 基盤 | Expo、React Native、TypeScript、Expo Router |
| UI | `@expo/ui/swift-ui`。RN view は必要箇所のみ |
| 保存 | `expo-sqlite` + Drizzle ORM（空 schema + migration 配線） |
| 日付 | `date-fns` ローカル暦日 `YYYY-MM-DD` の枠 |
| 写真 | `images` ユーティリティ枠のみ（`expo-image-picker` 本実装は**二段目**） |
| 分析 | `AnalyticsClient` no-op 枠（PostHog 実接続は製品側） |
| ナビ | NativeTabs **1タブ雛形** + tab 内 Stack（製品で 2〜3 タブへ差し替え） |
| テーマ | light only（`userInterfaceStyle: 'light'`） |
| 認証 / 課金 / 広告 | 入れない |

### 3.3 apps/lp（枠のみ）

| 項目 | 採用 |
| --- | --- |
| スキャフォールド | 所有者が `bun create cloudflare@latest apps/lp`（対話で Astro 等を選択） |
| 基盤 | Astro（静的）。Cloudflare Workers / Pages 配信を想定 |
| 初回（BP-007） | create 成果を整え、最小プレースホルダ＋「後続実装」README |
| 禁止 | 製品コピー、ストアスクショ本実装、課金説明の確定文（製品側） |

## 4. ディレクトリ構成

```text
DemoProject/expo-app-lp-monorepo-boilerplate/   # ルート・apps/sp・apps/lp は所有者の bun init / create 済み
├── apps/
│   ├── sp/                              # Expo（create expo-app 済み。仕様へ寄せる）
│   │   ├── assets/
│   │   ├── src/
│   │   │   ├── app/                     # Expo Router routes-only
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── +not-found.tsx
│   │   │   │   ├── (tabs)/
│   │   │   │   │   ├── _layout.tsx      # NativeTabs 1タブ雛形
│   │   │   │   │   └── (home)/
│   │   │   │   │       ├── _layout.tsx
│   │   │   │   │       └── index.tsx
│   │   │   │   └── settings.tsx         # 空ルート
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   │   ├── home/
│   │   │   │   └── settings/
│   │   │   ├── hooks/
│   │   │   │   └── use-app-bootstrap.ts
│   │   │   ├── drizzle/
│   │   │   │   ├── db.ts
│   │   │   │   ├── schema/
│   │   │   │   │   ├── app-setting-schema.ts  # 最小settingsのみ可
│   │   │   │   │   └── index.ts
│   │   │   │   └── migrations/
│   │   │   └── utils/
│   │   │       ├── analytics-client.ts  # no-op
│   │   │       ├── haptics.ts
│   │   │       ├── images.ts            # 枠・契約コメント
│   │   │       ├── local-date.ts
│   │   │       └── local-date.test.ts
│   │   ├── app.config.ts
│   │   ├── babel.config.js
│   │   ├── biome.json                   # ルートへ寄せても可
│   │   ├── drizzle.config.ts
│   │   ├── eas.json
│   │   ├── metro.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── lp/                              # Cloudflare create 済み（Astro LP 枠へ寄せる）
│       ├── src/
│       │   ├── pages/
│       │   │   └── index.astro          # プレースホルダ
│       │   ├── layouts/
│       │   └── styles/
│       ├── astro.config.mjs
│       ├── package.json
│       ├── README.md                    # 「後続で製品LPを実装」
│       └── tsconfig.json
├── packages/                            # 初回は空でも可。後続で共有が必要なら追加
├── biome.json
├── bunfig.toml                          # [install] linker = "isolated"
├── mprocs.yaml                          # sp / lp 並列 dev
├── package.json                         # workspaces: ["apps/*"]、dev: mprocs
├── bun.lock
├── README.md                            # コピー手順・rename・実装順・mprocs 操作
└── tsconfig.json                        # 必要なら base
```

### 4.1 apps/sp 配置ルール

- `src/app`: routes-only。DB・分析・画面ロジックを置かない。
- `src/screens`: 画面固有 UI / hook。
- `src/components`: 2画面以上で再利用する UI のみ。
- SwiftUI は `.ios.tsx` + default `.tsx` の platform pair。
- ファイル名は kebab-case。
- import alias 例: `@/screens/*`、`@/utils/*`、`@db/*` → `src/drizzle/*`。
- 依存方向: `route → screen → screen hook → drizzle / utils`。

## 5. ルート scripts・設定ファイル

### 5.1 package.json scripts（例）

```json
{
  "scripts": {
    "dev": "mprocs",
    "dev:sp": "bun --cwd apps/sp run dev",
    "dev:lp": "bun --cwd apps/lp run dev",
    "check": "biome check .",
    "check:sp": "bun --cwd apps/sp run check",
    "typecheck:sp": "bun --cwd apps/sp run typecheck",
    "test:sp": "bun --cwd apps/sp test"
  },
  "devDependencies": {
    "mprocs": "^0.9.6"
  }
}
```

- `apps/sp` の `dev` は Expo 起動（例: `expo start`）へ合わせる。`start` 別名でもよいが、mprocs からは `dev` を呼ぶ。
- `dev:lp` は枠が動く最低限でよい。初回完了判定に LP の見た目完成は含めない。
- 個別起動は `dev:sp` / `dev:lp`。一括は `bun run dev`（mprocs）。

### 5.2 bunfig.toml（正本）

four-app と同型。ルートに置く。

```toml
[install]
linker = "isolated"
```

### 5.3 mprocs.yaml（正本）

four-app の `mprocs.yaml` を sp / lp だけに縮めた形。ルートに置く。

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/pvolok/mprocs/master/schemas/mprocs.json

proc_list_title: expo-app-lp-monorepo

procs:
  sp:
    cmd: ["bun", "run", "dev"]
    cwd: <CONFIG_DIR>/apps/sp
    stop: SIGINT
  lp:
    cmd: ["bun", "run", "dev"]
    cwd: <CONFIG_DIR>/apps/lp
    stop: SIGINT

keymap_procs:
  <Tab>: { c: toggle-focus }
  <j>: null
  <k>: null

keymap_term:
  <Tab>: { c: toggle-focus }
```

README に次を書く。

- `bun run dev` で mprocs 起動
- Tab でプロセス一覧とターミナルのフォーカス切替
- `s` 起動、`x` 停止、`r` 再起動（mprocs デフォルト）
- 参照: [mprocs](https://github.com/pvolok/mprocs)
## 6. apps/sp に含めるもの / 入れないもの

### 含める

- Expo + Bun + Biome + TypeScript の動く空アプリ
- ルート `bunfig.toml`（isolated linker）と `mprocs`（`mprocs.yaml` + `bun run dev`）
- NativeTabs 1タブ + `/` で SwiftUI ホーム雛形
- Drizzle 接続・migration gate・最小 `app_settings`（または空 schema + 配線）
- `AnalyticsClient` no-op
- `local-date` + unit test 枠
- `images` 枠（documents 配下パス契約のコメント）
- settings 空ルート
- README: コピー手順、rename チェック、mprocs 操作、Development Build へ移る目安

### 入れない

- 製品ドメイン schema（植物・日報）
- PostHog SDK 実接続・同意 UI 完成形
- `expo-notifications` 予約ロジック
- 共有シート・課金・広告・アカウント
- みずどき／現場日報の画面文言・デザイン画像
- `apps/lp` の本番コピー・デプロイ設定の確定

## 7. 複製後 rename チェックリスト

コピー先で必ず差し替える。

- [ ] ルート / `apps/sp` / `apps/lp` の `package.json` name
- [ ] `apps/sp` の `app.config.ts`（`name`、`slug`、`bundleIdentifier`、scheme）
- [ ] EAS project 仮値（production 確定値は製品指示書で所有者確認）
- [ ] README の製品名と下流 Cursor 指示書リンク
- [ ] Git remote（新規独立リポジトリ）
- [ ] `apps/lp` のサイトタイトル placeholder

## 8. 下流（二段目・製品）

| 段 | 置き場 | 内容 |
| --- | --- | --- |
| 一段目（本仕様） | `DemoProject/expo-app-lp-monorepo-boilerplate/` | 汎用 sp+lp 骨格。いま完成させる |
| 二段目 | `DemoProject/local-app-common-lp-monorepo-boilerplate/` | 一段目コピー＋写真共通＋PostHog 輸送層（通知は含めない）。パック同梱外 |
| 製品 | `Project/houseplant-care/` / `Project/field-nippo/` | 二段目からコピー。ドメインは各 Cursor 指示書 |

二段目の Cursor 指示書（LC-000〜LC-006）は同梱外パックを正本とする。製品の `apps/lp` 本実装は各製品の後続チケット。

## 9. 実装フェーズ（概要）

| Phase | 対象 | 内容 |
| --- | --- | --- |
| BP-0 | ルート | Bun workspaces、`bunfig.toml`、Biome、mprocs、README（`bun init` 済み前提） |
| BP-1 | `apps/sp` | `create expo-app` 済みを仕様へ寄せる（folder、1タブ、SwiftUI、日付、Drizzle 空箱、Analytics no-op） |
| BP-2 | `apps/lp` | `create cloudflare` 済みを stub + README へ寄せる |
| BP-3 | 検証 | `bun install`、`typecheck:sp`、`check`、Expo Go smoke |
| 後続 | 二段目 | 一段目コピー → 共通メディア層など（別パック） |
| 後続 | 製品 | 二段目コピー → 各 Cursor 継続指示書 |
| 後続 | `apps/lp` | 製品 LP・公開 |

ボイラープレート本体の目安: **1.5〜2.5 営業日**（sp 厚くしない。lp は stub のみ）。

## 10. 正本の優先順位

1. 本仕様書
2. Cursor 実装指示書（本仕様の実装向け要約）
3. 製品側の ASO / P0 / expo 実装計画（複製後のみ）

衝突時は本仕様の「含めない」を優先し、製品機能をボイラープレートへ持ち込まない。
