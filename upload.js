import { readFile } from "node:fs/promises";
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL);

async function readJson(filename) {
  const contents = await readFile(filename);
  return JSON.parse(contents);
}

async function updateIconCategories() {
  const originalEntries = await readJson("./src/data/icon-categories.json");
  const existingDbRows = await sql`SELECT name FROM "icon-categories";`;

  // Find all original entries not yet in DB
  const entriesToInsert = originalEntries.filter(
    (originalEntry) =>
      // check that DB does not contain this entry
      !existingDbRows.some((row) => row.name === originalEntry.name),
  );

  if (entriesToInsert.length > 0) {
    const result = await sql.transaction(
      entriesToInsert.map(
        (entry) => sql`INSERT INTO "icon-categories" (id, name, description)
      OVERRIDING SYSTEM VALUE
      VALUES (${entry.id}, ${entry.name}, ${entry.description});`,
      ),
    );
    console.log("Added missing original entries to icon-categories table.");
  } else {
    console.log("icon-categories table already contains all original entries.");
  }
}

async function updateIcons() {
  const originalEntries = await readJson("./src/data/icons.json");
  const existingDbRows = await sql`SELECT name FROM "icons";`;

  // Find all original entries not yet in DB
  const entriesToInsert = originalEntries.filter(
    (originalEntry) =>
      // check that DB does not contain this entry
      !existingDbRows.some((row) => row.name === originalEntry.name),
  );

  if (entriesToInsert.length > 0) {
    const result = await sql.transaction(
      entriesToInsert.map(
        (entry) => sql`INSERT INTO "icons" (id, name, filename, category)
      OVERRIDING SYSTEM VALUE
      VALUES (${entry.id}, ${entry.name}, ${entry.fileName}, ${entry.category});`,
      ),
    );
    console.log("Added missing original entries to icons table.");
  } else {
    console.log("icons table already contains all original entries.");
  }
}

async function updateEntries() {
  const originalEntries = await readJson("./src/data/entries.json");
  const existingDbRows = await sql`SELECT name, date FROM "entries";`;

  // Find all original entries not yet in DB
  const entriesToInsert = originalEntries.filter(
    (originalEntry) =>
      // check that DB does not contain this entry
      !existingDbRows.some(
        (row) =>
          row.name === originalEntry.name && row.date === originalEntry.date,
      ),
  );

  if (entriesToInsert.length > 0) {
    const result = await sql.transaction(
      entriesToInsert.map(
        (
          entry,
        ) => sql`INSERT INTO "entries" (id, date, name, "email-sha256", entry, icon)
      OVERRIDING SYSTEM VALUE
      VALUES (${entry.id},${entry.date}, ${entry.name}, ${entry.emailSha256 ?? null}, ${entry.entry}, ${entry.icon ?? null});`,
      ),
    );
    console.log("Added missing original entries to entries table.");
  } else {
    console.log("entries table already contains all original entries.");
  }
}

await updateIconCategories();
await updateIcons();
await updateEntries();
