"use client";

import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarMainPlaceholder } from "@/components/calendar/calendar-main-placeholder";
import { CalendarSidebar } from "@/components/calendar/calendar-sidebar";
import {
  goToNextWeek,
  goToPreviousWeek,
} from "@/lib/calendar-date";

import { useState } from "react";

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  return (
    <div className="flex h-svh bg-background">
      <CalendarSidebar
        currentDate={currentDate}
        onDateSelect={setCurrentDate}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <CalendarHeader
          onToday={() => setCurrentDate(new Date())}
          onPreviousWeek={() =>
            setCurrentDate((date) => goToPreviousWeek(date))
          }
          onNextWeek={() => setCurrentDate((date) => goToNextWeek(date))}
        />
        <CalendarMainPlaceholder currentDate={currentDate} />
      </div>
    </div>
  );
}
