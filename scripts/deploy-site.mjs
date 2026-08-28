import { execFileSync, spawnSync } from 'node:child_process';

const subscription = process.env.AZURE_SUBSCRIPTION_ID ?? '283af945-693b-4a6e-b952-df928d0a18a9';
const resourceGroup = 'sociobot';
const appName = 'sf-listen-back-reader';
const armToken = execFileSync('az', [
  'account', 'get-access-token', '--resource', 'https://management.azure.com/', '--query', 'accessToken', '--output', 'tsv',
], { encoding: 'utf8' }).trim();
const secretsUrl = `https://management.azure.com/subscriptions/${subscription}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/staticSites/${appName}/listSecrets?api-version=2024-04-01`;
const secretsResponse = await fetch(secretsUrl, {
  method: 'POST',
  headers: { Authorization: `Bearer ${armToken}`, 'Content-Length': '0' },
});
if (!secretsResponse.ok) throw new Error(`Could not obtain the ${appName} deployment token: HTTP ${secretsResponse.status}.`);
const deploymentToken = (await secretsResponse.json()).properties?.apiKey;
if (!deploymentToken) throw new Error(`Azure returned no deployment token for ${appName}.`);

const deployment = spawnSync('swa', [
  'deploy', 'dist/site', '--swa-config-location', 'dist/site', '--env', 'production', '--no-use-keychain',
], { stdio: 'inherit', env: { ...process.env, SWA_CLI_DEPLOYMENT_TOKEN: deploymentToken } });
if (deployment.status !== 0) process.exit(deployment.status ?? 1);
