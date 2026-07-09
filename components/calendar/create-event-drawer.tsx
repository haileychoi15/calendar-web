"use client";

import { useEffect } from "react";

import { CreateEventDrawerForm } from "@/components/calendar/create-event-drawer-form";
import type { AvailableTimeSlot } from "@/lib/available-times";
import type { CreateMeetingEventInput } from "@/lib/calendar-events";
import { cn } from "@/lib/utils";

export const SIDEBAR_WIDTH_PX = 240;
export const CREATE_EVENT_DRAWER_WIDTH_PX = 320;
/** Extra layout width pushed into main when drawer opens (drawer - sidebar). */
export const CREATE_EVENT_DRAWER_MAIN_PUSH_PX =
  CREATE_EVENT_DRAWER_WIDTH_PX - SIDEBAR_WIDTH_PX;

type CreateEventDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendeeVisibleCalendarIds: ReadonlySet<string>;
  onToggleAttendeeCalendarVisibility: (
    personId: string,
    visible: boolean
  ) => void;
  onAttendeeCalendarIdsChange: (personIds: string[]) => void;
  onAvailableTimeSlotsChange: (slots: AvailableTimeSlot[]) => void;
  onHoveredAvailableSlotKeyChange: (slotKey: string | null) => void;
  hoveredAvailableSlotKey: string | null;
  selectedAvailableSlotKey: string | null;
  onSelectAvailableSlot: (slot: AvailableTimeSlot | null) => void;
  onSendInvite: (input: CreateMeetingEventInput) => void;
};

export function CreateEventDrawer({
  open,
  onOpenChange,
  attendeeVisibleCalendarIds,
  onToggleAttendeeCalendarVisibility,
  onAttendeeCalendarIdsChange,
  onAvailableTimeSlotsChange,
  onHoveredAvailableSlotKeyChange,
  hoveredAvailableSlotKey,
  selectedAvailableSlotKey,
  onSelectAvailableSlot,
  onSendInvite,
}: CreateEventDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "absolute top-0 left-0 z-20 h-svh w-[320px] overflow-hidden",
        !open && "pointer-events-none"
      )}
    >
      <div
        role="dialog"
        aria-modal={open}
        aria-label="일정 만들기"
        className={cn(
          "flex h-full w-[320px] flex-col border-r border-border bg-background shadow-md transition-transform duration-modal ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <CreateEventDrawerForm
          open={open}
          onClose={() => onOpenChange(false)}
          attendeeVisibleCalendarIds={attendeeVisibleCalendarIds}
          onToggleAttendeeCalendarVisibility={onToggleAttendeeCalendarVisibility}
          onAttendeeCalendarIdsChange={onAttendeeCalendarIdsChange}
          onAvailableTimeSlotsChange={onAvailableTimeSlotsChange}
          onHoveredAvailableSlotKeyChange={onHoveredAvailableSlotKeyChange}
          hoveredAvailableSlotKey={hoveredAvailableSlotKey}
          selectedAvailableSlotKey={selectedAvailableSlotKey}
          onSelectAvailableSlot={onSelectAvailableSlot}
          onSendInvite={onSendInvite}
        />
      </div>
    </div>
  );
}
