const cachePrefix = `__cache_`;

function writeCache(key: string, data: string) {
    if (typeof localStorage === `undefined`) return;
    localStorage.setItem(`${cachePrefix}${key}`, JSON.stringify(data));
}

function readCache(key: string, defaultValue: any): any {
    if (typeof localStorage === `undefined`) return defaultValue;
    const d = localStorage.getItem(`${cachePrefix}${key}`);
    return d ? JSON.parse(d) : defaultValue;
}

export { writeCache, readCache };