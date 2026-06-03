import { type GuestbookEntrySubmission } from "../components/GuestbookForm/guestbookEntrySubmissionSchema.js";
import { sql } from "../lib/neon.js";
import type { NewEntryRow } from "../types/guestbook-db-schema.js";
import { calculateEmailHash } from "./gravatar.js";
import { getIconId } from "./icons.js";

export async function toDbGuestbookEntry({
  name,
  iconType,
  builtinIcon,
  gravatarEmail,
  comment,
}: GuestbookEntrySubmission): Promise<NewEntryRow> {
  const iconInfo: Pick<NewEntryRow, "email_sha256" | "icon"> =
    iconType === "builtin"
      ? { icon: await getIconId(builtinIcon), email_sha256: null }
      : { email_sha256: calculateEmailHash(gravatarEmail), icon: null };

  return {
    name,
    entry: comment,
    ...iconInfo,
  };
}

export async function addEntry(
  gbookEntrySubmission: GuestbookEntrySubmission,
): Promise<void> {
  const { name, email_sha256, icon, entry } =
    await toDbGuestbookEntry(gbookEntrySubmission);
  // Insert into DB
  await sql`INSERT INTO entries (date, name, email_sha256, icon, entry) VALUES (NOW(), ${name}, ${email_sha256}, ${icon}, ${entry})`;
}
