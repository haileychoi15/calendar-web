"use client";

import type {
  FocusEventHandler,
  KeyboardEventHandler,
  ReactNode,
} from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const CREATE_EVENT_FIELD_HEIGHT_CLASS = "h-8";
export const CREATE_EVENT_FIELD_RADIUS_CLASS = "rounded-md";

const createEventGhostIconButtonHoverClassName =
  "rounded-md border border-transparent bg-transparent transition-[background-color,border-color] hover:border-muted focus-visible:border-muted aria-expanded:border-muted dark:hover:border-muted/50 dark:focus-visible:border-muted/50 dark:aria-expanded:border-muted/50";

/** Header ghost icon buttons: border hidden by default, matches hover fill on hover. */
export const createEventGhostIconButtonClassName = cn(
  CREATE_EVENT_FIELD_HEIGHT_CLASS,
  "size-8 p-0",
  createEventGhostIconButtonHoverClassName
);

/** Matches calendar header ghost border buttons (오늘). */
export const createEventGhostBorderButtonClassName = cn(
  CREATE_EVENT_FIELD_HEIGHT_CLASS,
  "rounded-md border border-border bg-transparent px-2.5"
);

/** Matches calendar header view selector (주/일/월). */
export const createEventOutlineTriggerClassName = cn(
  CREATE_EVENT_FIELD_HEIGHT_CLASS,
  "min-w-14 gap-1 rounded-md border border-border bg-transparent px-2.5 text-sm font-medium"
);

const suppressHoverWhenActiveClassName =
  "focus-within:hover:border-transparent focus-within:hover:bg-muted focus-visible:hover:border-transparent focus-visible:hover:bg-muted data-popup-open:hover:border-transparent data-popup-open:hover:bg-muted";

const fieldShellClassName = cn(
  CREATE_EVENT_FIELD_HEIGHT_CLASS,
  CREATE_EVENT_FIELD_RADIUS_CLASS,
  "flex items-center border border-transparent transition-[background-color,border-color] duration-default hover:border-border focus-within:border-transparent focus-within:bg-muted",
  suppressHoverWhenActiveClassName
);

const selectableFieldClassName = cn(
  CREATE_EVENT_FIELD_HEIGHT_CLASS,
  CREATE_EVENT_FIELD_RADIUS_CLASS,
  "inline-flex w-full items-center border border-transparent px-2 text-left text-sm transition-[background-color,border-color] duration-default hover:border-border",
  suppressHoverWhenActiveClassName
);

type CreateEventSectionProps = {
  children: ReactNode;
  className?: string;
};

export function CreateEventSection({
  children,
  className,
}: CreateEventSectionProps) {
  return (
    <section className={cn("border-b border-border/40 px-4 py-3", className)}>
      {children}
    </section>
  );
}

type CreateEventFieldRowProps = {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  iconClassName?: string;
};

export function CreateEventFieldRow({
  icon,
  children,
  className,
  iconClassName,
}: CreateEventFieldRowProps) {
  return (
    <div className={cn("flex items-start gap-2", className)}>
      {icon ? (
        <div
          className={cn(
            "flex h-8 w-5 shrink-0 items-center justify-center text-muted-foreground",
            iconClassName
          )}
        >
          {icon}
        </div>
      ) : null}
      <div className="min-w-0 flex-1 space-y-2">{children}</div>
    </div>
  );
}

type CreateEventInputShellProps = {
  children: ReactNode;
  className?: string;
};

export function CreateEventInputShell({
  children,
  className,
}: CreateEventInputShellProps) {
  return <div className={cn(fieldShellClassName, className)}>{children}</div>;
}

/** Always shows the focused fill treatment (e.g. attendee search). */
export const createEventFilledInputShellClassName =
  "border-transparent bg-muted hover:border-transparent hover:bg-muted focus-within:hover:border-transparent focus-within:hover:bg-muted";

type CreateEventSelectableFieldProps = {
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
};

export function CreateEventSelectableField({
  selected = false,
  onClick,
  className,
  children,
}: CreateEventSelectableFieldProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        selectableFieldClassName,
        selected &&
          "border-transparent bg-muted hover:border-transparent hover:bg-muted",
        className
      )}
    >
      {children}
    </button>
  );
}

type CreateEventPlainInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

export function CreateEventPlainInput({
  value,
  onChange,
  placeholder,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  ref,
}: CreateEventPlainInputProps & {
  ref?: React.Ref<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}) {
  return (
    <Input
      ref={ref}
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={cn(
        CREATE_EVENT_FIELD_HEIGHT_CLASS,
        CREATE_EVENT_FIELD_RADIUS_CLASS,
        "border-0 bg-transparent px-2 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent",
        className
      )}
    />
  );
}

export const createEventSelectableTriggerClassName = cn(
  selectableFieldClassName,
  "data-popup-open:border-transparent data-popup-open:bg-muted"
);

export const createEventTimeSelectTriggerClassName = cn(
  createEventSelectableTriggerClassName,
  "w-fit shrink-0 justify-between border-transparent text-sm font-medium shadow-none focus-visible:border-transparent focus-visible:ring-0 data-placeholder:text-foreground dark:bg-transparent dark:hover:bg-transparent"
);

export const createEventTimeSelectStartTriggerClassName = cn(
  createEventTimeSelectTriggerClassName,
  "w-[91px]"
);

export const createEventTimeSelectEndTriggerClassName = cn(
  createEventTimeSelectTriggerClassName,
  "w-full min-w-0"
);

type CreateEventFieldFlashProps = {
  flashKey: number;
  className?: string;
  children: ReactNode;
};

/** Brief primary tint when event time fields are filled from an available slot. */
export function CreateEventFieldFlash({
  flashKey,
  className,
  children,
}: CreateEventFieldFlashProps) {
  return (
    <div className={cn("relative", className)}>
      {flashKey > 0 ? (
        <span
          key={flashKey}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-md bg-primary/16 animate-[eventTimeFieldFlash_1.7s_forwards]"
        />
      ) : null}
      <div className="relative z-[1] min-w-0 w-full">{children}</div>
    </div>
  );
}
