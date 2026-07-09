import { getPersonById, type Person } from "@/lib/calendar-events";

export type AttendeePickerTeam = {
  id: string;
  label: string | null;
  personIds: readonly string[];
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
    personIds: ["marketer1", "sales1"],
  },
] as const;

export type AttendeePickerTeamGroup = {
  id: string;
  label: string | null;
  people: Person[];
};

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
      .map((personId) => getPersonById(personId))
      .filter((person): person is Person => person !== undefined)
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
