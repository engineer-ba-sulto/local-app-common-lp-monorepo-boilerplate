# BP-005 apps/sp Drizzle db・Kit・migration bundle・最小 schema

## 完了条件

- [x] expo-sqlite + Drizzle の空箱〜最小 settings schema・migration bundle・bootstrap を配線し、空 DB へ migration 適用後にルートが表示される状態にする。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

ローカル DB の骨格（空箱〜最小 settings）を実装する。

実装範囲:

- `apps/sp/src/drizzle/db.ts`
- schema（最小 `app-setting` 程度まで可）
- migrations / Kit / migration bundle
- bootstrap（migration gate 後に通常ルート表示）

禁止:

- 製品スキーマ（植物・日報等）
- 通知・課金・共有の実装

## 優先度または期限

中。依存: BP-002。見積 0.5〜1 日。Phase 2。BP-003 / BP-004 と並列可。

## 現在の状態

done（2026-07-23）。

## 関連ファイル

- [仕様書 v1](../../../monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../../monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/src/drizzle/**`、`drizzle.config.ts`、bootstrap hook

## 後続チケット

- [BP-006 AnalyticsClient no-op](../../todo/2026-07-22_bp_006_sp_analytics_noop.md)（Phase 2 並列）
- [BP-007 lp Astro stub](../../todo/2026-07-22_bp_007_lp_astro_stub.md)（Phase 3）
- [BP-008 統合検証・README](../../todo/2026-07-22_bp_008_integration_readme.md)（BP-003〜BP-007 完了後）

## 完了メモ

- `expo-sqlite` / `drizzle-orm` / `drizzle-kit` / `babel-plugin-inline-import` を追加。`app.config.ts` に `expo-sqlite` プラグイン。
- 最小 schema: `app_settings`（key / value KV）。`db.ts` + `@db/*` alias。
- `drizzle.config.ts`（`driver: 'expo'`）・`db:generate`・migration bundle（`0000_app_settings`）。
- `metro.config.js`（`.sql`）・`babel.config.js`（inline-import）。Biome は migrations 生成物を除外。
- `useAppBootstrap` + `_layout` の migration gate（成功後に通常ルート表示）。
- 検証: `bun run typecheck:sp` / `check:sp` / `check` / `test:sp` 成功。実機 Expo Go での migration 適用確認は所有者向け。
