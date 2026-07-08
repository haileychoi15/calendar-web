"use client";

import {
  formatAvailableTimeSlotHoverLabel,
  getAvailableTimeSlotLayout,
  type AvailableTimeSlot,
} from "@/lib/available-times";
import { cn } from "@/lib/utils";

const AVAILABLE_TIME_BLOCK_SHADOW =
  "0 2px 8px 0 color-mix(in srgb, var(--grey900) 10%, transparent)";

type CalendarAvailableTimeBlockProps = {
  slot: AvailableTimeSlot;
  hovered?: boolean;
  selected?: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
};

export function CalendarAvailableTimeBlock({
  slot,
  hovered = false,
  selected = false,
  onHover,
  onHoverEnd,
  onSelect,
}: CalendarAvailableTimeBlockProps) {
  const { top, height } = getAvailableTimeSlotLayout(slot.start, slot.end);
  const accentColor =
    slot.kind === "all" ? "var(--green400)" : "var(--yellow400)";
  const active = hovered || selected;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0.5 rounded-md",
        active ? (hovered ? "z-50" : "z-[45]") : "z-40"
      )}
      style={{
        top,
        height,
        boxShadow: AVAILABLE_TIME_BLOCK_SHADOW,
      }}
    >
      <button
        type="button"
        aria-label={formatAvailableTimeSlotHoverLabel(slot.start, slot.end)}
        aria-pressed={selected}
        className="pointer-events-auto relative size-full cursor-pointer rounded-md p-0"
        onMouseEnter={onHover}
        onMouseLeave={onHoverEnd}
        onClick={onSelect}
      >
        <span className="absolute inset-[2px] rounded-[4px] bg-background" />
        <span
          aria-hidden
          className={cn(
            "absolute inset-[2px] rounded-[4px] transition-opacity duration-modal ease-out",
            active ? "opacity-100" : "opacity-0"
          )}
          style={{
            backgroundColor: `color-mix(in oklch, ${accentColor} 24%, transparent)`,
          }}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-md border-2 transition-[border-color] duration-modal ease-out",
            active ? "border-solid" : "border-dashed"
          )}
          style={{ borderColor: accentColor }}
        />
        <span
          className={cn(
            "relative z-10 flex size-full items-center justify-center px-1 text-center text-xs font-medium whitespace-nowrap text-foreground transition-opacity duration-modal ease-out",
            active ? "opacity-100" : "opacity-0"
          )}
        >
          {formatAvailableTimeSlotHoverLabel(slot.start, slot.end)}
        </span>
      </button>
    </div>
  );
}
