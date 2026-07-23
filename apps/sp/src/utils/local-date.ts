import { addDays, compareAsc, format, isValid, parseISO } from "date-fns";

/** Local calendar day as `YYYY-MM-DD` (device timezone). */
export type LocalDate = string;

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATE_FORMAT = "yyyy-MM-dd";

/**
 * Parse a `YYYY-MM-DD` local calendar day.
 * Rejects malformed strings and non-existent calendar dates (e.g. 2023-02-29).
 */
export function parseLocalDate(yyyyMmDd: string): Date {
  if (!LOCAL_DATE_PATTERN.test(yyyyMmDd)) {
    throw new Error(`Invalid local date: ${yyyyMmDd}`);
  }

  const date = parseISO(yyyyMmDd);
  if (!isValid(date) || format(date, LOCAL_DATE_FORMAT) !== yyyyMmDd) {
    throw new Error(`Invalid local date: ${yyyyMmDd}`);
  }

  return date;
}

/** Format a `Date` to the device-local calendar day `YYYY-MM-DD`. */
export function formatLocalDate(date: Date): LocalDate {
  if (!isValid(date)) {
    throw new Error("Invalid Date");
  }
  return format(date, LOCAL_DATE_FORMAT);
}

/**
 * Today's local calendar day.
 * `@date-fns/tz` is intentionally not used; `now` is interpreted in the device timezone.
 */
export function todayLocalDate(now: Date = new Date()): LocalDate {
  return formatLocalDate(now);
}

/** Add (or subtract) calendar days to a local date string. */
export function addCalendarDays(localDate: LocalDate, days: number): LocalDate {
  return formatLocalDate(addDays(parseLocalDate(localDate), days));
}

/** Compare two local dates. Returns negative / 0 / positive like `compareAsc`. */
export function compareLocalDates(a: LocalDate, b: LocalDate): number {
  return compareAsc(parseLocalDate(a), parseLocalDate(b));
}
