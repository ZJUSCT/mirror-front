import { useRef, useState } from 'react';

import { copyText } from '../../lib/code-blocks';
import { checkIcon, codeIcon, contentCopyIcon } from '../../lib/ui-icons';

interface Props {
  href: string;
  locale: 'zh' | 'en';
}

export default function MarkdownActions({ href, locale }: Props) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const icon = copied ? checkIcon : contentCopyIcon;
  const label = copied
    ? locale === 'zh'
      ? '已复制'
      : 'Copied'
    : locale === 'zh'
      ? '复制 Markdown'
      : 'Copy Markdown';

  async function copyMarkdown() {
    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error(`Markdown request failed: ${response.status}`);
      await copyText(await response.text());
      setCopied(true);
      setStatus(locale === 'zh' ? '已复制' : 'Copied');
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setCopied(false);
        setStatus('');
        timer.current = null;
      }, 2000);
    } catch {
      setCopied(false);
      setStatus(locale === 'zh' ? '无法复制 Markdown' : 'Unable to copy Markdown');
    }
  }

  return (
    <div className="guide-export special-markdown-actions">
      <div className="guide-export-actions">
        <button
          type="button"
          className="guide-export-icon"
          onClick={copyMarkdown}
          aria-label={label}
          title={label}
        >
          <svg viewBox={`0 0 ${icon.width} ${icon.height}`} aria-hidden="true">
            <g dangerouslySetInnerHTML={{ __html: icon.body }} />
          </svg>
          <span className="site-action-label">{label}</span>
        </button>
        <a
          className="guide-export-icon"
          href={href}
          aria-label={locale === 'zh' ? '查看 Markdown' : 'View Markdown'}
          title={locale === 'zh' ? '查看 Markdown' : 'View Markdown'}
        >
          <svg viewBox={`0 0 ${codeIcon.width} ${codeIcon.height}`} aria-hidden="true">
            <g dangerouslySetInnerHTML={{ __html: codeIcon.body }} />
          </svg>
          <span className="site-action-label">
            {locale === 'zh' ? '查看 Markdown' : 'View Markdown'}
          </span>
        </a>
      </div>
      <span className="guide-copy-status" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
