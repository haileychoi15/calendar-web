"use client";

import { Plus } from "lucide-react";

import { CalendarListSection } from "@/components/calendar/calendar-list-section";
import { MiniCalendar } from "@/components/calendar/mini-calendar";
import { Button } from "@/components/ui/button";
import { MY_CALENDARS, OTHER_CALENDARS } from "@/lib/calendar-data";

type CalendarSidebarProps = {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
};

export function CalendarSidebar({
  currentDate,
  onDateSelect,
}: CalendarSidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-background">
      <div className="px-4 py-3">
        <h1 className="text-xl font-medium leading-7 tracking-tight text-foreground">
          Calendar
        </h1>
      </div>

      <div className="px-4 pt-2 pb-3">
        <Button className="h-10 w-full gap-1 rounded-lg px-4 py-1">
          <Plus className="size-4" />
          일정 만들기
        </Button>
      </div>

      <MiniCalendar
        currentDate={currentDate}
        onDateSelect={onDateSelect}
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-4">
        <CalendarListSection title="내 캘린더" calendars={MY_CALENDARS} />
        <CalendarListSection title="다른 캘린더" calendars={OTHER_CALENDARS} />
      </div>
    </aside>
  );
}
