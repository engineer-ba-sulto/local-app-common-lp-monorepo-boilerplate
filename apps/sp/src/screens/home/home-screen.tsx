import { StyleSheet, Text, View } from "react-native";

/**
 * 非 iOS フォールバック。SwiftUI（@expo/ui/swift-ui）は iOS のみ。
 * Jetpack Compose は入れない（仕様禁止）。
 */
export function HomeScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.caption}>Non-iOS fallback (SwiftUI is iOS-only)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111111",
  },
  caption: {
    fontSize: 16,
    color: "#333333",
  },
});
