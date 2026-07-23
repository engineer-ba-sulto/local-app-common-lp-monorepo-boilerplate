# apps/lp（Astro LP 枠）

App Store 向けランディングページ用の **Astro stub** です。`bun create cloudflare` 済み成果をボイラープレート枠へ寄せた状態で、製品 LP の本実装は後続です。

## いまあるもの

- `src/pages/index.astro` … プレースホルダページ
- Cloudflare adapter（`@astrojs/cloudflare`）と `wrangler` による配信想定

## 後続で実装すること

製品コピーへ落とすときに次を入れる（本ボイラープレートでは未実装）:

- 製品名・ストア誘導・ASO 向けコピー
- ストアスクショ・課金説明などの確定文
- 公開ドメインと Cloudflare 配信方式の確定

## 開発

モノレポルートから:

```sh
bun run dev:lp
```

または `bun run dev`（mprocs）で `lp` プロセスを起動。

アプリ単体:

| コマンド | 内容 |
| --- | --- |
| `bun run dev` | 開発サーバ（既定 `localhost:4321`） |
| `bun run build` | 本番ビルド |
| `bun run preview` | ビルド結果のプレビュー |
| `bun run deploy` | ビルド後に Wrangler でデプロイ |

## 関連

- ルート [README](../../README.md)
- 仕様書 §3.3（`apps/lp` は枠のみ）
