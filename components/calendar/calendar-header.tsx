"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { PersonAvatar } from "@/components/calendar/person-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuOption } from "@/components/ui/dropdown-menu-option";
import { IconButtonTooltip } from "@/components/ui/icon-button-tooltip";
import {
  createEventGhostBorderButtonClassName,
  createEventGhostIconButtonClassName,
  createEventOutlineTriggerClassName,
} from "@/components/calendar/create-event-field";
import { formatWeekViewMonthTitleForWeek } from "@/lib/calendar-week";
import { DEFAULT_PERSON_ID, getPersonById } from "@/lib/calendar-events";
import { cn } from "@/lib/utils";

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
  const currentUser = getPersonById(DEFAULT_PERSON_ID);

  return (
    <header className="relative z-40 mb-4 flex h-14 shrink-0 items-center justify-between px-6">
      <h1 className="text-[22px] font-semibold text-foreground">{monthTitle}</h1>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex shrink-0 items-center">
          <IconButtonTooltip label="이전 기간">
            <Button
              variant="ghost"
              size="icon"
              className={createEventGhostIconButtonClassName}
              onClick={onPreviousWeek}
              aria-label="이전 기간"
            >
              <ChevronLeft className="text-muted-foreground" />
            </Button>
          </IconButtonTooltip>
          <IconButtonTooltip label="다음 기간">
            <Button
              variant="ghost"
              size="icon"
              className={createEventGhostIconButtonClassName}
              onClick={onNextWeek}
              aria-label="다음 기간"
            >
              <ChevronRight className="text-muted-foreground" />
            </Button>
          </IconButtonTooltip>
        </div>

        <Button
          variant="ghost"
          size="default"
          className={cn(
            createEventGhostBorderButtonClassName,
            HEADER_BUTTON_CLASS,
            "shrink-0"
          )}
          onClick={onToday}
        >
          오늘 보기
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="default"
                className={cn(
                  createEventOutlineTriggerClassName,
                  HEADER_BUTTON_CLASS,
                  "shrink-0"
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

        {currentUser ? (
          <PersonAvatar
            personId={currentUser.id}
            name={currentUser.name}
            size="default"
            showCalendarColor={false}
          />
        ) : null}
      </div>
    </header>
  );
}
