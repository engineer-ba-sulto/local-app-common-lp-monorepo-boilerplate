import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * 二段目（local-app-common）用。製品コピー後に name / slug / scheme /
 * bundleIdentifier を差し替える（ルート README の rename チェックリスト）。
 * 本番 bundle id・プライバシー URL・製品名はここでは確定しない。
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Local App Common",
  slug: "local-app-common",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "local-app-common",
  userInterfaceStyle: "light",
  ios: {
    icon: "./assets/expo.icon",
    // 製品コピー時に差し替え。EAS / ASC 確定前の仮値。
    bundleIdentifier: "com.example.localappcommon",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    // 製品コピー時に差し替え。本二段目は iPhone 主対象の共通骨格。
    package: "com.example.localappcommon",
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-sqlite",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#208AEF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
