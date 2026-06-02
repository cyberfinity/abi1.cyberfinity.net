export interface IconCategoryRow {
  id: number;
  name: string;
  description: string;
}

export interface IconRow {
  id: number;
  name: string;
  filename: string;
  category: number;
}

export interface NewEntryRow {
  name: string;
  icon: number | null;
  entry: string;
  email_sha256: string | null;
}

export interface EntryRow extends NewEntryRow {
  id: number;
  date: string;
}
