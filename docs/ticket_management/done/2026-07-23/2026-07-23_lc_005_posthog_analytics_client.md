# LC-005 PostHog SDK・PostHogAnalyticsClient・同意切替

## 完了条件

- [x] 同意前は送信 0、同意後は手動 `capture` のみ、自動収集なし、キーはプレースホルダの `PostHogAnalyticsClient` を実装する。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

一段目の `AnalyticsClient` を維持しつつ、PostHog 実クライアントと同意切替を足す（製品イベントなし）。

実装範囲:

- PostHog RN SDK（Expo SDK 互換版）
- `apps/sp/src/utils/analytics-client.ts`（Noop / PostHog・同意フラグ配線）
- Project API Key のプレースホルダのみ

禁止:

- Session Replay / 自動収集 / Feature Flags / `identify`
- 製品固有イベント名・プロパティの確定
- Personal / 管理キーの混入
- `expo-notifications`

## 優先度または期限

高。依存: LC-000。見積 0.5 日。Phase 3。LC-001〜LC-004 と並行可。

## 現在の状態

done（2026-07-23）。

## 関連ファイル

- [仕様書 v1](../../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/src/utils/analytics-client.ts`、`apps/sp/src/utils/analytics-client.test.ts`、PostHog 依存、`apps/sp/app.config.ts`（`expo-localization` plugin）

## 後続チケット

- [LC-006 統合検証・README](../../todo/2026-07-23_lc_006_integration_readme.md)（LC-000〜LC-005 完了後）

## 完了メモ

### 実装内容

- `posthog-react-native@4.59.0` + `expo-application` / `expo-localization`（Expo SDK 57 互換）を導入。`expo-notifications` なし
- `NoopAnalyticsClient` 維持。`PostHogAnalyticsClient` を追加（同意 unset/denied → 送信 0、granted → `optIn` + 手動 `capture` のみ）
- SDK 既定: `defaultOptIn: false`、lifecycle / Session Replay / Feature Flags オフ。`PostHogProvider` 未使用（画面自動収集なし）
- Project API Key / host は `phc_REPLACE_WITH_PROJECT_API_KEY` と `EXPO_PUBLIC_POSTHOG_*` フォールバックのみ
- 単体テスト: 同意前 0・同意後 capture・revoke・reset・エラー吸収・placeholder 解決

### 検証

| 項目 | 結果 |
| --- | --- |
| `bun run typecheck:sp` | 成功 |
| `bun run check:sp` | 成功 |
| `bun run test:sp` | 成功（49 pass） |
| 実機確認 | 未実施（同意 UI・実キー送信は製品コピー後 / LC-006） |

### 次の候補

- [LC-006](../../todo/2026-07-23_lc_006_integration_readme.md) 統合検証・README（一段目差分・製品コピー手順）
