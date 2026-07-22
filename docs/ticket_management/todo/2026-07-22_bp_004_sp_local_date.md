# BP-004 apps/sp local-date + unit test

## 完了条件

- [ ] `utils/local-date.ts` と境界 unit test を追加し、`YYYY-MM-DD` のローカル暦日境界テストが成功する。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

`date-fns` ベースのローカル暦日ユーティリティ枠を実装する。

実装範囲:

- `apps/sp/src/utils/local-date.ts`
- `apps/sp/src/utils/local-date.test.ts`（または同等パス）
- `bun run test:sp` で該当 test が通ること

禁止:

- 製品ドメインの日付ビジネスロジック

## 優先度または期限

中。依存: BP-002。見積 0.5 日。Phase 2。BP-003 と並列可。

## 現在の状態

todo（2026-07-22 起票）。BP-002 完了後に着手。

## 関連ファイル

- [仕様書 v1](docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/src/utils/local-date.ts`、test

## 後続チケット

- [BP-008 統合検証・README](docs/ticket_management/todo/2026-07-22_bp_008_integration_readme.md)（BP-003〜BP-007 完了後）

## 完了メモ

（完了時に記入）
