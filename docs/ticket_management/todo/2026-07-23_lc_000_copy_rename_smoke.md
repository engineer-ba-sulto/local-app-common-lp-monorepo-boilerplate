# LC-000 一段目コピー確認・rename・smoke

## 完了条件

- [ ] 本フォルダで `bun install` / typecheck が通り、`/` が表示でき、ルート / `apps/sp` の名前が common 向けに整理済みである。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

二段目実装の Phase 0。一段目コピー済み前提の確認と rename・smoke。

実装範囲:

- ルート / `apps/sp` の name・README 骨子
- install / typecheck / `/` 表示の smoke

禁止:

- 一段目からの再コピー / `bun init` / `bun create`
- `apps/lp` の改修
- 製品ドメインの混入

## 優先度または期限

高。依存: 一段目 BP-008。見積 0.25 日。Phase 0。

## 現在の状態

todo（2026-07-23 起票）。

## 関連ファイル

- [仕様書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: ルート / `apps/sp` の name・README 骨子、smoke

## 後続チケット

- [LC-001 写真依存・config plugin](./2026-07-23_lc_001_image_deps_plugins.md)
- [LC-005 PostHog 輸送層](./2026-07-23_lc_005_posthog_analytics_client.md)（LC-000 完了後に並行可）

## 完了メモ

（実装完了時に記入）
