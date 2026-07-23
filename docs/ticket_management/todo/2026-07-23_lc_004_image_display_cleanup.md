# LC-004 表示 URI 契約・placeholder・未参照 cleanup

## 完了条件

- [ ] 表示用ヘルパと参照セット渡し cleanup（失敗は best-effort）を実装し、製品 UI なしで契約を満たす。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

`images.ts` の display / cleanup 部分を実装する。

実装範囲:

- `expo-image` 向け表示用 URI / placeholder 契約ヘルパ
- 参照セットを渡す未参照 cleanup（失敗でアプリを落とさない）

禁止:

- 製品画面・製品ドメインの混入
- cleanup 失敗によるクラッシュ

## 優先度または期限

高。依存: LC-003。見積 0.25〜0.5 日。Phase 2。

## 現在の状態

todo（2026-07-23 起票）。

## 関連ファイル

- [仕様書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/src/utils/images.ts`（display / cleanup）

## 後続チケット

- [LC-006 統合検証・README](./2026-07-23_lc_006_integration_readme.md)（LC-000〜LC-005 完了後）

## 完了メモ

（実装完了時に記入）
