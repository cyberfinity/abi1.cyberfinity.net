import { clamp } from "./math.js";

const germanMonthNames = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
] as const;

/**
 *
 * @param dateOrMonth A Data object, whose montn will be used. Or a month number (1-12)
 * @returns
 */
export function getGermanMonthName(
  dateOrMonth: Date | number,
): (typeof germanMonthNames)[number] {
  return germanMonthNames[
    typeof dateOrMonth === "number"
      ? clamp(dateOrMonth, 1, 12) - 1
      : dateOrMonth.getUTCMonth()
  ]!;
}

const germanWeekdays = [
  "Sonntag", // Date getUTCDay() 0 = Sunday
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
] as const;

export function getGermanWeekdayName(
  dateOrWeekday: Date | number,
): (typeof germanWeekdays)[number] {
  return germanWeekdays[
    typeof dateOrWeekday === "number"
      ? clamp(dateOrWeekday, 0, 7)
      : dateOrWeekday.getUTCDay()
  ]!;
}

export function formatDate(date: Date): string {
  return `${getGermanWeekdayName(date)}, ${date.getUTCDate()}. ${getGermanMonthName(date)} ${date.getUTCFullYear()} ${date.toUTCString().substring(17, 25)}`;
}
