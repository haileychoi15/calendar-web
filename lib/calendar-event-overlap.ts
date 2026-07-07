import type { CalendarEvent } from "@/lib/calendar-events";
import { getEventLayout } from "@/lib/calendar-events";
import { getKstParts } from "@/lib/calendar-week";

export type TimedEventLayout = {
  top: number;
  height: number;
  leftPercent: number;
  widthPercent: number;
  zIndex: number;
};

type EventMinutes = {
  startMin: number;
  endMin: number;
};

type ColumnPlacement = {
  column: number;
  totalColumns: number;
};

const HORIZONTAL_INSET_PERCENT = 1.5;
/** Per-column right shift for staggered overlap (capped when many events share a slot). */
const CASCADE_OFFSET_PERCENT = 22;
const MIN_BLOCK_WIDTH_PERCENT = 18;
const BASE_Z_INDEX = 20;

function getEventMinutes(event: CalendarEvent): EventMinutes {
  const start = getKstParts(event.start);
  const end = getKstParts(event.end);

  return {
    startMin: start.hour * 60 + start.minute,
    endMin: end.hour * 60 + end.minute,
  };
}

function eventsOverlap(a: CalendarEvent, b: CalendarEvent) {
  const aTimes = getEventMinutes(a);
  const bTimes = getEventMinutes(b);

  return (
    aTimes.startMin < bTimes.endMin && bTimes.startMin < aTimes.endMin
  );
}

function buildOverlapClusters(events: CalendarEvent[]) {
  const clusters: CalendarEvent[][] = [];

  for (const event of events) {
    const matchingClusters = clusters.filter((cluster) =>
      cluster.some((member) => eventsOverlap(member, event))
    );

    if (matchingClusters.length === 0) {
      clusters.push([event]);
      continue;
    }

    const merged = matchingClusters.flat();
    merged.push(event);

    for (const cluster of matchingClusters) {
      const index = clusters.indexOf(cluster);
      clusters.splice(index, 1);
    }

    clusters.push(merged);
  }

  return clusters;
}

function layoutCluster(cluster: CalendarEvent[]) {
  const sorted = [...cluster].sort((a, b) => {
    const aTimes = getEventMinutes(a);
    const bTimes = getEventMinutes(b);

    if (aTimes.startMin !== bTimes.startMin) {
      return aTimes.startMin - bTimes.startMin;
    }

    return bTimes.endMin - aTimes.endMin;
  });

  const columnEnds: number[] = [];
  const placements = new Map<
    string,
    EventMinutes & { column: number }
  >();

  for (const event of sorted) {
    const times = getEventMinutes(event);
    let column = columnEnds.findIndex((endMin) => endMin <= times.startMin);

    if (column === -1) {
      column = columnEnds.length;
      columnEnds.push(times.endMin);
    } else {
      columnEnds[column] = times.endMin;
    }

    placements.set(event.id, { ...times, column });
  }

  const totalColumns = Math.max(columnEnds.length, 1);
  const result = new Map<string, ColumnPlacement>();

  for (const event of sorted) {
    const placement = placements.get(event.id)!;
    result.set(event.id, {
      column: placement.column,
      totalColumns,
    });
  }

  return result;
}

function getCascadeOffset(totalColumns: number) {
  const availableWidth = 100 - HORIZONTAL_INSET_PERCENT * 2;
  return Math.min(CASCADE_OFFSET_PERCENT, availableWidth / totalColumns);
}

/** Staggered overlap: each column shifts right; width fills the remaining space. */
function toTimedEventLayout(
  event: CalendarEvent,
  placement: ColumnPlacement
): TimedEventLayout {
  const base = getEventLayout(event);
  const cascadeOffset = getCascadeOffset(placement.totalColumns);
  const leftPercent =
    placement.column * cascadeOffset + HORIZONTAL_INSET_PERCENT;
  const widthPercent = 100 - leftPercent - HORIZONTAL_INSET_PERCENT;

  return {
    ...base,
    leftPercent,
    widthPercent: Math.max(widthPercent, MIN_BLOCK_WIDTH_PERCENT),
    zIndex: BASE_Z_INDEX + placement.column,
  };
}

function toFullWidthLayout(event: CalendarEvent): TimedEventLayout {
  const base = getEventLayout(event);

  return {
    ...base,
    leftPercent: HORIZONTAL_INSET_PERCENT,
    widthPercent: 100 - HORIZONTAL_INSET_PERCENT * 2,
    zIndex: BASE_Z_INDEX,
  };
}

export function computeTimedEventLayouts(events: CalendarEvent[]) {
  const layouts = new Map<string, TimedEventLayout>();
  const clusters = buildOverlapClusters(events);

  for (const cluster of clusters) {
    if (cluster.length === 1) {
      const event = cluster[0]!;
      layouts.set(event.id, toFullWidthLayout(event));
      continue;
    }

    const placements = layoutCluster(cluster);

    for (const event of cluster) {
      const placement = placements.get(event.id)!;
      layouts.set(event.id, toTimedEventLayout(event, placement));
    }
  }

  return layouts;
}
