"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  CALENDAR_COLOR_CLASSES,
  type CalendarColor,
} from "@/lib/calendar-data";
import { cn } from "@/lib/utils";

type CalendarColorCheckboxProps = {
  color: CalendarColor;
  defaultChecked?: boolean;
};

export function CalendarColorCheckbox({
  color,
  defaultChecked = true,
}: CalendarColorCheckboxProps) {
  const colorClasses = CALENDAR_COLOR_CLASSES[color];

  return (
    <Checkbox
      defaultChecked={defaultChecked}
      className={cn(
        "size-[18px] rounded-[4px]",
        colorClasses.border,
        colorClasses.checked
      )}
    />
  );
}
