export type Locale = 'zh' | 'en';
export type MirrorStatus =
  | 'succeeded'
  | 'syncing'
  | 'pending'
  | 'failed'
  | 'paused'
  | 'cached'
  | 'unknown';

export type IsoDict = Record<string, string>;

export interface File {
  name: string;
  url: string;
}

export interface MirrorDto {
  id: string;
  name: Record<Locale, string>;
  desc: Record<Locale, string>;
  status: MirrorStatus;
  lastUpdated: number;
  nextScheduled: number;
  lastSuccess: number;
  url: string;
  files?: File[];
}

export interface Mirror extends MirrorDto {
  docUrl?: string;
}
