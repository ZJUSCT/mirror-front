import { useEffect, useReducer } from 'react';

import {
  mirrorPresentationState,
  parseMirrorStatus,
  stateLabels,
  type MirrorzData,
} from '../../lib/mirrorz';
import { mirrorLinkInfo } from '../../lib/mirror-view';
import { verifiedIcon } from '../../lib/ui-icons';
import { HighlightedText, type MirrorSearchResult } from './SearchHighlight';

interface Props {
  mirrors: MirrorSearchResult[];
  catalog: MirrorzData;
  docsByMirrorId: Record<string, string | null>;
  docsTitles: Record<string, string>;
  locale: 'zh' | 'en';
  friendlyName: boolean;
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

function formatShortLocal(timestampSec: number): string {
  const date = new Date(timestampSec * 1000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatIsoUtc(timestampSec: number): string {
  return new Date(timestampSec * 1000).toISOString().replace(/\.\d+Z$/, 'Z');
}

function upstreamHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function Missing() {
  return <span className="missing">—</span>;
}

function MirrorListRow({
  result,
  catalog,
  docsByMirrorId,
  docsTitles,
  locale,
  friendlyName,
  nowMs,
}: {
  result: MirrorSearchResult;
  catalog: MirrorzData;
  docsByMirrorId: Record<string, string | null>;
  docsTitles: Record<string, string>;
  locale: 'zh' | 'en';
  friendlyName: boolean;
  nowMs: number;
}) {
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
  // The snapshot being served: the old-good one while syncing/pending/failed,
  // otherwise the last successful sync itself.
  const servedAt =
    parsed.servedAt ?? (parsed.main.code === 'S' ? parsed.main.ts : undefined);

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
        {servedAt !== undefined ? (
          <time dateTime={new Date(servedAt * 1000).toISOString()}>
            {formatShortLocal(servedAt)}
          </time>
        ) : (
          <Missing />
        )}
      </td>
      <td>
        <span className={`status status-${state}`}>{stateLabels[state]}</span>
      </td>
      <td className="num">
        {parsed.main.ts !== undefined ? (
          formatRelativeDelta(parsed.main.ts, nowMs)
        ) : (
          <Missing />
        )}
      </td>
      <td>
        {parsed.createdAt !== undefined ? (
          <time dateTime={new Date(parsed.createdAt * 1000).toISOString()}>
            {formatIsoUtc(parsed.createdAt)}
          </time>
        ) : (
          <Missing />
        )}
      </td>
      <td className="mirror-list-upstream">
        {mirror.upstream ? (
          <a href={mirror.upstream}>{upstreamHost(mirror.upstream)}</a>
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

  const columnNames = {
    name: locale === 'zh' ? '名称' : 'Name',
    size: locale === 'zh' ? '大小' : 'Size',
    release: locale === 'zh' ? '发布版本' : 'Release',
    status: locale === 'zh' ? '同步状态' : 'Status',
    sync: locale === 'zh' ? '同步时间' : 'Last sync',
    created: locale === 'zh' ? '创建时间' : 'Created',
    upstream: locale === 'zh' ? '上游' : 'Upstream',
  };

  return (
    <div className="mirror-list-wrap">
      <table className="mirror-list">
        <thead>
          <tr>
            <th scope="col">{columnNames.name}</th>
            <th scope="col" className="num">
              {columnNames.size}
            </th>
            <th scope="col">{columnNames.release}</th>
            <th scope="col">{columnNames.status}</th>
            <th scope="col" className="num">
              {columnNames.sync}
            </th>
            <th scope="col">{columnNames.created}</th>
            <th scope="col">{columnNames.upstream}</th>
          </tr>
        </thead>
        <tbody>
          {mirrors.map((result) => (
            <MirrorListRow
              key={result.mirror.cname}
              result={result}
              catalog={catalog}
              docsByMirrorId={docsByMirrorId}
              docsTitles={docsTitles}
              locale={locale}
              friendlyName={friendlyName}
              nowMs={Date.now()}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
