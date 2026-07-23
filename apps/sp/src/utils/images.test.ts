import { describe, expect, test } from "bun:test";
import {
  createStoredImageFilename,
  extensionFromUri,
  type ImageCopyFs,
  isImagePickerPermissionError,
  joinDocumentsRelativePath,
  mapImagePickerLaunchResult,
  resolveImageCopy,
  resolveImagePick,
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
