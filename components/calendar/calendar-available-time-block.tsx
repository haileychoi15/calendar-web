"use client";

import {
  formatAvailableTimeSlotHoverLabel,
  getAvailableTimeSlotLayout,
  type AvailableTimeSlot,
} from "@/lib/available-times";
import { cn } from "@/lib/utils";

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
    <button
      type="button"
      aria-label={formatAvailableTimeSlotHoverLabel(slot.start, slot.end)}
      aria-pressed={selected}
      className={cn(
        "absolute inset-x-0.5 flex cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 px-1 transition-colors",
        active
          ? hovered
            ? "z-50 border-solid"
            : "z-[45] border-solid"
          : "z-40 border-dashed bg-transparent"
      )}
      style={{
        top,
        height,
        borderColor: accentColor,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onClick={onSelect}
    >
      {active ? (
        <>
          <span className="absolute inset-0 rounded-[inherit] bg-background" />
          <span
            className="absolute inset-0 rounded-[inherit]"
            style={{
              backgroundColor: `color-mix(in oklch, ${accentColor} 24%, transparent)`,
            }}
          />
        </>
      ) : null}
      {active ? (
        <span className="relative z-10 text-center text-xs font-medium whitespace-nowrap text-foreground">
          {formatAvailableTimeSlotHoverLabel(slot.start, slot.end)}
        </span>
      ) : null}
    </button>
  );
}
