import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

/**
 * 非 iOS 向けフォールバック。SwiftUI（@expo/ui/swift-ui）は iOS のみ。
 * Jetpack Compose は入れない（仕様禁止）。
 */
export function DependencySmoke() {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPress = () => {
    scale.value = withSpring(0.94, undefined, () => {
      scale.value = withSpring(1);
    });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.root}>
      <Text style={styles.caption}>
        BP-002 smoke（非 iOS: RN + Haptics + Reanimated）
      </Text>
      <Animated.View style={animatedStyle}>
        <Pressable onPress={onPress} style={styles.button}>
          <Text style={styles.buttonLabel}>Haptics + Reanimated</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
  },
  caption: {
    textAlign: "center",
    color: "#333333",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#208AEF",
  },
  buttonLabel: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
