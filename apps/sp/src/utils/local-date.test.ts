import { describe, expect, test } from "bun:test";
import {
  addCalendarDays,
  compareLocalDates,
  formatLocalDate,
  parseLocalDate,
  todayLocalDate,
} from "./local-date";

describe("parseLocalDate", () => {
  test("parses a valid YYYY-MM-DD as local midnight", () => {
    const date = parseLocalDate("2024-02-11");
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(11);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
  });

  test("accepts leap day", () => {
    expect(formatLocalDate(parseLocalDate("2024-02-29"))).toBe("2024-02-29");
  });

  test("rejects non-existent calendar dates", () => {
    expect(() => parseLocalDate("2023-02-29")).toThrow("Invalid local date");
    expect(() => parseLocalDate("2024-02-30")).toThrow("Invalid local date");
    expect(() => parseLocalDate("2024-04-31")).toThrow("Invalid local date");
    expect(() => parseLocalDate("2024-13-01")).toThrow("Invalid local date");
  });

  test("rejects malformed strings", () => {
    expect(() => parseLocalDate("2024/02/11")).toThrow("Invalid local date");
    expect(() => parseLocalDate("2024-2-11")).toThrow("Invalid local date");
    expect(() => parseLocalDate("20240211")).toThrow("Invalid local date");
    expect(() => parseLocalDate("")).toThrow("Invalid local date");
  });
});

describe("formatLocalDate", () => {
  test("formats device-local calendar day", () => {
    expect(formatLocalDate(new Date(2024, 0, 5, 15, 30, 0))).toBe("2024-01-05");
  });

  test("uses local calendar day near midnight, not UTC day", () => {
    const lateLocal = new Date(2024, 5, 15, 23, 59, 59);
    const earlyLocal = new Date(2024, 5, 16, 0, 0, 0);
    expect(formatLocalDate(lateLocal)).toBe("2024-06-15");
    expect(formatLocalDate(earlyLocal)).toBe("2024-06-16");
  });
});

describe("todayLocalDate", () => {
  test("formats the provided now", () => {
    expect(todayLocalDate(new Date(2024, 11, 31, 8, 0, 0))).toBe("2024-12-31");
  });
});

describe("addCalendarDays", () => {
  test("crosses month end", () => {
    expect(addCalendarDays("2024-01-31", 1)).toBe("2024-02-01");
  });

  test("crosses year end", () => {
    expect(addCalendarDays("2024-12-31", 1)).toBe("2025-01-01");
  });

  test("handles leap day boundaries", () => {
    expect(addCalendarDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addCalendarDays("2024-02-29", 1)).toBe("2024-03-01");
    expect(addCalendarDays("2023-02-28", 1)).toBe("2023-03-01");
  });

  test("subtracts calendar days", () => {
    expect(addCalendarDays("2024-03-01", -1)).toBe("2024-02-29");
  });
});

describe("compareLocalDates", () => {
  test("orders local dates", () => {
    expect(compareLocalDates("2024-01-01", "2024-01-02")).toBeLessThan(0);
    expect(compareLocalDates("2024-01-02", "2024-01-02")).toBe(0);
    expect(compareLocalDates("2024-01-03", "2024-01-02")).toBeGreaterThan(0);
  });
});
