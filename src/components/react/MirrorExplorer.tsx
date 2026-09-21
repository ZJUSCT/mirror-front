import Fuse from 'fuse.js';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  mirrorPresentationState,
  mirrorzDataSchema,
  stateLabels,
  type MirrorzData,
  type MirrorzMirror,
} from '../../lib/mirrorz';
import {
  localDocsId,
  mirrorLinkInfo,
  mirrorPathId,
} from '../../lib/mirror-view';
import {
  formatListBulletedIcon,
  gridViewIcon,
  verifiedIcon,
} from '../../lib/ui-icons';
import MirrorList from './MirrorList';
import {
  HighlightedText,
  type MirrorSearchResult,
  type SearchField,
  type SearchMatch,
} from './SearchHighlight';

interface Props {
  locale: 'zh' | 'en';
  docsByMirrorId: Record<string, string | null>;
  docsTitles: Record<string, string>;
}

const cacheDataKey = 'zju-mirror:mirrorz:v1';
const cacheSavedAtKey = 'zju-mirror:mirrorz:v1:saved-at';
const cacheMaxAgeMs = 6 * 60 * 60 * 1000;
const viewModeKey = 'zju-mirror:view';

interface CachedMirrorzData {
  data: MirrorzData;
  savedAt: string;
}

function readCache(): CachedMirrorzData | null {
  try {
    const raw = window.localStorage.getItem(cacheDataKey);
    const savedAt = window.localStorage.getItem(cacheSavedAtKey);
    if (!raw || !savedAt) return null;

    const age = Date.now() - Date.parse(savedAt);
    if (!Number.isFinite(age) || age < 0 || age > cacheMaxAgeMs) {
      window.localStorage.removeItem(cacheDataKey);
      window.localStorage.removeItem(cacheSavedAtKey);
      return null;
    }
    return { data: mirrorzDataSchema.parse(JSON.parse(raw)), savedAt };
  } catch {
    return null;
  }
}

