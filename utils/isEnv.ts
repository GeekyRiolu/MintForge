import { Doppler, getEnv } from './env';

export enum DeploymentEnv {
  DEBUG='DEBUG',
  SANDBOX='SANDBOX',
  STAGING='STAGING',
  PRODUCTION='PRODUCTION'
}

/**
 * Gets the deployment environment. Note: Defaults to `DEBUG` environment if doppler returns undefined.
 * @returns {DeploymentEnv} The deployment environment.
 */
export const getDeployEnv = () => (getEnv(Doppler.NEXT_PUBLIC_ENV) as DeploymentEnv) || DeploymentEnv.DEBUG;

/**
 * Returns whether or not the current deployment is a production deployment.
 * @returns {boolean} - whether or not the current deployment is a production deployment.
 */
export const isProd: boolean = getDeployEnv() === DeploymentEnv.PRODUCTION;

/**
 * Returns true if the current deployment environment matches the given environment(s).
 * @param {DeploymentEnv} env - the environment to check against.
 * @returns {boolean} - true if the current deployment environment is the given environment.
 */
export const isEnv= (env: DeploymentEnv | DeploymentEnv[]) => Array.isArray(env) ? env.includes(getDeployEnv()) : getDeployEnv() === env;

/**
 * Checks if the given environment(s) DON'T match the current environment.
 * @param {DeploymentEnv | DeploymentEnv[]} env - the environment to check against the current environment.
 * @returns {boolean} - true if the given environment is not the current environment.
 */
export const isNotEnv = (env: DeploymentEnv | DeploymentEnv[]) => !isEnv(env);

/**
 * Returns the base URL for the application. If an override is provided, it will be returned instead.
 * @param {string} [override=''] - An optional override for the base URL.
 * @returns {string} - The base URL for the application.
 */
export const getBaseUrl = (override = '') => {
  return override || getEnv(Doppler.NEXT_PUBLIC_BASE_URL);
};

/**
 * Returns the URL of the GraphQL API.
 * @returns {string} The URL of the GraphQL API.
 */
export function getAPIURL() {
  return getEnv(Doppler.NEXT_PUBLIC_GRAPHQL_URL);
}
