"use client";

import {
  AlignLeft,
  ChevronDown,
  Clock,
  ClockCheck,
  Eye,
  EyeOff,
  MapPin,
  Paperclip,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ko as dayPickerKo } from "react-day-picker/locale";

import { AvailableTimesSection } from "@/components/calendar/available-times-section";
import {
  CreateEventFieldFlash,
  CreateEventFieldRow,
  CreateEventInputShell,
  CreateEventPlainInput,
  CreateEventSection,
  createEventFilledInputShellClassName,
  createEventGhostBorderButtonClassName,
  createEventOutlineTriggerClassName,
  createEventSelectableTriggerClassName,
  createEventTimeSelectStartTriggerClassName,
  createEventTimeSelectEndTriggerClassName,
} from "@/components/calendar/create-event-field";
import { AttendeePickerDropdown } from "@/components/calendar/attendee-picker-dropdown";
import { PersonAvatar } from "@/components/calendar/person-avatar";
import { IconButtonTooltip } from "@/components/ui/icon-button-tooltip";
import { DropdownListPanel, DropdownMenuOption, DropdownOption } from "@/components/ui/dropdown-list";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  type CreateMeetingEventInput,
  type Person,
} from "@/lib/calendar-events";
import {
  applyKstDate,
  applyKstTime,
  addKstMinutes,
  DEFAULT_MEETING_DURATION_MINUTES,
  EVENT_TYPE_OPTIONS,
  formatCreateEventClockTime,
  formatCreateEventDate,
  formatCreateEventDuration,
  formatMeetingDurationLabel,
  getDefaultEventTimes,
  getKstTimeValue,
  MEETING_DURATION_OPTIONS,
  MEETING_ROOM_OPTIONS,
  parseKstTimeValue,
  snapToMeetingDurationMinutes,
  TIME_OPTIONS,
  type SupportedEventTypeOption,
} from "@/lib/create-event-form";
import {
  findAvailableTimes,
  getAvailableTimeSlotKey,
  getDisplayedAvailableTimeSlots,
  SEARCH_LOADING_DELAY_MS,
  type AvailableTimeAttendee,
  type AvailableTimeSlot,
  type AvailableTimesResult,
} from "@/lib/available-times";
import { getAttendeePickerTeamGroups, OPTIONAL_PARTICIPATION_SUGGESTED_PERSON_IDS } from "@/lib/attendee-picker-teams";
import { cn } from "@/lib/utils";

type AttendeeRequirement = "required" | "optional";

type Attendee = {
  id: string;
  name: string;
  isOrganizer?: boolean;
  requirement: AttendeeRequirement;
};

type CreateEventDrawerFormProps = {
  open: boolean;
  onClose: () => void;
  attendeeVisibleCalendarIds: ReadonlySet<string>;
  onToggleAttendeeCalendarVisibility: (
    personId: string,
    visible: boolean
  ) => void;
  onAttendeeCalendarIdsChange: (personIds: string[]) => void;
  onAvailableTimeSlotsChange: (slots: AvailableTimeSlot[]) => void;
  onHoveredAvailableSlotKeyChange: (slotKey: string | null) => void;
  hoveredAvailableSlotKey: string | null;
  selectedAvailableSlotKey: string | null;
  onSelectAvailableSlot: (slot: AvailableTimeSlot | null) => void;
  onSendInvite: (input: CreateMeetingEventInput) => void;
};

const ATTENDEE_ACTION_BUTTON_CLASS =
  "inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted";

function isCalendarPersonId(personId: string) {
  return getPersonById(personId) !== undefined;
}

function getAttendeeCalendarPersonIds(attendees: Attendee[]) {
  return attendees
    .map((attendee) => attendee.id)
    .filter((personId) => isCalendarPersonId(personId));
}

function buildInitialAttendees(): Attendee[] {
  const organizer = getPersonById(DEFAULT_PERSON_ID);

  return organizer
    ? [
        {
          id: organizer.id,
          name: organizer.name,
          isOrganizer: true,
          requirement: "required",
        },
      ]
    : [];
}

