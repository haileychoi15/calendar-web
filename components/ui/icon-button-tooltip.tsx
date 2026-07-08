"use client";

import type { ReactElement } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type IconButtonTooltipProps = {
  label: string;
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  contentClassName?: string;
};

export function IconButtonTooltip({
  label,
  children,
  side = "top",
  sideOffset = 4,
  contentClassName,
}: IconButtonTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent
        side={side}
        sideOffset={sideOffset}
        className={cn(contentClassName)}
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
