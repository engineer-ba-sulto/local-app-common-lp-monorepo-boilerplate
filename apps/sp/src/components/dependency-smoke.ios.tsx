import { Button, Host, Text, VStack } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

/**
 * BP-002: Expo UI (SwiftUI) / Haptics / Reanimated の最低限 smoke。
 * 本ホーム UI は BP-003 で差し替える。
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
      <Animated.View style={[styles.hostWrap, animatedStyle]}>
        <Host style={styles.host}>
          <VStack spacing={16}>
            <Text>BP-002 smoke (SwiftUI)</Text>
            <Button label="Haptics + Reanimated" onPress={onPress} />
          </VStack>
        </Host>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  hostWrap: {
    width: "80%",
    minHeight: 120,
  },
  host: {
    flex: 1,
  },
});
