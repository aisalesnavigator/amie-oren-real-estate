import { communities } from '../data/communities';
import { lakes } from '../data/lakes';
import type { PhotoMoment } from '../data/placeImages';

const momentLabel: Record<PhotoMoment, string> = { sunrise: 'Sunrise', sunset: 'Sunset', other: '' };

/** Display name for a community or lake slug ("silver-lake" -> "Silver Lake"). */
export function placeName(slug: string): string | undefined {
  return lakes.find((l) => l.slug === slug)?.name ?? communities.find((c) => c.slug === slug)?.name;
}

/** The visible caption: an explicit override, otherwise "<place> <Moment>" (e.g. "Silver Lake Sunrise"). */
export function photoCaption(input: { place: string; moment: PhotoMoment; caption?: string }): string {
  return input.caption?.trim() || [input.place, momentLabel[input.moment]].filter(Boolean).join(' ');
}

/** The quiet credit line shown beneath a caption. */
export const creditLine = (credit: string) => `Photo: ${credit}`;
