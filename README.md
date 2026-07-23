# local-app-common-lp-monorepo-boilerplate

一段目（`expo-app-lp-monorepo-boilerplate`）をコピーした**二段目**。写真共通 API と PostHog 輸送層を足す途中の共通骨格（製品ドメインなし）。

| App | Stack | 役割 |
| --- | --- | --- |
| `apps/sp` | Expo + Expo Router | iPhone ローカルアプリ共通骨格（写真・分析は LC で追加） |
| `apps/lp` | Astro | App Store 向け LP の枠（一段目 stub のまま。二段目では触らない） |

**一段目のまま製品へ直コピーしない。** 本二段目を経由する。

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

- `bun run dev` で起動（TTY 必須。IDE 統合ターミナルまたは通常のターミナルで実行）
- `Tab` でプロセス一覧とターミナルのフォーカス切替
- `s` 起動、`x` 停止、`r` 再起動（mprocs デフォルト）
- 参照: [mprocs](https://github.com/pvolok/mprocs)

### Expo Go での確認（`apps/sp`）

1. `bun run dev:sp`（または `bun run dev` の `sp`）を起動
2. Expo Go で `/` が SwiftUI ホーム雛形（「Home」）を表示すること
3. 初回起動時に Drizzle migration が適用され、ゲート通過後に通常ルートが表示されること
4. Analytics は当面 no-op（PostHog 実クライアントは LC-005）

## Scripts（ルート）

| Script | 内容 |
| --- | --- |
| `dev` | mprocs（sp / lp） |
| `dev:sp` / `dev:lp` | 個別起動 |
| `check` | Biome check |
| `typecheck:sp` / `check:sp` | sp 向け typecheck / Biome |
| `test:sp` | sp unit test（`local-date` 等） |

## 二段目で足すもの（予定・LC-001〜）

| 領域 | 内容 | チケット |
| --- | --- | --- |
| 写真 | `expo-image-picker` / `expo-file-system` / `expo-image` と `images.ts` | LC-001〜004 |
| 分析 | PostHog 輸送層（同意前 0・手動 capture のみ） | LC-005 |
| README 仕上げ | 一段目差分・製品コピー手順 | LC-006 |

**含めない:** 製品ドメイン、枚数上限、製品イベント名、`expo-notifications`

## 製品へのコピー（骨子）

詳細は LC-006 で README を仕上げる。概要のみ:

1. 本リポジトリを製品フォルダへコピーする。
   - みずどき: `Project/houseplant-care/`
   - 現場日報: `Project/field-nippo/`
2. 各製品は独立 Git とし、共有パッケージのランタイム結合を残さない。
3. コピー先で下記 rename チェックリストを完了する。

## 複製後 rename チェックリスト

コピー先（製品）で必ず差し替える。

- [ ] ルート / `apps/sp` / `apps/lp` の `package.json` name
- [ ] `apps/sp` の `app.config.ts`（`name`、`slug`、`bundleIdentifier`、scheme）
- [ ] EAS project 仮値（production 確定値は製品指示書で所有者確認）
- [ ] README の製品名と下流 Cursor 指示書リンク
- [ ] Git remote（新規独立リポジトリ）
- [ ] `apps/lp` のサイトタイトル placeholder

## 下流

| 段 | 置き場 | 内容 |
| --- | --- | --- |
| 一段目 | `DemoProject/expo-app-lp-monorepo-boilerplate/`（同梱外） | 汎用 sp+lp 骨格 |
| 二段目（本リポジトリ） | `DemoProject/local-app-common-lp-monorepo-boilerplate/` | 写真共通＋PostHog 輸送層（通知は含めない） |
| 製品 | `Project/houseplant-care/` / `Project/field-nippo/` | 二段目からコピー。ドメインは各 Cursor 指示書 |

## Docs

- [仕様書 v1](./docs/local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](./docs/local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- チケット: `docs/ticket_management/`
- 一段目ドキュメント（参照用）: `docs/monorepo_boilerplate/`
