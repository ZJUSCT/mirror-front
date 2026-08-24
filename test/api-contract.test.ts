import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { adaptLegacyMirrors } from '../src/lib/api-contract/mirrors';
import { parseNetworkMode } from '../src/lib/api-contract/network';

const fixturePath = fileURLToPath(
  new URL('./fixtures/legacy-mirrorgo.json', import.meta.url)
);
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as unknown;
const generatedAt = new Date('2026-08-24T04:00:00.000Z');

describe('legacy MirrorGo adapter', () => {
  test('normalizes all legacy states into a sorted versioned response', () => {
    const response = adaptLegacyMirrors(fixture, {
      generatedAt,
      docsByMirrorId: { 'ready-mirror': 'ready' },
    });

    expect(response.schemaVersion).toBe(1);
    expect(response.generatedAt).toBe('2026-08-24T04:00:00.000Z');
    expect(response.items.map((item) => item.id)).toEqual([
      'cached-mirror',
      'failed-mirror',
      'paused-mirror',
      'pending-mirror',
      'ready-mirror',
      'syncing-mirror',
      'unknown-mirror',
    ]);
    expect(response.items.map((item) => item.state)).toEqual([
      'cached',
      'failed',
      'paused',
      'pending',
      'ready',
      'syncing',
      'unknown',
    ]);
  });

  test('uses production data URLs, translation fallbacks, and null zero times', () => {
    const response = adaptLegacyMirrors(fixture, {
      generatedAt,
      docsByMirrorId: { 'ready-mirror': 'ready' },
    });
    const pending = response.items.find((item) => item.id === 'pending-mirror');
    const ready = response.items.find((item) => item.id === 'ready-mirror');

    expect(pending).toMatchObject({
      dataUrl: 'https://mirrors.zju.edu.cn/pending/',
      displayName: { zh: '等待中', en: '等待中' },
      lastAttemptAt: null,
      lastSucceededAt: null,
      lastFailedAt: null,
      documentation: { id: null, available: false },
    });
    expect(ready?.documentation).toEqual({ id: 'ready', available: true });
  });

  test('normalizes live-style directory paths with a trailing slash', () => {
    const liveStyle = (fixture as Array<Record<string, unknown>>).map(
      (mirror, index) =>
        index === 0 ? { ...mirror, url: '/syncing-mirror' } : mirror
    );
    const response = adaptLegacyMirrors(liveStyle, { generatedAt });

    expect(
      response.items.find((item) => item.id === 'syncing-mirror')?.dataUrl
    ).toBe('https://mirrors.zju.edu.cn/syncing-mirror/');
  });

  test('rejects duplicate IDs and data URLs that escape the configured origin', () => {
    const duplicate = [
      ...(fixture as Array<Record<string, unknown>>),
      (fixture as Array<Record<string, unknown>>)[0],
    ];
    const escaped = [
      {
        ...(fixture as Array<Record<string, unknown>>)[0],
        url: 'https://evil.example.invalid/mirror/',
      },
    ];

    expect(() => adaptLegacyMirrors(duplicate, { generatedAt })).toThrow(
      'duplicate mirror ID'
    );
    expect(() => adaptLegacyMirrors(escaped, { generatedAt })).toThrow(
      'escapes the configured origin'
    );
  });
});

describe('campus-network contract', () => {
  test.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 'unknown'],
    ['1', 'unknown'],
    [null, 'unknown'],
  ])('maps %j to %j', (input, expected) => {
    expect(parseNetworkMode(input)).toBe(expected);
  });
});