function personToAttendee(person: Person): Attendee {
  return {
    id: person.id,
    name: person.name,
    requirement: "required",
  };
}

export function CreateEventDrawerForm({
  open,
  onClose,
  attendeeVisibleCalendarIds,
  onToggleAttendeeCalendarVisibility,
  onAttendeeCalendarIdsChange,
  onAvailableTimeSlotsChange,
  onHoveredAvailableSlotKeyChange,
  hoveredAvailableSlotKey,
  selectedAvailableSlotKey,
  onSelectAvailableSlot,
  onSendInvite,
}: CreateEventDrawerFormProps) {
  const defaultTimes = useMemo(() => getDefaultEventTimes(), []);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const attendeeBlurTimeoutRef = useRef<number | null>(null);
  const locationBlurTimeoutRef = useRef<number | null>(null);

  const [eventType, setEventType] = useState<SupportedEventTypeOption>("meeting");
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
  const [sendInviteEmail, setSendInviteEmail] = useState(true);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [availableTimesEverOpened, setAvailableTimesEverOpened] = useState(false);
  const [availableTimesOpen, setAvailableTimesOpen] = useState(false);
  const [availableTimesLoading, setAvailableTimesLoading] = useState(false);
  const [availableTimesResult, setAvailableTimesResult] =
    useState<AvailableTimesResult | null>(null);
  const availableTimesRequestRef = useRef(0);
  const [eventTimeFlashKey, setEventTimeFlashKey] = useState(0);
  const [meetingDurationMinutes, setMeetingDurationMinutes] = useState(
    DEFAULT_MEETING_DURATION_MINUTES
  );

  const eventTypeLabel =
    EVENT_TYPE_OPTIONS.find((option) => option.value === eventType)?.label ??
    "회의";
  const meetingDurationLabel = formatMeetingDurationLabel(meetingDurationMinutes);

  useEffect(() => {
    if (!open) return;

    const frameId = requestAnimationFrame(() => {
      titleInputRef.current?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frameId);
  }, [open]);
  const durationLabel = formatCreateEventDuration(startTime, endTime);

  const attendeeIds = useMemo(
    () => new Set(attendees.map((attendee) => attendee.id)),
    [attendees]
  );

  const attendeePickerTeams = useMemo(
    () =>
      getAttendeePickerTeamGroups({
        excludedPersonIds: attendeeIds,
        query: attendeeQuery,
      }),
    [attendeeIds, attendeeQuery]
  );

  const showAttendeePicker =
    isAttendeeSearchFocused &&
    attendeePickerTeams.some((team) =>
      team.people.some((person) => !person.disabled)
    );

  const hasOnlyOrganizerAttendee =
    attendees.length === 1 && attendees[0]?.isOrganizer === true;

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

  const availableTimeAttendees = useMemo<AvailableTimeAttendee[]>(
    () =>
      attendees.map((attendee) => ({
        id: attendee.id,
        name: attendee.name,
        requirement: attendee.requirement,
      })),
    [attendees]
  );

  useEffect(() => {
    if (!open) return;

    onAttendeeCalendarIdsChange(getAttendeeCalendarPersonIds(attendees));
  }, [open, attendees, onAttendeeCalendarIdsChange]);

  useEffect(() => {
    if (
      !open ||
      !availableTimesEverOpened ||
      availableTimesLoading ||
      !availableTimesResult
    ) {
      onAvailableTimeSlotsChange([]);
    }
  }, [
    open,
    availableTimesEverOpened,
    availableTimesLoading,
    availableTimesResult,
    onAvailableTimeSlotsChange,
  ]);

  const handleVisibleAvailableSlotsChange = useCallback(
    (slots: AvailableTimeSlot[]) => {
      if (
        !open ||
        !availableTimesEverOpened ||
        availableTimesLoading ||
        !availableTimesResult
      ) {
        return;
      }

      onAvailableTimeSlotsChange(slots);
    },
    [
      open,
      availableTimesEverOpened,
      availableTimesLoading,
      availableTimesResult,
      onAvailableTimeSlotsChange,
    ]
  );

  useEffect(() => {
    if (!availableTimesOpen) return;

    const requestId = availableTimesRequestRef.current + 1;
    availableTimesRequestRef.current = requestId;
    setAvailableTimesLoading(true);
    setAvailableTimesResult(null);

    const timeoutId = window.setTimeout(() => {
      if (availableTimesRequestRef.current !== requestId) return;

      setAvailableTimesResult(
        findAvailableTimes(availableTimeAttendees, {
          durationMinutes: meetingDurationMinutes,
        })
      );
      setAvailableTimesLoading(false);
    }, SEARCH_LOADING_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [availableTimeAttendees, availableTimesOpen, meetingDurationMinutes]);

  const addAttendee = (attendee: Attendee, options?: { clearQuery?: boolean }) => {
    setAttendees((current) => {
      if (current.some((item) => item.id === attendee.id)) return current;
      return [...current, attendee];
    });
    if (options?.clearQuery ?? false) {
      setAttendeeQuery("");
    }
  };

  const addAttendeesFromPeople = (people: Person[]) => {
    setAttendees((current) => {
      const existing = new Set(current.map((item) => item.id));
      const next = [...current];

      for (const person of people) {
        if (existing.has(person.id)) continue;
        next.push(personToAttendee(person));
        existing.add(person.id);
      }

      return next;
    });
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

    const matchedPerson = attendeePickerTeams
      .flatMap((team) => team.people)
      .find((person) => person.name.toLowerCase() === query.toLowerCase());

    if (matchedPerson) {
      addAttendee(personToAttendee(matchedPerson), { clearQuery: true });
      return;
    }

    const guestId = `guest-${query}`;
    if (!attendeeIds.has(guestId)) {
      addAttendee({ id: guestId, name: query, requirement: "required" }, {
        clearQuery: true,
      });
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
    onToggleAttendeeCalendarVisibility(
      attendeeId,
      !attendeeVisibleCalendarIds.has(attendeeId)
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
    setEndTime(addKstMinutes(nextStart, meetingDurationMinutes));
  };

  const handleEndTimeChange = (value: string | null) => {
    if (!value) return;

    const { hour, minute } = parseKstTimeValue(value);
    const nextEnd = applyKstTime(startTime, hour, minute);

    if (nextEnd.getTime() <= startTime.getTime()) return;
    setEndTime(nextEnd);

    const diffMinutes = Math.round(
      (nextEnd.getTime() - startTime.getTime()) / (1000 * 60)
    );
    if (diffMinutes > 0) {
      setMeetingDurationMinutes(snapToMeetingDurationMinutes(diffMinutes));
    }
  };

  const handleMeetingDurationChange = (minutes: number) => {
    setMeetingDurationMinutes(minutes);
    setEndTime(addKstMinutes(startTime, minutes));
    onSelectAvailableSlot(null);
  };

  const handleOpenAvailableTimes = () => {
    setAvailableTimesEverOpened(true);
    setAvailableTimesOpen(true);
    onSelectAvailableSlot(null);
  };

  const handleSelectAvailableSlot = (slot: AvailableTimeSlot) => {
    onSelectAvailableSlot(slot);
  };

  useEffect(() => {
    if (!selectedAvailableSlotKey || !availableTimesResult) return;

    const slot = getDisplayedAvailableTimeSlots(availableTimesResult).find(
      (candidate) =>
        getAvailableTimeSlotKey(candidate) === selectedAvailableSlotKey
    );

    if (!slot) return;

    setEventDate(slot.start);
    setStartTime(slot.start);
    setEndTime(slot.end);
    setMeetingDurationMinutes(
      snapToMeetingDurationMinutes(
        Math.round((slot.end.getTime() - slot.start.getTime()) / (1000 * 60))
      )
    );
    setEventTimeFlashKey((key) => key + 1);
  }, [selectedAvailableSlotKey, availableTimesResult]);

  const resetForm = () => {
    const nextDefaults = getDefaultEventTimes();

    setEventType("meeting");
    setTitle("");
    setAttendeeQuery("");
    setIsAttendeeSearchFocused(false);
    setAttendees(buildInitialAttendees());

    setEventDate(nextDefaults.date);
    setStartTime(nextDefaults.start);
    setEndTime(nextDefaults.end);
    setMeetingDurationMinutes(DEFAULT_MEETING_DURATION_MINUTES);
    setDatePopoverOpen(false);

    setLocation("");
    setIsLocationFocused(false);
    setVideoLink("");
    setDescription("");
    setAttachments("");
    setSendInviteEmail(true);

    setAvailableTimesOpen(false);
    setAvailableTimesEverOpened(false);
    setAvailableTimesLoading(false);
    setAvailableTimesResult(null);
    onSelectAvailableSlot(null);
    setEventTimeFlashKey(0);
  };

  const handleDiscardAndClose = () => {
    setConfirmCloseOpen(false);
    resetForm();
    onClose();
  };

  const handleSendInvite = () => {
    const personIds = attendees
      .map((attendee) => attendee.id)
      .filter((personId) => isCalendarPersonId(personId));

    if (personIds.length === 0) return;

    onSendInvite({
      title: title.trim() || "회의 (제목 없음)",
      date: startTime,
      start: startTime,
      end: endTime,
      type: eventType,
      location: location.trim() || videoLink.trim() || null,
      personIds,
    });

    resetForm();
    onClose();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
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
                    disabled={!option.supported}
                    onClick={() => {
                      if (!option.supported) return;
                      setEventType(option.value);
                    }}
                  >
                    {option.label}
                  </DropdownMenuOption>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="닫기"
                  >
                    <X className="size-4" />
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>회의 만들기를 취소할까요?</AlertDialogTitle>
                  <AlertDialogDescription>
                    지금까지 입력한 정보는 저장되지 않아요.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    render={
                      <Button type="button" variant="outline">
                        취소
                      </Button>
                    }
                  />
                  <AlertDialogAction
                    render={
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDiscardAndClose}
                      >
                        삭제
                      </Button>
                    }
                  />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <CreateEventInputShell>
            <CreateEventPlainInput
              ref={titleInputRef}
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

              {showAttendeePicker ? (
                <AttendeePickerDropdown
                  teams={attendeePickerTeams}
                  onSelectPerson={(person) =>
                    addAttendee(personToAttendee(person))
                  }
                  onSelectTeam={addAttendeesFromPeople}
                />
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
                        선택 참여
                      </span>
                    ) : OPTIONAL_PARTICIPATION_SUGGESTED_PERSON_IDS.has(
                        attendee.id
                      ) ? (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        (선택 참여 권장)
                      </span>
                    ) : null}
                  </span>
                  {attendee.isOrganizer ? null : (
                    <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover/attendee-row:opacity-100">
                      <IconButtonTooltip
                        label={
                          attendee.requirement === "required"
                            ? "선택 참여로 표시"
                            : "필수로 표시"
                        }
                      >
                        <button
                          type="button"
                          aria-label={
                            attendee.requirement === "required"
                              ? "선택 참여로 표시"
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
                            attendeeVisibleCalendarIds.has(attendee.id)
                              ? "일정 숨기기"
                              : "일정 보이기"
                          }
                        >
                          <button
                            type="button"
                            aria-label={
                              attendeeVisibleCalendarIds.has(attendee.id)
                                ? "일정 숨기기"
                                : "일정 보이기"
                            }
                            onClick={(event) => {
                              toggleAttendeeCalendarVisibility(attendee.id);
                              event.currentTarget.blur();
                            }}
                            className={ATTENDEE_ACTION_BUTTON_CLASS}
                          >
                            {attendeeVisibleCalendarIds.has(attendee.id) ? (
                              <Eye className="size-3.5" />
                            ) : (
                              <EyeOff className="size-3.5" />
                            )}
                          </button>
                        </IconButtonTooltip>
                      ) : null}
                      <IconButtonTooltip label="삭제">
                        <button
                          type="button"
                          aria-label="삭제"
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

            {hasOnlyOrganizerAttendee ? null : (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="default"
                        className={createEventOutlineTriggerClassName}
                      >
                        {meetingDurationLabel}
                        <ChevronDown className="size-3.5 text-muted-foreground" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="start">
                    {MEETING_DURATION_OPTIONS.map((option) => (
                      <DropdownMenuOption
                        key={option.minutes}
                        selected={meetingDurationMinutes === option.minutes}
                        onClick={() => handleMeetingDurationChange(option.minutes)}
                      >
                        {option.label}
                      </DropdownMenuOption>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "min-w-0 flex-1 gap-1",
                    createEventGhostBorderButtonClassName
                  )}
                  onClick={handleOpenAvailableTimes}
                >
                  <ClockCheck className="size-4 shrink-0" />
                  가능 시간 보기
                </Button>
              </div>
            )}
          </CreateEventFieldRow>
        </CreateEventSection>

        {availableTimesEverOpened && !hasOnlyOrganizerAttendee ? (
          <CreateEventSection>
            <CreateEventFieldRow icon={<ClockCheck className="size-4" />}>
              <AvailableTimesSection
                open={availableTimesOpen}
                onToggle={() => setAvailableTimesOpen((prev) => !prev)}
                loading={availableTimesLoading}
                result={availableTimesResult}
                selectedSlotKey={selectedAvailableSlotKey}
                hoveredSlotKey={hoveredAvailableSlotKey}
                onSelectSlot={handleSelectAvailableSlot}
                onHoverSlot={onHoveredAvailableSlotKeyChange}
                onVisibleSlotsChange={handleVisibleAvailableSlotsChange}
              />
            </CreateEventFieldRow>
          </CreateEventSection>
        ) : null}

        <CreateEventSection>
          <CreateEventFieldRow icon={<Clock className="size-4" />}>
            <CreateEventFieldFlash flashKey={eventTimeFlashKey}>
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
            </CreateEventFieldFlash>

            <div className="flex items-center gap-1">
              <CreateEventFieldFlash
                flashKey={eventTimeFlashKey}
                className="w-[91px] shrink-0"
              >
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
                  <SelectContent
                    align="start"
                    alignItemWithTrigger={false}
                    className="max-h-56"
                  >
                    {TIME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CreateEventFieldFlash>

              <span className="shrink-0 text-sm text-muted-foreground">→</span>

              <CreateEventFieldFlash flashKey={eventTimeFlashKey} className="min-w-0 flex-1">
                <Select
                  value={getKstTimeValue(endTime)}
                  onValueChange={handleEndTimeChange}
                >
                  <SelectTrigger
                    showIcon={false}
                    className={createEventTimeSelectEndTriggerClassName}
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
                  <SelectContent
                    align="start"
                    alignItemWithTrigger={false}
                    className="max-h-56"
                  >
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
              </CreateEventFieldFlash>
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

      <div className="shrink-0 border-t border-border bg-background p-4">
        <label className="mb-3 flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={sendInviteEmail}
            onCheckedChange={setSendInviteEmail}
            className="size-[18px] rounded-[4px]"
          />
          <span className="text-sm text-foreground">
            참석자에게 이메일 알림도 함께 보내기
          </span>
        </label>
        <Button
          type="button"
          className="h-10 w-full rounded-lg hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_10%)]"
          onClick={handleSendInvite}
        >
          회의 만들기
        </Button>
      </div>
    </div>
  );
}
