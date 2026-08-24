import { useEffect, useMemo, useRef, useState } from 'react';

import {
  mirrorPresentationState,
  mirrorzDataSchema,
  resolveMirrorzUrl,
  type MirrorPresentationState,
  type MirrorzData,
  type MirrorzMirror,
} from '../../lib/mirrorz';
import { verifiedIcon } from '../../lib/ui-icons';

interface Props {
  locale: 'zh' | 'en';
  docsByMirrorId: Record<string, string | null>;
}

const cacheDataKey = 'zju-mirror:mirrorz:v1';
const cacheSavedAtKey = 'zju-mirror:mirrorz:v1:saved-at';
const cacheMaxAgeMs = 6 * 60 * 60 * 1000;

const stateLabels: Record<MirrorPresentationState, string> = {
  ready: 'SUCCEEDED',
  syncing: 'SYNCING',
  pending: 'PENDING',
  failed: 'FAILED',
  paused: 'PAUSED',
  cached: 'CACHED',
  proxied: 'PROXIED',
  disabled: 'DISABLED',
  unknown: 'UNKNOWN',
};

const officiallyCertifiedMirrorIds = new Set(
  [
    'CRAN',
    'CTAN',
    'almalinux',
    'alpine',
    'archlinux',
    'archlinuxcn',
    'bioconductor',
    'centos',
    'cygwin',
    'debian',
    'deepin',
    'deepin-cd',
    'EPEL',
    'fedora',
    'gentoo',
    'openeuler',
    'opensuse',
    'raspbian',
    'rocky',
    'ros',
    'ubuntu',
    'ubuntu-releases',
  ].map((value) => value.toLocaleLowerCase())
);

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

function localDocsId(
  mirror: MirrorzMirror,
  docsByMirrorId: Record<string, string | null>
): string | null {
  const urlPath = (() => {
    try {
      return new URL(mirror.url, 'https://mirrorz.invalid').pathname
        .split('/')
        .filter(Boolean)[0];
    } catch {
      return undefined;
    }
  })();
  const candidates = [
    mirror.cname,
    mirror.cname.toLocaleLowerCase(),
    urlPath,
    urlPath?.toLocaleLowerCase(),
  ];
  for (const candidate of candidates) {
    if (candidate && docsByMirrorId[candidate]) {
      return docsByMirrorId[candidate];
    }
  }
  return null;
}

function mirrorPathId(mirror: MirrorzMirror, catalog: MirrorzData): string {
  try {
    return (
      new URL(mirror.url, catalog.site.url).pathname
        .split('/')
        .filter(Boolean)[0] ?? mirror.cname
    );
  } catch {
    return mirror.cname;
  }
}

function MirrorCard({
  mirror,
  catalog,
  docsByMirrorId,
  locale,
  friendlyName,
}: {
  mirror: MirrorzMirror;
  catalog: MirrorzData;
  docsByMirrorId: Record<string, string | null>;
  locale: 'zh' | 'en';
  friendlyName: boolean;
}) {
  const state = mirrorPresentationState(mirror, catalog.site.disable);
  const dataUrl = resolveMirrorzUrl(catalog.site.url, mirror.url);
  const docsId = localDocsId(mirror, docsByMirrorId);
  const upstreamHelpUrl = mirror.help
    ? resolveMirrorzUrl(catalog.site.url, mirror.help)
    : null;
  const guideUrl = docsId
    ? `${locale === 'en' ? '/en' : ''}/docs/${docsId}/`
    : upstreamHelpUrl;
  const destination = guideUrl ?? dataUrl;
  const pathId = mirrorPathId(mirror, catalog);
  const certified = officiallyCertifiedMirrorIds.has(
    pathId.toLocaleLowerCase()
  );

  return (
    <a className="mirror-card" href={destination ?? undefined}>
      <div>
        <h3>
          {friendlyName ? mirror.cname : pathId}
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
          {mirror.desc ||
            (locale === 'zh' ? '暂无镜像说明' : 'No description available')}
        </p>
      </div>
      <div className="mirror-card-footer">
        <span className={`status status-${state}`}>{stateLabels[state]}</span>
      </div>
    </a>
  );
}

export default function MirrorExplorer({ locale, docsByMirrorId }: Props) {
  const [catalog, setCatalog] = useState<MirrorzData | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshAttempt, setRefreshAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [friendlyName, setFriendlyName] = useState(true);
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
    const normalized = query.trim().toLocaleLowerCase();
    return normalized
      ? allMirrors.filter((mirror) =>
          mirror.cname.toLocaleLowerCase().includes(normalized)
        )
      : allMirrors;
  }, [allMirrors, query]);
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

    const grouped = new Map<string, MirrorzMirror[]>();
    for (const mirror of mirrors) {
      const letter = catalog
        ? mirrorPathId(mirror, catalog).charAt(0).toLocaleUpperCase() || '#'
        : '#';
      const group = grouped.get(letter) ?? [];
      group.push(mirror);
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
                {group.items.map((mirror) => (
                  <MirrorCard
                    key={mirror.cname}
                    mirror={mirror}
                    catalog={catalog}
                    docsByMirrorId={docsByMirrorId}
                    locale={locale}
                    friendlyName={friendlyName}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
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
      {!searching && groups.length > 0 ? (
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
