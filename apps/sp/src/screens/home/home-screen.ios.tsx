import { Host, Text, VStack } from "@expo/ui/swift-ui";
import { StyleSheet, View } from "react-native";

/**
 * SwiftUI ホーム雛形（iOS）。製品ドメイン UI は置かない。
 */
export function HomeScreen() {
  return (
    <View style={styles.root}>
      <Host style={styles.host}>
        <VStack spacing={12}>
          <Text>Home</Text>
          <Text>SwiftUI home scaffold</Text>
        </VStack>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  host: {
    flex: 1,
  },
});
