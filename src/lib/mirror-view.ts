import {
  resolveMirrorzUrl,
  type MirrorzData,
  type MirrorzMirror,
} from './mirrorz';

// Keys are guide ids plus their lowercase aliases (see Home.astro), so the
// folded candidates resolve against mixed-case guides.
export function localDocsId(
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

export function mirrorPathId(
  mirror: MirrorzMirror,
  catalog: MirrorzData
): string {
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

export interface MirrorLinkInfo {
  pathId: string;
  friendlyLabel: string;
  destination: string | null;
  certified: boolean;
}

export function mirrorLinkInfo(
  mirror: MirrorzMirror,
  catalog: MirrorzData,
  docsByMirrorId: Record<string, string | null>,
  docsTitles: Record<string, string>,
  locale: 'zh' | 'en'
): MirrorLinkInfo {
  const docsId = localDocsId(mirror, docsByMirrorId);
  const documentTitle = docsId ? docsTitles[docsId] : undefined;
  const friendlyLabel = documentTitle ?? mirror.cname;
  const upstreamHelpUrl = mirror.help
    ? resolveMirrorzUrl(catalog.site.url, mirror.help)
    : null;
  const guideUrl = docsId
    ? `${locale === 'en' ? '/en' : ''}/docs/${docsId}/`
    : upstreamHelpUrl;
  const dataUrl = resolveMirrorzUrl(catalog.site.url, mirror.url);
  const pathId = mirrorPathId(mirror, catalog);
  return {
    pathId,
    friendlyLabel,
    destination: guideUrl ?? dataUrl,
    certified: officiallyCertifiedMirrorIds.has(pathId.toLocaleLowerCase()),
  };
}
