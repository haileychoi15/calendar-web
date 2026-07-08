import { addMinutes, format } from "date-fns";
import { ko } from "date-fns/locale";

import {
  getAllDayEventsForDate,
  getPersonById,
  getTimedEventsForDate,
} from "@/lib/calendar-events";
import { createKstDateTime } from "@/lib/create-event-form";
import {
  getKstParts,
  HOUR_SLOT_HEIGHT,
  isWeekendKst,
  toKstDateKey,
} from "@/lib/calendar-week";

export type AvailableTimeAttendee = {
  id: string;
  name: string;
  requirement: "required" | "optional";
};

export type AvailableTimeSlot = {
  start: Date;
  end: Date;
  kind: "all" | "required-only";
  unavailableOptionalAttendees: AvailableTimeAttendee[];
};

export type AvailableTimesResult = {
  allAvailableSlots: AvailableTimeSlot[];
  requiredOnlySlots: AvailableTimeSlot[];
  showRequiredOnlySection: boolean;
};

const SLOT_DURATION_MINUTES = 60;
const SLOT_STEP_MINUTES = 30;
const BUSINESS_HOUR_START = 9;
const BUSINESS_HOUR_END = 18;
const LUNCH_BREAK_START_MINUTES = 12 * 60;
const LUNCH_BREAK_END_MINUTES = 13 * 60;
const MAX_DISPLAY_SLOTS = 4;
const SEARCH_LOADING_DELAY_MS = 700;

export { SEARCH_LOADING_DELAY_MS };

function isCalendarPersonId(personId: string) {
  return getPersonById(personId) !== undefined;
}

function slotsOverlap(
  slotStart: Date,
  slotEnd: Date,
  eventStart: Date,
  eventEnd: Date
) {
  return slotStart.getTime() < eventEnd.getTime() && slotEnd.getTime() > eventStart.getTime();
}

function roundUpToNextSlot(now: Date, stepMinutes: number) {
  const parts = getKstParts(now);
  const totalMinutes = parts.hour * 60 + parts.minute;
  const roundedMinutes = Math.ceil(totalMinutes / stepMinutes) * stepMinutes;

  return createKstDateTime(
    parts.year,
    parts.month,
    parts.day,
    Math.floor(roundedMinutes / 60),
    roundedMinutes % 60
  );
}

function getSearchRangeEnd(now: Date) {
  const parts = getKstParts(now);
  const daysUntilNextWeekFriday = ((5 - parts.dayOfWeek + 7) % 7) + 7;

  return createKstDateTime(
    parts.year,
    parts.month,
    parts.day + daysUntilNextWeekFriday,
    BUSINESS_HOUR_END,
    0
  );
}

function isWithinBusinessHours(slotStart: Date, slotEnd: Date) {
  const startParts = getKstParts(slotStart);
  const endParts = getKstParts(slotEnd);

  if (isWeekendKst(slotStart)) return false;

  const startMinutes = startParts.hour * 60 + startParts.minute;
  const endMinutes = endParts.hour * 60 + endParts.minute;
  const businessStart = BUSINESS_HOUR_START * 60;
  const businessEnd = BUSINESS_HOUR_END * 60;

  const withinWorkHours = startMinutes >= businessStart && endMinutes <= businessEnd;
  if (!withinWorkHours) return false;

  // Exclude lunch break slots that overlap 12:00–13:00.
  const overlapsLunch =
    startMinutes < LUNCH_BREAK_END_MINUTES && endMinutes > LUNCH_BREAK_START_MINUTES;

  return !overlapsLunch;
}

function isPersonBusyDuring(
  personId: string,
  slotStart: Date,
  slotEnd: Date
) {
  if (!isCalendarPersonId(personId)) return false;

  const allDayEvents = getAllDayEventsForDate(slotStart, personId);
  if (allDayEvents.length > 0) return true;

  const timedEvents = getTimedEventsForDate(slotStart, personId);
  return timedEvents.some((event) =>
    slotsOverlap(slotStart, slotEnd, event.start, event.end)
  );
}

