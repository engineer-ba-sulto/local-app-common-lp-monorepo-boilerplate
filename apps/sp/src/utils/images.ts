/**
 * Image utilities — scaffold only (stage 1).
 *
 * ## Path contract (documents)
 * - Persist copied files under the app documents directory:
 *   `FileSystem.documentDirectory` + `<subdir>/` + `<filename>`
 * - Product chooses `<subdir>` (e.g. `plants/`, `reports/`).
 * - Do not store product photos outside documents.
 * - Relative stored paths (e.g. `plants/abc.jpg`) are the DB-facing values;
 *   absolute `file://` URIs are built when displaying / cleaning up.
 *
 * ## Stage 2 (local-app-common) will implement
 * - pick one image from camera / library (`expo-image-picker`)
 * - copy temp URI → `documents/<subdir>/`
 * - display URI / placeholder contract for `expo-image`
 * - best-effort unreferenced-file cleanup (failures must not crash the app)
 *
 * This stage intentionally does **not** import `expo-image-picker` or
 * `expo-file-system` for picker / copy flows.
 */

/** Relative subdirectory under the app documents directory (trailing slash optional). */
export type ImagesSubdir = string;

/**
 * Path relative to documents, suitable for DB storage.
 * Example: `plants/abc.jpg`
 */
export type StoredImageRelativePath = string;

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
