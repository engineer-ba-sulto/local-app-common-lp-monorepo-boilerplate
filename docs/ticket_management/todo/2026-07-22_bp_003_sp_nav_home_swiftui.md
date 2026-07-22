# BP-003 apps/sp folder・NativeTabs 1タブ・Stack・platform pair

## 完了条件

- [ ] `apps/sp` の folder 構成・NativeTabs 1タブ・Stack・platform pair を整え、`/` が SwiftUI ホーム雛形を表示し、settings 空ルートと not-found がある状態にする。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

Expo Router の routes-only 配置と 1 タブ雛形ナビを実装する。

実装範囲:

- `apps/sp/src/app/**`（`(tabs)` / `(home)` / `settings` / `+not-found`）
- `screens/home`（SwiftUI platform pair: `.ios.tsx` + default `.tsx`）
- settings 空ルート

禁止:

- 製品ドメイン画面・複数タブの本実装
- `src/app` への DB・分析・画面ロジック配置

## 優先度または期限

高。依存: BP-002。見積 0.5 日。Phase 1。**まずは `apps/sp` を動かす主票。**

## 現在の状態

todo（2026-07-22 起票）。BP-002 完了後に着手。

## 関連ファイル

- [仕様書 v1](docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_spec_v1.md)（§4 ディレクトリ構成）
- [Cursor実装指示書 v1](docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/src/app/**`、`apps/sp/src/screens/home`

## 後続チケット

- [BP-006 Analytics no-op・images/haptics](docs/ticket_management/todo/2026-07-22_bp_006_sp_analytics_noop.md)
- [BP-008 統合検証・README](docs/ticket_management/todo/2026-07-22_bp_008_integration_readme.md)（BP-003〜BP-007 完了後）

## 完了メモ

（完了時に記入）
