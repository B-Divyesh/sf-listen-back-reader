// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('static deployment response policy', () => {
  it('serves only known SPA routes through the shell and gives unknown paths a real 404', () => {
    const config = JSON.parse(readFileSync('staticwebapp.config.json', 'utf8'));
    expect(config.navigationFallback).toBeUndefined();
    expect(config.routes).toEqual(expect.arrayContaining([
      expect.objectContaining({ route: '/demo', rewrite: '/index.html' }),
      expect.objectContaining({ route: '/privacy', rewrite: '/index.html' }),
      expect.objectContaining({ route: '/terms', rewrite: '/index.html' }),
      expect.objectContaining({ route: '/downloads/*', headers: { 'Cache-Control': 'no-cache', 'Content-Disposition': 'attachment' } }),
    ]));
    expect(config.responseOverrides?.['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });

    const notFound = readFileSync('public/404.html', 'utf8');
    expect(notFound).toContain('<html lang="en">');
    expect(notFound).toContain('<main id="main">');
    expect(notFound.match(/<h1[ >]/g)).toHaveLength(1);
  });

  it('makes a release verify the public ZIP that the landing page links to', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.scripts['deploy:site']).toContain('node scripts/deploy-site.mjs');
    expect(pkg.scripts['deploy:site']).toContain('npm run test:deployment');
    expect(pkg.scripts['test:deployment']).toBe('node scripts/verify-deployment.mjs');

    const deployment = readFileSync('scripts/deploy-site.mjs', 'utf8');
    expect(deployment).toContain("const resourceGroup = 'sociobot'");
    expect(deployment).toContain("const appName = 'sf-listen-back-reader'");
    expect(deployment).toContain("'deploy', 'dist/site'");
    expect(deployment).toContain('SWA_CLI_DEPLOYMENT_TOKEN: deploymentToken');
  });
});
