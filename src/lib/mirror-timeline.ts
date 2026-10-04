import { parseMirrorStatus, type MirrorzMirror } from './mirrorz';

export const timelineHour = 3600_000;
export type TimelineKind = 'S' | 'D' | 'Y' | 'F' | 'P' | 'O' | 'X';
export interface MirrorTimelineEvent {
  kind: TimelineKind;
  start: number;
  end: number;
}

export interface TimelineEntry extends MirrorTimelineEvent {
  id: string;
  mirrorId: string;
  label: string;
}

/** Reserve both the time geometry and its label when reusing a free track. */
export function packMirrorTimeline(
  events: TimelineEntry[],
  start: number,
  end: number,
  width: number
) {
  const trackEnds: number[] = [];
  return (
    events
      .filter((event) => event.end >= start && event.start <= end)
      .map((event) => {
        const x = Math.max(0, ((event.start - start) / (end - start)) * width);
        const right = Math.min(
          width,
          ((event.end - start) / (end - start)) * width
        );
        const barWidth = event.end > event.start ? Math.max(3, right - x) : 0;
        const labelWidth = Math.min(
          width - 24,
          16 +
            Array.from(event.label).reduce(
              (sum, char) => sum + (char.charCodeAt(0) > 255 ? 13 : 8),
              0
            )
        );
        const labelBefore = x + 10 + labelWidth > width;
        const labelLeft = labelBefore ? x - 10 - labelWidth : x + 10;
        const left = Math.max(0, Math.min(x - 7, labelLeft));
        const edge = Math.min(
          width,
          Math.max(right + 7, labelLeft + labelWidth)
        );
        return {
          ...event,
          x,
          barWidth,
          labelLeft,
          labelBefore,
          labelWidth,
          left,
          width: edge - left,
        };
      })
      // Left-facing labels can begin before an earlier event's marker.
      .sort((a, b) => a.left - b.left || a.id.localeCompare(b.id))
      .map((event) => {
        let track = trackEnds.findIndex((last) => last + 8 <= event.left);
        if (track < 0) track = trackEnds.length;
        trackEnds[track] = event.left + event.width;
        return { ...event, track };
      })
  );
}

/** Only an in-progress sync has an observed interval. Other records are points. */
export function mirrorTimelineEvents(
  mirror: MirrorzMirror,
  snapshotAt: number
): MirrorTimelineEvent[] {
  const status = parseMirrorStatus(mirror.status);
  const events: MirrorTimelineEvent[] = [];
  const add = (kind: TimelineKind, seconds?: number) => {
    if (seconds === undefined || seconds <= 0) return;
    const start = seconds * 1000;
    if (!Number.isFinite(new Date(start).getTime())) return;
    if (start > snapshotAt + 48 * timelineHour) return;
    if (kind !== 'Y' && start < snapshotAt - 48 * timelineHour) return;
    if (kind === 'Y' && start > snapshotAt) return;
    events.push({
      kind,
      start,
      end: kind === 'Y' ? Math.max(start, snapshotAt) : start,
    });
  };
  if (['S', 'D', 'Y', 'F', 'P'].includes(status.main.code))
    add(status.main.code as TimelineKind, status.main.ts);
  if (!(status.main.code === 'S' && status.main.ts === status.servedAt))
    add('O', status.servedAt);
  add('X', status.nextSyncAt);
  return events;
}
