import { describe, expect, test } from 'vitest';

import { isStagingDeployment } from '../src/lib/deployment';

describe('deployment configuration', () => {
  test('uses the production presentation by default', () => {
    expect(isStagingDeployment(undefined)).toBe(false);
  });

  test('enables the staging strip at build time', () => {
    expect(isStagingDeployment('STAGING')).toBe(true);
  });
});
