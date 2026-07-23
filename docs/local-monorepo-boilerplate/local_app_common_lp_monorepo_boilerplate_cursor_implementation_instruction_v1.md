# Local App Common + LP モノレポ Boilerplate Cursor実装指示書 v1（二段目）

- 作成日: 2026-07-22
- 実装先: `DemoProject/local-app-common-lp-monorepo-boilerplate/`
- 所有者用意: 一段目完成物の**コピー済み**。エージェントはコピー / `bun init` / `bun create` を再実行しない
- 状態: 文書作成済み・**LC-000〜LC-004 done**（一段目 BP-008 完了後）
- 正本仕様: [仕様書 v1](./local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- 実装チケット: 本書「11. 実装チケット一覧」（LC-000〜LC-006）
- 上流: 一段目 `expo-app-lp-monorepo-boilerplate`（同梱外）
- 下流: みずどき / 現場日報（同梱外）
- 進捗管理: `docs/ticket_management/` が正本。「11.」は索引。親 `Workspace/ticket_management/` へは作らない

## 1. Cursorへの最初の指示

この文書を最初から最後まで読み、チケット一覧の順番で1チケットずつ実装すること。

各チケット開始時に次を行う。

1. 依存チケットが完了しているか確認する。
2. 変更予定ファイルと実装方針を短く提示する。
3. 不明点が仕様書で解決できる場合は質問せず仕様書に従う。
4. 製品ドメイン（植物・日報）、枚数上限、製品イベント名、本番 bundle id を推測で確定しない。
5. 実装後に対象テスト、typecheck、Biome check を実行する。
6. 変更ファイル、確認結果、残課題を報告する。

複数チケットを一括実装しない。`apps/lp` は触らない（一段目 stub のまま）。**`expo-notifications` は入れない。**

## 2. ワークスペース境界

**前提:** 所有者が一段目を本実装先へコピーし、単独ワークスペースとして開いている。

```bash
# DemoProject/ 配下の例
cp -R expo-app-lp-monorepo-boilerplate local-app-common-lp-monorepo-boilerplate
cd local-app-common-lp-monorepo-boilerplate
```

エージェントは次を行わない。

- フォルダの新規作成・一段目からのコピー
- `bun init` / `bun create`
- Git init / remote 設定（所有者が行う場合はそれに従う）
- 親ワークスペースからの `DemoProject/` 配下操作

コピー未完了・未オープンの場合は実装を開始せず所有者へ依頼して停止する。

## 3. 正本と優先順位

1. [仕様書 v1](./local_app_common_lp_monorepo_boilerplate_spec_v1.md)
2. 本指示書のチケット一覧
3. 一段目仕様（骨格の前提）
4. Expo / PostHog 公式（実装直前の SDK 互換確認）

衝突時は本仕様の「含めない」を優先する。最新のユーザー指示が最優先。

## 4. 実装ゴール

一段目の上に、**製品画面なし**の写真共通層と PostHog 輸送層を足す。

完成時に次ができること。

- ルートで `bun install` / `typecheck:sp` / `check` / `test:sp` が通る
- `expo-image-picker` / `expo-file-system` / `expo-image` が入っている
- `images.ts` で選択・コピー保存・表示用 URI・未参照 cleanup が呼べる
- キャンセル・権限拒否が通常分岐として扱える（クラッシュしない）
- `PostHogAnalyticsClient` があり、同意前は送信 0、同意後は手動 `capture` のみ
- 製品イベント名・通知ロジック・製品ドメインが混入していない
- README に二段目の差分と製品へのコピー手順がある

## 5. 実装ルール

- JS ランタイムは **Bun**。`npm` / `pnpm` / `yarn` / `npx` は使わない（Expo 公式が `bunx expo install` を求める場合はそれに従い README に書く）。
- 依存は Expo SDK 互換版で固定する。
- `expo-camera` / `expo-notifications` は追加しない。
- 枚数上限・ドメイン schema・製品イベント一覧・製品文言は入れない。
- PostHog の Session Replay / 自動収集 / Feature Flags / `identify` は入れない。
- ダークモードは一段目どおり light only。
- api / web アプリは作らない。

## 6. 技術スタック（二段目で足す分）

| 領域 | 採用 |
| --- | --- |
| 選択 | `expo-image-picker` |
| 保存 | `expo-file-system` |
| 表示 | `expo-image` |
| 写真 API | `apps/sp/src/utils/images.ts` |
| 分析 | PostHog RN SDK + `AnalyticsClient`（Noop / PostHog・同意切替） |

## 7. 実装フェーズ

| Phase | 内容 | 完了条件 |
| --- | --- | --- |
| 0 | コピー確認・rename・smoke | LC-000 |
| 1 | 写真依存・config plugin | LC-001 |
| 2 | 写真 API | LC-002〜LC-004 |
| 3 | PostHog 輸送層 | LC-005 |
| 4 | 検証・README | LC-006 |

## 8. Phase 0で確認する未決値

実装を止めない項目（製品側で差し替え）:

- 製品専用の権限文言・photos サブディレクトリ名
- 枚数上限
- 製品イベント名・プロパティ
- 本番 PostHog Project / API Key

実装開始前の必須前提（未充足なら停止）:

- [ ] 一段目 BP-008 完了
- [ ] 所有者が本実装先へ一段目をコピー済み
- [ ] 単独ワークスペースで開いている

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

## 10. 二段目完了ゲート

- [ ] 一段目の完了ゲートを維持（install / typecheck / check / test / mprocs）
- [ ] `expo-image-picker` / `expo-file-system` / `expo-image` 導入済み
- [ ] `images.ts` に選択・保存・表示契約・cleanup がある
- [ ] キャンセル・権限拒否でクラッシュしない
- [ ] PostHog クライアントがあり、同意前 0・同意後手動 capture のみ
- [ ] `expo-notifications` が依存に無い
- [ ] 製品ドメイン・枚数上限・製品イベント一覧が無い
- [ ] README に一段目差分・製品コピー手順がある

## 11. 実装チケット一覧

進捗の正本は `docs/ticket_management/todo/`（完了後は `done/YYYY-MM-DD/`）。本節の「状態」欄は索引として同期する。親 `Workspace/ticket_management/` へ個別チケットは作らない。

### 運用

- ID順。依存未完了へ進まない。
- 1回の Cursor 作業では原則 1 チケット。
- 状態は `todo | in_progress | blocked | done`（チケット本文と本節を同期）。
- 想定合計 1.5〜2 営業日。
- `apps/lp` は触らない。`expo-notifications` は入れない。
- チケット命名: `docs/ticket_management/todo/YYYY-MM-DD_lc_00N_<task_name>.md`（`.cursor/rules/ticket-management.mdc`）。

### 一覧表

チケット本文: `docs/ticket_management/todo/2026-07-23_lc_00N_*.md`

| ID | Phase | チケット | 依存 | 見積 | 完了判定 | 状態 |
| --- | ---: | --- | --- | ---: | --- | --- |
| [LC-000](../ticket_management/done/2026-07-23/2026-07-23_lc_000_copy_rename_smoke.md) | 0 | 一段目コピー確認・rename・smoke | 一段目 BP-008 | 0.25日 | 本フォルダで install / typecheck / `/` 表示。名前が common 向けに整理済み | done |
| [LC-001](../ticket_management/done/2026-07-23/2026-07-23_lc_001_image_deps_plugins.md) | 1 | `expo-image-picker` / `expo-file-system` / `expo-image` 導入と config plugin | LC-000 | 0.25〜0.5日 | SDK 互換で install、汎用日本語の photos/camera 権限文言 | done |
| [LC-002](../ticket_management/done/2026-07-23/2026-07-23_lc_002_image_picker_api.md) | 2 | カメラ／ライブラリ選択 API（キャンセル・拒否は通常結果） | LC-001 | 0.25〜0.5日 | 選択成功・キャンセル・拒否を型で表現。`expo-camera` なし | done |
| [LC-003](../ticket_management/done/2026-07-23/2026-07-23_lc_003_image_copy_save.md) | 2 | 一時 URI → documents 配下コピー保存 API | LC-002 | 0.25〜0.5日 | `subdir` 指定でコピー、失敗時に中途ファイルを残しにくい | done |
| [LC-004](../ticket_management/done/2026-07-23/2026-07-23_lc_004_image_display_cleanup.md) | 2 | 表示 URI 契約・placeholder・未参照 cleanup | LC-003 | 0.25〜0.5日 | 表示用ヘルパと参照セット渡し cleanup（失敗は best-effort） | done |
| [LC-005](../ticket_management/todo/2026-07-23_lc_005_posthog_analytics_client.md) | 3 | PostHog SDK・`PostHogAnalyticsClient`・同意切替（製品イベントなし） | LC-000 | 0.5日 | 同意前0、同意後手動 capture、自動収集なし、キーはプレースホルダ | todo |
| [LC-006](../ticket_management/todo/2026-07-23_lc_006_integration_readme.md) | 4 | 統合検証・README（一段目差分・製品コピー手順） | LC-000〜LC-005 | 0.25日 | 完了ゲートを満たす | todo |

### 主な実装対象

| ID | 主な対象 |
| --- | --- |
| LC-000 | ルート / `apps/sp` の name・README 骨子、smoke |
| LC-001 | `apps/sp/package.json`、`app.config.ts` plugin |
| LC-002 | `utils/images.ts` の picker 部分 |
| LC-003 | `utils/images.ts` の copy/save |
| LC-004 | `utils/images.ts` の display / cleanup |
| LC-005 | `utils/analytics-client.ts`、PostHog 依存、同意フラグ配線 |
| LC-006 | README、完了ゲート確認 |

### 依存関係

```text
（BP-008）── LC-000 ── LC-001 ── LC-002 ── LC-003 ── LC-004 ── LC-006
                 └── LC-005 ──────────────────────────────┘
```

本書の完了ゲート（「10.」）と一覧の完了判定の両方を満たして LC-006 を done にする。

## 12. 完了後の次工程

1. 本二段目を `Project/houseplant-care/` へコピーし、みずどきパックの Cursor 指示書 v2 に従う。
2. 同様に `Project/field-nippo/` へコピーし、現場日報パックの Cursor 指示書 v1 に従う。
3. 製品の枚数上限・画面は HC-009 / FN-007。製品イベントは HC-014 / FN-011。通知はみずどき HC-011〜013（現場日報 MVP では実装しない）。
