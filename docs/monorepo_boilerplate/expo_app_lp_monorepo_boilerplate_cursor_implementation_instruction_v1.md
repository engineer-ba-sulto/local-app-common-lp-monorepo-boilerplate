# Expo App + LP モノレポ Boilerplate Cursor実装指示書 v1

- 作成日: 2026-07-22
- 実装先: `DemoProject/expo-app-lp-monorepo-boilerplate/`
- 所有者用意: 仕様書 §2.1 の `bun init` / `bun create` 済み。エージェントはそれらを再実行しない
- 状態: BP-001〜BP-007 done・次は BP-008
- 正本仕様: [仕様書 v1](./expo_app_lp_monorepo_boilerplate_spec_v1.md)
- 実装チケット: 本書「11. 実装チケット一覧」（BP-001〜BP-008）
- 下流: 二段目（共通）→ みずどき / 現場日報（同梱外）
- 進捗管理: `docs/ticket_management/` が正本。「11.」は索引。親 `Workspace/ticket_management/` へは作らない

## 1. Cursorへの最初の指示

この文書を最初から最後まで読み、チケット一覧の順番で1チケットずつ実装すること。

各チケット開始時に次を行う。

1. 依存チケットが完了しているか確認する。
2. 変更予定ファイルと実装方針を短く提示する。
3. 不明点が仕様書で解決できる場合は質問せず仕様書に従う。
4. 製品ドメイン（植物・日報）、本番 bundle id、プライバシーURLを推測で確定しない。
5. 実装後に対象テスト、typecheck、Biome check を実行する。
6. 変更ファイル、確認結果、残課題を報告する。

複数チケットを一括実装しない。**まずは `apps/sp` を動かす。`apps/lp` は stub まで。**

## 2. ワークスペース境界

**前提:** 所有者が仕様書 §2.1 の手順を実行済みで、単独ワークスペースとして開いている。

```bash
mkdir expo-app-lp-monorepo-boilerplate
cd expo-app-lp-monorepo-boilerplate
bun init
bun create cloudflare@latest apps/lp
bun create expo-app ./apps/sp
```

（作業場所は `DemoProject/` 配下）

エージェントは次を行わない。

- `mkdir` / `bun init` / `bun create cloudflare@latest` / `bun create expo-app` の再実行
- Git init / remote 設定（所有者が行う場合はそれに従う）
- 親ワークスペース `Engineer-BA-Sulto-Cursor` からの `DemoProject/` 配下の依存インストール・ビルド・Git 操作

実装は用意済みフォルダを単独ワークスペースで開いた状態でのみ行う。create 済み成果を仕様へ寄せるのが BP-001 以降。本指示書と仕様書をプロジェクト側へ取り込んでから BP-001 に進む。

ルート・`apps/sp`・`apps/lp` のいずれかが未作成・未オープンの場合は、実装を開始せず所有者へ用意を依頼して停止する。
## 3. 正本と優先順位

1. [仕様書 v1](./expo_app_lp_monorepo_boilerplate_spec_v1.md)
2. 本指示書のチケット一覧
3. Expo / Drizzle / Astro の公式ドキュメント（実装直前の SDK 確認）

衝突時は仕様書の「入れない」を優先する。最新のユーザー指示が最優先。

## 4. 実装ゴール

コピーして使える **Bun workspaces モノレポ**を作る。

```text
apps/sp = Expo iPhone ローカルアプリの薄い骨格（今回の主対象）
apps/lp = Astro LP の枠（stub のみ）
```

完成時（ボイラープレート完了）に次ができること。

- ルートで `bun install` が通る（`bunfig.toml` の isolated linker）
- `bun run typecheck:sp` / `bun run check` / `bun run test:sp` が通る
- `bun run dev` で mprocs が起動し、sp / lp を切り替えられる
- Expo Go で `apps/sp` の `/` が SwiftUI ホーム雛形を表示する
- Drizzle migration gate 後に通常ルートが表示される
- `AnalyticsClient` は no-op で送信しない
- `apps/lp` に Astro stub と README がある（見た目完成は不要）
- README にコピー手順・rename・mprocs 操作がある

## 5. 実装ルール

