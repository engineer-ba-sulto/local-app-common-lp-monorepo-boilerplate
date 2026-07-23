# LC-003 一時 URI → documents 配下コピー保存 API

## 完了条件

- [ ] `subdir` 指定で一時 URI を documents 配下へコピーし、失敗時に中途ファイルを残しにくい保存 API を実装する。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

`images.ts` の copy/save 部分を実装する。

実装範囲:

- `apps/sp/src/utils/images.ts` のコピー保存 API
- `documents/<subdir>/` への保存とパス返却
- 失敗時の中途ファイル掃除（残しにくい設計）

禁止:

- 製品固定の `subdir` 名・枚数上限
- 製品ドメイン schema の混入

## 優先度または期限

高。依存: LC-002。見積 0.25〜0.5 日。Phase 2。

## 現在の状態

todo（2026-07-23 起票）。

## 関連ファイル

- [仕様書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/src/utils/images.ts`（copy/save）

## 後続チケット

- [LC-004 表示 URI・cleanup](./2026-07-23_lc_004_image_display_cleanup.md)

## 完了メモ

（実装完了時に記入）
