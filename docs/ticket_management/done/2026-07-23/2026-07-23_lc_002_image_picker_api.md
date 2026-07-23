# LC-002 カメラ／ライブラリ選択 API（キャンセル・拒否は通常結果）

## 完了条件

- [x] 選択成功・キャンセル・権限拒否を型で表現し、`expo-camera` なしでカメラ／ライブラリ選択 API を提供する。

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

done（2026-07-23）。

## 関連ファイル

- [仕様書 v1](../../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/src/utils/images.ts`（picker）

## 後続チケット

- [LC-003 一時 URI コピー保存 API](../../todo/2026-07-23_lc_003_image_copy_save.md)

## 完了メモ

### 実装内容

- `ImagePickResult`（`success` / `canceled` / `denied`）を追加
- `pickImageFromLibrary` / `pickImageFromCamera`（`expo-image-picker`、`expo-camera` なし）
- 権限未許可は通常結果。iOS の launch 時権限 reject も `denied` に吸収
- 静止画1枚固定（`mediaTypes: ["images"]`、複数選択なし）
- 単体テスト: 権限拒否・キャンセル・成功・権限例外・非権限例外の再 throw

### 検証

| 項目 | 結果 |
| --- | --- |
| `bun run typecheck:sp` | 成功 |
| `bun run check:sp` | 成功（29 files） |
| `bun run test:sp` | 成功（23 pass） |
| 実機確認 | 未実施（権限ダイアログは製品コピー後） |

### 次の候補

- [LC-003](../../todo/2026-07-23_lc_003_image_copy_save.md) 一時 URI → documents 配下コピー保存 API
