import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import {
  mirrorPresentationState,
  mirrorzDataSchema,
  resolveMirrorzUrl,
} from '../src/lib/mirrorz';

const fixturePath = fileURLToPath(
  new URL('./fixtures/mirrorz-v1.7.json', import.meta.url)
);
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as unknown;

describe('MirrorZ Data Format v1.7', () => {
  test('uses the upstream data model directly', () => {
    const data = mirrorzDataSchema.parse(fixture);

    expect(data).toEqual(fixture);
    expect(data.site).toMatchObject({
      url: 'https://mirrors.zju.edu.cn',
      abbr: 'ZJU',
    });
    expect(data.mirrors.map((mirror) => mirror.cname)).toContain(
      'ready-mirror'
    );
    expect(data).not.toHaveProperty('schemaVersion');
    expect(data).not.toHaveProperty('generatedAt');
    expect(data).not.toHaveProperty('items');
  });

  test('maps compact statuses only for UI presentation', () => {
    const data = mirrorzDataSchema.parse(fixture);

    expect(
      Object.fromEntries(
        data.mirrors.map((mirror) => [
          mirror.cname,
          mirrorPresentationState(mirror),
        ])
      )
    ).toEqual({
      'syncing-mirror': 'syncing',
      'ready-mirror': 'ready',
      'pending-mirror': 'pending',
      'failed-mirror': 'failed',
      'paused-mirror': 'paused',
      'cached-mirror': 'cached',
      'proxied-mirror': 'proxied',
      'unknown-mirror': 'unknown',
      'disabled-mirror': 'disabled',
    });
  });

  test('resolves MirrorZ URLs from site.url without rewriting the model', () => {
    expect(resolveMirrorzUrl('https://mirrors.zju.edu.cn', '/debian')).toBe(
      'https://mirrors.zju.edu.cn/debian'
    );
    expect(
      resolveMirrorzUrl(
        'https://mirrors.zju.edu.cn',
        'https://proxy.example.invalid/debian'
      )
    ).toBe('https://proxy.example.invalid/debian');
    expect(
      resolveMirrorzUrl('https://mirrors.zju.edu.cn', 'javascript:alert(1)')
    ).toBeNull();
  });

  test('rejects invalid protocol versions, statuses, and duplicate cnames', () => {
    const wrongVersion = structuredClone(fixture) as Record<string, unknown>;
    wrongVersion.version = 2;

    const invalidStatus = structuredClone(fixture) as {
      mirrors: Array<Record<string, unknown>>;
    };
    invalidStatus.mirrors[0].status = 'succeeded';

    const duplicate = structuredClone(fixture) as {
      mirrors: Array<Record<string, unknown>>;
    };
    duplicate.mirrors.push({ ...duplicate.mirrors[0] });

    expect(() => mirrorzDataSchema.parse(wrongVersion)).toThrow();
    expect(() => mirrorzDataSchema.parse(invalidStatus)).toThrow();
    expect(() => mirrorzDataSchema.parse(duplicate)).toThrow(
      'duplicate mirror cname'
    );
  });
});
