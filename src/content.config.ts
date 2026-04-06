import { defineCollection } from "astro:content";
import {
  iconCategoriesCollectionName,
  iconCategoriesLoader,
} from "./content/iconCollections.js";
import { iconsCollectionName, iconsLoader } from "./content/icons.js";

export const collections = {
  [iconCategoriesCollectionName]: defineCollection({
    loader: iconCategoriesLoader(),
  }),
  [iconsCollectionName]: defineCollection({ loader: iconsLoader() }),
};
