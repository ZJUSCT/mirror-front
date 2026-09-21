import type { ReactNode } from 'react';

import type { MirrorzMirror } from '../../lib/mirrorz';

export type SearchField = 'title' | 'cname' | 'path' | 'desc';

export interface SearchMatch {
  score: number;
  indices: Partial<Record<SearchField, [number, number][]>>;
}

export interface MirrorSearchResult {
  mirror: MirrorzMirror;
  searchMatch?: SearchMatch;
}

export function HighlightedText({
  value,
  ranges,
}: {
  value: string;
  ranges?: [number, number][];
}) {
  if (!ranges?.length) return <>{value}</>;
  const mergedRanges = ranges
    .toSorted(([leftStart], [rightStart]) => leftStart - rightStart)
    .reduce<[number, number][]>((merged, [start, end]) => {
      const previous = merged.at(-1);
      if (previous && start <= previous[1] + 1) {
        previous[1] = Math.max(previous[1], end);
      } else {
        merged.push([start, end]);
      }
      return merged;
    }, []);

  const segments: ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of mergedRanges) {
    if (start > cursor) segments.push(value.slice(cursor, start));
    segments.push(
      <mark className="mirror-search-match" key={`${start}-${end}`}>
        {value.slice(start, end + 1)}
      </mark>
    );
    cursor = end + 1;
  }
  if (cursor < value.length) segments.push(value.slice(cursor));
  return segments;
}
