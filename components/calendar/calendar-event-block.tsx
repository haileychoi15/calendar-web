import { Briefcase, Palmtree } from "lucide-react";

import { EVENT_RIGHT_INSET_PX, type TimedEventLayout } from "@/lib/calendar-event-overlap";
import type { CalendarEvent } from "@/lib/calendar-events";
import {
  DEFAULT_PERSON_ID,
  formatEventTimeLine,
  getEventBlockAppearance,
  getEventLayout,
  getPersonById,
  isShortEvent,
} from "@/lib/calendar-events";
import { cn } from "@/lib/utils";

type CalendarEventBlockProps = {
  event: CalendarEvent;
  layout?: TimedEventLayout;
  viewerPersonId?: string;
  highlighted?: boolean;
};

function EventTitleRow({
  event,
  appearance,
  compact,
  label,
}: {
  event: CalendarEvent;
  appearance: ReturnType<typeof getEventBlockAppearance>;
  compact?: boolean;
  label?: string;
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
      <span className="truncate">{label ?? event.title}</span>
    </div>
  );
}

function formatAllDayEventLabel(event: CalendarEvent) {
  const person = getPersonById(event.personId);
  if (!person) return event.title;
  return `[${person.name}] ${event.title}`;
}

const eventBlockSurfaceClassName =
  "overflow-hidden rounded-md px-1.5 py-0.5 text-xs leading-tight font-medium shadow-[0_0_0_1px_#ffffff]";

export function CalendarEventBlock({
  event,
  layout,
  viewerPersonId = DEFAULT_PERSON_ID,
  highlighted = false,
}: CalendarEventBlockProps) {
  const baseLayout = layout ?? {
    ...getEventLayout(event),
    leftPercent: 0,
    rightInsetPx: EVENT_RIGHT_INSET_PX,
    zIndex: 20,
  };
  const { top, height, leftPercent, rightInsetPx, zIndex } = baseLayout;
  const appearance = getEventBlockAppearance(event, viewerPersonId);
  const short = isShortEvent(event);
  const showTime = !short && height >= 40;

  return (
    <div
      className={cn(
        "pointer-events-auto absolute",
        eventBlockSurfaceClassName,
        highlighted && "event-highlight"
      )}
      style={{
        top,
        height,
        left: `${leftPercent}%`,
        right: rightInsetPx,
        zIndex: highlighted ? Math.max(zIndex, 50) : zIndex,
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
  const label = formatAllDayEventLabel(event);

  return (
    <div
      className={cn(
        "relative z-10 min-h-6 min-w-0 shrink-0",
        eventBlockSurfaceClassName
      )}
      style={{
        backgroundColor: appearance.backgroundColor,
        color: appearance.color,
      }}
      title={label}
    >
      <EventTitleRow event={event} appearance={appearance} label={label} />
    </div>
  );
}
