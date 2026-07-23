# LC-002 カメラ／ライブラリ選択 API（キャンセル・拒否は通常結果）

## 完了条件

- [ ] 選択成功・キャンセル・権限拒否を型で表現し、`expo-camera` なしでカメラ／ライブラリ選択 API を提供する。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

`images.ts` の picker 部分を実装する。キャンセル・権限拒否は例外ではなく通常結果。

実装範囲:

- `apps/sp/src/utils/images.ts` の選択 API
- 成功 / キャンセル / 拒否の結果型

禁止:

- `expo-camera` の追加
- 枚数上限・製品ドメインの混入
- クラッシュする例外扱いでのキャンセル／拒否

## 優先度または期限

高。依存: LC-001。見積 0.25〜0.5 日。Phase 2。

## 現在の状態

todo（2026-07-23 起票）。

## 関連ファイル

- [仕様書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/src/utils/images.ts`（picker）

## 後続チケット

- [LC-003 一時 URI コピー保存 API](./2026-07-23_lc_003_image_copy_save.md)

## 完了メモ

（実装完了時に記入）
