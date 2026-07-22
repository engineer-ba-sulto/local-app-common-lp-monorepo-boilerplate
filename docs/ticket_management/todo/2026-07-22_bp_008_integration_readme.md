# BP-008 統合検証・コピー手順 README 完成

## 完了条件

- [ ] 指示書「10. ボイラープレート完了ゲート」と BP-001〜BP-007 の完了判定を満たし、README にコピー・rename・mprocs・下流指示書リンクを記載する。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

一段目ボイラープレートの統合検証と README 完成。

検証・仕上げ範囲:

- `bun install` / `bun run typecheck:sp` / `bun run check` / `bun run test:sp`
- `bun run dev`（mprocs で sp / lp）
- Expo Go で SwiftUI ホーム雛形、migration 後ルート表示、Analytics no-op
- README: コピー手順・rename・mprocs 操作・下流（二段目 LC / みずどき / 現場日報）リンク
- 製品ドメインコード未混入の確認

## 優先度または期限

高（締め）。依存: BP-003〜BP-007。見積 0.5 日。Phase 4。

## 現在の状態

todo（2026-07-22 起票）。BP-003〜BP-007 完了後に着手。

## 関連ファイル

- [仕様書 v1](docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)（§10 完了ゲート）
- 主な対象: `README.md`、統合検証結果

## 後続チケット

- 二段目 `local-app-common-lp-monorepo-boilerplate`（LC-000〜LC-006）の Cursor 指示書に従う（本リポジトリ外・別パック）。一段目のまま製品へ直コピーしない。

## 完了メモ

（完了時に記入）
