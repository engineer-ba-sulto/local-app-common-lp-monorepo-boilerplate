# local-app-common-lp-monorepo-boilerplate

一段目（`expo-app-lp-monorepo-boilerplate`）の上に、**写真共通 API** と **PostHog 輸送層**を足した二段目共通骨格。製品ドメイン（植物・日報）・枚数上限・製品イベント・通知は含めない。

| App | Stack | 役割 |
| --- | --- | --- |
| `apps/sp` | Expo + Expo Router | iPhone ローカルアプリ共通骨格（写真・分析輸送層あり） |
| `apps/lp` | Astro | App Store 向け LP の枠（一段目 stub のまま。二段目では未改修） |

**一段目のまま製品へ直コピーしない。** 本二段目を経由する。

## Setup

**前提:** [Bun](https://bun.com) 1.3+

```bash
bun install
```

ルートの `bunfig.toml` で `linker = "isolated"` を使う。Expo 公式が `bunx expo install` を求める場合はそれに従う（`npm` / `pnpm` / `yarn` / `npx` は使わない）。

## ローカル開発

```bash
# sp / lp を mprocs で並列起動
bun run dev

# 個別起動
bun run dev:sp
bun run dev:lp
```

### mprocs 操作

- `bun run dev` で起動（TTY 必須。IDE 統合ターミナルまたは通常のターミナルで実行）
- `Tab` でプロセス一覧とターミナルのフォーカス切替
- `s` 起動、`x` 停止、`r` 再起動（mprocs デフォルト）
- 参照: [mprocs](https://github.com/pvolok/mprocs)

### Expo Go での確認（`apps/sp`）

1. `bun run dev:sp`（または `bun run dev` の `sp`）を起動
2. Expo Go で `/` が SwiftUI ホーム雛形（「Home」）を表示すること
3. 初回起動時に Drizzle migration が適用され、ゲート通過後に通常ルートが表示されること
4. Analytics は同意前 Noop / 同意後 `PostHogAnalyticsClient`（キーはプレースホルダ。実送信は製品で差し替え）

## Scripts（ルート）

| Script | 内容 |
| --- | --- |
| `dev` | mprocs（sp / lp） |
| `dev:sp` / `dev:lp` | 個別起動 |
| `check` | Biome check |
| `typecheck:sp` / `check:sp` | sp 向け typecheck / Biome |
| `test:sp` | sp unit test（`images` / `analytics-client` / `local-date` 等） |

## 一段目からの差分（二段目で足したもの）

| 領域 | 内容 | 主な場所 |
| --- | --- | --- |
| 写真依存 | `expo-image-picker` / `expo-file-system` / `expo-image`（Expo SDK 57 互換） | `apps/sp/package.json`、`app.config.ts` plugins |
| 写真 API | 選択・documents へコピー保存・表示 URI / placeholder・未参照 cleanup | `apps/sp/src/utils/images.ts` |
| 選択結果 | 成功 / キャンセル / 権限拒否を型で表現（クラッシュしない通常分岐） | `ImagePickResult` |
| 分析 | `NoopAnalyticsClient` ＋ `PostHogAnalyticsClient`（同意前 0・同意後手動 `capture` のみ） | `apps/sp/src/utils/analytics-client.ts` |
| PostHog | `posthog-react-native` + `expo-application` / `expo-localization`。キーはプレースホルダ | `POSTHOG_*_PLACEHOLDER` / `EXPO_PUBLIC_POSTHOG_*` |

### 含めない（製品側で足す）

- 製品ドメイン schema（植物・日報）・製品画面・製品文言
- 枚数上限（1枚 / 1日3枚など）
- 製品固有 PostHog イベント名・プロパティ一覧
- `expo-notifications`（みずどきは製品側 HC-011〜013。現場日報 MVP では実装しない）
- Session Replay / 自動収集 / Feature Flags / `identify`
- `expo-camera`（カメラは `expo-image-picker` の `launchCameraAsync`）
- `apps/lp` の製品コピー

## 製品へのコピー手順

所有者（または製品作業のエージェント）が行う。**本リポジトリ内では製品フォルダを作らない。**

### 1. コピー

```bash
# 親ワークスペースの Project/ 配下の例
cp -R DemoProject/local-app-common-lp-monorepo-boilerplate Project/houseplant-care
# または
cp -R DemoProject/local-app-common-lp-monorepo-boilerplate Project/field-nippo
```

| 製品 | 複製先 | 続行する指示書（同梱外） |
| --- | --- | --- |
| みずどき | `Project/houseplant-care/` | houseplant-care Cursor 指示書 v2 |
| 現場日報 | `Project/field-nippo/` | field-nippo Cursor 指示書 v1 |

各製品は**独立 Git**とし、共有パッケージのランタイム結合は残さない。コピー先を単独ワークスペースとして開く。

### 2. 複製後 rename チェックリスト

コピー先で必ず差し替える。

- [ ] ルート / `apps/sp` / `apps/lp` の `package.json` name
- [ ] `apps/sp` の `app.config.ts`（`name`、`slug`、`bundleIdentifier` / `package`、scheme、権限文言）
- [ ] EAS project 仮値（production 確定値は製品指示書で所有者確認）
- [ ] PostHog Project API Key / host（`EXPO_PUBLIC_POSTHOG_*` またはプレースホルダ定数）
- [ ] README の製品名と下流 Cursor 指示書リンク
- [ ] Git remote（新規独立リポジトリ）
- [ ] `apps/lp` のサイトタイトル placeholder

### 3. 製品側で足すもの（索引）

| 領域 | みずどき | 現場日報 |
| --- | --- | --- |
| 枚数上限・画面 | HC-009 ほか | FN-007 ほか |
| 製品イベント | HC-014 | FN-011 |
| 通知 | HC-011〜013（MVP 必須） | 初回 MVP 外 |

## 下流

| 段 | 置き場 | 内容 |
| --- | --- | --- |
| 一段目 | `DemoProject/expo-app-lp-monorepo-boilerplate/`（同梱外） | 汎用 sp+lp 骨格 |
| 二段目（本リポジトリ） | `DemoProject/local-app-common-lp-monorepo-boilerplate/` | 写真共通＋PostHog 輸送層（通知なし） |
| 製品 | `Project/houseplant-care/` / `Project/field-nippo/` | 二段目からコピー。ドメインは各 Cursor 指示書 |

## Docs

- [仕様書 v1](./docs/local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](./docs/local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- チケット: `docs/ticket_management/`
- 一段目ドキュメント（参照用）: `docs/monorepo_boilerplate/`
