export function isStagingDeployment(environment: string | undefined): boolean {
  return environment?.trim().toLowerCase() === 'staging';
}

export const stagingDeployment = isStagingDeployment(
  import.meta.env.DEPLOYMENT_ENV
);