function getUnavailableAttendees(
  attendees: AvailableTimeAttendee[],
  slotStart: Date,
  slotEnd: Date
) {
  return attendees.filter((attendee) =>
    isPersonBusyDuring(attendee.id, slotStart, slotEnd)
  );
}

function alignToNextBusinessSlot(date: Date) {
  let cursor = roundUpToNextSlot(date, SLOT_STEP_MINUTES);

  while (true) {
    const parts = getKstParts(cursor);

    if (isWeekendKst(cursor)) {
      const daysToMonday = parts.dayOfWeek === 0 ? 1 : 2;
      cursor = createKstDateTime(
        parts.year,
        parts.month,
        parts.day + daysToMonday,
        BUSINESS_HOUR_START,
        0
      );
      continue;
    }

    const minutes = parts.hour * 60 + parts.minute;
    const businessStart = BUSINESS_HOUR_START * 60;
    const businessEnd = BUSINESS_HOUR_END * 60;

    if (minutes >= businessEnd) {
      cursor = createKstDateTime(
        parts.year,
        parts.month,
        parts.day + 1,
        BUSINESS_HOUR_START,
        0
      );
      continue;
    }

    if (minutes < businessStart) {
      return createKstDateTime(
        parts.year,
        parts.month,
        parts.day,
        BUSINESS_HOUR_START,
        0
      );
    }

    return cursor;
  }
}

function generateCandidateSlots(now: Date) {
  const candidates: Array<{ start: Date; end: Date }> = [];
  let cursor = alignToNextBusinessSlot(now);
  const rangeEnd = getSearchRangeEnd(now);

  while (cursor.getTime() < rangeEnd.getTime()) {
    cursor = alignToNextBusinessSlot(cursor);
    if (cursor.getTime() >= rangeEnd.getTime()) break;

    const end = addMinutes(cursor, SLOT_DURATION_MINUTES);

    if (
      isWithinBusinessHours(cursor, end) &&
      end.getTime() <= rangeEnd.getTime()
    ) {
      candidates.push({ start: cursor, end });
    }

    cursor = addMinutes(cursor, SLOT_STEP_MINUTES);
  }

  return candidates;
}

function buildSlot(
  start: Date,
  end: Date,
  kind: AvailableTimeSlot["kind"],
  unavailableOptionalAttendees: AvailableTimeAttendee[]
): AvailableTimeSlot {
  return {
    start,
    end,
    kind,
    unavailableOptionalAttendees,
  };
}

function slotKey(slot: Pick<AvailableTimeSlot, "start" | "end">) {
  return `${slot.start.getTime()}-${slot.end.getTime()}`;
}

function excludeExistingSlots(
  slots: AvailableTimeSlot[],
  excluded: AvailableTimeSlot[]
) {
  const excludedKeys = new Set(excluded.map(slotKey));
  return slots.filter((slot) => !excludedKeys.has(slotKey(slot)));
}

export function formatAvailableTimeSlotLabel(start: Date, end: Date) {
  const dateLabel = format(start, "M월 d일 (EEE)", { locale: ko });
  const startParts = getKstParts(start);
  const endParts = getKstParts(end);
  const startPeriod = startParts.hour < 12 ? "오전" : "오후";
  const endPeriod = endParts.hour < 12 ? "오전" : "오후";
  const startClock = formatAvailableClockTimeShort(start);
  const endClock = formatAvailableClockTimeShort(end);

  const timeLabel =
    startPeriod === endPeriod
      ? `${startPeriod} ${startClock} - ${endClock}`
      : `${startPeriod} ${startClock} - ${endPeriod} ${endClock}`;

  return `${dateLabel} · ${timeLabel}`;
}

export function formatAvailableTimeSlotHoverLabel(start: Date, end: Date) {
  const startParts = getKstParts(start);
  const endParts = getKstParts(end);
  const startPeriod = startParts.hour < 12 ? "오전" : "오후";
  const endPeriod = endParts.hour < 12 ? "오전" : "오후";
  const startClock = formatAvailableClockTimeKorean(start);
  const endClock = formatAvailableClockTimeKorean(end);

  return startPeriod === endPeriod
    ? `${startPeriod} ${startClock} ~ ${endClock}`
    : `${startPeriod} ${startClock} ~ ${endPeriod} ${endClock}`;
}

