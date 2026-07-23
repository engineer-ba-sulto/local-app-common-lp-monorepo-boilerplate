# BP-008 統合検証・コピー手順 README 完成

## 完了条件

- [x] 指示書「10. ボイラープレート完了ゲート」と BP-001〜BP-007 の完了判定を満たし、README にコピー・rename・mprocs・下流指示書リンクを記載する。

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

done（2026-07-23）。一段目ボイラープレート完了。

## 関連ファイル

- [仕様書 v1](../../../monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../../monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)（§10 完了ゲート）
- 主な対象: [`README.md`](../../../../README.md)、統合検証結果

## 後続チケット

- 二段目 `local-app-common-lp-monorepo-boilerplate`（LC-000〜LC-006）の Cursor 指示書に従う（本リポジトリ外・別パック）。一段目のまま製品へ直コピーしない。
- 本リポジトリ内の追加 `todo` は作成しない（一段目完了。後続は別パック）。

## 完了メモ

### 検証

| 項目 | 結果 |
| --- | --- |
| `bun install` | 成功（isolated linker） |
| `bunfig.toml` / `mprocs.yaml` | ルートに存在 |
| `bun run typecheck:sp` | 成功 |
| `bun run check` | 成功 |
| `bun run test:sp` | 12 pass |
| `bun run dev`（mprocs） | バイナリ 0.9.6・`mprocs.yaml` 確認。非 TTY では起動不可のため、個別 `dev:sp` / `dev:lp` で代替確認 |
| `dev:sp` | Metro `localhost:8081` |
| `dev:lp` | Astro `localhost:4321` |
| SwiftUI ホーム | `home-screen.ios.tsx` 配線確認（実機 Expo Go は所有者確認推奨） |
| migration gate | `useAppBootstrap` + `_layout` ゲート確認 |
| Analytics no-op | `NoopAnalyticsClient`・PostHog SDK 未導入 |
| 製品ドメイン未混入 | schema は `app_settings` KV のみ。ドメイン文言・PostHog SDK・notifications なし（コメント例示のみ） |

### README

- コピー手順・rename チェックリスト・mprocs 操作・下流（二段目 / みずどき / 現場日報）リンクを記載。

### 次の候補

- 二段目パック `local-app-common-lp-monorepo-boilerplate`（LC-000〜LC-006）。本リポジトリ外。
