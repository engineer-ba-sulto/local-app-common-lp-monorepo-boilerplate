# LC-001 expo-image-picker / file-system / image 導入と config plugin

## 完了条件

- [ ] Expo SDK 互換で `expo-image-picker` / `expo-file-system` / `expo-image` を導入し、汎用日本語の photos/camera 権限文言を config plugin に設定する。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

写真共通層の依存導入と config plugin 設定。

実装範囲:

- `apps/sp/package.json` への依存追加（SDK 互換版固定）
- `app.config.ts` の image-picker plugin（汎用日本語権限文言）

禁止:

- `expo-camera` / `expo-notifications`
- 製品専用の権限文言・ドメイン文言の確定
- `apps/lp` の改修

## 優先度または期限

高。依存: LC-000。見積 0.25〜0.5 日。Phase 1。

## 現在の状態

todo（2026-07-23 起票）。

## 関連ファイル

- [仕様書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/package.json`、`app.config.ts` plugin

## 後続チケット

- [LC-002 カメラ／ライブラリ選択 API](./2026-07-23_lc_002_image_picker_api.md)

## 完了メモ

（実装完了時に記入）
