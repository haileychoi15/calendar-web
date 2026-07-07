"use client";

import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarWeekView } from "@/components/calendar/calendar-week-view";
import { CalendarSidebar } from "@/components/calendar/calendar-sidebar";
import { getPeople } from "@/lib/calendar-events";
import { getWeekStart } from "@/lib/calendar-week";
import { addDays } from "date-fns";

import { useCallback, useMemo, useState } from "react";

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [miniClickHighlight, setMiniClickHighlight] = useState<{
    date: Date;
    nonce: number;
  } | null>(null);
  const [visiblePersonIds, setVisiblePersonIds] = useState<string[]>(() =>
    getPeople().map((person) => person.id)
  );
  const visiblePersonIdSet = useMemo(
    () => new Set(visiblePersonIds),
    [visiblePersonIds]
  );

  const goToToday = useCallback(() => {
    const today = new Date();
    setSelectedDate(today);
    setWeekStart(getWeekStart(today));
    setMiniClickHighlight(null);
  }, []);

  const goToPreviousWeek = useCallback(() => {
    setSelectedDate((date) => addDays(date, -7));
    setWeekStart((start) => addDays(start, -7));
    setMiniClickHighlight(null);
  }, []);

  const goToNextWeek = useCallback(() => {
    setSelectedDate((date) => addDays(date, 7));
    setWeekStart((start) => addDays(start, 7));
    setMiniClickHighlight(null);
  }, []);

  const handleToggleCalendarVisibility = useCallback(
    (calendarId: string, visible: boolean) => {
      setVisiblePersonIds((prev) => {
        if (visible) {
          return prev.includes(calendarId) ? prev : [...prev, calendarId];
        }

        return prev.filter((id) => id !== calendarId);
      });
    },
    []
  );

  return (
    <div className="flex h-svh bg-background">
      <CalendarSidebar
        currentDate={selectedDate}
        weekStart={weekStart}
        visiblePersonIds={visiblePersonIdSet}
        onToggleCalendarVisibility={handleToggleCalendarVisibility}
        onDateSelect={(date) => {
          setSelectedDate(date);
          setWeekStart(getWeekStart(date));
          setMiniClickHighlight((prev) => ({
            date,
            nonce: (prev?.nonce ?? 0) + 1,
          }));
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <CalendarHeader
          weekStart={weekStart}
          onToday={goToToday}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
        />
        <CalendarWeekView
          weekStart={weekStart}
          visiblePersonIds={visiblePersonIdSet}
          highlight={
            miniClickHighlight
              ? { date: miniClickHighlight.date, nonce: miniClickHighlight.nonce }
              : null
          }
        />
      </div>
    </div>
  );
}
