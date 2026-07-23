# LC-006 統合検証・README（一段目差分・製品コピー手順）

## 完了条件

- [ ] 指示書「10. 二段目完了ゲート」と LC-000〜LC-005 の完了判定を満たし、README に一段目差分・製品コピー手順を記載する。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

二段目ボイラープレートの統合検証と README 仕上げ。

検証・仕上げ範囲:

- 一段目完了ゲートの維持（install / typecheck / check / test / mprocs）
- 写真依存・`images.ts` 契約・キャンセル／拒否非クラッシュ
- PostHog 同意前 0・同意後手動 capture のみ
- `expo-notifications` 非依存・製品ドメイン／枚数上限／製品イベント一覧なし
- README: 一段目差分・製品（みずどき / 現場日報）へのコピー手順

## 優先度または期限

高（締め）。依存: LC-000〜LC-005。見積 0.25 日。Phase 4。

## 現在の状態

todo（2026-07-23 起票）。

## 関連ファイル

- [仕様書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)（§10 完了ゲート）
- 主な対象: `README.md`、統合検証結果

## 後続チケット

- みずどき: `Project/houseplant-care/` へコピーし Cursor 指示書 v2 に従う（本リポジトリ外）
- 現場日報: `Project/field-nippo/` へコピーし Cursor 指示書 v1 に従う（本リポジトリ外）
- 本リポジトリ内の追加 `todo` は LC-006 完了時に不要なら作成しない

## 完了メモ

（実装完了時に記入）
