# BP-002 apps/sp を create expo-app 済みから仕様へ寄せる

## 完了条件

- [ ] `apps/sp` の Bun scripts・ライトモード・依存（Expo UI / Haptics / Reanimated）を仕様へ寄せ、`app.config.ts`・`eas.json` と smoke 確認ができる状態にする。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

`bun create expo-app` 済みの `apps/sp` を、仕様書の Expo / Bun first 設定へ寄せる。

実装範囲:

- `apps/sp/package.json`（`dev` スクリプト含む）
- `app.config.ts`（`userInterfaceStyle: 'light'` 等）
- `eas.json`
- Expo UI（SwiftUI）、Haptics、Reanimated 依存と最低限の smoke

禁止:

- `@expo/ui/jetpack-compose` / Android 専用 UI
- ダークモード実装
- 製品 bundle id / プライバシー URL の推測確定

## 優先度または期限

高。依存: BP-001。見積 0.5〜1 日。Phase 1。

## 現在の状態

todo（2026-07-22 起票）。BP-001 完了後に着手。

## 関連ファイル

- [仕様書 v1](docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/package.json`、`apps/sp/app.config.ts`、`apps/sp/eas.json`

## 後続チケット

- [BP-003 folder・NativeTabs・SwiftUI ホーム](docs/ticket_management/todo/2026-07-22_bp_003_sp_nav_home_swiftui.md)
- [BP-004 local-date + test](docs/ticket_management/todo/2026-07-22_bp_004_sp_local_date.md)
- [BP-005 Drizzle db](docs/ticket_management/todo/2026-07-22_bp_005_sp_drizzle_db.md)

## 完了メモ

（完了時に記入）
