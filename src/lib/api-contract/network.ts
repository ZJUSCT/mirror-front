export type NetworkMode = 0 | 1 | 2 | 'unknown';

export function parseNetworkMode(payload: unknown): NetworkMode {
  if (payload === 0 || payload === 1 || payload === 2) return payload;
  return 'unknown';
}
