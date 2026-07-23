# LC-005 PostHog SDK・PostHogAnalyticsClient・同意切替

## 完了条件

- [ ] 同意前は送信 0、同意後は手動 `capture` のみ、自動収集なし、キーはプレースホルダの `PostHogAnalyticsClient` を実装する。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

一段目の `AnalyticsClient` を維持しつつ、PostHog 実クライアントと同意切替を足す（製品イベントなし）。

実装範囲:

- PostHog RN SDK（Expo SDK 互換版）
- `apps/sp/src/utils/analytics-client.ts`（Noop / PostHog・同意フラグ配線）
- Project API Key のプレースホルダのみ

禁止:

- Session Replay / 自動収集 / Feature Flags / `identify`
- 製品固有イベント名・プロパティの確定
- Personal / 管理キーの混入
- `expo-notifications`

## 優先度または期限

高。依存: LC-000。見積 0.5 日。Phase 3。LC-001〜LC-004 と並行可。

## 現在の状態

todo（2026-07-23 起票）。

## 関連ファイル

- [仕様書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/src/utils/analytics-client.ts`、PostHog 依存、同意フラグ配線

## 後続チケット

- [LC-006 統合検証・README](./2026-07-23_lc_006_integration_readme.md)（LC-000〜LC-005 完了後）

## 完了メモ

（実装完了時に記入）
