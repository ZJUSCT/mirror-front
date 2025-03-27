import config from '../../config';

export function getUrl(url: string | undefined, prefix: boolean): string {
  if (!url) return config.siteUrl;
  if (process.env.NODE_ENV === 'development') {
    return url;
  }
  if (typeof window === 'undefined') {
    return `${config.siteUrl}${prefix ? config.pathPrefix : ''}${url}`;
  }
  return `${window.location.origin}${prefix ? config.pathPrefix : ''}${url}`;
}
