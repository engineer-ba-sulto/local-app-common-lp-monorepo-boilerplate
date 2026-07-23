# local-app-common-sp

二段目モノレポ（`local-app-common-lp-monorepo-boilerplate`）の Expo アプリ。

セットアップ・起動・検証は**ルート README**を正本とする。

```bash
# リポジトリルートから
bun install
bun run typecheck:sp
bun run dev:sp
```

- ランタイムは Bun（`npm` / `npx` は使わない）
- `/` は SwiftUI ホーム雛形（`src/screens/home/`）
- 写真 API・PostHog はルートの LC チケットで追加
