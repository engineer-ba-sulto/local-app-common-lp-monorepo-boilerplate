# LC-003 一時 URI → documents 配下コピー保存 API

## 完了条件

- [x] `subdir` 指定で一時 URI を documents 配下へコピーし、失敗時に中途ファイルを残しにくい保存 API を実装する。

## 担当エージェント

- 主担当: Develop / Technical_Officer

## 依頼内容

`images.ts` の copy/save 部分を実装する。

実装範囲:

- `apps/sp/src/utils/images.ts` のコピー保存 API
- `documents/<subdir>/` への保存とパス返却
- 失敗時の中途ファイル掃除（残しにくい設計）

禁止:

- 製品固定の `subdir` 名・枚数上限
- 製品ドメイン schema の混入

## 優先度または期限

高。依存: LC-002。見積 0.25〜0.5 日。Phase 2。

## 現在の状態

done（2026-07-23）。

## 関連ファイル

- [仕様書 v1](../../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_spec_v1.md)
- [Cursor実装指示書 v1](../../../local-monorepo-boilerplate/local_app_common_lp_monorepo_boilerplate_cursor_implementation_instruction_v1.md)
- 主な対象: `apps/sp/src/utils/images.ts`（copy/save）

## 後続チケット

- [LC-004 表示 URI・cleanup](../../todo/2026-07-23_lc_004_image_display_cleanup.md)

## 完了メモ

### 実装内容

- `copyImageToDocuments(sourceUri, subdir)` — `expo-file-system` の `File` / `Directory` / `Paths.document`
- 保存先は `documents/<subdir>/`。返却は DB 向け相対パス（例: `plants/<uuid>.jpg`）
- `.partial` へコピー → rename で確定。失敗時は staging / 最終パスを best-effort 削除
- `subdir`・ファイル名は呼び出し側／UUID。製品固定名や枚数上限なし
- 単体テスト: 成功・空 subdir・copy 失敗掃除・rename 失敗掃除

### 検証

| 項目 | 結果 |
| --- | --- |
| `bun run typecheck:sp` | 成功 |
| `bun run check:sp` | 成功（29 files） |
| `bun run test:sp` | 成功（30 pass） |
| 実機確認 | 未実施（FS 実コピーは製品コピー後） |

### 次の候補

- [LC-004](../../todo/2026-07-23_lc_004_image_display_cleanup.md) 表示 URI 契約・placeholder・未参照 cleanup
