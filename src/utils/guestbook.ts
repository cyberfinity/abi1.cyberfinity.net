import { gravatarUrl } from "./gravatar.js";
import { sql } from "../lib/neon.js";
import { type EntryRow, type IconRow } from "../types/guestbook-db-schema.js";

export interface GuestbookEntry {
  permalink?: string | URL;
  iconFilename?: string;
  iconCustomUrl?: string | URL;
  iconAlt?: string;
  name: string;
  date: Date;
  comment: string;
}

export interface DbGuestbookEntry extends EntryRow {
  icon_filename: IconRow["filename"];
  icon_name: IconRow["name"];
}

function toGuestbookEntry(dbEntry: DbGuestbookEntry): GuestbookEntry {
  const { /*id,*/ name, date, entry, email_sha256, icon_filename, icon_name } =
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
  }
  if (icon_filename !== null) {
    iconProps.iconFilename = icon_filename;
  }

  return {
    name,
    date: new Date(date),
    comment: entry,
    ...iconProps,
  };
}

export async function fetchEntries(
  limit: number,
  offset: number,
): Promise<{
  entries: GuestbookEntry[];
  entriesCount: number;
}> {
  const [dbEntriesCount, dbEntries] = await sql.transaction([
    sql`SELECT COUNT(*) FROM entries`,
    sql`SELECT icons.filename AS icon_filename, icons.name AS icon_name, entries.name, entries.email_sha256, entries.date, entries.entry FROM entries, icons WHERE entries.icon = icons.id ORDER BY entries.date DESC OFFSET ${offset} LIMIT ${limit}`,
  ]);

  return {
    entries: ((dbEntries ?? []) as DbGuestbookEntry[]).map(toGuestbookEntry),
    entriesCount:
      (dbEntriesCount as { count: number }[] | undefined)?.[0]?.count ?? 0,
  };
}
