import { useEffect, useRef } from 'react';

import { enhanceCodeBlocks } from '../../lib/code-blocks';

export default function StaticCodeBlocks({ locale }: { locale: 'zh' | 'en' }) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const article = markerRef.current?.closest('article');
    if (article) return enhanceCodeBlocks(article, locale);
  }, [locale]);

  return <span ref={markerRef} hidden />;
}
