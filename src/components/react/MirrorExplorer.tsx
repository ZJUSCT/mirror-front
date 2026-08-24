import Fuse from 'fuse.js';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  adaptLegacyMirrors,
  frontendMirrorsResponseSchema,
  type FrontendMirror,
  type FrontendMirrorsResponse,
  type MirrorState,
} from '../../lib/api-contract/mirrors';

interface Props {
  locale: 'zh' | 'en';
  docsByMirrorId: Record<string, string | null>;
}

const cacheKey = 'zju-mirror:frontend-mirrors:v1';
const cacheMaxAgeMs = 6 * 60 * 60 * 1000;

const stateLabels: Record<MirrorState, { zh: string; en: string }> = {
  ready: { zh: '同步成功', en: 'Ready' },
  syncing: { zh: '同步中', en: 'Syncing' },
  pending: { zh: '等待中', en: 'Pending' },
  failed: { zh: '同步失败', en: 'Failed' },
  paused: { zh: '已暂停', en: 'Paused' },
  cached: { zh: '缓存', en: 'Cached' },
  unknown: { zh: '状态未知', en: 'Unknown' },
};

function readCache(): FrontendMirrorsResponse | null {
  try {
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = frontendMirrorsResponseSchema.parse(JSON.parse(raw));
    const age = Date.now() - Date.parse(parsed.generatedAt);
    if (!Number.isFinite(age) || age < 0 || age > cacheMaxAgeMs) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }
    return parsed;
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
  locale,
}: {
  mirror: FrontendMirror;
  locale: 'zh' | 'en';
}) {
  return (
    <article className="mirror-card">
      <div>
        <h3>{mirror.displayName[locale]}</h3>
        <p className="mirror-id">{mirror.id}</p>
        <p>{mirror.description[locale]}</p>
      </div>
      <div className="mirror-card-footer">
        <span className={`status status-${mirror.state}`}>
          {stateLabels[mirror.state][locale]}
        </span>
        <span className="mirror-links">
          {mirror.documentation.available && mirror.documentation.id ? (
            <a
              href={`${locale === 'en' ? '/en' : ''}/docs/${mirror.documentation.id}/`}
            >
              {locale === 'zh' ? '使用帮助' : 'Guide'}
            </a>
          ) : (
            <span title={locale === 'zh' ? '暂无共享帮助' : 'No shared guide'}>
              {locale === 'zh' ? '暂无帮助' : 'No guide'}
            </span>
          )}
          <a href={mirror.dataUrl}>{locale === 'zh' ? '浏览文件' : 'Browse'}</a>
        </span>
      </div>
    </article>
  );
}

export default function MirrorExplorer({ locale, docsByMirrorId }: Props) {
  const [response, setResponse] = useState<FrontendMirrorsResponse | null>(
    null
  );
  const [stale, setStale] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshAttempt, setRefreshAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (refreshAttempt === 0) {
      const cached = readCache();
      if (cached) {
        setResponse(cached);
        setStale(true);
      }
    }

    setLoading(true);
    setError(false);
    fetchWithTimeout('/api/v2/mirrorgo.json')
      .then(async (result) => {
        if (!result.ok) throw new Error(`Status API returned ${result.status}`);
        return result.json() as Promise<unknown>;
      })
      .then((payload) => {
        if (cancelled) return;
        const normalized = adaptLegacyMirrors(payload, { docsByMirrorId });
        try {
          window.localStorage.setItem(cacheKey, JSON.stringify(normalized));
        } catch {
          // Live data remains usable when browser storage is unavailable.
        }
        setResponse(normalized);
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
  }, [docsByMirrorId, refreshAttempt]);

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

  const fuse = useMemo(
    () =>
      new Fuse(response?.items ?? [], {
        keys: ['id', `displayName.${locale}`, `description.${locale}`],
        threshold: 0.35,
      }),
    [locale, response]
  );
  const mirrors = useMemo(() => {
    const normalized = query.trim();
    return normalized
      ? fuse.search(normalized).map((result) => result.item)
      : (response?.items ?? []);
  }, [fuse, query, response]);
  const searching = query.trim().length > 0;
  const groups = useMemo(() => {
    if (searching) return [{ letter: null, items: mirrors }];

    const grouped = new Map<string, FrontendMirror[]>();
    for (const mirror of mirrors) {
      const letter = mirror.id.charAt(0).toLocaleUpperCase() || '#';
      const group = grouped.get(letter) ?? [];
      group.push(mirror);
      grouped.set(letter, group);
    }

    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([letter, items]) => ({ letter, items }));
  }, [mirrors, searching]);

  return (
    <section className="mirror-explorer" aria-labelledby="all-mirrors-heading">
      <div className="section-heading-row">
        <h2 id="all-mirrors-heading">
          {locale === 'zh' ? '所有镜像' : 'All mirrors'}
        </h2>
      </div>

      <label className="search-field">
        <span className="search-icon" aria-hidden="true">
          ⌕
        </span>
        <span className="visually-hidden">
          {locale === 'zh' ? '搜索镜像' : 'Search mirrors'}
        </span>
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={
            locale === 'zh'
              ? '搜索名称、ID 或描述…'
              : 'Search by name, ID, or description…'
          }
        />
        <kbd>/</kbd>
      </label>

      {error ? (
        <p className="callout warning" role="status">
          <span>
            {response
              ? locale === 'zh'
                ? `状态接口暂时不可用，正在显示 ${formatTimestamp(response.generatedAt, locale)} 保存的数据。`
                : `The status API is unavailable; showing data saved at ${formatTimestamp(response.generatedAt, locale)}.`
              : locale === 'zh'
                ? '状态接口暂时不可用。镜像文件和公告仍可正常访问。'
                : 'The status API is unavailable. Mirror files and announcements remain accessible.'}
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

      {response ? (
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
                  <MirrorCard key={mirror.id} mirror={mirror} locale={locale} />
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
      {response && mirrors.length === 0 ? (
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
