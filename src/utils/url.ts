import config from '../../config';

export function getUrl(url: string | undefined, prefix: boolean): string {
    if (!url) return config.siteUrl;
    if (process.env.NODE_ENV === 'development') {
        return url;
    } else {
        return `${config.siteUrl}${prefix ? config.pathPrefix : ''}${url}`;
    }
}