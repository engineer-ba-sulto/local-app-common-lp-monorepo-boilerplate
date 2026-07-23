/**
 * Image utilities (local-app-common stage 2).
 *
 * ## Path contract (documents)
 * - Persist copied files under the app documents directory:
 *   `Paths.document` + `<subdir>/` + `<filename>`
 * - Product chooses `<subdir>` (e.g. `plants/`, `reports/`).
 * - Do not store product photos outside documents.
 * - Relative stored paths (e.g. `plants/abc.jpg`) are the DB-facing values;
 *   absolute `file://` URIs are built when displaying / cleaning up.
 *
 * ## Implemented
 * - pick one image from camera / library (`expo-image-picker`)
 *   Cancel and permission denial are normal results (not thrown).
 * - copy temp URI → `documents/<subdir>/` (`expo-file-system`)
 *   Failures best-effort delete staging / destination so partial files
 *   are unlikely to remain.
 *
 * ## Still stage 2 (later tickets)
 * - display URI / placeholder contract for `expo-image` (LC-004)
 * - best-effort unreferenced-file cleanup (LC-004)
 *
 * Does **not** use `expo-camera`. Camera capture goes through
 * `expo-image-picker`'s `launchCameraAsync`.
 *
 * `expo-image-picker` / `expo-file-system` are loaded only inside public
 * helpers so unit tests of pure mappers do not pull React Native into the
 * Bun test runner.
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

/** Injectable filesystem ops for copy/save (unit-test friendly). */
export type ImageCopyFs = {
  ensureSubdir: (relativeSubdir: string) => void | Promise<void>;
  copyUriToRelativePath: (
    sourceUri: string,
    relativePath: string,
  ) => Promise<void>;
  renameRelativePath: (
    fromRelativePath: string,
    toFileName: string,
  ) => void | Promise<void>;
  deleteRelativePathIfExists: (relativePath: string) => void | Promise<void>;
};

/**
 * Extract a safe file extension (with leading `.`) from a URI path.
 * Query strings and odd extensions are ignored. Exported for unit tests.
 */
export function extensionFromUri(uri: string): string {
  const withoutQuery = uri.split("?")[0] ?? uri;
  const basename = withoutQuery.split("/").pop() ?? "";
  const dot = basename.lastIndexOf(".");
  if (dot <= 0 || dot === basename.length - 1) {
    return "";
  }
  const ext = basename.slice(dot + 1).toLowerCase();
  if (!/^[a-z0-9]{1,8}$/.test(ext)) {
    return "";
  }
  return `.${ext}`;
}

/**
 * Build a unique filename under documents (optionally with extension).
 * Exported for unit tests.
 */
export function createStoredImageFilename(extension = ""): string {
  const id = crypto.randomUUID().replaceAll("-", "");
  if (!extension) {
    return id;
  }
  return `${id}${extension.startsWith(".") ? extension : `.${extension}`}`;
}

async function bestEffortDelete(
  deleteRelativePathIfExists: ImageCopyFs["deleteRelativePathIfExists"],
  relativePath: string,
): Promise<void> {
  try {
    await deleteRelativePathIfExists(relativePath);
  } catch {
    // Ignore cleanup failures — caller already has the primary error.
  }
}

/**
 * Copy a temporary image URI into `documents/<subdir>/` via injectable FS.
 * Writes to a `.partial` staging path first, then renames to the final name
 * so mid-copy failures are unlikely to leave a finished-looking file.
 * Exported for unit tests.
 */
export async function resolveImageCopy(
  sourceUri: string,
  subdir: ImagesSubdir,
  fs: ImageCopyFs,
  options?: {
    createFilename?: (sourceUri: string) => string;
  },
): Promise<StoredImageRelativePath> {
  const relativeSubdir = joinDocumentsRelativePath(subdir);
  if (!relativeSubdir) {
    throw new Error("Images subdir must not be empty");
  }

  const filename =
    options?.createFilename?.(sourceUri) ??
    createStoredImageFilename(extensionFromUri(sourceUri));
  const relativePath = joinDocumentsRelativePath(relativeSubdir, filename);
  const stagingPath = `${relativePath}.partial`;

  await fs.ensureSubdir(relativeSubdir);

  try {
    await fs.copyUriToRelativePath(sourceUri, stagingPath);
    await fs.renameRelativePath(stagingPath, filename);
    return relativePath;
  } catch (error) {
    await bestEffortDelete(fs.deleteRelativePathIfExists, stagingPath);
    await bestEffortDelete(fs.deleteRelativePathIfExists, relativePath);
    throw error;
  }
}

function documentsRelativeParts(relativePath: string): string[] {
  return joinDocumentsRelativePath(relativePath).split("/").filter(Boolean);
}

/**
 * Copy a temporary picker/camera URI into `documents/<subdir>/`.
 * Returns a documents-relative path suitable for DB storage
 * (e.g. `plants/ab12….jpg`). Product chooses `subdir`; this helper does not
 * enforce product-specific names or image count limits.
 */
export async function copyImageToDocuments(
  sourceUri: string,
  subdir: ImagesSubdir,
): Promise<StoredImageRelativePath> {
  const { Directory, File, Paths } = await import("expo-file-system");

  return resolveImageCopy(sourceUri, subdir, {
    ensureSubdir: (relativeSubdir) => {
      const dir = new Directory(
        Paths.document,
        ...documentsRelativeParts(relativeSubdir),
      );
      dir.create({ intermediates: true, idempotent: true });
    },
    copyUriToRelativePath: async (fromUri, relativePath) => {
      const parts = documentsRelativeParts(relativePath);
      const dest = new File(Paths.document, ...parts);
      const source = new File(fromUri);
      await source.copy(dest);
    },
    renameRelativePath: (fromRelativePath, toFileName) => {
      const file = new File(
        Paths.document,
        ...documentsRelativeParts(fromRelativePath),
      );
      file.rename(toFileName);
    },
    deleteRelativePathIfExists: (relativePath) => {
      const file = new File(
        Paths.document,
        ...documentsRelativeParts(relativePath),
      );
      if (file.exists) {
        file.delete();
      }
    },
  });
}
