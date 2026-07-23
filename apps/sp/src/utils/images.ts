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
 * - display URI / placeholder contract for `expo-image`
 * - best-effort unreferenced-file cleanup under a product-chosen subdir
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

/**
 * `expo-image` `source` shape for a local documents file.
 * Pass as `<Image source={contract.source} />` when non-null.
 */
export type ExpoImageSource = { uri: string };

/**
 * `expo-image` `placeholder` contract.
 * Product supplies blurhash, a remote/local URI, a `require()` asset id,
 * or an `ImageSource`-like object — this module does not ship UI assets.
 */
export type ExpoImagePlaceholder =
  | string
  | number
  | { uri: string }
  | { blurhash: string }
  | { thumbhash: string };

/**
 * Props fragment for `<Image>` from `expo-image`.
 * No React component is provided here (product UI stays in product apps).
 */
export type ExpoImageDisplayContract = {
  source: ExpoImageSource | null;
  placeholder: ExpoImagePlaceholder | undefined;
};

/**
 * Join a documents directory URI with a stored relative path.
 * Pure string helper — no filesystem access. Returns `null` when the
 * relative path is empty / missing after normalization.
 * Exported for unit tests.
 */
export function resolveDocumentsDisplayUri(
  documentsDirectoryUri: string,
  relativePath: StoredImageRelativePath | null | undefined,
): string | null {
  if (relativePath == null) {
    return null;
  }
  const relative = joinDocumentsRelativePath(relativePath);
  if (!relative) {
    return null;
  }
  const base = documentsDirectoryUri.endsWith("/")
    ? documentsDirectoryUri
    : `${documentsDirectoryUri}/`;
  return `${base}${relative}`;
}

/**
 * Build the shared `expo-image` display contract from a display URI.
 * Pure — does not touch the filesystem or React.
 */
export function createExpoImageDisplayContract(
  displayUri: string | null | undefined,
  placeholder?: ExpoImagePlaceholder,
): ExpoImageDisplayContract {
  return {
    source: displayUri ? { uri: displayUri } : null,
    placeholder,
  };
}

/**
 * Resolve a documents-relative stored path to an absolute `file://` URI
 * suitable for `expo-image` `source`. Uses `File.uri` under `Paths.document`.
 */
export async function getImageDisplayUri(
  relativePath: StoredImageRelativePath,
): Promise<string> {
  const relative = joinDocumentsRelativePath(relativePath);
  if (!relative) {
    throw new Error("Stored image relative path must not be empty");
  }
  const { File, Paths } = await import("expo-file-system");
  const file = new File(Paths.document, ...documentsRelativeParts(relative));
  return file.uri;
}

/**
 * Convenience: documents-relative path → `expo-image` display contract.
 * Product chooses `placeholder` (blurhash / asset); this helper only wires URI.
 */
export async function getExpoImageDisplayContract(
  relativePath: StoredImageRelativePath | null | undefined,
  placeholder?: ExpoImagePlaceholder,
): Promise<ExpoImageDisplayContract> {
  if (relativePath == null || !joinDocumentsRelativePath(relativePath)) {
    return createExpoImageDisplayContract(null, placeholder);
  }
  const uri = await getImageDisplayUri(relativePath);
  return createExpoImageDisplayContract(uri, placeholder);
}

/** Injectable filesystem ops for unreferenced cleanup (unit-test friendly). */
export type ImageCleanupFs = {
  listRelativeFilePaths: (
    relativeSubdir: string,
  ) => Iterable<string> | Promise<Iterable<string>>;
  deleteRelativePathIfExists: (relativePath: string) => void | Promise<void>;
};

/** Result of a best-effort cleanup pass. Never thrown as an error. */
export type ImageCleanupResult = {
  deleted: StoredImageRelativePath[];
  failed: StoredImageRelativePath[];
};

/**
 * Delete files under `subdir` that are not in `referencedRelativePaths`.
 * Failures are collected into `failed` — this function does not throw for
 * per-file delete errors. Listing / ensure failures yield an empty pass
 * (best-effort; callers must not treat cleanup as hard success).
 * Exported for unit tests.
 */
export async function resolveUnreferencedImageCleanup(
  subdir: ImagesSubdir,
  referencedRelativePaths: Iterable<StoredImageRelativePath>,
  fs: ImageCleanupFs,
): Promise<ImageCleanupResult> {
  const relativeSubdir = joinDocumentsRelativePath(subdir);
  if (!relativeSubdir) {
    return { deleted: [], failed: [] };
  }

  const referenced = new Set(
    [...referencedRelativePaths]
      .map((path) => joinDocumentsRelativePath(path))
      .filter((path) => path.length > 0),
  );

  let listed: Iterable<string>;
  try {
    listed = await fs.listRelativeFilePaths(relativeSubdir);
  } catch {
    return { deleted: [], failed: [] };
  }

  const deleted: StoredImageRelativePath[] = [];
  const failed: StoredImageRelativePath[] = [];

  for (const rawPath of listed) {
    const relativePath = joinDocumentsRelativePath(rawPath);
    if (!relativePath) {
      continue;
    }
    // Only touch files that live under the requested subdir.
    if (
      relativePath !== relativeSubdir &&
      !relativePath.startsWith(`${relativeSubdir}/`)
    ) {
      continue;
    }
    if (referenced.has(relativePath)) {
      continue;
    }
    try {
      await fs.deleteRelativePathIfExists(relativePath);
      deleted.push(relativePath);
    } catch {
      failed.push(relativePath);
    }
  }

  return { deleted, failed };
}

/**
 * Best-effort cleanup of unreferenced image files under `documents/<subdir>/`.
 * Product passes the set of relative paths still referenced (e.g. from DB).
 * Never throws — listing / delete failures are swallowed or returned in
 * `failed`. Does not recurse into nested directories.
 */
export async function cleanupUnreferencedImages(
  subdir: ImagesSubdir,
  referencedRelativePaths: Iterable<StoredImageRelativePath>,
): Promise<ImageCleanupResult> {
  const { Directory, File, Paths } = await import("expo-file-system");

  return resolveUnreferencedImageCleanup(subdir, referencedRelativePaths, {
    listRelativeFilePaths: (relativeSubdir) => {
      const dir = new Directory(
        Paths.document,
        ...documentsRelativeParts(relativeSubdir),
      );
      if (!dir.exists) {
        return [];
      }
      const paths: string[] = [];
      for (const item of dir.list()) {
        // Files only — skip nested directories (product chooses flat layout).
        if (item instanceof Directory) {
          continue;
        }
        paths.push(joinDocumentsRelativePath(relativeSubdir, item.name));
      }
      return paths;
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
