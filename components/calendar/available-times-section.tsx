"use client";

import { PersonAvatar } from "@/components/calendar/person-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  formatAvailableTimeSlotLabel,
  getAvailableTimeSlotKey,
  type AvailableTimeSlot,
  type AvailableTimesResult,
} from "@/lib/available-times";
import { cn } from "@/lib/utils";

type AvailableTimeSlotSkeletonProps = {
  className?: string;
};

function AvailableTimeSlotSkeleton({ className }: AvailableTimeSlotSkeletonProps) {
  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-md border border-border",
        className
      )}
    >
      <Skeleton className="w-1 shrink-0 rounded-none" />
      <div className="flex flex-1 items-start gap-2 px-3 py-2.5">
        <Skeleton className="mt-0.5 size-[18px] shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>
    </div>
  );
}

type AvailableTimeSlotItemProps = {
  slot: AvailableTimeSlot;
  selected: boolean;
  hoveredSlotKey: string | null;
  onSelect: () => void;
  onHover: () => void;
  onHoverEnd: () => void;
};

function MiniPersonAvatar({
  personId,
  name,
}: {
  personId: string;
  name: string;
}) {
  return (
    <PersonAvatar
      personId={personId}
      name={name}
      className="size-4"
      showCalendarColor={false}
    />
  );
}

function AvailableTimeSlotItem({
  slot,
  selected,
  hoveredSlotKey,
  onSelect,
  onHover,
  onHoverEnd,
}: AvailableTimeSlotItemProps) {
  const slotKey = getAvailableTimeSlotKey(slot);
  const isHovered = hoveredSlotKey === slotKey && !selected;
  const accentClassName =
    slot.kind === "all" ? "bg-[var(--green400)]" : "bg-[var(--yellow400)]";
  const unavailableCount = slot.unavailableOptionalAttendees.length;

  return (
    <label
      className={cn(
        "flex cursor-pointer overflow-hidden rounded-md border transition-colors",
        selected
          ? "border-primary bg-muted/40 shadow-[inset_0_0_0_1px_var(--primary)]"
          : isHovered
            ? "border-border bg-muted/30"
            : "border-border"
      )}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
    >
      <span className={cn("w-1 shrink-0", accentClassName)} aria-hidden />
      <span className="flex flex-1 items-start gap-2 px-3 py-2.5">
        <input
          type="radio"
          name="available-time-slot"
          checked={selected}
          onChange={onSelect}
          className="pointer-events-none mt-0.5 size-[18px] shrink-0 accent-primary"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-foreground">
            {formatAvailableTimeSlotLabel(slot.start, slot.end)}
          </span>
          {unavailableCount > 0 ? (
            <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              {unavailableCount === 1 ? (
                <>
                  <MiniPersonAvatar
                    personId={slot.unavailableOptionalAttendees[0]!.id}
                    name={slot.unavailableOptionalAttendees[0]!.name}
                  />
                  <span className="truncate">
                    {slot.unavailableOptionalAttendees[0]!.name}님이 참석할 수
                    없음
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center -space-x-1">
                    {slot.unavailableOptionalAttendees.slice(0, 2).map((attendee) => (
                      <MiniPersonAvatar
                        key={attendee.id}
                        personId={attendee.id}
                        name={attendee.name}
                      />
                    ))}
                  </span>
                  <span>{unavailableCount}명이 참석할 수 없음</span>
                </>
              )}
            </span>
          ) : null}
        </span>
      </span>
    </label>
  );
}

type AvailableTimesSectionProps = {
  open: boolean;
  onToggle: () => void;
  loading: boolean;
  result: AvailableTimesResult | null;
  selectedSlotKey: string | null;
  hoveredSlotKey: string | null;
  onSelectSlot: (slot: AvailableTimeSlot) => void;
  onHoverSlot: (slotKey: string | null) => void;
};

export function AvailableTimesSection({
  open,
  onToggle,
  loading,
  result,
  selectedSlotKey,
  hoveredSlotKey,
  onSelectSlot,
  onHoverSlot,
}: AvailableTimesSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex h-8 items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {loading ? "가능한 시간을 찾고 있어요.." : "가능 시간"}
        </p>

        <button
          type="button"
          aria-label={open ? "가능 시간 접기" : "가능 시간 펼치기"}
          aria-expanded={open}
          onClick={onToggle}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-muted"
        >
          {open ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {open ? (
        loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <AvailableTimeSlotSkeleton key={index} />
            ))}
          </div>
        ) : result ? (
          <div className="space-y-4">
            {result.allAvailableSlots.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  모두 참석 가능한 시간대
                </p>
                <div className="space-y-2">
                  {result.allAvailableSlots.map((slot) => (
                    <AvailableTimeSlotItem
                      key={getAvailableTimeSlotKey(slot)}
                      slot={slot}
                      selected={
                        selectedSlotKey === getAvailableTimeSlotKey(slot)
                      }
                      hoveredSlotKey={hoveredSlotKey}
                      onSelect={() => onSelectSlot(slot)}
                      onHover={() =>
                        onHoverSlot(getAvailableTimeSlotKey(slot))
                      }
                      onHoverEnd={() => onHoverSlot(null)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {result.showRequiredOnlySection &&
            result.requiredOnlySlots.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  필수 참석자가 가능한 시간대
                </p>
                <div className="space-y-2">
                  {result.requiredOnlySlots.map((slot) => (
                    <AvailableTimeSlotItem
                      key={getAvailableTimeSlotKey(slot)}
                      slot={slot}
                      selected={
                        selectedSlotKey === getAvailableTimeSlotKey(slot)
                      }
                      hoveredSlotKey={hoveredSlotKey}
                      onSelect={() => onSelectSlot(slot)}
                      onHover={() =>
                        onHoverSlot(getAvailableTimeSlotKey(slot))
                      }
                      onHoverEnd={() => onHoverSlot(null)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null
      ) : null}
    </div>
  );
}

export { AvailableTimeSlotSkeleton };
