"use client";

import { toast } from "sonner";

import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarWeekView } from "@/components/calendar/calendar-week-view";
import { CalendarSidebar } from "@/components/calendar/calendar-sidebar";
import {
  CREATE_EVENT_DRAWER_MAIN_PUSH_PX,
  CreateEventDrawer,
} from "@/components/calendar/create-event-drawer";
import { HOLIDAY_CALENDAR_ID } from "@/lib/calendar-data";
import {
  addMeetingEvents,
  type CreateMeetingEventInput,
  getPeople,
} from "@/lib/calendar-events";
import type { AvailableTimeSlot } from "@/lib/available-times";
import { getAvailableTimeSlotKey } from "@/lib/available-times";
import { getWeekStart, isDateInWeek } from "@/lib/calendar-week";
import { addDays } from "date-fns";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function getDefaultSidebarVisibleIds() {
  return [...getPeople().map((person) => person.id), HOLIDAY_CALENDAR_ID];
}

const EVENT_HIGHLIGHT_START_DELAY_MS = 300;
const EVENT_HIGHLIGHT_DURATION_MS = 1500;

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [miniClickHighlight, setMiniClickHighlight] = useState<{
    date: Date;
    nonce: number;
  } | null>(null);
  const [sidebarVisibleIds, setSidebarVisibleIds] = useState<string[]>(
    getDefaultSidebarVisibleIds
  );
  const [frozenSidebarVisibleIds, setFrozenSidebarVisibleIds] = useState<
    string[] | null
  >(null);
  const [drawerAttendeeCalendarIds, setDrawerAttendeeCalendarIds] = useState<
    string[]
  >([]);
  const [eventsRevision, setEventsRevision] = useState(0);
  const [highlightedEventIds, setHighlightedEventIds] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const highlightTimeoutsRef = useRef<number[]>([]);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    AvailableTimeSlot[]
  >([]);
  const [hoveredAvailableSlotKey, setHoveredAvailableSlotKey] = useState<
    string | null
  >(null);
  const [selectedAvailableSlotKey, setSelectedAvailableSlotKey] = useState<
    string | null
  >(null);

  const sidebarDisplayIdSet = useMemo(() => {
    if (createEventOpen && frozenSidebarVisibleIds) {
      return new Set(frozenSidebarVisibleIds);
    }

    return new Set(sidebarVisibleIds);
  }, [createEventOpen, frozenSidebarVisibleIds, sidebarVisibleIds]);

  const weekViewVisibleIdSet = useMemo(() => {
    if (createEventOpen) {
      return new Set(drawerAttendeeCalendarIds);
    }

    return new Set(sidebarVisibleIds);
  }, [createEventOpen, drawerAttendeeCalendarIds, sidebarVisibleIds]);

  const drawerAttendeeVisibleIdSet = useMemo(
    () => new Set(drawerAttendeeCalendarIds),
    [drawerAttendeeCalendarIds]
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
      if (createEventOpen) return;

      setSidebarVisibleIds((prev) => {
        if (visible) {
          return prev.includes(calendarId) ? prev : [...prev, calendarId];
        }

        return prev.filter((id) => id !== calendarId);
      });
    },
    [createEventOpen]
  );

  const handleAttendeeCalendarIdsChange = useCallback((personIds: string[]) => {
    setDrawerAttendeeCalendarIds(personIds);
  }, []);

  const handleToggleDrawerAttendeeCalendarVisibility = useCallback(
    (personId: string, visible: boolean) => {
      setDrawerAttendeeCalendarIds((prev) => {
        if (visible) {
          return prev.includes(personId) ? prev : [...prev, personId];
        }

        return prev.filter((id) => id !== personId);
      });
    },
    []
  );

  const handleAvailableTimeSlotsChange = useCallback(
    (slots: AvailableTimeSlot[]) => {
      setAvailableTimeSlots(slots);
      setHoveredAvailableSlotKey(null);
      setSelectedAvailableSlotKey(null);
    },
    []
  );

  const handleHoveredAvailableSlotKeyChange = useCallback(
    (slotKey: string | null) => {
      setHoveredAvailableSlotKey(slotKey);

      if (!slotKey) return;

      const slot = availableTimeSlots.find(
        (candidate) => getAvailableTimeSlotKey(candidate) === slotKey
      );
      if (!slot) return;

      if (isDateInWeek(slot.start, weekStart)) return;

      setWeekStart(getWeekStart(slot.start));
      setMiniClickHighlight(null);
    },
    [availableTimeSlots, weekStart]
  );

  const clearHighlightTimeouts = useCallback(() => {
    for (const timeoutId of highlightTimeoutsRef.current) {
      window.clearTimeout(timeoutId);
    }
    highlightTimeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearHighlightTimeouts();
    };
  }, [clearHighlightTimeouts]);

  const handleSelectAvailableSlot = useCallback(
    (slot: AvailableTimeSlot | null) => {
      setSelectedAvailableSlotKey(
        slot ? getAvailableTimeSlotKey(slot) : null
      );

      if (!slot) return;

      setSelectedDate(slot.start);
      setWeekStart(getWeekStart(slot.start));
      setMiniClickHighlight(null);
    },
    []
  );

  const handleSendInvite = useCallback(
    (input: CreateMeetingEventInput) => {
      const createdEvents = addMeetingEvents(input);
      setEventsRevision((revision) => revision + 1);
      setAvailableTimeSlots([]);
      setHoveredAvailableSlotKey(null);
      setSelectedAvailableSlotKey(null);
      setSelectedDate(input.start);
      setMiniClickHighlight(null);

      setWeekStart((current) => {
        if (isDateInWeek(input.start, current)) return current;
        return getWeekStart(input.start);
      });

      toast.success(`${input.personIds.length}명을 회의에 초대했어요.`);

      clearHighlightTimeouts();
      setHighlightedEventIds(new Set());

      const startTimeoutId = window.setTimeout(() => {
        setHighlightedEventIds(new Set(createdEvents.map((event) => event.id)));

        const endTimeoutId = window.setTimeout(() => {
          setHighlightedEventIds(new Set());
        }, EVENT_HIGHLIGHT_DURATION_MS);
        highlightTimeoutsRef.current.push(endTimeoutId);
      }, EVENT_HIGHLIGHT_START_DELAY_MS);

      highlightTimeoutsRef.current.push(startTimeoutId);
    },
    [clearHighlightTimeouts]
  );

  const handleCreateEventOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setSidebarVisibleIds((current) => {
          setFrozenSidebarVisibleIds([...current]);
          return current;
        });
        setCreateEventOpen(true);
        return;
      }

      setFrozenSidebarVisibleIds((snapshot) => {
        if (snapshot) {
          setSidebarVisibleIds(snapshot);
        }
        return null;
      });
      setDrawerAttendeeCalendarIds([]);
      setCreateEventOpen(false);
      setHoveredAvailableSlotKey(null);
      setSelectedAvailableSlotKey(null);
    },
    []
  );

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <div className="relative h-svh min-h-0 shrink-0">
        <CalendarSidebar
          currentDate={selectedDate}
          weekStart={weekStart}
          visiblePersonIds={sidebarDisplayIdSet}
          calendarListDisabled={createEventOpen}
          onToggleCalendarVisibility={handleToggleCalendarVisibility}
          onCreateEventClick={() => handleCreateEventOpenChange(true)}
          onDateSelect={(date) => {
            setSelectedDate(date);
            setWeekStart(getWeekStart(date));
            setMiniClickHighlight((prev) => ({
              date,
              nonce: (prev?.nonce ?? 0) + 1,
            }));
          }}
        />
        <CreateEventDrawer
          open={createEventOpen}
          onOpenChange={handleCreateEventOpenChange}
          attendeeVisibleCalendarIds={drawerAttendeeVisibleIdSet}
          onToggleAttendeeCalendarVisibility={
            handleToggleDrawerAttendeeCalendarVisibility
          }
          onAttendeeCalendarIdsChange={handleAttendeeCalendarIdsChange}
          onAvailableTimeSlotsChange={handleAvailableTimeSlotsChange}
          onHoveredAvailableSlotKeyChange={handleHoveredAvailableSlotKeyChange}
          hoveredAvailableSlotKey={hoveredAvailableSlotKey}
          selectedAvailableSlotKey={selectedAvailableSlotKey}
          onSelectAvailableSlot={handleSelectAvailableSlot}
          onSendInvite={handleSendInvite}
        />
      </div>
      <div
        aria-hidden
        className="shrink-0 overflow-hidden transition-[width] duration-modal ease-out"
        style={{ width: createEventOpen ? CREATE_EVENT_DRAWER_MAIN_PUSH_PX : 0 }}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CalendarHeader
          weekStart={weekStart}
          onToday={goToToday}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
        />
        <CalendarWeekView
          weekStart={weekStart}
          eventsRevision={eventsRevision}
          highlightedEventIds={highlightedEventIds}
          visiblePersonIds={weekViewVisibleIdSet}
          availableTimeSlots={availableTimeSlots}
          hoveredAvailableSlotKey={hoveredAvailableSlotKey}
          selectedAvailableSlotKey={selectedAvailableSlotKey}
          onHoveredAvailableSlotKeyChange={handleHoveredAvailableSlotKeyChange}
          onSelectAvailableSlot={handleSelectAvailableSlot}
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
