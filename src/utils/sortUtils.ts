import { Poster } from '../types';

export type SortMode = 'z-to-a' | 'a-to-z' | 'year-desc' | 'rating-desc' | 'numeric';

/**
 * Natural numerical string comparator (A to Z, 1 to 10).
 */
export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Natural numerical string comparator descending (Z to A, 10 to 1).
 */
export function naturalCompareDesc(a: string, b: string): number {
  return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Compare two posters naturally in Z - A (descending) order.
 * Considers originalFileName first (from Google Drive), then title.
 * Puts the latest/updated photos at the very top!
 */
export function comparePostersZToA(a: Poster, b: Poster): number {
  // Compare by original filename if available (Z - A, newest/highest file first)
  if (a.originalFileName && b.originalFileName) {
    const cmp = naturalCompareDesc(a.originalFileName, b.originalFileName);
    if (cmp !== 0) return cmp;
  } else if (a.originalFileName && !b.originalFileName) {
    const cmp = naturalCompareDesc(a.originalFileName, b.title);
    if (cmp !== 0) return cmp;
  } else if (!a.originalFileName && b.originalFileName) {
    const cmp = naturalCompareDesc(a.title, b.originalFileName);
    if (cmp !== 0) return cmp;
  }

  // Fallback to title comparison with natural numeric Z - A sorting
  const titleCmp = naturalCompareDesc(a.title || '', b.title || '');
  if (titleCmp !== 0) return titleCmp;

  return new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime();
}

/**
 * Compare two posters naturally in A - Z (ascending) order.
 */
export function comparePostersAToZ(a: Poster, b: Poster): number {
  if (a.originalFileName && b.originalFileName) {
    const cmp = naturalCompare(a.originalFileName, b.originalFileName);
    if (cmp !== 0) return cmp;
  } else if (a.originalFileName && !b.originalFileName) {
    const cmp = naturalCompare(a.originalFileName, b.title);
    if (cmp !== 0) return cmp;
  } else if (!a.originalFileName && b.originalFileName) {
    const cmp = naturalCompare(a.title, b.originalFileName);
    if (cmp !== 0) return cmp;
  }

  return naturalCompare(a.title || '', b.title || '');
}

/**
 * Backward-compatible alias (defaults to Z - A descending)
 */
export const comparePostersNumerically = comparePostersZToA;

/**
 * Sort an array of posters according to the chosen sortMode.
 * Defaults to 'z-to-a' (Newest / Updated photos at the top).
 */
export function sortPosters(posters: Poster[], sortMode: SortMode = 'z-to-a'): Poster[] {
  const list = [...posters];

  switch (sortMode) {
    case 'z-to-a':
    case 'numeric':
      return list.sort(comparePostersZToA);

    case 'a-to-z':
      return list.sort(comparePostersAToZ);

    case 'year-desc':
      return list.sort((a, b) => {
        const yearB = b.year || 0;
        const yearA = a.year || 0;
        if (yearB !== yearA) return yearB - yearA;
        return comparePostersZToA(a, b);
      });

    case 'rating-desc':
      return list.sort((a, b) => {
        const ratingB = b.rating || 0;
        const ratingA = a.rating || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return comparePostersZToA(a, b);
      });

    default:
      return list.sort(comparePostersZToA);
  }
}