- JS ランタイムは **Bun**。`npm` / `pnpm` / `yarn` / `npx` は使わない。
- ロックファイルは `bun.lock`。
- ルートに `bunfig.toml`（`[install] linker = "isolated"`）を置く。four-app と同型。
- ルートに `mprocs` を devDependency で入れ、`mprocs.yaml` と `"dev": "mprocs"` を置く。four-app を sp/lp に縮めた形。
- workspaces は `apps/*`。初回は `packages/*` を必須にしない。
- formatter / linter は Biome。
- `apps/sp` は Bun first。Expo / EAS / RN で Bun 由来の問題が出た場合は Expo 公式 CLI に従い、README に逃げ道を書く。
- ダークモードは実装しない。`userInterfaceStyle: 'light'`。
- `@expo/ui/jetpack-compose` と Android 専用 UI を入れない。
- api / web アプリは作らない（four-app とは別物）。
- 製品スキーマ・通知・PostHog 実接続・共有・課金を入れない。

## 6. 技術スタック（再掲）

| 領域 | 採用 |
| --- | --- |
| モノレポ | Bun workspaces、`bunfig.toml`（isolated）、mprocs |
| sp | Expo, Expo Router, TypeScript, `@expo/ui` SwiftUI |
| sp DB | expo-sqlite + Drizzle（空箱〜最小 settings） |
| sp 日付 | date-fns + `local-date` |
| sp 分析 | AnalyticsClient no-op |
| lp | Astro stub |
| lint | Biome |

## 7. 実装フェーズ

| Phase | 内容 | 完了条件 |
| --- | --- | --- |
| 0 | ルート workspaces・`bunfig.toml`・Biome・mprocs・README 骨子 | `bun install` 成功、`bunfig.toml` / `mprocs.yaml` あり |
| 1 | `apps/sp` Expo・folder・1タブ・SwiftUI・Haptics・Reanimated | `/` が表示される |
| 2 | `apps/sp` 日付・Drizzle 空箱・Analytics no-op・settings 空 | typecheck / test / migration gate |
| 3 | `apps/lp` Astro stub | `dev:lp` または build が最低限動く |
| 4 | 統合検証・README 完成 | リリースゲート（ボイラープレート） |

## 8. Phase 0で確認する未決値

実装を止めない項目（TestFlight / 本番前に所有者確認）:

- iOS minimum deployment target
- production bundle identifier（製品ごと）
- EAS / App Store Connect
- LP 公開ドメインと Cloudflare 配信方式

実装開始前の必須前提（未充足なら停止）:

- [ ] 所有者が仕様書 §2.1（`bun init` / `create cloudflare` / `create expo-app`）を実行済み
- [ ] `apps/sp/` と `apps/lp/` が存在する
- [ ] 当該パスを単独ワークスペースとして開いている

## 9. 完了報告形式

```markdown
## 完了したチケット

- ID:
- 実装内容:

## 変更ファイル

- path: 変更理由

## 検証

- command: result
- 実機確認: result / 未実施理由

## 正本との差分

- なし / 内容

## 次のチケット

- ID:
```

## 10. ボイラープレート完了ゲート

- [ ] `bun install` 成功（`bunfig.toml` の isolated linker）
- [ ] `bunfig.toml` と `mprocs.yaml` がルートにある
- [ ] `bun run dev` で mprocs が起動する（sp / lp）
- [ ] `bun run typecheck:sp` 成功
- [ ] `bun run check` 成功
- [ ] `bun run test:sp` 成功（local-date 等）
- [ ] Expo Go で SwiftUI ホーム雛形
- [ ] migration 適用後にルート表示
- [ ] Analytics no-op（送信なし）
- [ ] `apps/lp` stub と README 存在
- [ ] README にコピー・rename・mprocs・下流指示書リンク
- [ ] 製品ドメインコードが混入していない

## 11. 実装チケット一覧

進捗の正本は `docs/ticket_management/todo/`（完了後は `done/YYYY-MM-DD/`）。本節の「状態」欄は索引として同期する。親 `Workspace/ticket_management/` へ個別チケットは作らない。

### 運用

- ID順。依存未完了へ進まない。
- 1回の Cursor 作業では原則 1 チケット。
- 状態は `todo | in_progress | blocked | done`（チケット本文と本節を同期）。
- 想定合計 1.5〜2.5 営業日。
- **まずは `apps/sp`。`apps/lp` は stub まで。**
- BP-001 開始前に、§2.1 の create 済みフォルダが単独WSで開かれていること。
- チケット命名: `docs/ticket_management/todo/YYYY-MM-DD_bp_00N_<task_name>.md`（`.cursor/rules/ticket-management.mdc`）。

### 一覧表

チケット本文: `docs/ticket_management/todo/2026-07-22_bp_00N_*.md`

