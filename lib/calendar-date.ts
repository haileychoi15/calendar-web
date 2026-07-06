import { addMonths, addWeeks, format, subMonths, subWeeks } from "date-fns";
import { ko } from "date-fns/locale";

export function formatMonthTitle(date: Date) {
  return format(date, "yyyy년 M월", { locale: ko });
}

export function goToPreviousWeek(date: Date) {
  return subWeeks(date, 1);
}

export function goToNextWeek(date: Date) {
  return addWeeks(date, 1);
}

export function goToPreviousMonth(date: Date) {
  return subMonths(date, 1);
}

export function goToNextMonth(date: Date) {
  return addMonths(date, 1);
}
