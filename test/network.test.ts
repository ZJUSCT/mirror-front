import { describe, expect, test } from 'vitest';

import { parseNetworkMode } from '../src/lib/network';

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
});
