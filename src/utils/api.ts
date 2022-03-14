import config from '../../config';
import { MirrorDto } from '../types/mirror';

async function apiCall<T>(path: string): Promise<T> {
  const res = await fetch(`${config.apiBaseUrl}/${path}`);
  if (!res.ok) {
    throw new Error(`API call failed: ${res.status} ${await res.text()}`);
  }
  return await res.json();
}

export function getMirrors(): Promise<MirrorDto[]> {
  return apiCall('mirrors');
}

export function getMirror(id: string): Promise<MirrorDto> {
  return apiCall(`mirrors/${id}`);
}
