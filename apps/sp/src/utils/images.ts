/**
 * Image utilities (local-app-common stage 2).
 *
 * ## Path contract (documents)
 * - Persist copied files under the app documents directory:
 *   `FileSystem.documentDirectory` + `<subdir>/` + `<filename>`
 * - Product chooses `<subdir>` (e.g. `plants/`, `reports/`).
 * - Do not store product photos outside documents.
 * - Relative stored paths (e.g. `plants/abc.jpg`) are the DB-facing values;
 *   absolute `file://` URIs are built when displaying / cleaning up.
 *
 * ## Implemented
 * - pick one image from camera / library (`expo-image-picker`)
 *   Cancel and permission denial are normal results (not thrown).
 *
 * ## Still stage 2 (later tickets)
 * - copy temp URI → `documents/<subdir>/` (LC-003)
 * - display URI / placeholder contract for `expo-image` (LC-004)
 * - best-effort unreferenced-file cleanup (LC-004)
 *
 * Does **not** use `expo-camera`. Camera capture goes through
 * `expo-image-picker`'s `launchCameraAsync`.
 *
 * `expo-image-picker` is loaded only inside pick helpers so unit tests of
 * pure mappers do not pull React Native into the Bun test runner.
 */

/** Relative subdirectory under the app documents directory (trailing slash optional). */
export type ImagesSubdir = string;

/**
 * Path relative to documents, suitable for DB storage.
 * Example: `plants/abc.jpg`
 */
export type StoredImageRelativePath = string;

/**
 * Result of a single-image pick. Cancel and permission denial are
 * discriminated statuses — callers must not treat them as thrown errors.
 */
export type ImagePickResult =
  | { status: "success"; uri: string }
  | { status: "canceled" }
  | { status: "denied" };

/** Minimal shape of `expo-image-picker` launch results used by this module. */
export type ImagePickerLaunchResultLike = {
  canceled: boolean;
  assets: Array<{ uri: string }> | null;
};

const PICKER_OPTIONS = {
  mediaTypes: ["images"] as ("images" | "videos" | "livePhotos")[],
  allowsMultipleSelection: false,
  quality: 1,
};

/**
 * Normalize a documents-relative path segment list.
 * Does not touch the filesystem — path-shape helper for stage 2 / products.
 */
export function joinDocumentsRelativePath(
  ...segments: string[]
): StoredImageRelativePath {
  return segments
    .flatMap((segment) => segment.split("/"))
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== "." && part !== "..")
    .join("/");
}

/**
 * Detect permission-related failures from `expo-image-picker` (e.g. iOS
 * rejecting `launchCameraAsync` when camera permission is missing).
 * Exported for unit tests.
 */
export function isImagePickerPermissionError(error: unknown): boolean {
  if (error == null) {
    return false;
  }
  if (typeof error !== "object") {
    return String(error).toLowerCase().includes("permission");
  }
  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message) : "";
  const name = "name" in error ? String(error.name) : "";
  const haystack = `${code} ${message} ${name}`.toLowerCase();
  return haystack.includes("permission");
}

/**
 * Map a raw picker launch result to {@link ImagePickResult}.
 * Exported for unit tests.
 */
export function mapImagePickerLaunchResult(
  result: ImagePickerLaunchResultLike,
): ImagePickResult {
  if (result.canceled) {
    return { status: "canceled" };
  }
  const uri = result.assets?.[0]?.uri;
  if (!uri) {
    return { status: "canceled" };
  }
  return { status: "success", uri };
}

/**
 * Permission check → launch → map. Cancel / deny are normal results.
 * Unexpected non-permission errors are rethrown.
 * Exported for unit tests (injectable request / launch).
 */
export async function resolveImagePick(
  requestPermission: () => Promise<{ granted: boolean }>,
  launch: () => Promise<ImagePickerLaunchResultLike>,
): Promise<ImagePickResult> {
  const permission = await requestPermission();
  if (!permission.granted) {
    return { status: "denied" };
  }
  try {
    const result = await launch();
    return mapImagePickerLaunchResult(result);
  } catch (error) {
    if (isImagePickerPermissionError(error)) {
      return { status: "denied" };
    }
    throw error;
  }
}

/** Pick one still image from the photo library. */
export async function pickImageFromLibrary(): Promise<ImagePickResult> {
  const ImagePicker = await import("expo-image-picker");
  return resolveImagePick(
    () => ImagePicker.requestMediaLibraryPermissionsAsync(),
    () => ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS),
  );
}

/** Pick one still image via the system camera UI (`expo-image-picker`). */
export async function pickImageFromCamera(): Promise<ImagePickResult> {
  const ImagePicker = await import("expo-image-picker");
  return resolveImagePick(
    () => ImagePicker.requestCameraPermissionsAsync(),
    () => ImagePicker.launchCameraAsync(PICKER_OPTIONS),
  );
}
