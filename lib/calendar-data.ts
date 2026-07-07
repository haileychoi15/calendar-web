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
  team?: string;
  color?: CalendarColor;
  /** Clean sidebar checkbox color (Toss palette). */
  checkboxColor?: string;
};

export const CALENDAR_COLOR_CLASSES: Record<
  CalendarColor,
  { checked: string; border: string }
> = {
  blue: {
    checked: "data-checked:bg-primary data-checked:border-primary",
    border: "border-primary/40",
  },
  teal: {
    checked:
      "data-checked:bg-toss-teal-500 data-checked:border-toss-teal-500",
    border: "border-toss-teal-500/40",
  },
  orange: {
    checked:
      "data-checked:bg-toss-orange-500 data-checked:border-toss-orange-500",
    border: "border-toss-orange-500/40",
  },
  rose: {
    checked: "data-checked:bg-toss-red-500 data-checked:border-toss-red-500",
    border: "border-toss-red-500/40",
  },
  violet: {
    checked:
      "data-checked:bg-toss-purple-500 data-checked:border-toss-purple-500",
    border: "border-toss-purple-500/40",
  },
};

/** Sidebar checkbox colors — Toss 300/400 tokens for clear, non-muddy hues. */
const PERSON_CHECKBOX_COLORS: Record<string, string> = {
  po1: "var(--purple400)",
  designer1: "var(--blue300)",
  fe1: "var(--teal400)",
  be1: "var(--orange400)",
  sales1: "var(--red400)",
  marketer1: "var(--green400)",
};

const PERSON_TEAMS: Record<string, string> = {
  designer1: "Product",
  po1: "Product",
  fe1: "Product",
  be1: "Product",
  sales1: "Marketing",
  marketer1: "Sales",
};

function personToCalendarItem(person: ReturnType<typeof getPeople>[number]): CalendarItem {
  return {
    id: person.id,
    name: person.name,
    team: PERSON_TEAMS[person.id],
    checkboxColor: PERSON_CHECKBOX_COLORS[person.id] ?? "var(--blue400)",
  };
}

export const MY_CALENDARS: CalendarItem[] = getPeople()
  .filter((person) => person.id === DEFAULT_PERSON_ID)
  .map(personToCalendarItem);

export const OTHER_CALENDARS: CalendarItem[] = getPeople()
  .filter((person) => person.id !== DEFAULT_PERSON_ID)
  .map(personToCalendarItem);
