# BP-006 apps/sp AnalyticsClient no-op・images/haptics 枠

## 完了条件

- [ ] `AnalyticsClient` を no-op のみで実装し、`images` / `haptics` 枠を置き、PostHog SDK 未接続・送信なしであることを確認する。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

分析・画像・ハプティクスのユーティリティ枠を置く（本実装は製品側／二段目）。

実装範囲:

- `apps/sp/src/utils/analytics-client.ts`（no-op）
- `apps/sp/src/utils/images.ts`（枠・契約コメント）
- `apps/sp/src/utils/haptics.ts`

禁止:

- PostHog SDK 実接続・イベント送信
- `expo-image-picker` 本実装（二段目）

## 優先度または期限

中。依存: BP-003。見積 0.5 日。Phase 2。

## 現在の状態

todo（2026-07-22 起票）。BP-003 完了後に着手。

## 関連ファイル

- [仕様書 v1](docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/src/utils/analytics-client.ts`、`images.ts`、`haptics.ts`

## 後続チケット

- [BP-008 統合検証・README](docs/ticket_management/todo/2026-07-22_bp_008_integration_readme.md)（BP-003〜BP-007 完了後）

## 完了メモ

（完了時に記入）
