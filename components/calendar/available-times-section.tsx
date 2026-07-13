"use client";

import { useEffect, useState } from "react";
import { PersonAvatar } from "@/components/calendar/person-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  AVAILABLE_TIMES_PAGE_SIZE,
  formatAvailableTimeSlotLabel,
  getAvailableTimeSlotKey,
  getDaysEarlierThanAllAvailable,
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
        "flex items-start gap-2 rounded-md px-3 py-2.5",
        className
      )}
    >
      <Skeleton className="mt-0.5 size-[18px] shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}

type AvailableTimeSlotItemProps = {
  slot: AvailableTimeSlot;
  earliestAllDateKey: string | null;
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
      size="xs"
      showCalendarColor={false}
    />
  );
}

function AvailableTimeSlotItem({
  slot,
  earliestAllDateKey,
  selected,
  hoveredSlotKey,
  onSelect,
  onHover,
  onHoverEnd,
}: AvailableTimeSlotItemProps) {
  const slotKey = getAvailableTimeSlotKey(slot);
  const isHovered = hoveredSlotKey === slotKey && !selected;
  const accentColor =
    slot.kind === "all" ? "var(--green400)" : "var(--yellow400)";
  const unavailableCount = slot.unavailableOptionalAttendees.length;
  const daysEarlier = getDaysEarlierThanAllAvailable(slot, earliestAllDateKey);

  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2 rounded-md border-2 px-3 py-2.5 transition-[border-color,border-style,background-color]",
        selected
          ? "border-solid border-primary bg-muted/40"
          : cn("border-dashed", isHovered && "bg-muted")
      )}
      style={selected ? undefined : { borderColor: accentColor }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
    >
      <input
        type="radio"
        name="available-time-slot"
        checked={selected}
        onChange={onSelect}
        className={cn(
          "pointer-events-none mt-0.5 size-[18px] shrink-0 accent-primary",
          !selected && "opacity-40"
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-foreground">
          {formatAvailableTimeSlotLabel(slot.start, slot.end)}
        </span>
        {unavailableCount > 0 ? (
          <span className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
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
                    {slot.unavailableOptionalAttendees
                      .slice(0, 2)
                      .map((attendee) => (
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
            {daysEarlier !== null && daysEarlier > 0 ? (
              <span>모두가 가능한 날짜보다 {daysEarlier}일 빠름</span>
            ) : null}
          </span>
        ) : null}
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
  onVisibleSlotsChange?: (slots: AvailableTimeSlot[]) => void;
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
  onVisibleSlotsChange,
}: AvailableTimesSectionProps) {
  const [visibleCount, setVisibleCount] = useState(AVAILABLE_TIMES_PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(AVAILABLE_TIMES_PAGE_SIZE);
  }, [result]);

  const slots = result?.slots ?? [];
  const maxVisibleCount = AVAILABLE_TIMES_PAGE_SIZE * 2;
  const visibleSlots = slots.slice(0, visibleCount);
  const showMoreButton =
    visibleCount < maxVisibleCount && visibleCount < slots.length;
  const visibleAllSlots = visibleSlots.filter((slot) => slot.kind === "all");
  const visibleRequiredOnlySlots = visibleSlots.filter(
    (slot) => slot.kind === "required-only"
  );

  useEffect(() => {
    if (!result) {
      onVisibleSlotsChange?.([]);
      return;
    }

    onVisibleSlotsChange?.(result.slots.slice(0, visibleCount));
  }, [result, visibleCount, onVisibleSlotsChange]);

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
            {Array.from({ length: AVAILABLE_TIMES_PAGE_SIZE }).map((_, index) => (
              <AvailableTimeSlotSkeleton key={index} />
            ))}
          </div>
        ) : result && visibleSlots.length > 0 ? (
          <div className="space-y-4">
            {visibleAllSlots.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  모두 참석 가능한 시간대
                </p>
                <div className="space-y-2">
                  {visibleAllSlots.map((slot) => (
                    <AvailableTimeSlotItem
                      key={getAvailableTimeSlotKey(slot)}
                      slot={slot}
                      earliestAllDateKey={result.earliestAllDateKey}
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

            {visibleRequiredOnlySlots.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  필수 참석자만 가능한 시간대
                </p>
                <div className="space-y-2">
                  {visibleRequiredOnlySlots.map((slot) => (
                    <AvailableTimeSlotItem
                      key={getAvailableTimeSlotKey(slot)}
                      slot={slot}
                      earliestAllDateKey={result.earliestAllDateKey}
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

            {showMoreButton ? (
              <button
                type="button"
                className="flex h-8 w-full items-center justify-center rounded-md text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                onClick={() =>
                  setVisibleCount((count) =>
                    Math.min(count + AVAILABLE_TIMES_PAGE_SIZE, maxVisibleCount)
                  )
                }
              >
                더보기
              </button>
            ) : null}
          </div>
        ) : null
      ) : null}
    </div>
  );
}

export { AvailableTimeSlotSkeleton };
