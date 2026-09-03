import alpineLinuxIcon from '@iconify/icons-simple-icons/alpinelinux';
import anacondaIcon from '@iconify/icons-simple-icons/anaconda';
import archLinuxIcon from '@iconify/icons-simple-icons/archlinux';
import centOsIcon from '@iconify/icons-simple-icons/centos';
import debianIcon from '@iconify/icons-simple-icons/debian';
import deepinIcon from '@iconify/icons-simple-icons/deepin';
import dockerIcon from '@iconify/icons-simple-icons/docker';
import fedoraIcon from '@iconify/icons-simple-icons/fedora';
import gentooIcon from '@iconify/icons-simple-icons/gentoo';
import gnuIcon from '@iconify/icons-simple-icons/gnu';
import homebrewIcon from '@iconify/icons-simple-icons/homebrew';
import kaliIcon from '@iconify/icons-simple-icons/kalilinux';
import linuxIcon from '@iconify/icons-simple-icons/linux';
import linuxmintIcon from '@iconify/icons-simple-icons/linuxmint';
import llvmIcon from '@iconify/icons-simple-icons/llvm';
import manjaroIcon from '@iconify/icons-simple-icons/manjaro';
import openSuseIcon from '@iconify/icons-simple-icons/opensuse';
import openWrtIcon from '@iconify/icons-simple-icons/openwrt';
import pythonIcon from '@iconify/icons-simple-icons/python';
import qtIcon from '@iconify/icons-simple-icons/qt';
import raspberryPiIcon from '@iconify/icons-simple-icons/raspberrypi';
import rockyIcon from '@iconify/icons-simple-icons/rockylinux';
import rosIcon from '@iconify/icons-simple-icons/ros';
import rustIcon from '@iconify/icons-simple-icons/rust';
import ubuntuIcon from '@iconify/icons-simple-icons/ubuntu';
import { useEffect, useMemo, useState } from 'react';

import {
  MIRROR_SERVICE_CHANGE_EVENT,
  type MirrorServiceChangeDetail,
} from '../../lib/mirror-endpoint';
import {
  mirrorPresentationState,
  mirrorzDataSchema,
  resolveMirrorzUrl,
  type MirrorPresentationState,
  type MirrorzData,
  type MirrorzMirror,
} from '../../lib/mirrorz';
import { folderIcon } from '../../lib/ui-icons';

interface Props {
  mirrorId: string;
  title: string;
  fallbackDataUrl?: string | null;
  federatedDataUrl?: string | null;
  locale: 'zh' | 'en';
}

interface StaticIcon {
  width: number;
  height: number;
  body: string;
}

