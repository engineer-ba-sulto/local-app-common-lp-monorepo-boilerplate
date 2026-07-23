import { describe, expect, test } from "bun:test";
import {
  createExpoImageDisplayContract,
  createStoredImageFilename,
  extensionFromUri,
  type ImageCleanupFs,
  type ImageCopyFs,
  isImagePickerPermissionError,
  joinDocumentsRelativePath,
  mapImagePickerLaunchResult,
  resolveDocumentsDisplayUri,
  resolveImageCopy,
  resolveImagePick,
  resolveUnreferencedImageCleanup,
} from "./images";

describe("joinDocumentsRelativePath", () => {
  test("joins and strips empty / dot segments", () => {
    expect(joinDocumentsRelativePath("plants/", "/abc.jpg")).toBe(
      "plants/abc.jpg",
    );
    expect(joinDocumentsRelativePath("a", "..", "b")).toBe("a/b");
  });
});

describe("extensionFromUri", () => {
  test("reads extension and strips query", () => {
    expect(extensionFromUri("file:///tmp/a.JPG?x=1")).toBe(".jpg");
    expect(extensionFromUri("file:///tmp/photo.jpeg")).toBe(".jpeg");
  });

  test("returns empty for missing or unsafe extensions", () => {
    expect(extensionFromUri("file:///tmp/noext")).toBe("");
    expect(extensionFromUri("file:///tmp/.hidden")).toBe("");
    expect(extensionFromUri("file:///tmp/a.tar.gz")).toBe(".gz");
    expect(extensionFromUri("file:///tmp/a.toolongextension")).toBe("");
  });
});

describe("createStoredImageFilename", () => {
  test("creates unique names with optional extension", () => {
    const a = createStoredImageFilename(".jpg");
    const b = createStoredImageFilename(".jpg");
    expect(a).toMatch(/^[a-f0-9]{32}\.jpg$/);
    expect(b).toMatch(/^[a-f0-9]{32}\.jpg$/);
    expect(a).not.toBe(b);
    expect(createStoredImageFilename()).toMatch(/^[a-f0-9]{32}$/);
  });
});

describe("isImagePickerPermissionError", () => {
  test("detects permission in code or message", () => {
    expect(
      isImagePickerPermissionError({
        code: "ERR_MISSING_CAMERA_PERMISSION",
        message: "Missing camera permission",
      }),
    ).toBe(true);
    expect(
      isImagePickerPermissionError(new Error("Camera permission denied")),
    ).toBe(true);
  });

  test("ignores unrelated errors", () => {
    expect(isImagePickerPermissionError(new Error("Network failed"))).toBe(
      false,
    );
    expect(isImagePickerPermissionError(null)).toBe(false);
    expect(isImagePickerPermissionError(42)).toBe(false);
  });
});

describe("mapImagePickerLaunchResult", () => {
  test("maps success", () => {
    expect(
      mapImagePickerLaunchResult({
        canceled: false,
        assets: [{ uri: "file:///tmp/a.jpg" }],
      }),
    ).toEqual({ status: "success", uri: "file:///tmp/a.jpg" });
  });

  test("maps canceled", () => {
    expect(
      mapImagePickerLaunchResult({ canceled: true, assets: null }),
    ).toEqual({ status: "canceled" });
  });

  test("maps missing uri as canceled", () => {
    expect(
      mapImagePickerLaunchResult({
        canceled: false,
        assets: [{ uri: "" }],
      }),
    ).toEqual({ status: "canceled" });
    expect(mapImagePickerLaunchResult({ canceled: false, assets: [] })).toEqual(
      { status: "canceled" },
    );
  });
});

