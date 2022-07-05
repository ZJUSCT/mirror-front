const cachePrefix = '__cache__';

function writeCache(key: string, data: string) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(`${cachePrefix}${key}`, JSON.stringify(data));
}

function readCache<T>(key: string, defaultValue: T): T {
  if (typeof localStorage === 'undefined') return defaultValue;
  const d = localStorage.getItem(`${cachePrefix}${key}`);
  return d ? JSON.parse(d) : defaultValue;
}

export { writeCache, readCache };
