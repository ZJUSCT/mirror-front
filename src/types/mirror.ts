export type Locale = 'zh' | 'en';
export type MirrorStatus = 'succeeded' | 'syncing' | 'failed' | 'paused' | 'cached' | 'unknown';

export type IsoDict = Record<string, string>;

export interface MirrorDto {
  id: string;
  name: Record<Locale, string>;
  desc: Record<Locale, string>;
  status: MirrorStatus;
  lastUpdated: string;
  nextScheduled: string;
  lastSuccess: string;
  url: string;
  isoDict: IsoDict;
}

export interface Mirror extends MirrorDto {
  docUrl?: string;
}
