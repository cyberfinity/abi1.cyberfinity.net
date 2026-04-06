import {
  getCollection,
  getEntry,
  type ReferenceDataEntry,
} from "astro:content";
import { iconsCollectionName, type Icon } from "../content/icons";
import type { iconCategoriesCollectionName } from "../content/iconCollections";

export const fallbackIconFilename = "abi1-old.png";

export function getIconUrl(filename: string | undefined): string {
  return `/icons/${filename ?? fallbackIconFilename}`;
}

export interface IconData extends Omit<Icon, "category"> {
  categoryName: string;
  url: string;
}

export async function getIcons(includeReserved = false): Promise<IconData[]> {
  const iconEntries = await getCollection(iconsCollectionName);

  const iconsData: IconData[] = await Promise.all(
    iconEntries.map(async (iconEntry) => {
      const { category, filename, ...restIconData } = iconEntry.data;
      const iconCategoryEntry = await getEntry(
        category as ReferenceDataEntry<
          typeof iconCategoriesCollectionName,
          string
        >,
      );
      return {
        filename,
        ...restIconData,
        url: getIconUrl(filename),
        categoryName: iconCategoryEntry.data.name,
      } satisfies IconData;
    }),
  );

  return iconsData.filter(
    (iconData) => includeReserved || iconData.categoryName !== "Reserved",
  );
}
