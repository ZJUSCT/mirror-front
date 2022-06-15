function writeCache(key: string, data: string) {
    if (typeof localStorage === `undefined`) return;
    localStorage.setItem(`__cache_${key}`, JSON.stringify(data));
}

function readCache(key: string, defaultValue: any): any {
    if (typeof localStorage === `undefined`) return defaultValue;
    const d = localStorage.getItem(`__cache_${key}`);
    return d ? JSON.parse(d) : defaultValue;
}

export { writeCache, readCache };