const statusLabels: Record<MirrorPresentationState, string> = {
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

const iconModules: Record<string, unknown> = {
  alpine: alpineLinuxIcon,
  anaconda: anacondaIcon,
  archlinux: archLinuxIcon,
  archlinuxcn: archLinuxIcon,
  centos: centOsIcon,
  'centos-vault': centOsIcon,
  debian: debianIcon,
  deepin: deepinIcon,
  'docker-ce': dockerIcon,
  fedora: fedoraIcon,
  gentoo: gentooIcon,
  'gentoo-portage': gentooIcon,
  'gentoo-portage.git': gentooIcon,
  gnu: gnuIcon,
  'homebrew.git': homebrewIcon,
  kali: kaliIcon,
  'linux.git': linuxIcon,
  linuxmint: linuxmintIcon,
  'llvm-apt': llvmIcon,
  manjaro: manjaroIcon,
  opensuse: openSuseIcon,
  openwrt: openWrtIcon,
  pypi: pythonIcon,
  qt: qtIcon,
  raspberrypi: raspberryPiIcon,
  raspbian: raspberryPiIcon,
  rocky: rockyIcon,
  ros: rosIcon,
  ros2: rosIcon,
  rosdistro: rosIcon,
  rustup: rustIcon,
  'crates.io-index': rustIcon,
  ubuntu: ubuntuIcon,
  'ubuntu-ports': ubuntuIcon,
};

function staticIcon(value: unknown): StaticIcon | null {
  if (!value) return null;
  const module = value as { default?: StaticIcon } & Partial<StaticIcon>;
  const candidate = module.default ?? module;
  return candidate.width && candidate.height && candidate.body
    ? (candidate as StaticIcon)
    : null;
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

function findMirror(
  catalog: MirrorzData,
  mirrorId: string
): MirrorzMirror | null {
  const normalized = mirrorId.toLocaleLowerCase();
  return (
    catalog.mirrors.find((mirror) =>
      [mirror.cname, mirrorPathId(mirror, catalog)].some(
        (value) => value.toLocaleLowerCase() === normalized
      )
    ) ?? null
  );
}

function statusTimestamp(status: string): number | null {
  const tokens = status.match(/[A-Z](?:\d+)?/g) ?? [];
  const main = tokens.find((token) => 'SDYFP'.includes(token.charAt(0)));
  if (!main) return null;
  const oldSuccess = tokens.find((token) => token.startsWith('O'));
  const chosen =
    (main.startsWith('Y') || main.startsWith('F')) && oldSuccess
      ? oldSuccess
      : main;
  const timestamp = Number(chosen.slice(1));
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp * 1000 : null;
}

function relativeTimestamp(value: number, locale: 'zh' | 'en'): string {
  const deltaSeconds = Math.round((value - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(
    locale === 'zh' ? 'zh-CN' : 'en-US',
    { numeric: 'auto' }
  );
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(deltaSeconds) >= seconds)
      return formatter.format(Math.round(deltaSeconds / seconds), unit);
  }
  return formatter.format(deltaSeconds, 'second');
}

export default function GuideHero({
  mirrorId,
  title,
  fallbackDataUrl = null,
  federatedDataUrl = null,
  locale,
}: Props) {
  const [catalog, setCatalog] = useState<MirrorzData | null>(null);
  const [federatedEnabled, setFederatedEnabled] = useState(false);
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    const controller = new AbortController();
    fetch('/mirrorz.json', { signal: controller.signal })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error('MirrorZ'))
      )
      .then((payload: unknown) => setCatalog(mirrorzDataSchema.parse(payload)))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateMirrorService = (event: Event) => {
      setFederatedEnabled(
        (event as CustomEvent<MirrorServiceChangeDetail>).detail.federated
      );
    };
    setFederatedEnabled(
      document.documentElement.dataset.mirrorService === 'cernet'
    );
    window.addEventListener(MIRROR_SERVICE_CHANGE_EVENT, updateMirrorService);
    return () =>
      window.removeEventListener(
        MIRROR_SERVICE_CHANGE_EVENT,
        updateMirrorService
      );
  }, []);

  const mirror = catalog ? findMirror(catalog, mirrorId) : null;
  const state = mirror
    ? mirrorPresentationState(mirror, catalog?.site.disable)
    : 'unknown';
  const timestamp = mirror ? statusTimestamp(mirror.status) : null;
  const dataUrl =
    mirror && catalog
      ? resolveMirrorzUrl(catalog.site.url, mirror.url)
      : fallbackDataUrl;
  const selectedDataUrl =
    federatedEnabled && federatedDataUrl ? federatedDataUrl : dataUrl;
  const icon = useMemo(
    () => staticIcon(iconModules[mirrorId.toLocaleLowerCase()]),
    [mirrorId]
  );

  return (
    <section className="article-hero guide-hero">
      <h1 className="article-title">{title}</h1>
      <div className="guide-status-row">
        <span className={`status status-${state}`}>{statusLabels[state]}</span>
        {timestamp ? (
          <span className="guide-updated">
            {locale === 'zh' ? '最近更新于 ' : 'Last updated at '}
            {new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
              dateStyle: 'short',
              timeStyle: 'medium',
            }).format(timestamp)}{' '}
            ({relativeTimestamp(timestamp, locale)})
          </span>
        ) : null}
      </div>
      {selectedDataUrl ? (
        <a className="file-list-button" href={selectedDataUrl}>
          <svg
            viewBox={`0 0 ${folderIcon.width} ${folderIcon.height}`}
            aria-hidden="true"
          >
            <g dangerouslySetInnerHTML={{ __html: folderIcon.body }} />
          </svg>
          {locale === 'zh' ? '文件列表' : 'File List'}
        </a>
      ) : null}
      {icon ? (
        <svg
          className="guide-watermark"
          viewBox={`0 0 ${icon.width} ${icon.height}`}
          aria-hidden="true"
          focusable="false"
        >
          <g dangerouslySetInnerHTML={{ __html: icon.body }} />
        </svg>
      ) : null}
    </section>
  );
}
