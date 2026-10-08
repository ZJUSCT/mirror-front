import { useEffect, useRef, useState } from 'react';

import { copyText } from '../../lib/code-blocks';
import { highlightCodeElement } from '../../lib/code-highlighting';
import { checkIcon, contentCopyIcon } from '../../lib/ui-icons';

interface Props {
  value: string;
  language: string;
}

export default function ConfigCodeBlock({ value, language }: Props) {
  const codeRef = useRef<HTMLElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>(
    'idle'
  );

  useEffect(() => {
    if (codeRef.current) highlightCodeElement(codeRef.current);
  }, [value]);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    []
  );

  async function handleCopy() {
    try {
      await copyText(value);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyStatus('idle'), 1800);
  }

  const icon = copyStatus === 'copied' ? checkIcon : contentCopyIcon;
  const label =
    copyStatus === 'copied'
      ? '已复制'
      : copyStatus === 'failed'
        ? '复制失败'
        : '复制';
  return (
    <figure className="code-block-shell">
      <figcaption className="code-block-language">{language}</figcaption>
      <button
        type="button"
        className="code-copy-button"
        aria-label={label}
        onClick={() => void handleCopy()}
      >
        <svg
          viewBox={`0 0 ${icon.width} ${icon.height}`}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: icon.body }}
        />
        <span aria-live="polite">{label}</span>
      </button>
      <pre tabIndex={0}>
        <code ref={codeRef} data-language={language.toLowerCase()}>
          {value}
        </code>
      </pre>
    </figure>
  );
}
