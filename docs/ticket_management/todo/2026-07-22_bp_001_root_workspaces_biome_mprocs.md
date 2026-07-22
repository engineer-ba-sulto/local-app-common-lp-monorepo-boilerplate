# BP-001 ルート Bun workspaces・bunfig・Biome・mprocs・README骨子

## 完了条件

- [ ] ルートに Bun workspaces（`apps/*`）、`bunfig.toml`（`linker = "isolated"`）、`mprocs.yaml`、`"dev": "mprocs"`、Biome、scripts（`dev` / `dev:sp` / `dev:lp`）を整え、`bun install` が成功する。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

所有者の `bun init` 済みルートを、仕様書のモノレポ骨格へ寄せる。

実装範囲:

- ルート `package.json` の `workspaces: ["apps/*"]`
- `bunfig.toml`（`[install] linker = "isolated"`）
- `mprocs` を devDependency に追加し、`mprocs.yaml`（sp / lp）と `"dev": "mprocs"`
- ルート Biome（`biome.json`）と `check` 系 scripts
- README 骨子（詳細コピー手順は BP-008）

禁止:

- `bun init` / `bun create` の再実行
- `packages/*` の必須化
- 製品ドメインコードの混入

## 優先度または期限

高。依存なし（所有者 §2.1 完了前提）。見積 0.5 日。Phase 0。

## 現在の状態

todo（2026-07-22 起票）。コード未着手。

## 関連ファイル

- [仕様書 v1](docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `package.json`、`bun.lock`、`bunfig.toml`、`mprocs.yaml`、`biome.json`、`README.md`

## 後続チケット

- [BP-002 sp Expo 寄せ](docs/ticket_management/todo/2026-07-22_bp_002_sp_expo_align.md)
- [BP-007 lp Astro stub](docs/ticket_management/todo/2026-07-22_bp_007_lp_astro_stub.md)

## 完了メモ

（完了時に記入）
