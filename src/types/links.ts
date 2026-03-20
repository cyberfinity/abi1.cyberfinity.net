/**
 *  Text and optional href for simple links.
 */
export interface OptionalLink {
  text: string | number;
  href?: URL | string | undefined;
}

/**
 *  Text and required href for simple links.
 */
export interface RequiredLink extends OptionalLink {
  href: URL | string;
}
