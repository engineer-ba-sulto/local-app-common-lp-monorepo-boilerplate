import * as Haptics from "expo-haptics";

/**
 * Haptics wrappers (iOS only).
 *
 * - Selection change → `selectionFeedback`
 * - DB commit success → `successFeedback`
 * - Failure → `errorFeedback`
 * - Destructive confirm (sparingly) → `warningFeedback`
 *
 * Never fail the caller: Low Power Mode / missing Taptic Engine / errors are swallowed.
 * Do not fire on scroll, screen appear, or ordinary taps. Skip if SwiftUI already haptics.
 */

async function runIosHaptic(fn: () => Promise<void>): Promise<void> {
  if (process.env.EXPO_OS !== "ios") {
    return;
  }
  try {
    await fn();
  } catch {
    // Haptics must not affect save / navigation outcomes.
  }
}

/** Explicit selection change (e.g. picker / segmented control). */
export function selectionFeedback(): void {
  void runIosHaptic(() => Haptics.selectionAsync());
}

/** After a successful DB commit or durable local save. */
export function successFeedback(): void {
  void runIosHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}

/** After a failed operation the user should notice. */
export function errorFeedback(): void {
  void runIosHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  );
}

/** Destructive confirm only when needed. */
export function warningFeedback(): void {
  void runIosHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  );
}
