"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ko } from "react-day-picker/locale";
import type { DayButton, WeekProps } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  formatMonthTitle,
  goToNextMonth,
  goToPreviousMonth,
} from "@/lib/calendar-date";
import { getWeekMonthAnchor, isWeekRowActive, toKstDateKey } from "@/lib/calendar-week";
import { cn } from "@/lib/utils";

type MiniCalendarProps = {
  currentDate: Date;
  weekStart: Date;
  onDateSelect: (date: Date) => void;
};

function createMiniCalendarWeek(weekStart: Date) {
  return function MiniCalendarWeek({
    week,
    className,
    children,
    ...props
  }: WeekProps) {
    const isActiveWeek = isWeekRowActive(
      week.days.map((day) => day.date),
      weekStart
    );

    return (
      <tr
        className={cn(
          className,
          isActiveWeek &&
            "[&_td]:bg-muted [&_td:first-child]:rounded-l-md [&_td:last-child]:rounded-r-md"
        )}
        {...props}
      >
        {children}
      </tr>
    );
  };
}

function MiniCalendarDayButton({
  day,
  modifiers,
  className,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = useRef<HTMLButtonElement>(null);
  const isSelected =
    modifiers.selected &&
    !modifiers.range_start &&
    !modifiers.range_end &&
    !modifiers.range_middle;

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(ko.code)}
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 rounded-(--cell-radius) border-0 p-0 text-[13px] leading-none font-medium",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        modifiers.today &&
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        isSelected &&
          !modifiers.today &&
          "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
        modifiers.outside && !isSelected && !modifiers.today && "text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function MiniCalendar({
  currentDate,
  weekStart,
  onDateSelect,
}: MiniCalendarProps) {
  const [month, setMonth] = useState(() => getWeekMonthAnchor(weekStart));
  const weekStartKey = toKstDateKey(weekStart);

  useEffect(() => {
    setMonth(getWeekMonthAnchor(weekStart));
  }, [weekStartKey, weekStart]);

  const MiniCalendarWeek = useMemo(
    () => createMiniCalendarWeek(weekStart),
    [weekStartKey, weekStart]
  );

  return (
    <div className="flex w-full flex-col items-center px-2 py-4">
      <div className="mb-1.5 flex h-8 w-full items-center gap-1.5 px-2 py-0.5">
        <p className="min-w-0 flex-1 text-sm font-semibold leading-5 tracking-tight text-foreground">
          {formatMonthTitle(month)}
        </p>
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-6 rounded-lg"
            onClick={() => setMonth((date) => goToPreviousMonth(date))}
            aria-label="이전 달"
          >
            <ChevronLeft className="size-4 text-muted-foreground" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-6 rounded-lg"
            onClick={() => setMonth((date) => goToNextMonth(date))}
            aria-label="다음 달"
          >
            <ChevronRight className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="w-full">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(date) => date && onDateSelect(date)}
          month={month}
          onMonthChange={setMonth}
          locale={ko}
          showOutsideDays
          fixedWeeks
          hideNavigation
          className={cn(
            "w-full bg-transparent p-0",
            "[--cell-size:--spacing(7)] [--cell-radius:var(--radius-sm)]"
          )}
          classNames={{
            months: "w-full",
            month: "w-full gap-0",
            month_caption: "hidden",
            nav: "hidden",
            month_grid: "w-full [&_tbody>tr+tr]:mt-1",
            weekdays: "gap-0",
            weekday:
              "flex-1 pb-2 text-[13px] font-medium text-muted-foreground select-none",
            week: "gap-0",
            day: "p-0",
            today: "",
          }}
          components={{
            Week: MiniCalendarWeek,
            DayButton: MiniCalendarDayButton,
          }}
        />
      </div>
    </div>
  );
}
