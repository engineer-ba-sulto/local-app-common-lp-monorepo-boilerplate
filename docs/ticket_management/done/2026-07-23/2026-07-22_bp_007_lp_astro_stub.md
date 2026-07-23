# BP-007 apps/lp を create cloudflare 済みから stub・README へ寄せる

## 完了条件

- [x] `apps/lp` に Astro stub（placeholder ページ）と「後続実装」README を整え、`dev:lp` または build が最低限動く状態にする。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

`bun create cloudflare` 済みの `apps/lp` を、LP 枠（stub）へ寄せる。見た目完成は不要。

実装範囲:

- placeholder ページ（例: `src/pages/index.astro`）
- `apps/lp/README.md`（後続で製品 LP を実装する旨）
- `dev` スクリプトとルート `dev:lp` 連携

禁止:

- 製品コピー・ストアスクショ本実装・課金説明の確定文
- LP 見た目の完成を完了判定に含めること

## 優先度または期限

中。依存: BP-001。見積 0.5 日。Phase 3。**`apps/sp` 優先。本チケットは stub まで。**

## 現在の状態

done（2026-07-23）。

## 関連ファイル

- [仕様書 v1](../../../monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_spec_v1.md)（§3.3）
- [Cursor実装指示書 v1](../../../monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/lp/**`

## 後続チケット

- [BP-008 統合検証・README](../../todo/2026-07-22_bp_008_integration_readme.md)（BP-003〜BP-007 完了後）

## 完了メモ

- `src/pages/index.astro` を「LP Placeholder」stub に差し替え（製品コピーなし）。
- `apps/lp/README.md` を「後続で製品 LP を実装」案内に書き換え。
- `dev` / ルート `dev:lp` / mprocs `lp` は BP-001 時点で連携済み。変更なし。
- 検証: `bun --cwd apps/lp run build` 成功、`bun run check` 成功、`bun run dev:lp` で `localhost:4321` に placeholder 表示。
