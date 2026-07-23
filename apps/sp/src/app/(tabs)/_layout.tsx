import { NativeTabs } from "expo-router/unstable-native-tabs";

/**
 * 1タブ雛形。製品側で 2〜3 タブへ差し替える。
 */
export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