function formatTimestamp(value: string, locale: 'zh' | 'en'): string {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

async function fetchWithTimeout(
  url: string,
  timeoutMs = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

function MirrorCard({
  mirror,
  catalog,
  docsByMirrorId,
  docsTitles,
  locale,
  friendlyName,
  searchMatch,
}: {
  mirror: MirrorzMirror;
  catalog: MirrorzData;
  docsByMirrorId: Record<string, string | null>;
  docsTitles: Record<string, string>;
  locale: 'zh' | 'en';
  friendlyName: boolean;
  searchMatch?: SearchMatch;
}) {
  const state = mirrorPresentationState(mirror, catalog.site.disable);
  const link = mirrorLinkInfo(
    mirror,
    catalog,
    docsByMirrorId,
    docsTitles,
    locale
  );
  const { pathId, friendlyLabel, destination, certified } = link;

  return (
    <a className="mirror-card" href={destination ?? undefined}>
      <div>
        <h3
          aria-label={
            searchMatch ? (friendlyName ? friendlyLabel : pathId) : undefined
          }
        >
          {/* The h3 is a flex row for the verified icon, so the title must sit
              in one inline box; as direct children, highlighted fragments
              would each become a flex item and scatter across lines. */}
          <span>
            <HighlightedText
              value={friendlyName ? friendlyLabel : pathId}
              ranges={searchMatch?.indices[friendlyName ? 'title' : 'path']}
            />
          </span>
          {certified ? (
            <svg
              className="verified-icon"
              viewBox={`0 0 ${verifiedIcon.width} ${verifiedIcon.height}`}
              role="img"
              aria-label={
                locale === 'zh'
                  ? `已加入 ${pathId} 官方镜像列表`
                  : `Added to the ${pathId} official mirror list`
              }
            >
              <g dangerouslySetInnerHTML={{ __html: verifiedIcon.body }} />
            </svg>
          ) : null}
        </h3>
        <p>
          {mirror.desc ? (
            <HighlightedText
              value={mirror.desc}
              ranges={searchMatch?.indices.desc}
            />
          ) : locale === 'zh' ? (
            '暂无镜像说明'
          ) : (
            'No description available'
          )}
        </p>
      </div>
      <div className="mirror-card-footer">
        <span className={`status status-${state}`}>{stateLabels[state]}</span>
      </div>
    </a>
  );
}

export default function MirrorExplorer({
  locale,
  docsByMirrorId,
  docsTitles,
}: Props) {
  const [catalog, setCatalog] = useState<MirrorzData | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshAttempt, setRefreshAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [friendlyName, setFriendlyName] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const search = document.querySelector<HTMLInputElement>('#mirror-search');
    searchRef.current = search;
    if (!search) return;
    const updateQuery = () => setQuery(search.value);
    updateQuery();
    search.addEventListener('input', updateQuery);
    return () => search.removeEventListener('input', updateQuery);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('zju-mirror:friendlyName');
      setFriendlyName(saved === null || saved === '1');
    } catch {
      setFriendlyName(true);
    }
    const update = (event: Event) => {
      setFriendlyName((event as CustomEvent<boolean>).detail);
    };
    window.addEventListener('zju-mirror:friendly-name-change', update);
    return () =>
      window.removeEventListener('zju-mirror:friendly-name-change', update);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(viewModeKey);
      if (saved === 'list' || saved === 'card') setViewMode(saved);
    } catch {
      // The default card view stays when storage is unavailable.
    }
  }, []);

  const updateViewMode = (mode: 'card' | 'list') => {
    setViewMode(mode);
    try {
      window.localStorage.setItem(viewModeKey, mode);
    } catch {
      // Mode switching still works for the current page.
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (refreshAttempt === 0) {
      const cached = readCache();
      if (cached) {
        setCatalog(cached.data);
        setSavedAt(cached.savedAt);
        setStale(true);
      }
    }

    setLoading(true);
    setError(false);
    fetchWithTimeout('/mirrorz.json')
      .then(async (result) => {
        if (!result.ok) {
          throw new Error(`MirrorZ data returned ${result.status}`);
        }
        return result.json() as Promise<unknown>;
      })
      .then((payload) => {
        if (cancelled) return;
        const data = mirrorzDataSchema.parse(payload);
        const fetchedAt = new Date().toISOString();
        try {
          window.localStorage.setItem(cacheDataKey, JSON.stringify(data));
          window.localStorage.setItem(cacheSavedAtKey, fetchedAt);
        } catch {
          // Live data remains usable when browser storage is unavailable.
        }
        setCatalog(data);
        setSavedAt(fetchedAt);
        setStale(false);
        setError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setStale(true);
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshAttempt]);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.matches('input, textarea, select, button'))
      ) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  const allMirrors = useMemo(
    () =>
      [...(catalog?.mirrors ?? [])].sort((left, right) =>
        mirrorPathId(left, catalog!).localeCompare(
          mirrorPathId(right, catalog!),
          undefined,
          {
            sensitivity: 'base',
          }
        )
      ),
    [catalog]
  );
  const mirrors = useMemo(() => {
    if (!query.trim() || !catalog) {
      return allMirrors.map((mirror) => ({ mirror, searchMatch: undefined }));
    }
    const searchIndex = new Fuse(
      allMirrors.map((mirror) => {
        const docsId = localDocsId(mirror, docsByMirrorId);
        return {
          mirror,
          title: (docsId ? docsTitles[docsId] : undefined) ?? mirror.cname,
          cname: mirror.cname,
          path: mirrorPathId(mirror, catalog),
          desc: mirror.desc ?? '',
        };
      }),
      {
        keys: ['title', 'cname', 'path', 'desc'],
        includeMatches: true,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }
    );
    return searchIndex.search(query.trim()).map((result) => ({
      mirror: result.item.mirror,
      searchMatch: {
        score: result.score ?? 0,
        indices: Object.fromEntries(
          (result.matches ?? []).map((match) => [match.key, match.indices])
        ) as Partial<Record<SearchField, [number, number][]>>,
      },
    }));
  }, [allMirrors, catalog, docsByMirrorId, docsTitles, query]);
  const searching = query.trim().length > 0;
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      '[data-hide-during-search]'
    );
    sections.forEach((section) => {
      section.hidden = searching;
    });
    return () => {
      sections.forEach((section) => {
        section.hidden = false;
      });
    };
  }, [searching]);
  const groups = useMemo(() => {
    if (searching) return [{ letter: null, items: mirrors }];

    const grouped = new Map<string, MirrorSearchResult[]>();
    for (const result of mirrors) {
      const { mirror } = result;
      const letter = catalog
        ? mirrorPathId(mirror, catalog).charAt(0).toLocaleUpperCase() || '#'
        : '#';
      const group = grouped.get(letter) ?? [];
      group.push(result);
      grouped.set(letter, group);
    }

    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([letter, items]) => ({ letter, items }));
  }, [catalog, mirrors, searching]);

  return (
    <section
      id="all-mirrors"
      className="mirror-explorer"
      aria-labelledby="all-mirrors-heading"
    >
      <div className="section-heading-row">
        <h2 id="all-mirrors-heading">
          {locale === 'zh' ? '所有镜像' : 'All Mirrors'}
        </h2>
        <div
          className="view-toggle"
          role="group"
          aria-label={locale === 'zh' ? '切换视图' : 'Switch view'}
        >
          <button
            type="button"
            aria-pressed={viewMode === 'card'}
            aria-label={locale === 'zh' ? '卡片视图' : 'Card view'}
            title={locale === 'zh' ? '卡片视图' : 'Card view'}
            onClick={() => updateViewMode('card')}
          >
            <svg
              viewBox={`0 0 ${gridViewIcon.width} ${gridViewIcon.height}`}
              aria-hidden="true"
            >
              <g dangerouslySetInnerHTML={{ __html: gridViewIcon.body }} />
            </svg>
          </button>
          <button
            type="button"
            aria-pressed={viewMode === 'list'}
            aria-label={locale === 'zh' ? '列表视图' : 'List view'}
            title={locale === 'zh' ? '列表视图' : 'List view'}
            onClick={() => updateViewMode('list')}
          >
            <svg
              viewBox={`0 0 ${formatListBulletedIcon.width} ${formatListBulletedIcon.height}`}
              aria-hidden="true"
            >
              <g
                dangerouslySetInnerHTML={{
                  __html: formatListBulletedIcon.body,
                }}
              />
            </svg>
          </button>
        </div>
      </div>

      {error ? (
        <p className="callout warning" role="status">
          <span>
            {catalog && savedAt
              ? locale === 'zh'
                ? `MirrorZ 数据暂时不可用，正在显示 ${formatTimestamp(savedAt, locale)} 保存的数据。`
                : `MirrorZ data is unavailable; showing data saved at ${formatTimestamp(savedAt, locale)}.`
              : locale === 'zh'
                ? 'MirrorZ 数据暂时不可用。镜像文件和公告仍可正常访问。'
                : 'MirrorZ data is unavailable. Mirror files and announcements remain accessible.'}
          </span>{' '}
          <button
            className="retry-button"
            type="button"
            disabled={loading}
            onClick={() => setRefreshAttempt((current) => current + 1)}
          >
            {locale === 'zh' ? '重试' : 'Retry'}
          </button>
        </p>
      ) : null}
      {stale && !error ? (
        <p className="callout" role="status">
          {locale === 'zh'
            ? '正在刷新上次保存的数据…'
            : 'Refreshing saved data…'}
        </p>
      ) : null}

      {catalog ? (
        viewMode === 'list' ? (
          <MirrorList
            mirrors={mirrors}
            catalog={catalog}
            docsByMirrorId={docsByMirrorId}
            docsTitles={docsTitles}
            locale={locale}
            friendlyName={friendlyName}
          />
        ) : (
          <div className="mirror-groups">
            {groups.map((group) => (
              <section
                className="mirror-group"
                key={group.letter ?? 'search-results'}
                aria-labelledby={
                  group.letter ? `mirror-group-${group.letter}` : undefined
                }
              >
                {group.letter ? (
                  <h3 id={`mirror-group-${group.letter}`}>{group.letter}</h3>
                ) : null}
                <div className="mirror-grid">
                  {group.items.map((result) => (
                    <MirrorCard
                      key={result.mirror.cname}
                      mirror={result.mirror}
                      catalog={catalog}
                      docsByMirrorId={docsByMirrorId}
                      docsTitles={docsTitles}
                      locale={locale}
                      friendlyName={friendlyName}
                      searchMatch={result.searchMatch}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      ) : loading ? (
        <p className="loading-message">
          {locale === 'zh' ? '正在载入镜像状态…' : 'Loading mirror status…'}
        </p>
      ) : null}
      {catalog && mirrors.length === 0 ? (
        <p>
          {locale === 'zh'
            ? '没有匹配的镜像。'
            : 'No mirrors match your search.'}
        </p>
      ) : null}
      {viewMode === 'card' && !searching && groups.length > 0 ? (
        <nav
          className="alphabet-nav"
          aria-label={locale === 'zh' ? '按首字母跳转' : 'Jump by initial'}
        >
          {groups.map((group) =>
            group.letter ? (
              <a key={group.letter} href={`#mirror-group-${group.letter}`}>
                {group.letter}
              </a>
            ) : null
          )}
        </nav>
      ) : null}
    </section>
  );
}
