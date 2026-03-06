export const fallbackIconFilename = "abi1-old.png";

export function getIconUrl(filename: string | undefined): string {
  return `/icons/${filename ?? fallbackIconFilename}`;
}
