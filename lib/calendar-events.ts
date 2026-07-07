import eventsData from "@/data/events.json";

import { getKstParts, HOUR_SLOT_HEIGHT, toKstDateKey } from "@/lib/calendar-week";

export type Person = {
  id: string;
  name: string;
  role: string;
  color: string;
  textColor: string;
};

export type EventType = "meeting" | "외근" | "휴가" | "기타";

export type EventStatus = "confirmed" | "pending";

export type RawCalendarEvent = {
  person_id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  type: EventType;
  location: string | null;
  status?: EventStatus;
};

export type EventsData = {
  people: Person[];
  events: RawCalendarEvent[];
};

export type CalendarEvent = {
  id: string;
  personId: string;
  title: string;
  date: string;
  start: Date;
  end: Date;
  type: EventType;
  location: string | null;
  status: EventStatus;
  isAllDay: boolean;
};

export type EventLayout = {
  top: number;
  height: number;
};

export type EventBlockAppearance = {
  backgroundColor: string;
  color: string;
  border?: string;
  showBriefcaseIcon: boolean;
  showVacationIcon: boolean;
};

/** Default calendar owner — matches header avatar "CY" (최유영) */
export const DEFAULT_PERSON_ID = "designer1";

const data = eventsData as EventsData;

const peopleById = new Map(data.people.map((person) => [person.id, person]));

function normalizeDatetime(value: string) {
  return value.replace(
    /T(\d{2}):(\d{2})\+09:00:00$/,
    "T$1:$2:00+09:00"
  );
}

function parseKstDatetime(value: string) {
  return new Date(normalizeDatetime(value));
}

function getDurationHours(start: Date, end: Date) {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

function isAllDayEvent(type: EventType, start: Date, end: Date) {
  if (type !== "휴가") return false;

  const startParts = getKstParts(start);
  const endParts = getKstParts(end);
  const durationHours = getDurationHours(start, end);

  return (
    durationHours >= 8 &&
    startParts.hour === 9 &&
    endParts.hour >= 18
  );
}

function resolveColorToken(value: string) {
  return value === "primary" ? "var(--primary)" : value;
}

export function resolvePersonColor(value: string) {
  return resolveColorToken(value);
}

function formatKstClockTime(date: Date) {
  const { hour, minute } = getKstParts(date);
  const paddedMinute = String(minute).padStart(2, "0");

  if (hour === 0) return `오전 12:${paddedMinute}`;
  if (hour < 12) return `오전 ${hour}:${paddedMinute}`;
  if (hour === 12) return `오후 12:${paddedMinute}`;
  return `오후 ${hour - 12}:${paddedMinute}`;
}

function toCalendarEvent(raw: RawCalendarEvent, index: number): CalendarEvent {
  const start = parseKstDatetime(raw.start);
  const end = parseKstDatetime(raw.end);

  return {
    id: `${raw.person_id}-${raw.date}-${index}`,
    personId: raw.person_id,
    title: raw.title,
    date: raw.date,
    start,
    end,
    type: raw.type,
    location: raw.location,
    status: raw.status ?? "confirmed",
    isAllDay: isAllDayEvent(raw.type, start, end),
  };
}

const calendarEvents = data.events.map(toCalendarEvent);

export function getPeople() {
  return data.people;
}

export function getPersonById(personId: string) {
  return peopleById.get(personId);
}

export function getEventDurationMinutes(event: CalendarEvent) {
  return getDurationHours(event.start, event.end) * 60;
}

export function isShortEvent(event: CalendarEvent) {
  return getEventDurationMinutes(event) < 30;
}

export function formatEventTimeLine(event: CalendarEvent) {
  const timeRange = `${formatKstClockTime(event.start)} – ${formatKstClockTime(event.end)}`;
  if (event.location) return `${timeRange}, ${event.location}`;
  return timeRange;
}

export function getEventBlockAppearance(
  event: CalendarEvent,
  viewerPersonId: string = DEFAULT_PERSON_ID
): EventBlockAppearance {
  const person = getPersonById(event.personId);
  const isMine = event.personId === viewerPersonId;
  const showBriefcaseIcon = event.type === "외근";
  const showVacationIcon = event.type === "휴가";

  if (isMine && event.status === "pending") {
    return {
      backgroundColor: "transparent",
      color: "var(--primary)",
      border: "1.5px solid var(--primary)",
      showBriefcaseIcon,
      showVacationIcon,
    };
  }

  if (isMine) {
    return {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      showBriefcaseIcon,
      showVacationIcon,
    };
  }

  if (!person) {
    return {
      backgroundColor: "var(--muted)",
      color: "var(--foreground)",
      showBriefcaseIcon,
      showVacationIcon,
    };
  }

  return {
    backgroundColor: resolveColorToken(person.color),
    color: resolveColorToken(person.textColor),
    showBriefcaseIcon,
    showVacationIcon,
  };
}

export function getEventLayout(event: CalendarEvent): EventLayout {
  const { hour, minute } = getKstParts(event.start);
  const durationHours = getDurationHours(event.start, event.end);

  return {
    top: (hour + minute / 60) * HOUR_SLOT_HEIGHT,
    height: Math.max(durationHours * HOUR_SLOT_HEIGHT, 20),
  };
}

export function getEventsForPerson(personId: string = DEFAULT_PERSON_ID) {
  return calendarEvents.filter((event) => event.personId === personId);
}

export function getEventsForDate(
  date: Date,
  personId?: string,
  visiblePersonIds?: ReadonlySet<string>
) {
  const dateKey = toKstDateKey(date);
  let events = calendarEvents.filter((event) => event.date === dateKey);

  if (personId) {
    events = events.filter((event) => event.personId === personId);
  } else if (visiblePersonIds) {
    events = events.filter((event) => visiblePersonIds.has(event.personId));
  }

  return events;
}

export function getTimedEventsForDate(
  date: Date,
  personId?: string,
  visiblePersonIds?: ReadonlySet<string>
) {
  return getEventsForDate(date, personId, visiblePersonIds).filter(
    (event) => !event.isAllDay
  );
}

export function getAllDayEventsForDate(
  date: Date,
  personId?: string,
  visiblePersonIds?: ReadonlySet<string>
) {
  return getEventsForDate(date, personId, visiblePersonIds).filter(
    (event) => event.isAllDay
  );
}
