import { useEffect, useState } from 'react';

interface StatisticsManifest {
  width: number;
  height: number;
  from: number;
  to: number;
  panels: {
    id: string;
    title: { zh: string; en: string };
    images: { light: string; dark: string };
  }[];
}

export default function Statistics({ locale }: { locale: 'zh' | 'en' }) {
  const [manifest, setManifest] = useState<StatisticsManifest | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [refreshedAt, setRefreshedAt] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () =>
      setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const controller = new AbortController();
    const refresh = async () => {
      try {
        const response = await fetch('/statistics-data/manifest.json', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data: StatisticsManifest = await response.json();
        if (!Array.isArray(data.panels)) return;
        setManifest(data);
        setRefreshedAt(Date.now());
      } catch {
        // Leave the current images visible until the next scheduled refresh.
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 5 * 60 * 1000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  if (!manifest?.panels.length) {
    return (
      <div className="statistics">
        <p role="status">
          {locale === 'zh'
            ? '图表暂未就绪，请稍后再来查看。'
            : 'Charts are not available yet. Please check back soon.'}
        </p>
      </div>
    );
  }

  const formatTime = (value: number) =>
    new Date(value).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <div className="statistics">
      <p className="statistics-period">
        {locale === 'zh'
          ? '图表时间范围（本地时间）：'
          : 'Time range (local time): '}
        <time dateTime={new Date(manifest.from).toISOString()}>
          {formatTime(manifest.from)}
        </time>
        {' – '}
        <time dateTime={new Date(manifest.to).toISOString()}>
          {formatTime(manifest.to)}
        </time>
      </p>
      <div className="statistics-panels">
        {manifest.panels.map((panel) => {
          const title = panel.title[locale];
          const src = `/statistics-data/${encodeURIComponent(panel.images[theme])}?t=${refreshedAt}`;
          return (
            <section className="statistics-panel" key={panel.id}>
              <h2>{title}</h2>
              <a href={src} target="_blank" rel="noopener">
                <img
                  src={src}
                  alt={title}
                  width={manifest.width}
                  height={manifest.height}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </section>
          );
        })}
      </div>
    </div>
  );
}
