export const ZJU_MIRROR_ORIGIN = 'https://mirrors.zju.edu.cn';
export const CERNET_MIRROR_ORIGIN = 'https://mirrors.cernet.edu.cn';

export const MIRROR_SERVICE_CHANGE_EVENT = 'zju:mirror-service-change';
export const MIRROR_GUIDE_OPTIONS_CHANGE_EVENT = 'zju:guide-options-change';
export const MIRROR_GUIDE_OPTIONS_UPDATE_EVENT = 'zju:guide-options-update';

export interface MirrorServiceChangeDetail {
  federated: boolean;
}

export interface MirrorGuideOptionsChangeDetail extends MirrorServiceChangeDetail {
  https: boolean;
  sudo: boolean;
}

export type MirrorGuideOptionsUpdateDetail =
  Partial<MirrorGuideOptionsChangeDetail>;

export function isZjuMirrorUrl(value: string): boolean {
  return new URL(value).host === new URL(ZJU_MIRROR_ORIGIN).host;
}

export function replaceMirrorOrigin(value: string, origin: string): string {
  const source = new URL(value);
  const target = new URL(origin);
  source.host = target.host;
  return source.toString();
}

export function federatedMirrorUrl(publicPath: string): string {
  return new URL(publicPath, CERNET_MIRROR_ORIGIN).toString();
}
