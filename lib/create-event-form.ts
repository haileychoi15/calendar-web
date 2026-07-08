import { addHours, addMinutes, format } from "date-fns";
import { ko } from "date-fns/locale";

import { getKstParts } from "@/lib/calendar-week";

export const EVENT_TYPE_OPTIONS = [
  { value: "meeting", label: "회의" },
  { value: "외근", label: "외근" },
  { value: "휴가", label: "휴가" },
  { value: "기타", label: "기타" },
] as const;

export type EventTypeOption = (typeof EVENT_TYPE_OPTIONS)[number]["value"];

export const MEETING_DURATION_OPTIONS = [
  { minutes: 30, label: "30분" },
  { minutes: 60, label: "1시간" },
  { minutes: 90, label: "1시간 30분" },
  { minutes: 120, label: "2시간" },
  { minutes: 180, label: "3시간" },
] as const;

export const DEFAULT_MEETING_DURATION_MINUTES = 60;

export function createKstDateTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
) {
  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  const paddedHour = String(hour).padStart(2, "0");
  const paddedMinute = String(minute).padStart(2, "0");

  return new Date(
    `${year}-${paddedMonth}-${paddedDay}T${paddedHour}:${paddedMinute}:00+09:00`
  );
}

export function applyKstDate(base: Date, nextDate: Date) {
  const time = getKstParts(base);
  const date = getKstParts(nextDate);

  return createKstDateTime(
    date.year,
    date.month,
    date.day,
    time.hour,
    time.minute
  );
}

export function applyKstTime(baseDate: Date, hour: number, minute: number) {
  const parts = getKstParts(baseDate);
  return createKstDateTime(
    parts.year,
    parts.month,
    parts.day,
    hour,
    minute
  );
}

export function getKstTimeValue(date: Date) {
  const { hour, minute } = getKstParts(date);
  return `${hour}:${minute}`;
}

export function parseKstTimeValue(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return { hour: hour ?? 0, minute: minute ?? 0 };
}

export function formatCreateEventDate(date: Date) {
  return format(date, "M월 d일 (EEE)", { locale: ko });
}

export function formatCreateEventClockTime(date: Date) {
  const { hour, minute } = getKstParts(date);
  const paddedMinute = String(minute).padStart(2, "0");

  if (hour === 0) return `오전 12:${paddedMinute}`;
  if (hour < 12) return `오전 ${hour}:${paddedMinute}`;
  if (hour === 12) return `오후 12:${paddedMinute}`;
  return `오후 ${hour - 12}:${paddedMinute}`;
}

export function formatCreateEventDuration(start: Date, end: Date) {
  const totalMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  return formatMeetingDurationLabel(totalMinutes);
}

export function formatMeetingDurationLabel(totalMinutes: number) {
  if (totalMinutes <= 0) return "";

  const preset = MEETING_DURATION_OPTIONS.find(
    (option) => option.minutes === totalMinutes
  );
  if (preset) return preset.label;

  if (totalMinutes % 60 === 0) {
    const hours = totalMinutes / 60;
    return hours === 1 ? "1시간" : `${hours}시간`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return hours === 1 ? "1시간" : `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}

export function addKstMinutes(date: Date, minutes: number) {
  const next = addMinutes(date, minutes);
  const parts = getKstParts(next);

  return createKstDateTime(
    parts.year,
    parts.month,
    parts.day,
    parts.hour,
    parts.minute
  );
}

export function snapToMeetingDurationMinutes(totalMinutes: number) {
  if (totalMinutes <= 0) return DEFAULT_MEETING_DURATION_MINUTES;

  const exact = MEETING_DURATION_OPTIONS.find(
    (option) => option.minutes === totalMinutes
  );
  if (exact) return exact.minutes;

  return MEETING_DURATION_OPTIONS.reduce((closest, option) => {
    return Math.abs(option.minutes - totalMinutes) <
      Math.abs(closest.minutes - totalMinutes)
      ? option
      : closest;
  }).minutes;
}

export function getDefaultEventTimes() {
  const now = new Date();
  return {
    date: now,
    start: now,
    end: addHours(now, 1),
  };
}

const TIME_SLOT_MINUTES = 30;

export function generateTimeOptions() {
  const options: Array<{
    value: string;
    label: string;
    hour: number;
    minute: number;
  }> = [];

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += TIME_SLOT_MINUTES) {
      const sample = createKstDateTime(2026, 1, 1, hour, minute);
      options.push({
        value: `${hour}:${minute}`,
        label: formatCreateEventClockTime(sample),
        hour,
        minute,
      });
    }
  }

  return options;
}

export const TIME_OPTIONS = generateTimeOptions();

export const MEETING_ROOM_OPTIONS = ["미팅룸1", "미팅룸2"] as const;
