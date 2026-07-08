"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuOption } from "@/components/ui/dropdown-menu-option";
import { cn } from "@/lib/utils";
import { formatWeekViewMonthTitleForWeek } from "@/lib/calendar-week";

type CalendarHeaderProps = {
  weekStart: Date;
  onToday: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
};

type ViewOption = {
  label: string;
  value: "day" | "week" | "month";
  disabled?: boolean;
};

const VIEW_OPTIONS: ViewOption[] = [
  { label: "일", value: "day", disabled: true },
  { label: "주", value: "week" },
  { label: "월", value: "month", disabled: true },
];

const HEADER_BUTTON_CLASS = "border-border";

export function CalendarHeader({
  weekStart,
  onToday,
  onPreviousWeek,
  onNextWeek,
}: CalendarHeaderProps) {
  const selectedView = VIEW_OPTIONS[1];
  const monthTitle = formatWeekViewMonthTitleForWeek(weekStart);

  return (
    <header className="mb-4 flex h-14 shrink-0 items-center justify-between px-6">
      <h1 className="text-[22px] font-semibold text-foreground">{monthTitle}</h1>

      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousWeek}
            aria-label="이전 주"
          >
            <ChevronLeft className="text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextWeek}
            aria-label="다음 주"
          >
            <ChevronRight className="text-muted-foreground" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="default"
          className={cn(
            "h-8 rounded-md border border-border bg-transparent px-2.5",
            HEADER_BUTTON_CLASS
          )}
          onClick={onToday}
        >
          오늘
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="default"
                className={cn(
                  "min-w-14 h-8 gap-1 rounded-md border border-border bg-transparent px-2.5",
                  HEADER_BUTTON_CLASS
                )}
              >
                {selectedView.label}
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-24">
            {VIEW_OPTIONS.map((option) => (
              <DropdownMenuOption
                key={option.value}
                disabled={option.disabled}
                selected={option.value === selectedView.value}
                className={cn(
                  option.value === selectedView.value && "font-medium"
                )}
              >
                {option.label}
              </DropdownMenuOption>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Avatar>
          <AvatarFallback className="text-sm font-medium">김</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