describe("resolveImagePick", () => {
  test("returns denied when permission is not granted", async () => {
    const result = await resolveImagePick(
      async () => ({ granted: false }),
      async () => {
        throw new Error("launch should not run");
      },
    );
    expect(result).toEqual({ status: "denied" });
  });

  test("returns success when launch succeeds", async () => {
    const result = await resolveImagePick(
      async () => ({ granted: true }),
      async () => ({
        canceled: false,
        assets: [{ uri: "file:///tmp/ok.jpg" }],
      }),
    );
    expect(result).toEqual({ status: "success", uri: "file:///tmp/ok.jpg" });
  });

  test("returns canceled when user cancels", async () => {
    const result = await resolveImagePick(
      async () => ({ granted: true }),
      async () => ({ canceled: true, assets: null }),
    );
    expect(result).toEqual({ status: "canceled" });
  });

  test("maps permission throw from launch to denied", async () => {
    const result = await resolveImagePick(
      async () => ({ granted: true }),
      async () => {
        throw { code: "E_MISSING_PERMISSION", message: "Missing permission" };
      },
    );
    expect(result).toEqual({ status: "denied" });
  });

  test("rethrows non-permission errors", async () => {
    await expect(
      resolveImagePick(
        async () => ({ granted: true }),
        async () => {
          throw new Error("UnavailabilityError");
        },
      ),
    ).rejects.toThrow("UnavailabilityError");
  });
});

function createMemoryCopyFs(options?: {
  failOnCopy?: boolean;
  failOnRename?: boolean;
}): {
  fs: ImageCopyFs;
  files: Set<string>;
  ensured: string[];
} {
  const files = new Set<string>();
  const ensured: string[] = [];
  const fs: ImageCopyFs = {
    ensureSubdir: (relativeSubdir) => {
      ensured.push(relativeSubdir);
    },
    copyUriToRelativePath: async (_sourceUri, relativePath) => {
      if (options?.failOnCopy) {
        files.add(relativePath);
        throw new Error("copy failed");
      }
      files.add(relativePath);
    },
    renameRelativePath: (fromRelativePath, toFileName) => {
      if (options?.failOnRename) {
        throw new Error("rename failed");
      }
      if (!files.has(fromRelativePath)) {
        throw new Error(`missing staging file: ${fromRelativePath}`);
      }
      files.delete(fromRelativePath);
      const parent = fromRelativePath.includes("/")
        ? fromRelativePath.slice(0, fromRelativePath.lastIndexOf("/") + 1)
        : "";
      files.add(`${parent}${toFileName}`);
    },
    deleteRelativePathIfExists: (relativePath) => {
      files.delete(relativePath);
    },
  };
  return { fs, files, ensured };
}

describe("resolveImageCopy", () => {
  test("rejects empty subdir", async () => {
    const { fs } = createMemoryCopyFs();
    await expect(
      resolveImageCopy("file:///tmp/a.jpg", "   ", fs),
    ).rejects.toThrow("subdir must not be empty");
  });

  test("copies via staging then renames to final path", async () => {
    const { fs, files, ensured } = createMemoryCopyFs();
    const relativePath = await resolveImageCopy(
      "file:///tmp/a.jpg",
      "plants/",
      fs,
      { createFilename: () => "fixed.jpg" },
    );
    expect(relativePath).toBe("plants/fixed.jpg");
    expect(ensured).toEqual(["plants"]);
    expect(files.has("plants/fixed.jpg")).toBe(true);
    expect(files.has("plants/fixed.jpg.partial")).toBe(false);
  });

  test("cleans staging when copy fails", async () => {
    const { fs, files } = createMemoryCopyFs({ failOnCopy: true });
    await expect(
      resolveImageCopy("file:///tmp/a.jpg", "plants", fs, {
        createFilename: () => "fixed.jpg",
      }),
    ).rejects.toThrow("copy failed");
    expect(files.has("plants/fixed.jpg.partial")).toBe(false);
    expect(files.has("plants/fixed.jpg")).toBe(false);
  });

  test("cleans staging and final when rename fails", async () => {
    const { fs, files } = createMemoryCopyFs({ failOnRename: true });
    await expect(
      resolveImageCopy("file:///tmp/a.jpg", "plants", fs, {
        createFilename: () => "fixed.jpg",
      }),
    ).rejects.toThrow("rename failed");
    expect(files.has("plants/fixed.jpg.partial")).toBe(false);
    expect(files.has("plants/fixed.jpg")).toBe(false);
  });
});

