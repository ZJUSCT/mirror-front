import { describe, expect, test } from 'vitest';

import { isCampusNetwork, parseNetworkMode } from '../src/lib/network';

describe('campus-network response', () => {
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

  test.each([
    [0, false],
    [1, true],
    [2, true],
    ['unknown', false],
  ] as const)('identifies campus mode %j as %j', (mode, expected) => {
    expect(isCampusNetwork(mode)).toBe(expected);
  });
});
