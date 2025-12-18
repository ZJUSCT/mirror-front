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
  url: string;
  name: Record<Locale, string>;
  desc: Record<Locale, string>;
  upstream: string;
  size: number;
  status: MirrorStatus;
  lastAttempt: number;
  nextScheduled: number;
  lastFailure: number;
  lastSuccess: number;
  files?: File[];
}

export interface Mirror extends MirrorDto {
  docUrl?: string;
}
