import { DEFAULT_PERSON_ID, getPeople } from "@/lib/calendar-events";

export type CalendarColor =
  | "blue"
  | "teal"
  | "orange"
  | "rose"
  | "violet";

export type CalendarItem = {
  id: string;
  name: string;
  role?: string;
  color?: CalendarColor;
  /** Clean sidebar checkbox color (Toss palette). */
  checkboxColor?: string;
};

export const CALENDAR_COLOR_CLASSES: Record<
  CalendarColor,
  { checked: string }
> = {
  blue: {
    checked: "data-checked:bg-primary data-checked:border-primary",
  },
  teal: {
    checked:
      "data-checked:bg-toss-teal-500 data-checked:border-toss-teal-500",
  },
  orange: {
    checked:
      "data-checked:bg-toss-orange-500 data-checked:border-toss-orange-500",
  },
  rose: {
    checked: "data-checked:bg-toss-red-500 data-checked:border-toss-red-500",
  },
  violet: {
    checked:
      "data-checked:bg-toss-purple-500 data-checked:border-toss-purple-500",
  },
};

/** Sidebar checkbox colors — Toss 300/400 tokens for clear, non-muddy hues. */
const PERSON_CHECKBOX_COLORS: Record<string, string> = {
  po1: "var(--purple400)",
  fe1: "var(--teal400)",
  be1: "var(--orange400)",
  sales1: "var(--red400)",
  marketer1: "var(--green400)",
};

export function getPersonCheckboxColor(personId: string) {
  if (personId === DEFAULT_PERSON_ID) {
    return "var(--primary)";
  }

  return PERSON_CHECKBOX_COLORS[personId] ?? "var(--grey300)";
}

const TEAM_MEMBER_CALENDAR_IDS = new Set(["po1", "fe1", "be1"]);

export const HOLIDAY_CALENDAR_ID = "holidays";

const HOLIDAY_CALENDAR: CalendarItem = {
  id: HOLIDAY_CALENDAR_ID,
  name: "공휴일",
  checkboxColor: "var(--grey400)",
};

function personToCalendarItem(person: ReturnType<typeof getPeople>[number]): CalendarItem {
  const isMine = person.id === DEFAULT_PERSON_ID;

  return {
    id: person.id,
    name: person.name,
    role: person.role,
    ...(isMine
      ? { color: "blue" as const }
      : {
          checkboxColor: PERSON_CHECKBOX_COLORS[person.id] ?? "var(--blue400)",
        }),
  };
}

export const MY_CALENDARS: CalendarItem[] = [
  ...getPeople()
    .filter((person) => person.id === DEFAULT_PERSON_ID)
    .map(personToCalendarItem),
  HOLIDAY_CALENDAR,
];

export const OTHER_CALENDARS: CalendarItem[] = getPeople()
  .filter((person) => TEAM_MEMBER_CALENDAR_IDS.has(person.id))
  .map(personToCalendarItem);
