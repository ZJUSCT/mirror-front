import { MirrorDto } from '../types/mirror';
import { writeCache } from './cache';

function getMirrorById(
  mirrors: MirrorDto[],
  id: string,
  defaultData: MirrorDto
): MirrorDto {
  const mirror = mirrors.find((m: MirrorDto) => m.id === id);
  return mirror || defaultData;
}

async function fetchMirrors(): Promise<MirrorDto[]> {
  const res = await fetch('/api/v2/mirrorgo.json');
  if (!res.ok) {
    throw new Error(`API call failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  writeCache('mirrors', json);
  return json;
}

export { getMirrorById, fetchMirrors };
