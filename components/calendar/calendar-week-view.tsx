"use client";

import { useEffect, useMemo, useRef } from "react";

import { useKstNow } from "@/hooks/use-kst-now";
import {
  formatHourLabel,
  formatNowBadge,
  formatWeekdayHeader,
  formatWeekViewMonthTitle,
  getKstParts,
  getNowOffsetTop,
  getWeekDays,
  HOUR_SLOT_HEIGHT,
  HOURS_IN_DAY,
  INITIAL_SCROLL_HOUR,
  isTodayKst,
  isWeekendKst,
  TIME_GUTTER_WIDTH,
} from "@/lib/calendar-week";
import { cn } from "@/lib/utils";

type CalendarWeekViewProps = {
  currentDate: Date;
};

const HOURS = Array.from({ length: HOURS_IN_DAY }, (_, hour) => hour);

function getColumnClassName(date: Date) {
  const isWeekend = isWeekendKst(date);
  const isToday = isTodayKst(date);

  if (isWeekend) return "bg-muted/50";
  if (isToday) return "bg-primary/5";
  return undefined;
}

type WeekdayHeaderCellProps = {
  date: Date;
};

function WeekdayHeaderCell({ date }: WeekdayHeaderCellProps) {
  const isToday = isTodayKst(date);
  const { day } = getKstParts(date);
  const weekdayLabel = formatWeekdayHeader(date).split(" ")[0];

  return (
    <div
      className={cn(
        "flex h-10 items-center justify-center gap-1 border-r border-border text-sm last:border-r-0",
        getColumnClassName(date)
      )}
    >
      <span className={cn(isToday && "text-primary")}>{weekdayLabel}</span>
      {isToday ? (
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {day}
        </span>
      ) : (
        <span>{day}</span>
      )}
    </div>
  );
}

type NowIndicatorProps = {
  now: Date;
};

function NowIndicator({ now }: NowIndicatorProps) {
  const top = getNowOffsetTop(now);

  return (
    <>
      <div
        className="pointer-events-none absolute right-0 z-20 h-0.5 bg-primary"
        style={{
          top,
          left: TIME_GUTTER_WIDTH,
        }}
      />
      <div
        className="pointer-events-none absolute z-20 flex justify-end pr-1"
        style={{
          top: top - 10,
          left: 0,
          width: TIME_GUTTER_WIDTH,
        }}
      >
        <span className="rounded-md bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
          {formatNowBadge(now)}
        </span>
      </div>
    </>
  );
}

export function CalendarWeekView({ currentDate }: CalendarWeekViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const now = useKstNow();
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const monthTitle = useMemo(
    () => formatWeekViewMonthTitle(currentDate),
    [currentDate]
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollTop = INITIAL_SCROLL_HOUR * HOUR_SLOT_HEIGHT;
  }, [currentDate]);

  return (
    <main
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-background"
      style={{ ["--time-gutter" as string]: TIME_GUTTER_WIDTH }}
    >
      <div className="sticky top-0 z-10 shrink-0 border-b border-border bg-background">
        <div className="px-4 pt-4">
          <h1 className="text-lg font-semibold text-foreground">{monthTitle}</h1>
          <p className="text-xs text-muted-foreground">GMT+9</p>
        </div>

        <div className="grid grid-cols-[var(--time-gutter)_1fr]">
          <div className="border-r border-border" />
          <div className="grid grid-cols-7">
            {weekDays.map((date) => (
              <WeekdayHeaderCell key={date.toISOString()} date={date} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[var(--time-gutter)_1fr] border-t border-border">
          <div className="h-8 border-r border-border" />
          <div className="grid h-8 grid-cols-7">
            {weekDays.map((date) => (
              <div
                key={`allday-${date.toISOString()}`}
                className={cn(
                  "border-r border-border last:border-r-0",
                  getColumnClassName(date)
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
      >
        <div className="relative grid grid-cols-[var(--time-gutter)_1fr]">
          <div className="border-r border-border">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex items-start justify-end pr-2 text-xs text-muted-foreground"
                style={{ height: HOUR_SLOT_HEIGHT }}
              >
                <span className="-translate-y-2">{formatHourLabel(hour)}</span>
              </div>
            ))}
          </div>

          <div className="relative grid grid-cols-7">
            {weekDays.map((date) => (
              <div
                key={`grid-${date.toISOString()}`}
                className={cn(
                  "border-r border-border last:border-r-0",
                  getColumnClassName(date)
                )}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-border"
                    style={{ height: HOUR_SLOT_HEIGHT }}
                  />
                ))}
              </div>
            ))}
          </div>

          <NowIndicator now={now} />
        </div>
      </div>
    </main>
  );
}
