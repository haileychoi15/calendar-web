"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const SIDEBAR_WIDTH_PX = 240;
export const CREATE_EVENT_DRAWER_WIDTH_PX = 300;
/** Extra layout width pushed into main when drawer opens (drawer - sidebar). */
export const CREATE_EVENT_DRAWER_MAIN_PUSH_PX =
  CREATE_EVENT_DRAWER_WIDTH_PX - SIDEBAR_WIDTH_PX;

type CreateEventDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateEventDrawer({
  open,
  onOpenChange,
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
        aria-labelledby="create-event-drawer-title"
        className={cn(
          "flex h-full w-[300px] flex-col border-r border-border bg-background shadow-md transition-transform duration-modal ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2
            id="create-event-drawer-title"
            className="text-sm font-semibold leading-5 tracking-tight text-foreground"
          >
            일정 만들기
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="닫기"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto" />
      </div>
    </div>
  );
}
