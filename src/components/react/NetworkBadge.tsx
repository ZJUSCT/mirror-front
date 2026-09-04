import { useEffect, useState } from 'react';

import {
  campusNetworkEndpoint,
  parseNetworkMode,
  type NetworkMode,
} from '../../lib/network';

const labels: Record<NetworkMode, { zh: string; en: string }> = {
  0: { zh: '校外网络', en: 'Off-Campus' },
  1: { zh: '校内网络 - IPv4', en: 'On-Campus - IPv4' },
  2: { zh: '校内网络 - IPv6', en: 'On-Campus - IPv6' },
  unknown: { zh: '网络状态未知', en: 'Network status unavailable' },
};

export default function NetworkBadge({ locale }: { locale: 'zh' | 'en' }) {
  const [mode, setMode] = useState<NetworkMode>('unknown');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);

    fetch(campusNetworkEndpoint, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return 'unknown';
        return parseNetworkMode(await response.json());
      })
      .then(setMode)
      .catch(() => setMode('unknown'))
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <span className={`network-badge network-${mode}`}>
      {labels[mode][locale]}
    </span>
  );
}
