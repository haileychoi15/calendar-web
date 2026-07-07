import { addDays } from "date-fns";

const KST_TIMEZONE = "Asia/Seoul";

export const HOUR_SLOT_HEIGHT = 60;
export const HOURS_IN_DAY = 24;
export const INITIAL_SCROLL_HOUR = 7;
export const TIME_GUTTER_WIDTH = "4.5rem";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export type KstParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dayOfWeek: number;
};

function getPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
) {
  const value = parts.find((part) => part.type === type)?.value;
  return value ? Number(value) : 0;
}

export function getKstParts(date: Date): KstParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: KST_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "short",
  });

  const parts = formatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Sun";
  const dayOfWeekMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: getPart(parts, "year"),
    month: getPart(parts, "month"),
    day: getPart(parts, "day"),
    hour: getPart(parts, "hour") % 24,
    minute: getPart(parts, "minute"),
    dayOfWeek: dayOfWeekMap[weekday] ?? 0,
  };
}

function createKstNoonDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 3, 0, 0));
}

export function getWeekDays(date: Date): Date[] {
  const { year, month, day, dayOfWeek } = getKstParts(date);
  const anchor = createKstNoonDate(year, month, day);
  const weekStart = addDays(anchor, -dayOfWeek);

  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function getWeekStart(date: Date) {
  return getWeekDays(date)[0]!;
}

export function toKstDateKey(date: Date) {
  const { year, month, day } = getKstParts(date);
  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  return `${year}-${paddedMonth}-${paddedDay}`;
}

export function isSameKstDay(a: Date, b: Date) {
  return toKstDateKey(a) === toKstDateKey(b);
}

export function isDateInWeek(date: Date, weekStart: Date) {
  const weekDays = getWeekDays(weekStart);

  return weekDays.some((weekDay) => toKstDateKey(weekDay) === toKstDateKey(date));
}

export function isWeekRowActive(dates: Date[], weekStart: Date) {
  const weekStartKey = toKstDateKey(weekStart);

  return dates.some((date) => toKstDateKey(date) === weekStartKey);
}

export function isTodayKst(date: Date) {
  return isSameKstDay(date, new Date());
}

export function isWeekendKst(date: Date) {
  const { dayOfWeek } = getKstParts(date);
  return dayOfWeek === 0 || dayOfWeek === 6;
}

export function formatWeekdayHeader(date: Date) {
  const { day, dayOfWeek } = getKstParts(date);
  return `${WEEKDAY_LABELS[dayOfWeek]} ${day}`;
}

export function formatHourLabel(hour: number) {
  if (hour === 0) return "오전 12시";
  if (hour < 12) return `오전 ${hour}시`;
  if (hour === 12) return "오후 12시";
  return `오후 ${hour - 12}시`;
}

function formatMeridiemHour(hour: number) {
  if (hour === 0) return { meridiem: "오전", displayHour: 12 };
  if (hour < 12) return { meridiem: "오전", displayHour: hour };
  if (hour === 12) return { meridiem: "오후", displayHour: 12 };
  return { meridiem: "오후", displayHour: hour - 12 };
}

export function formatNowBadge(date: Date) {
  const { hour, minute } = getKstParts(date);
  const { meridiem, displayHour } = formatMeridiemHour(hour);
  const paddedMinute = String(minute).padStart(2, "0");
  return `${meridiem} ${displayHour}:${paddedMinute}`;
}

export function getNowOffsetTop(date: Date) {
  const { hour, minute } = getKstParts(date);
  return (hour + minute / 60) * HOUR_SLOT_HEIGHT;
}

export function formatWeekViewMonthTitle(date: Date) {
  const { year, month } = getKstParts(date);
  return `${year}년 ${month}월`;
}

export function getWeekMonthAnchor(weekStart: Date) {
  const weekDays = getWeekDays(weekStart);
  const first = weekDays[0]!;
  const last = weekDays[6]!;
  const firstParts = getKstParts(first);
  const lastParts = getKstParts(last);

  if (firstParts.year === lastParts.year && firstParts.month === lastParts.month) {
    return first;
  }

  // Week spans two months: use Thursday's month.
  return addDays(first, 4);
}

export function formatWeekViewMonthTitleForWeek(weekStart: Date) {
  return formatWeekViewMonthTitle(getWeekMonthAnchor(weekStart));
}