describe("resolveDocumentsDisplayUri", () => {
  test("joins documents URI and relative path", () => {
    expect(resolveDocumentsDisplayUri("file:///docs", "plants/abc.jpg")).toBe(
      "file:///docs/plants/abc.jpg",
    );
    expect(resolveDocumentsDisplayUri("file:///docs/", "plants/abc.jpg")).toBe(
      "file:///docs/plants/abc.jpg",
    );
  });

  test("returns null for missing or empty relative path", () => {
    expect(resolveDocumentsDisplayUri("file:///docs", null)).toBeNull();
    expect(resolveDocumentsDisplayUri("file:///docs", undefined)).toBeNull();
    expect(resolveDocumentsDisplayUri("file:///docs", "  ")).toBeNull();
    expect(resolveDocumentsDisplayUri("file:///docs", "../")).toBeNull();
  });
});

describe("createExpoImageDisplayContract", () => {
  test("builds source and optional placeholder", () => {
    expect(
      createExpoImageDisplayContract("file:///docs/plants/a.jpg", {
        blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH",
      }),
    ).toEqual({
      source: { uri: "file:///docs/plants/a.jpg" },
      placeholder: { blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" },
    });
  });

  test("null uri yields null source", () => {
    expect(createExpoImageDisplayContract(null)).toEqual({
      source: null,
      placeholder: undefined,
    });
    expect(createExpoImageDisplayContract(undefined, 1)).toEqual({
      source: null,
      placeholder: 1,
    });
  });
});

function createMemoryCleanupFs(options?: {
  failList?: boolean;
  failDeletePaths?: Set<string>;
}): {
  fs: ImageCleanupFs;
  files: Set<string>;
} {
  const files = new Set<string>();
  const fs: ImageCleanupFs = {
    listRelativeFilePaths: (relativeSubdir) => {
      if (options?.failList) {
        throw new Error("list failed");
      }
      const prefix = `${relativeSubdir}/`;
      return [...files].filter(
        (path) => path === relativeSubdir || path.startsWith(prefix),
      );
    },
    deleteRelativePathIfExists: (relativePath) => {
      if (options?.failDeletePaths?.has(relativePath)) {
        throw new Error(`delete failed: ${relativePath}`);
      }
      files.delete(relativePath);
    },
  };
  return { fs, files };
}

describe("resolveUnreferencedImageCleanup", () => {
  test("returns empty for empty subdir", async () => {
    const { fs } = createMemoryCleanupFs();
    await expect(
      resolveUnreferencedImageCleanup("  ", ["plants/a.jpg"], fs),
    ).resolves.toEqual({ deleted: [], failed: [] });
  });

  test("deletes unreferenced files and keeps referenced", async () => {
    const { fs, files } = createMemoryCleanupFs();
    files.add("plants/keep.jpg");
    files.add("plants/gone.jpg");
    files.add("plants/orphan.partial");
    const result = await resolveUnreferencedImageCleanup(
      "plants/",
      ["plants/keep.jpg"],
      fs,
    );
    expect(result.deleted.sort()).toEqual([
      "plants/gone.jpg",
      "plants/orphan.partial",
    ]);
    expect(result.failed).toEqual([]);
    expect(files.has("plants/keep.jpg")).toBe(true);
    expect(files.has("plants/gone.jpg")).toBe(false);
  });

  test("ignores files outside subdir", async () => {
    const { fs, files } = createMemoryCleanupFs();
    files.add("plants/a.jpg");
    files.add("reports/b.jpg");
    const result = await resolveUnreferencedImageCleanup("plants", [], fs);
    expect(result.deleted).toEqual(["plants/a.jpg"]);
    expect(files.has("reports/b.jpg")).toBe(true);
  });

  test("list failure yields empty result without throw", async () => {
    const { fs } = createMemoryCleanupFs({ failList: true });
    await expect(
      resolveUnreferencedImageCleanup("plants", [], fs),
    ).resolves.toEqual({ deleted: [], failed: [] });
  });

  test("delete failure is collected in failed", async () => {
    const { fs, files } = createMemoryCleanupFs({
      failDeletePaths: new Set(["plants/locked.jpg"]),
    });
    files.add("plants/locked.jpg");
    files.add("plants/ok.jpg");
    const result = await resolveUnreferencedImageCleanup("plants", [], fs);
    expect(result.deleted).toEqual(["plants/ok.jpg"]);
    expect(result.failed).toEqual(["plants/locked.jpg"]);
    expect(files.has("plants/locked.jpg")).toBe(true);
  });
});
