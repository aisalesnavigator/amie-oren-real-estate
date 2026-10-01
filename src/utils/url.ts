import { site } from '../config/site';

/** Absolute URL on the configured canonical domain. */
export const absoluteUrl = (path = '/'): string => new URL(path, `${site.siteUrl}/`).toString();
