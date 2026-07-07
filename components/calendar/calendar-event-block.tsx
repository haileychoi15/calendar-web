import { Briefcase, Palmtree } from "lucide-react";

import type { CalendarEvent } from "@/lib/calendar-events";
import {
  DEFAULT_PERSON_ID,
  formatEventTimeLine,
  getEventBlockAppearance,
  getEventLayout,
  isShortEvent,
} from "@/lib/calendar-events";
import { cn } from "@/lib/utils";

type CalendarEventBlockProps = {
  event: CalendarEvent;
  layout?: {
    top: number;
    height: number;
    leftPercent: number;
    widthPercent: number;
    zIndex: number;
  };
  viewerPersonId?: string;
};

function EventTitleRow({
  event,
  appearance,
  compact,
}: {
  event: CalendarEvent;
  appearance: ReturnType<typeof getEventBlockAppearance>;
  compact?: boolean;
}) {
  const iconClass = compact ? "size-2.5 shrink-0" : "size-3 shrink-0";

  return (
    <div className="flex min-w-0 items-center gap-0.5">
      {appearance.showBriefcaseIcon && (
        <Briefcase className={iconClass} aria-hidden />
      )}
      {appearance.showVacationIcon && (
        <Palmtree className={iconClass} aria-hidden />
      )}
      <span className="truncate">{event.title}</span>
    </div>
  );
}

export function CalendarEventBlock({
  event,
  layout,
  viewerPersonId = DEFAULT_PERSON_ID,
}: CalendarEventBlockProps) {
  const baseLayout = layout ?? {
    ...getEventLayout(event),
    leftPercent: 1.5,
    widthPercent: 97,
    zIndex: 20,
  };
  const { top, height, leftPercent, widthPercent, zIndex } = baseLayout;
  const appearance = getEventBlockAppearance(event, viewerPersonId);
  const short = isShortEvent(event);
  const showTime = !short && height >= 40;

  return (
    <div
      className={cn(
        "pointer-events-auto absolute overflow-hidden rounded-md border-[1.5px] border-white px-1.5 py-0.5",
        "text-xs leading-tight font-medium"
      )}
      style={{
        top,
        height,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        zIndex,
        backgroundColor: appearance.backgroundColor,
        color: appearance.color,
      }}
      title={formatEventTimeLine(event)}
    >
      <EventTitleRow event={event} appearance={appearance} compact={short} />
      {showTime && (
        <p className="truncate text-[10px] leading-tight opacity-90">
          {formatEventTimeLine(event)}
        </p>
      )}
    </div>
  );
}

type CalendarAllDayEventChipProps = {
  event: CalendarEvent;
  viewerPersonId?: string;
};

export function CalendarAllDayEventChip({
  event,
  viewerPersonId = DEFAULT_PERSON_ID,
}: CalendarAllDayEventChipProps) {
  const appearance = getEventBlockAppearance(event, viewerPersonId);

  return (
    <div
      className="min-w-0 overflow-hidden rounded-md px-1.5 py-0.5 text-[10px] leading-tight font-medium"
      style={{
        backgroundColor: appearance.backgroundColor,
        color: appearance.color,
        border: appearance.border,
      }}
      title={event.title}
    >
      <EventTitleRow event={event} appearance={appearance} compact />
    </div>
  );
}
