import { z } from "astro/zod";
import { reference, type ReferenceDataEntry } from "astro:content";
import { type Loader } from "astro/loaders";
import { sql } from "../lib/neon.js";
import { type IconRow } from "../types/guestbook-db-schema.js";
import { iconCategoriesCollectionName } from "./iconCollections.js";

export const iconsCollectionName = "icons" as const;

export const iconSchema = z.object({
  name: z.string().readonly(),
  filename: z.string().readonly(),
  category: reference(iconCategoriesCollectionName),
});

export type Icon = z.infer<typeof iconSchema>;

function toIcon(dbIconCategory: IconRow): {
  id: string;
  data: Icon;
} {
  const { id, category, ...restData } = dbIconCategory;
  return {
    id: `${id}`,
    data: {
      category: {
        collection: iconCategoriesCollectionName,
        id: String(category),
      },
      ...restData,
    } satisfies Icon,
  };
}

export function iconsLoader(): Loader {
  return {
    name: "abi1-gbook-icons-loader",
    load: async ({ store, parseData }) => {
      store.clear();
      const dbIcons = (await sql`SELECT * from "icons"`) as IconRow[];

      for (const dbIcon of dbIcons) {
        const { id, data } = toIcon(dbIcon);
        const parsedData = await parseData({ id, data });
        store.set({ id, data: parsedData });
      }
    },
    schema: iconSchema,
  } satisfies Loader;
}
