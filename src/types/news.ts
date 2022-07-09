export type Locale = 'zh' | 'en';

export type IsoDict = Record<string, string>;

export interface File {
  name: string;
  url: string;
}

export interface NewsDto {
  name: string;
  title: Record<Locale, string>;
  date: string;
  author: string;
  url: string;
  files?: File[];
}

export interface News extends NewsDto {
  docUrl?: string;
}
