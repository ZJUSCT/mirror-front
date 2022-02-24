import config from '../../config';
import { MirrorDto } from '../types/mirror';

export async function getMirrors(): Promise<MirrorDto[]> {
    return await (await fetch(config.apiBaseUrl + "/mirrors")).json();
}

export async function getMirror(id: string): Promise<MirrorDto> {
    return await (await fetch(config.apiBaseUrl + `/mirrors/${id}`)).json();
}