| ID | Phase | チケット | 依存 | 見積 | 完了判定 | 状態 |
| --- | ---: | --- | --- | ---: | --- | --- |
| [BP-001](../ticket_management/done/2026-07-22/2026-07-22_bp_001_root_workspaces_biome_mprocs.md) | 0 | ルート Bun workspaces・`bunfig.toml`・Biome・mprocs・README骨子（`bun init` 済みを寄せる） | 所有者 §2.1 完了 | 0.5日 | workspaces、`bunfig.toml`（isolated）、`mprocs.yaml`、`"dev": "mprocs"`、Biome、`bun install` 成功 | done |
| [BP-002](../ticket_management/done/2026-07-23/2026-07-22_bp_002_sp_expo_align.md) | 1 | `apps/sp` を create expo-app 済みから仕様へ寄せる（Bun scripts・ライトモード・依存） | BP-001 | 0.5〜1日 | `app.config.ts`、`eas.json`、Expo UI / Haptics / Reanimated smoke | done |
| [BP-003](../ticket_management/done/2026-07-23/2026-07-22_bp_003_sp_nav_home_swiftui.md) | 1 | `apps/sp` folder・NativeTabs 1タブ・Stack・platform pair | BP-002 | 0.5日 | `/` が SwiftUI ホーム、settings 空ルート、not-found | done |
| [BP-004](../ticket_management/done/2026-07-23/2026-07-22_bp_004_sp_local_date.md) | 2 | `apps/sp` local-date + unit test | BP-002 | 0.5日 | `YYYY-MM-DD` 境界 test 成功 | done |
| [BP-005](../ticket_management/done/2026-07-23/2026-07-22_bp_005_sp_drizzle_db.md) | 2 | `apps/sp` Drizzle db・Kit・migration bundle・最小 schema | BP-002 | 0.5〜1日 | 空DBへ migration 後にルート表示 | done |
| [BP-006](../ticket_management/done/2026-07-23/2026-07-22_bp_006_sp_analytics_noop.md) | 2 | `apps/sp` AnalyticsClient no-op・images/haptics 枠 | BP-003 | 0.5日 | no-op のみ。PostHog SDK 未接続 | done |
| [BP-007](../ticket_management/done/2026-07-23/2026-07-22_bp_007_lp_astro_stub.md) | 3 | `apps/lp` を create cloudflare 済みから stub・README へ寄せる | BP-001 | 0.5日 | placeholder ページと「後続実装」README | done |
| [BP-008](../ticket_management/todo/2026-07-22_bp_008_integration_readme.md) | 4 | 統合検証・コピー手順 README 完成 | BP-003〜BP-007 | 0.5日 | 完了ゲートを満たす | todo |

### 主な実装対象

| ID | 主な対象 |
| --- | --- |
| BP-001 | ルート `package.json`、`bun.lock`、`bunfig.toml`、`mprocs.yaml`、`mprocs` 依存、`biome.json`、scripts（`dev` / `dev:sp` / `dev:lp`） |
| BP-002 | `apps/sp/package.json`（`dev` スクリプト含む）、`app.config.ts`、`eas.json`、依存 |
| BP-003 | `apps/sp/src/app/**`、`screens/home`、platform pair |
| BP-004 | `utils/local-date.ts`、test |
| BP-005 | `drizzle/db.ts`、schema、migrations、bootstrap |
| BP-006 | `utils/analytics-client.ts`、`images.ts`、`haptics.ts` |
| BP-007 | `apps/lp/**` stub（`dev` スクリプト） |
| BP-008 | README コピー手順、rename、mprocs 操作、下流リンク |

### 依存関係

```text
BP-001
├── BP-002 ── BP-003 ── BP-006
│        ├── BP-004
│        └── BP-005
├── BP-007
└── BP-003〜BP-007 ── BP-008
```

本書の完了ゲート（「10.」）と一覧の完了判定の両方を満たして BP-008 を done にする。

## 12. 完了後の次工程

1. **二段目** `local-app-common-lp-monorepo-boilerplate` パックの Cursor 指示書（LC-000〜LC-006）に従う（写真共通＋PostHog 輸送層。通知は二段目に含めない）。
2. 二段目から `Project/houseplant-care/` へコピーし、みずどきパックの Cursor 指示書 v2 に従う。
3. 同様に `Project/field-nippo/` へコピーし、現場日報パックの Cursor 指示書 v1 に従う。
4. 各製品の `apps/lp` 本実装は、アプリ MVP 公開判断の後でもよい（HC-016 / FN-013）。

一段目のまま製品へ直コピーしない（共通メディア層の二重実装を避ける）。
