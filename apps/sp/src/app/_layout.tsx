import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { Text, View } from "react-native";

import { useAppBootstrap } from "@/hooks/use-app-bootstrap";

export default function RootLayout() {
  const { isReady, error } = useAppBootstrap();

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Preparing…</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
