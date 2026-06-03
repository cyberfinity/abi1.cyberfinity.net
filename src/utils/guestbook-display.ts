import { gravatarUrl } from "./gravatar.js";
import { sql } from "../lib/neon.js";
import { type EntryRow, type IconRow } from "../types/guestbook-db-schema.js";

export interface GuestbookEntry {
  permalink: string | URL;
  iconFilename?: string;
  iconCustomUrl?: string | URL;
  iconAlt?: string;
  name: string;
  date: Date;
  comment: string;
}

export interface DbGuestbookEntry extends EntryRow {
  icon_filename: IconRow["filename"] | null;
  icon_name: IconRow["name"] | null;
}

export function getGuestbookEntryPath(id: number): string {
  return `/gaestebuch/eintrag${id}`;
}

function toGuestbookEntry(dbEntry: DbGuestbookEntry): GuestbookEntry {
  const { id, name, date, entry, email_sha256, icon_filename, icon_name } =
    dbEntry;

  const iconProps: Pick<
    GuestbookEntry,
    "iconAlt" | "iconCustomUrl" | "iconFilename"
  > = {};
  if (icon_name !== null) {
    iconProps.iconAlt = icon_name;
  }
  if (email_sha256 !== null) {
    iconProps.iconCustomUrl = gravatarUrl(email_sha256, { size: 80 });
    iconProps.iconAlt = `Gravatar von ${name}`;
  }
  if (icon_filename !== null) {
    iconProps.iconFilename = icon_filename;
  }

  return {
    name,
    permalink: getGuestbookEntryPath(id),
    date: new Date(date),
    comment: entry,
    ...iconProps,
  };
}

const guestbookEntriesSelectClause = sql`(
  (
    SELECT
      icons.filename AS icon_filename,
      icons.name AS icon_name,
      entries.id,
      entries.name,
      entries.email_sha256,
      entries.date,
      entries.entry
    FROM entries, icons
    WHERE entries.icon = icons.id
  )
  UNION
  (
    SELECT
      NULL as icon_filename,
      NULL as icon_name,
      entries.id,
      entries.name,
      entries.email_sha256,
      entries.date,
      entries.entry
    FROM entries
    WHERE icon IS NULL
  )
)`;

export async function fetchEntries(
  limit: number,
  offset: number,
): Promise<{
  entries: GuestbookEntry[];
  entriesCount: number;
}> {
  const [dbEntriesCount, dbEntries] = await sql.transaction([
    sql`SELECT COUNT(*) FROM entries`,
    sql`SELECT * FROM ${guestbookEntriesSelectClause} ORDER BY date DESC OFFSET ${offset} LIMIT ${limit}`,
  ]);

  return {
    entries: ((dbEntries ?? []) as DbGuestbookEntry[]).map(toGuestbookEntry),
    entriesCount:
      (dbEntriesCount as { count: number }[] | undefined)?.[0]?.count ?? 0,
  };
}

export async function fetchEntriesForMonth(
  year: number,
  month: number,
): Promise<GuestbookEntry[]> {
  const dbEntries = await sql`SELECT * FROM ${guestbookEntriesSelectClause}
    WHERE EXTRACT(YEAR FROM date) = ${year} AND EXTRACT(MONTH FROM date) = ${month}
    ORDER BY date ASC`;

  return ((dbEntries ?? []) as DbGuestbookEntry[]).map(toGuestbookEntry);
}

export async function fetchEntry(id: number): Promise<{
  prevEntry?: GuestbookEntry;
  entry?: GuestbookEntry;
  nextEntry?: GuestbookEntry;
}> {
  if (Number.isNaN(id)) {
    return {};
  }

  // Select target entry, plus preceding and following ones
  const dbEntries = (await sql`(
      SELECT * FROM ${guestbookEntriesSelectClause} WHERE id <= ${id} ORDER BY id DESC LIMIT 2
    ) UNION (
      SELECT * FROM ${guestbookEntriesSelectClause} WHERE id > ${id} ORDER BY id ASC LIMIT 1
    )`) as DbGuestbookEntry[];

  const result: {
    prevEntry?: GuestbookEntry;
    entry?: GuestbookEntry;
    nextEntry?: GuestbookEntry;
  } = {};

  for (const entryRow of dbEntries) {
    if (entryRow.id < id) {
      result.prevEntry = toGuestbookEntry(entryRow);
      continue;
    }
    if (entryRow.id > id) {
      result.nextEntry = toGuestbookEntry(entryRow);
      continue;
    }
    result.entry = toGuestbookEntry(entryRow);
  }

  return result;
}

interface DbMonthlyCount {
  year: string;

  /**
   * Month number (1 -12)
   */
  month: string;
  count: string;
}

