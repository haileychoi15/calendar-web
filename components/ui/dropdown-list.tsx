"use client";

import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const dropdownListPanelClassName =
  "overflow-hidden rounded-lg border border-border bg-popover p-1 text-left text-popover-foreground shadow-sm";

export const dropdownListOptionClassName =
  "group/dropdown-list-option relative grid w-full cursor-default grid-cols-[1fr_auto] items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-foreground outline-none select-none hover:bg-muted focus:bg-muted disabled:pointer-events-none disabled:opacity-50";

const dropdownListCheckClassName =
  "size-3.5 shrink-0 !text-primary group-hover/dropdown-list-option:!text-primary group-focus/dropdown-list-option:!text-primary group-focus-visible/dropdown-list-option:!text-primary";

type DropdownListPanelProps = {
  children: ReactNode;
  className?: string;
};

export function DropdownListPanel({
  children,
  className,
}: DropdownListPanelProps) {
  return (
    <div className={cn(dropdownListPanelClassName, className)}>{children}</div>
  );
}

type DropdownListOptionContentProps = {
  selected?: boolean;
  children: ReactNode;
  contentClassName?: string;
};

export function DropdownListOptionContent({
  selected = false,
  children,
  contentClassName,
}: DropdownListOptionContentProps) {
  return (
    <>
      <span className={cn("min-w-0 truncate text-left", contentClassName)}>
        {children}
      </span>
      <span className="flex size-3.5 items-center justify-end">
        {selected ? (
          <Check className={dropdownListCheckClassName} aria-hidden />
        ) : null}
      </span>
    </>
  );
}

export function getDropdownListOptionClassName({
  selected = false,
  className,
}: {
  selected?: boolean;
  className?: string;
} = {}) {
  return cn(
    dropdownListOptionClassName,
    selected && "bg-muted hover:bg-muted focus:bg-muted",
    className
  );
}

type DropdownOptionProps = {
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DropdownOption({
  selected = false,
  onClick,
  children,
  className,
  contentClassName,
}: DropdownOptionProps) {
  return (
    <button
      type="button"
      className={getDropdownListOptionClassName({ selected, className })}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <DropdownListOptionContent
        selected={selected}
        contentClassName={contentClassName}
      >
        {children}
      </DropdownListOptionContent>
    </button>
  );
}

type DropdownMenuOptionProps = {
  selected?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof DropdownMenuItem>, "children">;

export function DropdownMenuOption({
  selected = false,
  children,
  className,
  ...props
}: DropdownMenuOptionProps) {
  return (
    <DropdownMenuItem
      className={cn(
        getDropdownListOptionClassName({ selected, className }),
        "focus:**:text-foreground"
      )}
      {...props}
    >
      <DropdownListOptionContent selected={selected}>
        {children}
      </DropdownListOptionContent>
    </DropdownMenuItem>
  );
}
