export type NetworkMode = 0 | 1 | 2 | 'unknown';

export const campusNetworkEndpoint = import.meta.env.DEV
  ? '/api/is_campus_network/'
  : '/api/is_campus_network';

export function parseNetworkMode(payload: unknown): NetworkMode {
  if (payload === 0 || payload === 1 || payload === 2) return payload;
  return 'unknown';
}

export function isCampusNetwork(mode: NetworkMode): boolean {
  return mode === 1 || mode === 2;
}