export interface YearCount {
  year: number;
  entriesCount: number;
}

export interface MonthCount {
  year: number;
  /**
   * Month number (1 -12)
   */
  month: number;
  entriesCount: number;
}

export async function getArchiveStats() {
  const [dbMonthCounts, dbFirstEntry] = (await sql.transaction([
    sql`SELECT EXTRACT(YEAR FROM date) as year, EXTRACT(MONTH FROM date) as month, COUNT(*) FROM entries GROUP BY year, month ORDER BY year, month ASC;`,
    sql`SELECT * FROM ${guestbookEntriesSelectClause} ORDER BY date ASC LIMIT 1`,
  ])) as [DbMonthlyCount[], DbGuestbookEntry[]];

  const monthCounts: MonthCount[] = (dbMonthCounts ?? []).map(
    (dbMonthCount) => ({
      year: parseInt(dbMonthCount.year),
      month: parseInt(dbMonthCount.month),
      entriesCount: parseInt(dbMonthCount.count),
    }),
  );

  let yearCounts: YearCount[] | null = null;

  const firstEntry = toGuestbookEntry(dbFirstEntry[0]!);

  return {
    getFirstEntryDate(): Date {
      return firstEntry.date;
    },

    /**
     * Total number of entries in guestbook.
     */
    getTotalEntriesCount(): number {
      return monthCounts.reduce((sum, monthCount) => {
        return monthCount.entriesCount + sum;
      }, 0);
    },

    /**
     * Stats for each year that has guestbook entries.
     */
    getYearCounts(): YearCount[] {
      if (yearCounts === null) {
        yearCounts = monthCounts.reduce((yearCountsAccumulator, monthCount) => {
          // Find existing stats for the same year as this
          // month, if any.
          let currentYearCount = yearCountsAccumulator.find(
            (yearStat) => yearStat.year === monthCount.year,
          );

          if (currentYearCount === undefined) {
            // None existed, so initialise a new one
            currentYearCount = { year: monthCount.year, entriesCount: 0 };
            yearCountsAccumulator.push(currentYearCount);
          }

          currentYearCount.entriesCount += monthCount.entriesCount;

          return yearCountsAccumulator;
        }, [] as YearCount[]);
      }

      return yearCounts;
    },

    getPaddedYearCounts(): YearCount[] {
      const yearCounts = this.getYearCounts();
      const paddedYearCounts: YearCount[] = [];
      const currentYear = new Date().getUTCFullYear();
      let startYear = currentYear;
      if (yearCounts.length > 0) {
        startYear = yearCounts[0]!.year;
      }

      let yearCountsIndex = 0;
      for (let year = startYear; year <= currentYear; year++) {
        if (yearCounts[yearCountsIndex]?.year === year) {
          paddedYearCounts.push(yearCounts[yearCountsIndex]!);
          yearCountsIndex++;
        } else {
          paddedYearCounts.push({
            year,
            entriesCount: 0,
          });
        }
      }
      return paddedYearCounts;
    },

    getYearEntriesCount(year: number): number {
      return (
        this.getYearCounts().find((yearCount) => yearCount.year === year)
          ?.entriesCount ?? 0
      );
    },

    getAllMonthCounts(): MonthCount[] {
      return monthCounts;
    },

    getMonthCounts(yearOrCount: number | YearCount): MonthCount[] {
      const year =
        typeof yearOrCount === "number" ? yearOrCount : yearOrCount.year;

      return monthCounts.filter((monthCount) => monthCount.year === year);
    },

    getPaddedMonthCounts(yearOrCount: number | YearCount): MonthCount[] {
      const year =
        typeof yearOrCount === "number" ? yearOrCount : yearOrCount.year;
      const monthCounts = this.getMonthCounts(yearOrCount);
      const paddedMonthCounts: MonthCount[] = [];

      let monthCountIndex = 0;
      for (let month = 1; month <= 12; month++) {
        if (monthCounts[monthCountIndex]?.month === month) {
          paddedMonthCounts.push(monthCounts[monthCountIndex]!);
          monthCountIndex++;
        } else {
          paddedMonthCounts.push({
            year,
            month,
            entriesCount: 0,
          });
        }
      }

      return paddedMonthCounts;
    },

    getMonthEntriesCount(year: number, month: number): number {
      return (
        monthCounts.find(
          (monthCount) =>
            monthCount.year === year && monthCount.month === month,
        )?.entriesCount ?? 0
      );
    },
  };
}

export function getMonthSlug(month: number | Date): string {
  const monthNumber: number =
    typeof month === "number" ? month : month.getUTCMonth() + 1;
  return String(monthNumber).padStart(2, "0");
}
