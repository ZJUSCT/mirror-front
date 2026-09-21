import { useEffect, useMemo, useReducer, useState } from 'react';

import {
  mirrorPresentationState,
  parseMirrorStatus,
  stateLabels,
  type MirrorPresentationState,
  type MirrorzData,
} from '../../lib/mirrorz';
import { mirrorLinkInfo, type MirrorLinkInfo } from '../../lib/mirror-view';
import {
  arrowDownwardIcon,
  arrowUpwardIcon,
  unfoldMoreIcon,
  verifiedIcon,
} from '../../lib/ui-icons';
import { HighlightedText, type MirrorSearchResult } from './SearchHighlight';

interface Props {
  mirrors: MirrorSearchResult[];
  catalog: MirrorzData;
  docsByMirrorId: Record<string, string | null>;
  docsTitles: Record<string, string>;
  locale: 'zh' | 'en';
  friendlyName: boolean;
}

type SortKey =
  | 'name'
  | 'size'
  | 'release'
  | 'status'
  | 'sync'
  | 'created'
  | 'upstream';

interface SortState {
  key: SortKey;
  dir: 'asc' | 'desc';
}

/** Relative time as +/-dd.hh:mm:ss; past timestamps get the '-' sign. */
function formatRelativeDelta(timestampSec: number, nowMs: number): string {
  let deltaSec = Math.round((timestampSec * 1000 - nowMs) / 1000);
  const sign = deltaSec < 0 ? '-' : '+';
  deltaSec = Math.abs(deltaSec);
  const pad = (value: number) => String(value).padStart(2, '0');
  const days = Math.floor(deltaSec / 86400);
  const hours = Math.floor((deltaSec % 86400) / 3600);
  const minutes = Math.floor((deltaSec % 3600) / 60);
  const seconds = deltaSec % 60;
  return `${sign}${pad(days)}.${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** Local-time ISO 8601, with the local UTC offset in place of the Z suffix. */
function formatIsoLocal(timestampSec: number): string {
  const date = new Date(timestampSec * 1000);
  const pad = (value: number) => String(value).padStart(2, '0');
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes < 0 ? '-' : '+';
  const absOffset = Math.abs(offsetMinutes);
  const offset = `${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${offset}`;
}

const binarySizeUnits: Record<string, number> = {
  b: 1,
  k: 1024,
  kb: 1024,
  kib: 1024,
  m: 1024 ** 2,
  mb: 1024 ** 2,
  mib: 1024 ** 2,
  g: 1024 ** 3,
  gb: 1024 ** 3,
  gib: 1024 ** 3,
  t: 1024 ** 4,
  tb: 1024 ** 4,
  tib: 1024 ** 4,
  p: 1024 ** 5,
  pb: 1024 ** 5,
  pib: 1024 ** 5,
};

/** Best-effort byte count of a human size such as "48.00 GiB" or "596G". */
function parseSizeBytes(size: string): number | null {
  const match = size.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]*)$/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  const scale = binarySizeUnits[match[2].toLowerCase()];
  return scale ? value * scale : value;
}

interface RowItem {
  result: MirrorSearchResult;
  name: string;
  link: MirrorLinkInfo;
  state: MirrorPresentationState;
  stateLabel: string;
  sizeBytes: number | null;
  servedAt?: number;
  syncedAt?: number;
  createdAt?: number;
  upstream: string | null;
}

function compareRows(
  left: RowItem,
  right: RowItem,
  key: SortKey,
  direction: 1 | -1
): number {
  switch (key) {
    case 'name':
      return (
        direction *
        left.name.localeCompare(right.name, undefined, {
          sensitivity: 'base',
        })
      );
    case 'status':
      return (
        direction *
        left.stateLabel.localeCompare(right.stateLabel, undefined, {
          sensitivity: 'base',
        })
      );
    case 'upstream': {
      // Missing values sink to the bottom regardless of direction.
      if (!left.upstream && !right.upstream) return 0;
      if (!left.upstream) return 1;
      if (!right.upstream) return -1;
      return (
        direction *
        left.upstream.localeCompare(right.upstream, undefined, {
          sensitivity: 'base',
        })
      );
    }
    default: {
      const numberOf = (row: RowItem): number | null => {
        if (key === 'size') return row.sizeBytes;
        if (key === 'release') return row.servedAt ?? null;
        if (key === 'sync') return row.syncedAt ?? null;
        return row.createdAt ?? null;
      };
      const leftValue = numberOf(left);
      const rightValue = numberOf(right);
      // Missing values sink to the bottom regardless of direction.
      if (leftValue === null && rightValue === null) return 0;
      if (leftValue === null) return 1;
      if (rightValue === null) return -1;
      return direction * (leftValue - rightValue);
    }
  }
}

function Missing() {
  return <span className="missing">—</span>;
}

function TimeCell({
  timestampSec,
  iso,
  nowMs,
  hint,
  onToggle,
}: {
  timestampSec?: number;
  iso: boolean;
  nowMs: number;
  hint: string;
  onToggle: () => void;
}) {
  if (timestampSec === undefined) return <Missing />;
  return (
    <button
      type="button"
      className="mirror-list-time"
      title={hint}
      onClick={onToggle}
    >
      <time dateTime={new Date(timestampSec * 1000).toISOString()}>
        {iso
          ? formatIsoLocal(timestampSec)
          : formatRelativeDelta(timestampSec, nowMs)}
      </time>
    </button>
  );
}

function MirrorListRow({
  row,
  locale,
  friendlyName,
  nowMs,
  isoTimes,
  timeHint,
  onToggleTimeFormat,
}: {
  row: RowItem;
  locale: 'zh' | 'en';
  friendlyName: boolean;
  nowMs: number;
  isoTimes: boolean;
  timeHint: string;
  onToggleTimeFormat: () => void;
}) {
  const { result, link } = row;
  const mirror = result.mirror;
  return (
    <tr>
      <td className="mirror-list-name">
        <a
          href={link.destination ?? undefined}
          aria-label={
            result.searchMatch
              ? friendlyName
                ? link.friendlyLabel
                : link.pathId
              : undefined
          }
        >
          <HighlightedText
            value={friendlyName ? link.friendlyLabel : link.pathId}
            ranges={
              result.searchMatch?.indices[friendlyName ? 'title' : 'path']
            }
          />
        </a>
        {link.certified ? (
          <svg
            className="verified-icon mirror-list-verified"
            viewBox={`0 0 ${verifiedIcon.width} ${verifiedIcon.height}`}
            role="img"
            aria-label={
              locale === 'zh'
                ? `已加入 ${link.pathId} 官方镜像列表`
                : `Added to the ${link.pathId} official mirror list`
            }
          >
            <g dangerouslySetInnerHTML={{ __html: verifiedIcon.body }} />
          </svg>
        ) : null}
      </td>
      <td className="num">{mirror.size ? mirror.size : <Missing />}</td>
      <td>
        <TimeCell
          timestampSec={row.servedAt}
          iso={isoTimes}
          nowMs={nowMs}
          hint={timeHint}
          onToggle={onToggleTimeFormat}
        />
      </td>
      <td>
        <span className={`status status-${row.state}`}>{row.stateLabel}</span>
      </td>
      <td className="num">
        <TimeCell
          timestampSec={row.syncedAt}
          iso={isoTimes}
          nowMs={nowMs}
          hint={timeHint}
          onToggle={onToggleTimeFormat}
        />
      </td>
      <td>
        <TimeCell
          timestampSec={row.createdAt}
          iso={isoTimes}
          nowMs={nowMs}
          hint={timeHint}
          onToggle={onToggleTimeFormat}
        />
      </td>
      <td className="mirror-list-upstream">
        {mirror.upstream ? (
          <a href={mirror.upstream}>{mirror.upstream}</a>
        ) : (
          <Missing />
        )}
      </td>
    </tr>
  );
}

export default function MirrorList({
  mirrors,
  catalog,
  docsByMirrorId,
  docsTitles,
  locale,
  friendlyName,
}: Props) {
  // Relative timestamps age while the table stays mounted.
  const [, tick] = useReducer((count: number) => count + 1, 0);
  useEffect(() => {
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const [sort, setSort] = useState<SortState | null>(null);
  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current?.key === key
        ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const [isoTimes, setIsoTimes] = useState(false);
  const toggleTimeFormat = () => setIsoTimes((current) => !current);
  const timeHint =
    locale === 'zh' ? '点击切换时间格式' : 'Click to switch time format';

  const columns: Array<{ key: SortKey; label: string; num?: boolean }> = [
    { key: 'name', label: locale === 'zh' ? '名称' : 'Name' },
    { key: 'size', label: locale === 'zh' ? '大小' : 'Size', num: true },
    { key: 'release', label: locale === 'zh' ? '发布版本' : 'Release' },
    { key: 'status', label: locale === 'zh' ? '同步状态' : 'Status' },
    {
      key: 'sync',
      label: locale === 'zh' ? '同步时间' : 'Last sync',
      num: true,
    },
    { key: 'created', label: locale === 'zh' ? '创建时间' : 'Created' },
    { key: 'upstream', label: locale === 'zh' ? '上游' : 'Upstream' },
  ];

  const rows = useMemo(() => {
    const items: RowItem[] = mirrors.map((result) => {
      const mirror = result.mirror;
      const link = mirrorLinkInfo(
        mirror,
        catalog,
        docsByMirrorId,
        docsTitles,
        locale
      );
      const state = mirrorPresentationState(mirror, catalog.site.disable);
      const parsed = parseMirrorStatus(mirror.status);
      return {
        result,
        name: friendlyName ? link.friendlyLabel : link.pathId,
        link,
        state,
        stateLabel: stateLabels[state],
        sizeBytes: mirror.size ? parseSizeBytes(mirror.size) : null,
        // The snapshot being served: the old-good one while
        // syncing/pending/failed, otherwise the last successful sync itself.
        servedAt:
          parsed.servedAt ??
          (parsed.main.code === 'S' ? parsed.main.ts : undefined),
        syncedAt: parsed.main.ts,
        createdAt: parsed.createdAt,
        upstream: mirror.upstream ?? null,
      };
    });
    if (sort) {
      items.sort((left, right) =>
        compareRows(left, right, sort.key, sort.dir === 'asc' ? 1 : -1)
      );
    }
    return items;
  }, [
    catalog,
    docsByMirrorId,
    docsTitles,
    friendlyName,
    locale,
    mirrors,
    sort,
  ]);

  return (
    <div className="mirror-list-wrap">
      <table className="mirror-list">
        <thead>
          <tr>
            {columns.map((column) => {
              const active = sort?.key === column.key;
              const icon = active
                ? sort.dir === 'asc'
                  ? arrowUpwardIcon
                  : arrowDownwardIcon
                : unfoldMoreIcon;
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={column.num ? 'num' : undefined}
                  aria-sort={
                    active
                      ? sort.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <button
                    type="button"
                    className="mirror-list-sort"
                    onClick={() => toggleSort(column.key)}
                  >
                    {column.label}
                    <svg
                      viewBox={`0 0 ${icon.width} ${icon.height}`}
                      aria-hidden="true"
                    >
                      <g dangerouslySetInnerHTML={{ __html: icon.body }} />
                    </svg>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <MirrorListRow
              key={row.result.mirror.cname}
              row={row}
              locale={locale}
              friendlyName={friendlyName}
              nowMs={Date.now()}
              isoTimes={isoTimes}
              timeHint={timeHint}
              onToggleTimeFormat={toggleTimeFormat}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
