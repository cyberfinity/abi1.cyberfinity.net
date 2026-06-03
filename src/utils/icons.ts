import {
  getCollection,
  getEntry,
  type ReferenceDataEntry,
} from "astro:content";
import { iconsCollectionName, type Icon } from "../content/icons";
import type { iconCategoriesCollectionName } from "../content/iconCollections";

export const fallbackIconFilename = "abi1-old.png";
export const fallbackIconId = 7;

export function getIconUrl(filename: string | undefined): string {
  return `/icons/${filename ?? fallbackIconFilename}`;
}

export interface IconData extends Omit<Icon, "category"> {
  id: number;
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
        id: parseInt(iconEntry.id),
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

export async function getIconsByCategory(includeReserved = false): { [category: string]: IconData[] } {
  return (await getIcons())
  .sort((a, b) => {
    if (a.categoryName !== b.categoryName) {
      return a.categoryName.localeCompare(b.categoryName);
    }
    return a.name.localeCompare(b.name);
  })
  .reduce(
    (iconsByCategoryAccumulator, iconData) => {
      const categoryIcons =
        iconsByCategoryAccumulator[iconData.categoryName] ?? [];
      categoryIcons.push(iconData);
      iconsByCategoryAccumulator[iconData.categoryName] = categoryIcons;
      return iconsByCategoryAccumulator;
    },
    {} as { [category: string]: IconData[] },
  );
}

export async function getIconId(filename: string): Promise<number> {
  const allIcons = await getIcons(true);
  return (
    allIcons.find((iconData) => iconData.filename === filename)?.id ??
    fallbackIconId
  );
}
