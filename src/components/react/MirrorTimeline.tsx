import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { mirrorPresentationState, type MirrorzData } from '../../lib/mirrorz';
import { mirrorLinkInfo } from '../../lib/mirror-view';
import {
  mirrorTimelineEvents,
  packMirrorTimeline,
  timelineHour as hour,
  type TimelineKind,
} from '../../lib/mirror-timeline';
import { HighlightedText, type MirrorSearchResult } from './SearchHighlight';
import {
  chevronLeftIcon,
  chevronRightIcon,
  myLocationIcon,
} from '../../lib/ui-icons';

interface Props {
  mirrors: MirrorSearchResult[];
  catalog: MirrorzData;
  docsByMirrorId: Record<string, string | null>;
  docsTitles: Record<string, string>;
  locale: 'zh' | 'en';
  friendlyName: boolean;
  snapshotAt: string | null;
}
interface TimeWindow {
  start: number;
  end: number;
}
const labels: Record<TimelineKind, [string, string]> = {
  S: ['同步完成', 'Sync completed'],
  D: ['进入等待队列', 'Queued for sync'],
  Y: ['同步中（截至快照）', 'Syncing as of snapshot'],
  F: ['最近失败尝试', 'Last failed attempt'],
  P: ['暂停同步', 'Sync paused'],
  O: ['上次同步成功', 'Previous successful sync'],
  X: ['计划同步', 'Scheduled sync'],
};
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export default function MirrorTimeline({
  mirrors,
  catalog,
  docsByMirrorId,
  docsTitles,
  locale,
  friendlyName,
  snapshotAt,
}: Props) {
  const [mountedAt] = useState(() => Date.now());
  const observedAt =
    snapshotAt && Number.isFinite(Date.parse(snapshotAt))
      ? Date.parse(snapshotAt)
      : mountedAt;
  const [selection, setSelection] = useState<TimeWindow | null>(null);
  const [plotWidth, setPlotWidth] = useState(1000);
  const mapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; view: TimeWindow; width: number } | null>(
    null
  );
  const chartDrag = useRef<{
    x: number;
    y: number;
    pageScroll: number;
    view: TimeWindow;
  } | null>(null);
  const moved = useRef(false);
  const zh = locale === 'zh';
  const lang = zh ? 0 : 1;
  const language = zh ? 'zh-CN' : 'en-US';
  const fullDate = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    [language]
  );
  const preciseDate = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    [language]
  );
  const rows = useMemo(
    () =>
      mirrors
        .map((result) => ({
          result,
          link: mirrorLinkInfo(
            result.mirror,
            catalog,
            docsByMirrorId,
            docsTitles,
            locale
          ),
          state: mirrorPresentationState(result.mirror, catalog.site.disable),
          events: mirrorTimelineEvents(result.mirror, observedAt),
        }))
        .sort(
          (a, b) =>
            Number(b.state === 'syncing') - Number(a.state === 'syncing') ||
            a.link.pathId.localeCompare(b.link.pathId)
        ),
    [mirrors, catalog, docsByMirrorId, docsTitles, locale, observedAt]
  );
  const events = rows.flatMap((row) => row.events);
  const first = events.length
    ? Math.min(...events.map((event) => event.start))
    : observedAt;
  const last = events.length
    ? Math.max(...events.map((event) => event.end))
    : observedAt;
  const padding = Math.max(hour, (last - first) * 0.03);
  const bounds = {
    start: Math.max(
      observedAt - 48 * hour,
      Math.min(first - padding, observedAt - 12 * hour)
    ),
    end: Math.min(
      observedAt + 48 * hour,
      Math.max(last + padding, observedAt + 12 * hour)
    ),
  };
  const fullSpan = bounds.end - bounds.start;
  const fit = (view: TimeWindow): TimeWindow => {
    const length = clamp(view.end - view.start, hour / 4, fullSpan);
    const start = clamp(view.start, bounds.start, bounds.end - length);
    return { start, end: start + length };
  };
  const view = fit(
    selection ?? { start: observedAt - 12 * hour, end: observedAt + 12 * hour }
  );
  const span = view.end - view.start;
  const x = (time: number) => ((time - view.start) / span) * 100;
  const inside = (start: number, end: number) =>
    end >= view.start && start <= view.end;
  const visible = rows.filter((row) =>
    row.events.some((event) => inside(event.start, event.end))
  );
  const entries = rows.flatMap((row) =>
    row.events.map((event) => ({
      ...event,
      id: `${row.result.mirror.cname}-${event.kind}`,
      mirrorId: row.result.mirror.cname,
      label: friendlyName ? row.link.friendlyLabel : row.link.pathId,
    }))
  );
  const packed = packMirrorTimeline(entries, view.start, view.end, plotWidth);
  const trackCount = Math.max(0, ...packed.map((event) => event.track + 1));
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const observer = new ResizeObserver(() =>
      setPlotWidth(Math.max(640, chart.clientWidth - 32))
    );
    observer.observe(chart);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const chart = chartRef.current;
    if (chart)
      chart.scrollLeft = Math.max(0, (plotWidth + 32 - chart.clientWidth) / 2);
  }, [plotWidth]);
  const move = (delta: number) =>
    setSelection(fit({ start: view.start + delta, end: view.end + delta }));
  const zoom = (length: number) => {
    const center = (view.start + view.end) / 2;
    setSelection(fit({ start: center - length / 2, end: center + length / 2 }));
  };
  const latest = useRef({ view, bounds, fit });
  latest.current = { view, bounds, fit };
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const { view, fit } = latest.current;
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? map.clientWidth
            : 1);
      const length =
        (view.end - view.start) * Math.exp(clamp(delta * 0.002, -0.6, 0.6));
      const center = (view.start + view.end) / 2;
      setSelection(
        fit({ start: center - length / 2, end: center + length / 2 })
      );
    };
    map.addEventListener('wheel', onWheel, { passive: false });
    return () => map.removeEventListener('wheel', onWheel);
  }, []);
  const step =
    [0.25, 0.5, 1, 2, 3, 6, 12, 24, 48, 168, 720]
      .map((hours) => hours * hour)
      .find((step) => step >= span / 7) ??
    Math.ceil(span / (7 * 24 * hour)) * 24 * hour;
  const ticks: number[] = [];
  for (
    let time = Math.ceil(view.start / step) * step;
    time <= view.end;
    time += step
  )
    ticks.push(time);
  const snapshotX = x(observedAt);
  const showSnapshot = snapshotX >= 0 && snapshotX <= 100;
  const eventDescription = (kind: TimelineKind, start: number, end: number) =>
    `${labels[kind][lang]} · ${preciseDate.format(start)}${end > start ? ` → ${preciseDate.format(end)}` : ''}`;
  const onMapDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    const center =
      bounds.start + ((event.clientX - rect.left) / rect.width) * fullSpan;
    const next =
      center >= view.start && center <= view.end
        ? view
        : fit({ start: center - span / 2, end: center + span / 2 });
    setSelection(next);
    drag.current = { x: event.clientX, view: next, width: rect.width };
  };

  return (
    <section
      className="mirror-timeline"
      aria-label={zh ? '镜像同步时间轴' : 'Mirror synchronization timeline'}
    >
      <div
        className="timeline-minimap"
        ref={mapRef}
        tabIndex={0}
        role="group"
        aria-label={
          zh
            ? '时间范围概览，左右方向键平移，加减键缩放'
            : 'Time overview: arrow keys to pan, plus and minus to zoom'
        }
        onPointerDown={onMapDown}
        onPointerMove={(event) => {
          if (!drag.current) return;
          const delta =
            ((event.clientX - drag.current.x) / drag.current.width) * fullSpan;
          setSelection(
            fit({
              start: drag.current.view.start + delta,
              end: drag.current.view.end + delta,
            })
          );
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            move((span / 4) * (event.key === 'ArrowLeft' ? -1 : 1));
          } else if (['+', '=', '-'].includes(event.key)) {
            event.preventDefault();
            zoom(span * (event.key === '-' ? 2 : 0.5));
          }
        }}
      >
        {rows.map((row, index) =>
          row.events.map((event) => (
            <span
              key={`${row.result.mirror.cname}-${event.kind}`}
              className={`timeline-mini-event timeline-mark-${event.kind}`}
              style={{
                left: `${((event.start - bounds.start) / fullSpan) * 100}%`,
                width: `${Math.max(0.15, ((event.end - event.start) / fullSpan) * 100)}%`,
                top: `${8 + (index / Math.max(1, rows.length)) * 80}%`,
              }}
            />
          ))
        )}
        <span
          className="timeline-window"
          style={{
            left: `${((view.start - bounds.start) / fullSpan) * 100}%`,
            width: `${(span / fullSpan) * 100}%`,
          }}
        />
      </div>
      <div className="timeline-overview-heading">
        <span>{fullDate.format(bounds.start)}</span>
        <span>
          {zh ? '滚轮缩放 · 拖动平移' : 'Scroll to zoom · drag to pan'}
        </span>
        <span>{fullDate.format(bounds.end)}</span>
      </div>
      <div className="timeline-window-heading">
        <div className="timeline-legend">
          <span>
            <i className="timeline-key-active" />
            {zh ? '同步中' : 'Syncing'}
          </span>
          <span>
            <i className="timeline-key-point" />
            {zh ? '已知状态时间' : 'Recorded status'}
          </span>
          <span>
            <i className="timeline-key-plan" />
            {zh ? '计划时间' : 'Scheduled time'}
          </span>
        </div>
        <div className="timeline-pan">
          <span>
            {zh
              ? `${visible.length} 个镜像 · ${trackCount} 条轨道`
              : `${visible.length} mirrors · ${trackCount} tracks`}
          </span>
          {[
            [-1, chevronLeftIcon],
            [0, myLocationIcon],
            [1, chevronRightIcon],
          ].map(([direction, icon]) => {
            const glyph = icon as typeof chevronLeftIcon;
            const label =
              Number(direction) === 0
                ? zh
                  ? '定位当前'
                  : 'Locate current'
                : Number(direction) < 0
                  ? zh
                    ? '向前平移'
                    : 'Pan earlier'
                  : zh
                    ? '向后平移'
                    : 'Pan later';
            return (
              <button
                key={String(direction)}
                type="button"
                aria-label={label}
                title={label}
                onClick={() =>
                  Number(direction) === 0
                    ? setSelection(
                        fit({
                          start: observedAt - span / 2,
                          end: observedAt + span / 2,
                        })
                      )
                    : move((Number(direction) * span) / 2)
                }
              >
                <svg
                  viewBox={`0 0 ${glyph.width} ${glyph.height}`}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: glyph.body }}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div
        className="timeline-scroll"
        ref={chartRef}
        tabIndex={0}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          moved.current = false;
          chartDrag.current = {
            x: event.clientX,
            y: event.clientY,
            pageScroll: window.scrollY,
            view,
          };
        }}
        onPointerMove={(event) => {
          const gesture = chartDrag.current;
          if (!gesture) return;
          const dx = event.clientX - gesture.x,
            dy = event.clientY - gesture.y;
          if (Math.hypot(dx, dy) <= 3 && !moved.current) return;
          moved.current = true;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          window.scrollTo({
            top: gesture.pageScroll - dy,
            behavior: 'instant',
          });
          const delta =
            (-dx / plotWidth) * (gesture.view.end - gesture.view.start);
          setSelection(
            fit({
              start: gesture.view.start + delta,
              end: gesture.view.end + delta,
            })
          );
        }}
        onPointerUp={() => {
          chartDrag.current = null;
        }}
        onPointerCancel={() => {
          chartDrag.current = null;
        }}
        onLostPointerCapture={() => {
          chartDrag.current = null;
        }}
        aria-label={
          zh
            ? '镜像时间轴，横向拖动平移时间，纵向拖动滚动页面'
            : 'Mirror timeline: drag horizontally to pan time, vertically to scroll the page'
        }
      >
        <div className="timeline-grid" style={{ width: plotWidth + 32 }}>
          <div className="timeline-axis">
            <div className="timeline-plot-inner">
              {ticks.map((tick) => (
                <span
                  className="timeline-tick"
                  key={tick}
                  style={{ left: `${x(tick)}%` }}
                >
                  {fullDate.format(tick)}
                </span>
              ))}
            </div>
          </div>
          <div
            className="timeline-canvas"
            style={{ height: Math.max(6, trackCount) * 32 }}
          >
            {Array.from({ length: Math.max(6, trackCount) }, (_, index) => (
              <div
                className="timeline-track-row"
                key={index}
                style={{ top: index * 32 }}
              />
            ))}
            <div className="timeline-plot-inner">
              {ticks.map((tick) => (
                <span
                  className="timeline-gridline"
                  key={tick}
                  style={{ left: `${x(tick)}%` }}
                />
              ))}
              {showSnapshot ? (
                <span
                  className="timeline-snapshot-line"
                  style={{ left: `${snapshotX}%` }}
                />
              ) : null}
              {packed.map((event) => {
                const row = rows.find(
                  (row) => row.result.mirror.cname === event.mirrorId
                )!;
                const interval = event.end > event.start;
                const description = `${event.label} · ${eventDescription(event.kind, event.start, event.end)}`;
                return (
                  <div
                    role="img"
                    key={event.id}
                    className={`timeline-packed timeline-mark-${event.kind}`}
                    style={{
                      left: event.left,
                      top: event.track * 32 + 4,
                      width: event.width,
                    }}
                    title={description}
                    aria-label={description}
                  >
                    <span
                      className={
                        interval ? 'timeline-interval' : 'timeline-point'
                      }
                      style={{
                        left: event.x - event.left,
                        ...(interval ? { width: event.barWidth } : {}),
                      }}
                    />
                    <span
                      className="timeline-event-name"
                      style={{
                        left: event.labelLeft - event.left,
                        width: event.labelWidth,
                        textAlign: event.labelBefore ? 'right' : 'left',
                      }}
                    >
                      {event.start < view.start ? '‹ ' : ''}
                      <HighlightedText
                        value={event.label}
                        ranges={
                          row.result.searchMatch?.indices[
                            friendlyName ? 'title' : 'path'
                          ]
                        }
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {!visible.length ? (
          <p className="timeline-empty">
            {zh
              ? '此时间范围没有记录，可在概览上滚轮缩小比例。'
              : 'No records in this window. Scroll over the overview to zoom out.'}
          </p>
        ) : null}
      </div>
    </section>
  );
}
