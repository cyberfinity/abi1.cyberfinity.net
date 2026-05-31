import { hash } from "node:crypto";

export function calculateEmailHash(email: string): string {
  return hash("sha256", email.trim().toLowerCase());
}

export function gravatarUrl(
  emailHash: string,
  options: {
    size?: number;
    defaultImage?: string | URL;
  } = {},
): URL {
  const url = new URL(`https://gravatar.com/avatar/${emailHash}`);

  if (typeof options.size === "number" && options.size > 0) {
    url.searchParams.set("s", String(options.size));
  }

  if (
    options.defaultImage !== undefined &&
    URL.canParse(options.defaultImage)
  ) {
    const defaultImageUrl: URL =
      options.defaultImage instanceof URL
        ? options.defaultImage
        : new URL(options.defaultImage);
    url.searchParams.set("d", defaultImageUrl.toString());
  }

  return url;
}
