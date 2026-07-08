"use client";

import { addHours } from "date-fns";
import {
  AlignLeft,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  MapPin,
  Paperclip,
  Sparkles,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { ko as dayPickerKo } from "react-day-picker/locale";

import {
  CreateEventFieldRow,
  CreateEventInputShell,
  CreateEventPlainInput,
  CreateEventSection,
  createEventFilledInputShellClassName,
  createEventGhostBorderButtonClassName,
  createEventOutlineTriggerClassName,
  createEventSelectableTriggerClassName,
  createEventTimeSelectStartTriggerClassName,
  createEventTimeSelectTriggerClassName,
} from "@/components/calendar/create-event-field";
import { PersonAvatar } from "@/components/calendar/person-avatar";
import { DropdownListPanel, DropdownMenuOption, DropdownOption } from "@/components/ui/dropdown-list";
import { IconButtonTooltip } from "@/components/ui/icon-button-tooltip";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_PERSON_ID,
  getPeople,
  getPersonById,
  type Person,
} from "@/lib/calendar-events";
import {
  applyKstDate,
  applyKstTime,
  EVENT_TYPE_OPTIONS,
  formatCreateEventClockTime,
  formatCreateEventDate,
  formatCreateEventDuration,
  getDefaultEventTimes,
  getKstTimeValue,
  MEETING_ROOM_OPTIONS,
  parseKstTimeValue,
  TIME_OPTIONS,
  type EventTypeOption,
} from "@/lib/create-event-form";
import { cn } from "@/lib/utils";

type AttendeeRequirement = "required" | "optional";

type Attendee = {
  id: string;
  name: string;
  isOrganizer?: boolean;
  requirement: AttendeeRequirement;
};

type CreateEventDrawerFormProps = {
  onClose: () => void;
  visiblePersonIds: ReadonlySet<string>;
  onTogglePersonCalendarVisibility: (personId: string, visible: boolean) => void;
};

const ATTENDEE_ACTION_BUTTON_CLASS =
  "inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted";

function isCalendarPersonId(personId: string) {
  return getPersonById(personId) !== undefined;
}

const INITIAL_ATTENDEE_IDS = ["po1", "fe1", "be1"] as const;

function buildInitialAttendees(): Attendee[] {
  const organizer = getPersonById(DEFAULT_PERSON_ID);
  const attendees: Attendee[] = organizer
    ? [
        {
          id: organizer.id,
          name: organizer.name,
          isOrganizer: true,
          requirement: "required",
        },
      ]
    : [];

  for (const personId of INITIAL_ATTENDEE_IDS) {
    const person = getPersonById(personId);
    if (person) {
      attendees.push({
        id: person.id,
        name: person.name,
        requirement: "required",
      });
    }
  }

  return attendees;
}

function personToAttendee(person: Person): Attendee {
  return {
    id: person.id,
    name: person.name,
    requirement: "required",
  };
}

