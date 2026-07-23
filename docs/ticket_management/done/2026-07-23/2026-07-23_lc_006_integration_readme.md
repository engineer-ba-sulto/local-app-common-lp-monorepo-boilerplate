# LC-006 統合検証・README（一段目差分・製品コピー手順）

## 完了条件

- [x] 指示書「10. 二段目完了ゲート」と LC-000〜LC-005 の完了判定を満たし、README に一段目差分・製品コピー手順を記載する。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

二段目ボイラープレートの統合検証と README 仕上げ。

検証・仕上げ範囲:

- 一段目完了ゲートの維持（install / typecheck / check / test / mprocs）
- 写真依存・`images.ts` 契約・キャンセル／拒否非クラッシュ
- PostHog 同意前 0・同意後手動 capture のみ
- `expo-notifications` 非依存・製品ドメイン／枚数上限／製品イベント一覧なし
- README: 一段目差分・製品（みずどき / 現場日報）へのコピー手順

## 優先度または期限

高（締め）。依存: LC-000〜LC-005。見積 0.25 日。Phase 4。

## 現在の状態

done（2026-07-23）。

## 関連ファイル

- [仕様書 v1](../../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)（§10 完了ゲート）
- 主な対象: `README.md`、統合検証結果

## 後続チケット

- みずどき: `Project/houseplant-care/` へコピーし Cursor 指示書 v2 に従う（本リポジトリ外）
- 現場日報: `Project/field-nippo/` へコピーし Cursor 指示書 v1 に従う（本リポジトリ外）
- 本リポジトリ内の追加 `todo` は不要のため作成しない

## 完了メモ

### 実装内容

- ルート `README.md` を仕上げ: 一段目差分表、含めない一覧、みずどき／現場日報へのコピー手順・rename チェックリスト・製品側チケット索引
- 二段目完了ゲートを統合検証

### 検証（完了ゲート）

| 項目 | 結果 |
| --- | --- |
| `bun install` | 成功（変更なし） |
| `bun run typecheck:sp` | 成功 |
| `bun run check` | 成功（42 files） |
| `bun run test:sp` | 成功（49 pass / 0 fail） |
| mprocs（`bun run dev`） | 動作確認済み（sp / lp UP） |
| `expo-image-picker` / `expo-file-system` / `expo-image` | `apps/sp/package.json` に導入済み |
| `images.ts` 契約 | 選択・保存・表示・cleanup あり。キャンセル／拒否は通常結果（単体テストで確認） |
| PostHog | 同意前 0・同意後手動 capture のみ（単体テストで確認） |
| `expo-notifications` | `package.json` / `bun.lock` に無し |
| 製品ドメイン／枚数上限／製品イベント一覧 | コードに無し（`plants/` 等はコメント・テスト例のみ） |

### 次の候補

- 本リポジトリ外: みずどき `Project/houseplant-care/`、現場日報 `Project/field-nippo/` へコピーし各 Cursor 指示書へ進む