function formatAvailableClockTimeKorean(date: Date) {
  const { hour, minute } = getKstParts(date);
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  if (minute === 0) return `${hour12}시`;

  const paddedMinute = String(minute).padStart(2, "0");
  return `${hour12}:${paddedMinute}`;
}

function formatAvailableClockTime(date: Date) {
  const { hour, minute } = getKstParts(date);
  const paddedMinute = String(minute).padStart(2, "0");

  if (hour === 0) return `오전 12:${paddedMinute}`;
  if (hour < 12) return `오전 ${hour}:${paddedMinute}`;
  if (hour === 12) return `오후 12:${paddedMinute}`;
  return `오후 ${hour - 12}:${paddedMinute}`;
}

function formatAvailableClockTimeShort(date: Date) {
  const { hour, minute } = getKstParts(date);
  const paddedMinute = String(minute).padStart(2, "0");
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${paddedMinute}`;
}

export function findAvailableTimes(
  attendees: AvailableTimeAttendee[],
  now: Date = new Date()
): AvailableTimesResult {
  const requiredAttendees = attendees.filter(
    (attendee) => attendee.requirement === "required"
  );
  const optionalAttendees = attendees.filter(
    (attendee) => attendee.requirement === "optional"
  );

  const allAvailableSlots: AvailableTimeSlot[] = [];
  const requiredOnlySlots: AvailableTimeSlot[] = [];

  for (const candidate of generateCandidateSlots(now)) {
    const unavailableRequired = getUnavailableAttendees(
      requiredAttendees,
      candidate.start,
      candidate.end
    );

    if (unavailableRequired.length > 0) continue;

    const unavailableOptional = getUnavailableAttendees(
      optionalAttendees,
      candidate.start,
      candidate.end
    );

    if (unavailableOptional.length === 0) {
      allAvailableSlots.push(
        buildSlot(candidate.start, candidate.end, "all", [])
      );
      continue;
    }

    requiredOnlySlots.push(
      buildSlot(
        candidate.start,
        candidate.end,
        "required-only",
        unavailableOptional
      )
    );
  }

  const allCount = allAvailableSlots.length;
  let displayAll = allAvailableSlots;
  let displayRequired = requiredOnlySlots;
  let showRequiredOnlySection = false;

  if (allCount === 0) {
    showRequiredOnlySection = true;
    displayRequired = requiredOnlySlots.slice(0, MAX_DISPLAY_SLOTS);
  } else if (allCount === 1) {
    showRequiredOnlySection = true;
    displayAll = allAvailableSlots;
    displayRequired = excludeExistingSlots(requiredOnlySlots, displayAll).slice(
      0,
      MAX_DISPLAY_SLOTS
    );
  } else {
    displayAll = allAvailableSlots.slice(0, MAX_DISPLAY_SLOTS);
    showRequiredOnlySection = false;
    displayRequired = [];
  }

  return {
    allAvailableSlots: displayAll,
    requiredOnlySlots: displayRequired,
    showRequiredOnlySection,
  };
}

export function getAvailableTimeSlotKey(slot: AvailableTimeSlot) {
  return `${slotKey(slot)}-${slot.kind}`;
}

export function getDisplayedAvailableTimeSlots(
  result: AvailableTimesResult | null
) {
  if (!result) return [];

  return [...result.allAvailableSlots, ...result.requiredOnlySlots];
}

export function getAvailableTimeSlotLayout(start: Date, end: Date) {
  const { hour, minute } = getKstParts(start);
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  return {
    top: (hour + minute / 60) * HOUR_SLOT_HEIGHT,
    height: Math.max(durationHours * HOUR_SLOT_HEIGHT, 20),
  };
}

export function isAvailableTimeSlotOnDate(slot: AvailableTimeSlot, date: Date) {
  return toKstDateKey(slot.start) === toKstDateKey(date);
}
