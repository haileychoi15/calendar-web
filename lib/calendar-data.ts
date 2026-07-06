export type CalendarColor =
  | "blue"
  | "teal"
  | "orange"
  | "rose"
  | "violet";

export type CalendarItem = {
  id: string;
  name: string;
  color: CalendarColor;
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

export const MY_CALENDARS: CalendarItem[] = [
  { id: "my-1", name: "김헤일리", color: "blue" },
  { id: "my-2", name: "Product Team", color: "rose" },
  { id: "my-3", name: "생일", color: "orange" },
  { id: "my-4", name: "공휴일", color: "violet" },
  { id: "my-5", name: "휴가", color: "teal" },
];

export const OTHER_CALENDARS: CalendarItem[] = [
  { id: "other-1", name: "Product KR Team", color: "blue" },
  { id: "other-2", name: "Holidays in South Korea", color: "rose" },
  { id: "other-3", name: "Flex", color: "teal" },
  { id: "other-4", name: "Company Events", color: "orange" },
  { id: "other-5", name: "Design Review", color: "violet" },
];
