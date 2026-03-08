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

export function getGermanMonthName(
  date: Date,
): (typeof germanMonthNames)[number] {
  return germanMonthNames[date.getUTCMonth()]!;
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
  date: Date,
): (typeof germanWeekdays)[number] {
  return germanWeekdays[date.getUTCDay()]!;
}
