import { describe, expect, test } from "bun:test";
import {
  isImagePickerPermissionError,
  joinDocumentsRelativePath,
  mapImagePickerLaunchResult,
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
