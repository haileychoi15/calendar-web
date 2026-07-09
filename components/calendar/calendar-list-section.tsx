"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { CalendarColorCheckbox } from "@/components/calendar/calendar-color-checkbox";
import type { CalendarItem } from "@/lib/calendar-data";
import { cn } from "@/lib/utils";

type CalendarListSectionProps = {
  title: string;
  calendars: CalendarItem[];
  visibleCalendarIds: ReadonlySet<string>;
  disabled?: boolean;
  onToggleCalendar: (calendarId: string, visible: boolean) => void;
};

function showUnsupportedPrototypeToast() {
  toast("프로토타입에서 지원하지 않는 기능입니다.");
}

export function CalendarListSection({
  title,
  calendars,
  visibleCalendarIds,
  disabled = false,
  onToggleCalendar,
}: CalendarListSectionProps) {
  return (
    <section className="flex w-full flex-col gap-1">
      <h2 className="px-2 py-1.5 text-sm font-semibold leading-5 tracking-tight text-foreground">
        {title}
      </h2>

      <ul className="flex w-full flex-col">
        {calendars.map((calendar) => (
          <li key={calendar.id}>
            <label
              className={cn(
                "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5",
                disabled
                  ? "cursor-default"
                  : "cursor-pointer transition-colors duration-default ease-out hover:bg-muted"
              )}
              aria-disabled={disabled || undefined}
            >
              <CalendarColorCheckbox
                color={calendar.color}
                checkboxColor={calendar.checkboxColor}
                checked={visibleCalendarIds.has(calendar.id)}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  onToggleCalendar(calendar.id, checked)
                }
              />
              <span className="min-w-0 flex-1 truncate">
                <span className="text-sm font-medium text-foreground">
                  {calendar.name}
                </span>
                {calendar.role ? (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {calendar.role}
                  </span>
                ) : null}
              </span>
            </label>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={showUnsupportedPrototypeToast}
            className={cn(
              "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5",
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
