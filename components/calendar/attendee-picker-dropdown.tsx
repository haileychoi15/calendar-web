"use client";

import { PersonAvatar } from "@/components/calendar/person-avatar";
import { DropdownListPanel } from "@/components/ui/dropdown-list";
import type { AttendeePickerTeamGroup } from "@/lib/attendee-picker-teams";
import type { Person } from "@/lib/calendar-events";
import { cn } from "@/lib/utils";

type AttendeePickerDropdownProps = {
  teams: AttendeePickerTeamGroup[];
  className?: string;
  onSelectPerson: (person: Person) => void;
  onSelectTeam: (people: Person[]) => void;
};

function preventBlurOnMouseDown(event: React.MouseEvent) {
  event.preventDefault();
}

export function AttendeePickerDropdown({
  teams,
  className,
  onSelectPerson,
  onSelectTeam,
}: AttendeePickerDropdownProps) {
  return (
    <DropdownListPanel className={cn("absolute inset-x-0 top-full z-30 mt-1 p-0", className)}>
      <div className="max-h-64 overflow-y-auto">
        {teams.map((team, index) => (
          <section
            key={team.id}
            className={cn(
              "px-3 py-2",
              index > 0 && "border-t border-border"
            )}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-muted-foreground">{team.label}</p>
              <button
                type="button"
                className="shrink-0 rounded-sm px-1 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                onMouseDown={preventBlurOnMouseDown}
                onClick={() => onSelectTeam(team.people)}
              >
                모두 선택
              </button>
            </div>

            <ul className="space-y-0.5">
              {team.people.map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left transition-colors hover:bg-muted"
                    onMouseDown={preventBlurOnMouseDown}
                    onClick={() => onSelectPerson(person)}
                  >
                    <PersonAvatar
                      personId={person.id}
                      name={person.name}
                      showCalendarColor={false}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="text-sm font-medium text-foreground">
                        {person.name}
                      </span>
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {person.role}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </DropdownListPanel>
  );
}
