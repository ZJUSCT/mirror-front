export type Locale = 'zh' | 'en';
export type MirrorStatus = 'success' | 'syncing' | 'failed' | 'paused' | 'cached' | 'unknown';

export interface MirrorDto{
    id: string;
    name: Record<Locale, string>;
    desc: Record<Locale, string>;
    status: MirrorStatus;
    lastUpdated: string;
    nextScheduled: string;
    lastSuccess: string;
    url: string;
    isoDict: Record<string, string>;
}

export interface Mirror extends MirrorDto {
    docUrl?: string;
}
