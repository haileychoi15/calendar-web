"use client";

import { useEffect } from "react";

import { CreateEventDrawerForm } from "@/components/calendar/create-event-drawer-form";
import { cn } from "@/lib/utils";

export const SIDEBAR_WIDTH_PX = 240;
export const CREATE_EVENT_DRAWER_WIDTH_PX = 300;
/** Extra layout width pushed into main when drawer opens (drawer - sidebar). */
export const CREATE_EVENT_DRAWER_MAIN_PUSH_PX =
  CREATE_EVENT_DRAWER_WIDTH_PX - SIDEBAR_WIDTH_PX;

type CreateEventDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visiblePersonIds: ReadonlySet<string>;
  onTogglePersonCalendarVisibility: (personId: string, visible: boolean) => void;
};

export function CreateEventDrawer({
  open,
  onOpenChange,
  visiblePersonIds,
  onTogglePersonCalendarVisibility,
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
        "absolute top-0 left-0 z-20 h-svh w-[300px] overflow-hidden",
        !open && "pointer-events-none"
      )}
    >
      <div
        role="dialog"
        aria-modal={open}
        aria-label="일정 만들기"
        className={cn(
          "flex h-full w-[300px] flex-col border-r border-border bg-background shadow-md transition-transform duration-modal ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <CreateEventDrawerForm
          onClose={() => onOpenChange(false)}
          visiblePersonIds={visiblePersonIds}
          onTogglePersonCalendarVisibility={onTogglePersonCalendarVisibility}
        />
      </div>
    </div>
  );
}
