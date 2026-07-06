"use client";

import { Plus } from "lucide-react";

import { CalendarColorCheckbox } from "@/components/calendar/calendar-color-checkbox";
import type { CalendarItem } from "@/lib/calendar-data";
import { cn } from "@/lib/utils";

type CalendarListSectionProps = {
  title: string;
  calendars: CalendarItem[];
};

export function CalendarListSection({
  title,
  calendars,
}: CalendarListSectionProps) {
  return (
    <section className="flex w-full flex-col gap-1">
      <h2 className="px-2 py-1.5 text-sm font-medium leading-5 tracking-tight text-foreground">
        {title}
      </h2>

      <ul className="flex w-full flex-col">
        {calendars.map((calendar) => (
          <li key={calendar.id}>
            <label
              className={cn(
                "flex w-full cursor-pointer items-center gap-1.5 px-2 py-1.5",
                "transition-colors duration-default ease-out hover:bg-muted"
              )}
            >
              <CalendarColorCheckbox
                color={calendar.color}
                defaultChecked
              />
              <span className="min-w-0 flex-1 truncate text-sm leading-5 tracking-tight text-foreground">
                {calendar.name}
              </span>
            </label>
          </li>
        ))}

        <li>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-1.5 px-2 py-1.5",
              "text-sm leading-5 tracking-tight text-muted-foreground",
              "transition-colors duration-default ease-out hover:bg-muted"
            )}
          >
            <Plus className="size-4 shrink-0" />
            <span>캘린더 추가</span>
          </button>
        </li>
      </ul>
    </section>
  );
}
