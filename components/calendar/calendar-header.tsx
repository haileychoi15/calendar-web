"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type CalendarHeaderProps = {
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
  onToday,
  onPreviousWeek,
  onNextWeek,
}: CalendarHeaderProps) {
  const selectedView = VIEW_OPTIONS[1];

  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b border-border px-6">
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback className="text-xs font-medium">CY</AvatarFallback>
        </Avatar>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="secondary"
                size="default"
                className={cn("min-w-14 gap-1", HEADER_BUTTON_CLASS)}
              >
                {selectedView.label}
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-24">
            {VIEW_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                disabled={option.disabled}
                className={cn(
                  option.value === selectedView.value && "font-medium"
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="secondary"
          size="default"
          className={HEADER_BUTTON_CLASS}
          onClick={onToday}
        >
          오늘
        </Button>

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
      </div>
    </header>
  );
}
