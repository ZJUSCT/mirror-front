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

function popCache<T>(key: string, defaultValue: T): T {
  const d = readCache(key, defaultValue);
  localStorage.removeItem(`${cachePrefix}${key}`);
  return d;
}

export { writeCache, readCache, popCache };
