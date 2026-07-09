"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPersonCheckboxColor } from "@/lib/calendar-data";
import {
  DEFAULT_PERSON_AVATAR_SRC,
  getPersonAvatarSrc,
} from "@/lib/person-avatars";
import { cn } from "@/lib/utils";

type PersonAvatarProps = {
  personId: string;
  name: string;
  className?: string;
  size?: "default" | "xs" | "sm" | "lg";
  /** Colored ring from calendar identity. Off for header profile. */
  showCalendarColor?: boolean;
};

export function PersonAvatar({
  personId,
  name,
  className,
  size = "sm",
  showCalendarColor = true,
}: PersonAvatarProps) {
  const borderColor = getPersonCheckboxColor(personId);
  const avatarSrc = getPersonAvatarSrc(name);

  return (
    <Avatar
      size={size}
      className={cn(
        size === "xs" && "size-4",
        size === "sm" && "size-6",
        size === "lg" && "size-10",
        "after:hidden",
        showCalendarColor ? "border-2" : "border-[0.5px] border-border",
        className
      )}
      style={showCalendarColor ? { borderColor } : undefined}
    >
      <AvatarImage src={avatarSrc} alt={name} />
      <AvatarFallback
        className={cn(
          "overflow-hidden bg-muted p-0",
          showCalendarColor ? "border-2" : "border-[0.5px] border-border"
        )}
        style={showCalendarColor ? { borderColor } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={DEFAULT_PERSON_AVATAR_SRC}
          alt=""
          className="size-full rounded-full object-cover"
        />
      </AvatarFallback>
    </Avatar>
  );
}
