import { formatMonthTitle } from "@/lib/calendar-date";

type CalendarMainPlaceholderProps = {
  currentDate: Date;
};

export function CalendarMainPlaceholder({
  currentDate,
}: CalendarMainPlaceholderProps) {
  return (
    <main className="flex flex-1 flex-col bg-muted/50 p-6">
      <h1 className="text-lg font-semibold text-foreground">
        {formatMonthTitle(currentDate)}
      </h1>
    </main>
  );
}
