// @ts-check
import { defineConfig } from "astro/config";

import netlify from "@astrojs/netlify";

const netlifyConfig = process.env.NETLIFY === 'true' ? {
  adapter: netlify(),
} : {};

console.log(`Using Netlify adaptor? ${process.env.NETLIFY}`);

// https://astro.build/config
export default defineConfig({
  ...netlifyConfig,
});
