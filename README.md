# expo-app-lp-monorepo-boilerplate

Expo（`apps/sp`）+ Astro LP（`apps/lp`）向けの Bun workspaces モノレポ骨子。

| App | Stack | 役割 |
| --- | --- | --- |
| `apps/sp` | Expo + Expo Router | iPhone ローカルアプリの薄い骨格 |
| `apps/lp` | Astro | App Store 向け LP の枠（stub） |

## Setup

**前提:** [Bun](https://bun.com) 1.3+

```bash
bun install
```

ルートの `bunfig.toml` で `linker = "isolated"` を使う。

## ローカル開発

```bash
# sp / lp を mprocs で並列起動
bun run dev

# 個別起動
bun run dev:sp
bun run dev:lp
```

### mprocs 操作

- `bun run dev` で起動
- `Tab` でプロセス一覧とターミナルのフォーカス切替
- `s` 起動、`x` 停止、`r` 再起動（mprocs デフォルト）
- 参照: [mprocs](https://github.com/pvolok/mprocs)

## Scripts（ルート）

| Script | 内容 |
| --- | --- |
| `dev` | mprocs（sp / lp） |
| `dev:sp` / `dev:lp` | 個別起動 |
| `check` | Biome check |
| `typecheck:sp` / `check:sp` | sp 向け typecheck / Biome |
| `test:sp` | sp unit test（BP-004 以降） |

## コピー・rename

詳細なコピー手順・プロジェクト rename・下流指示書リンクは BP-008 で README を完成させる。

## Docs

- [仕様書 v1](./docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](./docs/monorepo_boilerplate/expo_app_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
