"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getPersonCheckboxColor } from "@/lib/calendar-data";
import { cn } from "@/lib/utils";

type PersonAvatarProps = {
  personId: string;
  name: string;
  className?: string;
};

export function PersonAvatar({ personId, name, className }: PersonAvatarProps) {
  const borderColor = getPersonCheckboxColor(personId);

  return (
    <Avatar size="sm" className={cn("size-6 after:hidden", className)}>
      <AvatarFallback
        className="border-2 bg-muted text-[10px] font-medium text-muted-foreground"
        style={{ borderColor }}
      >
        {name.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}
