"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  CALENDAR_COLOR_CLASSES,
  type CalendarColor,
} from "@/lib/calendar-data";
import { cn } from "@/lib/utils";

type CalendarColorCheckboxProps = {
  color?: CalendarColor;
  checkboxColor?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function CalendarColorCheckbox({
  color = "blue",
  checkboxColor,
  checked,
  onCheckedChange,
}: CalendarColorCheckboxProps) {
  if (checkboxColor) {
    return (
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "size-[18px] rounded-[4px]",
          "border-[color-mix(in_srgb,var(--calendar-color)_38%,transparent)]",
          "data-checked:border-[var(--calendar-color)] data-checked:bg-[var(--calendar-color)]",
          "data-checked:text-white",
          "dark:data-checked:bg-[var(--calendar-color)] dark:data-checked:text-white"
        )}
        style={
          {
            "--calendar-color": checkboxColor,
          } as React.CSSProperties
        }
      />
    );
  }

  const colorClasses = CALENDAR_COLOR_CLASSES[color];

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "size-[18px] rounded-[4px]",
        colorClasses.border,
        colorClasses.checked
      )}
    />
  );
}
