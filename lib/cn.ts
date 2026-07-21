/**
 * Tiny classnames helper — joins truthy class fragments without pulling in a
 * third-party dependency (keeping the bundle lightweight).
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