export function CreateEventDrawerForm({
  onClose,
  visiblePersonIds,
  onTogglePersonCalendarVisibility,
}: CreateEventDrawerFormProps) {
  const defaultTimes = useMemo(() => getDefaultEventTimes(), []);
  const attendeeBlurTimeoutRef = useRef<number | null>(null);
  const locationBlurTimeoutRef = useRef<number | null>(null);

  const [eventType, setEventType] = useState<EventTypeOption>("meeting");
  const [title, setTitle] = useState("");
  const [attendeeQuery, setAttendeeQuery] = useState("");
  const [isAttendeeSearchFocused, setIsAttendeeSearchFocused] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>(buildInitialAttendees);
  const [eventDate, setEventDate] = useState(defaultTimes.date);
  const [startTime, setStartTime] = useState(defaultTimes.start);
  const [endTime, setEndTime] = useState(defaultTimes.end);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState("");

  const eventTypeLabel =
    EVENT_TYPE_OPTIONS.find((option) => option.value === eventType)?.label ??
    "회의";
  const durationLabel = formatCreateEventDuration(startTime, endTime);

  const attendeeIds = useMemo(
    () => new Set(attendees.map((attendee) => attendee.id)),
    [attendees]
  );

  const attendeeSuggestions = useMemo(() => {
    const query = attendeeQuery.trim().toLowerCase();

    return getPeople().filter((person) => {
      if (attendeeIds.has(person.id)) return false;
      if (!query) return true;

      return (
        person.name.toLowerCase().includes(query) ||
        person.role.toLowerCase().includes(query)
      );
    });
  }, [attendeeIds, attendeeQuery]);

  const showAttendeeSuggestions =
    isAttendeeSearchFocused && attendeeSuggestions.length > 0;

  const meetingRoomSuggestions = useMemo(() => {
    const query = location.trim().toLowerCase();
    const isExactRoomMatch = MEETING_ROOM_OPTIONS.some(
      (room) => room.toLowerCase() === query
    );

    if (!query || isExactRoomMatch) {
      return [...MEETING_ROOM_OPTIONS];
    }

    return MEETING_ROOM_OPTIONS.filter((room) =>
      room.toLowerCase().includes(query)
    );
  }, [location]);

  const showMeetingRoomSuggestions =
    isLocationFocused && meetingRoomSuggestions.length > 0;

  const addAttendee = (attendee: Attendee) => {
    setAttendees((current) => {
      if (current.some((item) => item.id === attendee.id)) return current;
      return [...current, attendee];
    });
    setAttendeeQuery("");
  };

  const handleAttendeeFocus = () => {
    if (attendeeBlurTimeoutRef.current) {
      window.clearTimeout(attendeeBlurTimeoutRef.current);
      attendeeBlurTimeoutRef.current = null;
    }
    setIsAttendeeSearchFocused(true);
  };

  const handleAttendeeBlur = () => {
    attendeeBlurTimeoutRef.current = window.setTimeout(() => {
      setIsAttendeeSearchFocused(false);
    }, 150);
  };

  const handleLocationFocus = () => {
    if (locationBlurTimeoutRef.current) {
      window.clearTimeout(locationBlurTimeoutRef.current);
      locationBlurTimeoutRef.current = null;
    }
    setIsLocationFocused(true);
  };

  const handleLocationBlur = () => {
    locationBlurTimeoutRef.current = window.setTimeout(() => {
      setIsLocationFocused(false);
    }, 150);
  };

  const handleAttendeeKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const query = attendeeQuery.trim();
    if (!query) return;

    const matchedPerson = attendeeSuggestions.find(
      (person) => person.name.toLowerCase() === query.toLowerCase()
    );

    if (matchedPerson) {
      addAttendee(personToAttendee(matchedPerson));
      return;
    }

    const guestId = `guest-${query}`;
    if (!attendeeIds.has(guestId)) {
      addAttendee({ id: guestId, name: query, requirement: "required" });
    } else {
      setAttendeeQuery("");
    }
  };

  const toggleAttendeeRequirement = (attendeeId: string) => {
    setAttendees((current) =>
      current.map((attendee) =>
        attendee.id === attendeeId
          ? {
              ...attendee,
              requirement:
                attendee.requirement === "required" ? "optional" : "required",
            }
          : attendee
      )
    );
  };

  const toggleAttendeeCalendarVisibility = (attendeeId: string) => {
    onTogglePersonCalendarVisibility(
      attendeeId,
      !visiblePersonIds.has(attendeeId)
    );
  };

  const removeAttendee = (attendeeId: string) => {
    setAttendees((current) =>
      current.filter((attendee) => attendee.id !== attendeeId)
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setEventDate(date);
    setStartTime((current) => applyKstDate(current, date));
    setEndTime((current) => applyKstDate(current, date));
    setDatePopoverOpen(false);
  };

  const handleStartTimeChange = (value: string | null) => {
    if (!value) return;

    const { hour, minute } = parseKstTimeValue(value);
    const nextStart = applyKstTime(startTime, hour, minute);
    setStartTime(nextStart);

    if (nextStart.getTime() >= endTime.getTime()) {
      setEndTime(addHours(nextStart, 1));
    }
  };

  const handleEndTimeChange = (value: string | null) => {
    if (!value) return;

    const { hour, minute } = parseKstTimeValue(value);
    const nextEnd = applyKstTime(endTime, hour, minute);

    if (nextEnd.getTime() <= startTime.getTime()) return;
    setEndTime(nextEnd);
  };

  return (
    <div className="relative flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pb-[72px]">
        <CreateEventSection className="space-y-2 pt-3">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="default"
                    className={createEventOutlineTriggerClassName}
                  >
                    {eventTypeLabel}
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <DropdownMenuOption
                    key={option.value}
                    selected={eventType === option.value}
                    onClick={() => setEventType(option.value)}
                  >
                    {option.label}
                  </DropdownMenuOption>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="닫기"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>

          <CreateEventInputShell>
            <CreateEventPlainInput
              value={title}
              onChange={setTitle}
              placeholder="제목"
              className="text-sm font-medium"
            />
          </CreateEventInputShell>
        </CreateEventSection>

        <CreateEventSection>
          <CreateEventFieldRow icon={<Users className="size-4" />}>
            <div className="relative">
              <CreateEventInputShell className={createEventFilledInputShellClassName}>
                <CreateEventPlainInput
                  value={attendeeQuery}
                  onChange={setAttendeeQuery}
                  placeholder="참석자 추가"
                  onFocus={handleAttendeeFocus}
                  onBlur={handleAttendeeBlur}
                  onKeyDown={handleAttendeeKeyDown}
                />
              </CreateEventInputShell>

              {showAttendeeSuggestions ? (
                <DropdownListPanel className="absolute inset-x-0 top-full z-30 mt-1">
                  <ul className="max-h-40 overflow-y-auto">
                    {attendeeSuggestions.map((person) => (
                      <li key={person.id} className="w-full">
                        <DropdownOption
                          contentClassName="flex items-center gap-2"
                          onClick={() => addAttendee(personToAttendee(person))}
                        >
                          <PersonAvatar personId={person.id} name={person.name} />
                          <span className="min-w-0 flex-1 truncate text-foreground">
                            {person.name}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {person.role}
                          </span>
                        </DropdownOption>
                      </li>
                    ))}
                  </ul>
                </DropdownListPanel>
              ) : null}
            </div>

            <ul className="space-y-1">
              {attendees.map((attendee) => (
                <li
                  key={attendee.id}
                  className="group/attendee-row flex items-center gap-2 rounded-lg px-1 py-1"
                >
                  <PersonAvatar personId={attendee.id} name={attendee.name} />
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {attendee.name}
                    {attendee.isOrganizer ? (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        주최자
                      </span>
                    ) : attendee.requirement === "optional" ? (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        선택 참석
                      </span>
                    ) : null}
                  </span>
                  {attendee.isOrganizer ? null : (
                    <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover/attendee-row:opacity-100">
                      <IconButtonTooltip
                        label={
                          attendee.requirement === "required"
                            ? "선택 참석으로 표시"
                            : "필수로 표시"
                        }
                      >
                        <button
                          type="button"
                          aria-label={
                            attendee.requirement === "required"
                              ? "선택 참석으로 표시"
                              : "필수로 표시"
                          }
                          onClick={(event) => {
                            toggleAttendeeRequirement(attendee.id);
                            event.currentTarget.blur();
                          }}
                          className={ATTENDEE_ACTION_BUTTON_CLASS}
                        >
                          <User
                            className={cn(
                              "size-3.5",
                              attendee.requirement === "required" && "fill-current"
                            )}
                          />
                        </button>
                      </IconButtonTooltip>
                      {isCalendarPersonId(attendee.id) ? (
                        <IconButtonTooltip
                          label={
                            visiblePersonIds.has(attendee.id)
                              ? "일정 숨기기"
                              : "일정 보이기"
                          }
                        >
                          <button
                            type="button"
                            aria-label={
                              visiblePersonIds.has(attendee.id)
                                ? "일정 숨기기"
                                : "일정 보이기"
                            }
                            onClick={(event) => {
                              toggleAttendeeCalendarVisibility(attendee.id);
                              event.currentTarget.blur();
                            }}
                            className={ATTENDEE_ACTION_BUTTON_CLASS}
                          >
                            {visiblePersonIds.has(attendee.id) ? (
                              <Eye className="size-3.5" />
                            ) : (
                              <EyeOff className="size-3.5" />
                            )}
                          </button>
                        </IconButtonTooltip>
                      ) : null}
                      <IconButtonTooltip label="참석자 제외">
                        <button
                          type="button"
                          aria-label="참석자 제외"
                          onClick={(event) => {
                            removeAttendee(attendee.id);
                            event.currentTarget.blur();
                          }}
                          className={ATTENDEE_ACTION_BUTTON_CLASS}
                        >
                          <X className="size-3.5" />
                        </button>
                      </IconButtonTooltip>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <Button
              type="button"
              variant="ghost"
              className={cn("w-full", createEventGhostBorderButtonClassName)}
            >
              <Sparkles className="size-4" />
              가능 시간 보기
            </Button>
          </CreateEventFieldRow>
        </CreateEventSection>

        <CreateEventSection>
          <CreateEventFieldRow icon={<Clock className="size-4" />}>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    className={createEventSelectableTriggerClassName}
                  >
                    {formatCreateEventDate(eventDate)}
                  </button>
                }
              />
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={handleDateSelect}
                  locale={dayPickerKo}
                />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-1">
              <Select
                value={getKstTimeValue(startTime)}
                onValueChange={handleStartTimeChange}
              >
                <SelectTrigger
                  showIcon={false}
                  className={createEventTimeSelectStartTriggerClassName}
                >
                  <SelectValue placeholder={formatCreateEventClockTime(startTime)}>
                    <span className="text-sm font-medium">
                      {formatCreateEventClockTime(startTime)}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {TIME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="shrink-0 text-sm text-muted-foreground">→</span>

              <Select
                value={getKstTimeValue(endTime)}
                onValueChange={handleEndTimeChange}
              >
                <SelectTrigger
                  showIcon={false}
                  className={createEventTimeSelectTriggerClassName}
                >
                  <SelectValue placeholder={formatCreateEventClockTime(endTime)}>
                    <span className="text-sm font-medium">
                      {formatCreateEventClockTime(endTime)}
                    </span>
                    {durationLabel ? (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {durationLabel}
                      </span>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {TIME_OPTIONS.filter((option) => {
                    const { hour, minute } = option;
                    const candidate = applyKstTime(startTime, hour, minute);
                    return candidate.getTime() > startTime.getTime();
                  }).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CreateEventFieldRow>
        </CreateEventSection>

        <CreateEventSection>
          <CreateEventFieldRow icon={<MapPin className="size-4" />}>
            <div className="relative">
              <CreateEventInputShell>
                <CreateEventPlainInput
                  value={location}
                  onChange={setLocation}
                  placeholder="회의실"
                  onFocus={handleLocationFocus}
                  onBlur={handleLocationBlur}
                />
              </CreateEventInputShell>

              {showMeetingRoomSuggestions ? (
                <DropdownListPanel className="absolute inset-x-0 top-full z-30 mt-1">
                  <ul>
                    {meetingRoomSuggestions.map((room) => (
                      <li key={room} className="w-full">
                        <DropdownOption
                          selected={location === room}
                          onClick={() => setLocation(room)}
                        >
                          {room}
                        </DropdownOption>
                      </li>
                    ))}
                  </ul>
                </DropdownListPanel>
              ) : null}
            </div>
          </CreateEventFieldRow>

          <CreateEventFieldRow
            icon={<Video className="size-4" />}
            className="mt-2"
          >
            <CreateEventInputShell>
              <CreateEventPlainInput
                value={videoLink}
                onChange={setVideoLink}
                placeholder="Google Meet / Zoom 연결"
              />
            </CreateEventInputShell>
          </CreateEventFieldRow>
        </CreateEventSection>

        <CreateEventSection className="border-b-0">
          <CreateEventFieldRow icon={<AlignLeft className="size-4" />}>
            <CreateEventInputShell>
              <CreateEventPlainInput
                value={description}
                onChange={setDescription}
                placeholder="설명"
              />
            </CreateEventInputShell>
          </CreateEventFieldRow>

          <CreateEventFieldRow
            icon={<Paperclip className="size-4" />}
            className="mt-2"
          >
            <CreateEventInputShell>
              <CreateEventPlainInput
                value={attachments}
                onChange={setAttachments}
                placeholder="링크 및 첨부파일"
              />
            </CreateEventInputShell>
          </CreateEventFieldRow>
        </CreateEventSection>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-background p-4">
        <Button type="button" className="h-10 w-full rounded-lg">
          초대보내기
        </Button>
      </div>
    </div>
  );
}
