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
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function CalendarColorCheckbox({
  color = "blue",
  checkboxColor,
  checked,
  disabled = false,
  onCheckedChange,
}: CalendarColorCheckboxProps) {
  const sharedClassName = "size-[18px] rounded-[4px] border-input";

  if (checkboxColor) {
    return (
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className={cn(
          sharedClassName,
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
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      className={cn(sharedClassName, colorClasses.checked)}
    />
  );
}
