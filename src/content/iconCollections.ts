import { z } from "astro/zod";
import { type Loader } from "astro/loaders";
import { sql } from "../lib/neon.js";
import { type IconCategoryRow } from "../types/guestbook-db-schema.js";

export const iconCategoriesCollectionName = "iconCategories" as const;

export const iconCategorySchema = z.object({
  name: z.string().readonly(),
  description: z.string().readonly(),
});

export type IconCategory = z.infer<typeof iconCategorySchema>;

function toIconCategory(dbIconCategory: IconCategoryRow): {
  id: string;
  data: IconCategory;
} {
  const { id, ...data } = dbIconCategory;
  return {
    id: `${id}`,
    data,
  };
}

export function iconCategoriesLoader(): Loader {
  return {
    name: "abi1-gbook-icon-categories-loader",
    load: async ({ store, parseData }) => {
      store.clear();
      const dbIconCategories =
        (await sql`SELECT * from "icon-categories"`) as IconCategoryRow[];

      for (const dbIconCategory of dbIconCategories) {
        const { id, data } = toIconCategory(dbIconCategory);
        const parsedData = await parseData({ id, data });
        store.set({ id, data: parsedData });
      }
    },
    schema: iconCategorySchema,
  } satisfies Loader;
}
