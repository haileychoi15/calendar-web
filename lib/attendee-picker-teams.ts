import { getPersonById, type Person } from "@/lib/calendar-events";

export type AttendeePickerPerson = Person & {
  disabled?: boolean;
};

export type AttendeePickerTeam = {
  id: string;
  label: string | null;
  personIds: readonly string[];
};

/** Prototype-only entries: shown in the picker but not selectable. */
const DISABLED_ATTENDEE_PICKER_PEOPLE: Record<string, AttendeePickerPerson> = {
  sales2: {
    id: "sales2",
    name: "장민우",
    role: "세일즈 매니저",
    color: "#FAECE7",
    textColor: "#993C1D",
    disabled: true,
  },
  sales3: {
    id: "sales3",
    name: "한동수",
    role: "세일즈 매니저",
    color: "#FAECE7",
    textColor: "#993C1D",
    disabled: true,
  },
};

export const ATTENDEE_PICKER_TEAMS: readonly AttendeePickerTeam[] = [
  {
    id: "product",
    label: "팀원",
    personIds: ["po1", "fe1", "be1"],
  },
  {
    id: "cross-functional",
    label: null,
    personIds: ["marketer1", "sales1", "sales2", "sales3"],
  },
] as const;

export type AttendeePickerTeamGroup = {
  id: string;
  label: string | null;
  people: AttendeePickerPerson[];
};

function getAttendeePickerPerson(
  personId: string
): AttendeePickerPerson | undefined {
  const disabledPerson = DISABLED_ATTENDEE_PICKER_PEOPLE[personId];
  if (disabledPerson) return disabledPerson;

  return getPersonById(personId);
}

export function getAttendeePickerTeamGroups({
  excludedPersonIds,
  query = "",
}: {
  excludedPersonIds: ReadonlySet<string>;
  query?: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  return ATTENDEE_PICKER_TEAMS.map((team) => {
    const people = team.personIds
      .map((personId) => getAttendeePickerPerson(personId))
      .filter((person): person is AttendeePickerPerson => person !== undefined)
      .filter((person) => !excludedPersonIds.has(person.id))
      .filter((person) => {
        if (!normalizedQuery) return true;

        return (
          team.label?.toLowerCase().includes(normalizedQuery) ||
          person.name.toLowerCase().includes(normalizedQuery) ||
          person.role.toLowerCase().includes(normalizedQuery)
        );
      });

    return {
      id: team.id,
      label: team.label,
      people,
    };
  }).filter((team) => team.people.length > 0);
}
