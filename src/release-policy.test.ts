// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

describe('static deployment response policy', () => {
  it('maps every declared public claim to exactly one regression test', () => {
    const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Array<{ id: string; test: string }>;
    const tests = [
      readFileSync('src/reader.test.ts', 'utf8'),
      readFileSync('src/demo.browser.test.ts', 'utf8'),
      readFileSync('src/release-policy.test.ts', 'utf8'),
    ].join('\n');
    for (const claim of claims) {
      expect(claim.test).toBe(`npm test -- -t @claim:${claim.id}`);
      expect(tests.match(new RegExp(`@claim:${claim.id.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`, 'g'))).toHaveLength(1);
    }
  });

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
    expect(config.globalHeaders?.['Content-Security-Policy']).toContain("frame-ancestors 'none'");

    const notFound = readFileSync('public/404.html', 'utf8');
    expect(notFound).toContain('<html lang="en">');
    expect(notFound).toContain('<main id="main">');
    expect(notFound.match(/<h1[ >]/g)).toHaveLength(1);
  });

  it('preloads a responsive mobile hero within the image budget', () => {
    const html = readFileSync('index.html', 'utf8');
    const site = readFileSync('src/site.tsx', 'utf8');
    expect(html).toContain('rel="preload" as="image"');
    expect(html).toContain('imagesrcset="/hero-mobile.webp 768w, /hero.webp 1536w"');
    expect(site).toContain('srcSet="/hero-mobile.webp 768w, /hero.webp 1536w"');
    expect(statSync('public/hero-mobile.webp').size).toBeLessThan(60_000);
  });

  it('makes a release verify the public ZIP that the landing page links to', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.scripts['deploy:site']).toContain('node scripts/deploy-site.mjs');
    expect(pkg.scripts['deploy:site']).toContain('npm run test:deployment');
    expect(pkg.scripts['test:deployment']).toBe('node scripts/verify-deployment.mjs');

    const deployment = readFileSync('scripts/deploy-site.mjs', 'utf8');
    const verification = readFileSync('scripts/verify-deployment.mjs', 'utf8');
    expect(deployment).toContain("const resourceGroup = 'sociobot'");
    expect(deployment).toContain("const appName = 'sf-listen-back-reader'");
    expect(deployment).toContain("'deploy', 'dist/site'");
    expect(deployment).toContain('SWA_CLI_DEPLOYMENT_TOKEN: deploymentToken');
    expect(verification).toContain("frame-ancestors 'none'");
    expect(verification).toContain('<title>Listen Back Reader — replay one sentence</title>');
  });

  it('build:site alone produces the complete deployable site with its extension ZIP', () => {
    rmSync('dist/site', { recursive: true, force: true });
    execFileSync('npm', ['run', 'build:site'], { stdio: 'pipe' });
    expect(existsSync('dist/site/downloads/listen-back-reader.zip')).toBe(true);
    expect(readFileSync('dist/site/downloads/listen-back-reader.zip').byteLength).toBeGreaterThan(1_000);
  }, 30_000);

  it('@claim:source-marker follows exact wrapped sentence ranges in the packaged extension', () => {
    execFileSync('npm', ['run', 'build:extension'], { stdio: 'pipe' });
    execFileSync('node', ['scripts/verify-extension.mjs', '--claim', 'source-marker'], { stdio: 'pipe' });
  }, 30_000);

  it('@claim:active-page-only packages explicit active-tab injection with no standing site access', async () => {
    execFileSync('npm', ['run', 'build:extension'], { stdio: 'pipe' });
    const manifest = JSON.parse(readFileSync('.output/chrome-mv3/manifest.json', 'utf8'));
    expect(manifest.permissions).toEqual(['activeTab', 'scripting']);
    expect(manifest).not.toHaveProperty('content_scripts');
    expect(manifest).not.toHaveProperty('host_permissions');

    const content = readFileSync('entrypoints/content.ts', 'utf8');
    const background = readFileSync('entrypoints/background.ts', 'utf8');
    expect(content).toContain("registration: 'runtime'");
    expect(background).toContain('browser.scripting.executeScript');

    let activate: ((message: unknown) => unknown) | undefined;
    const sendMessage = vi.fn()
      .mockRejectedValueOnce(new Error('No reader in this tab yet.'))
      .mockResolvedValueOnce({ count: 2, current: 0, text: 'First.', rate: 1 });
    const executeScript = vi.fn().mockResolvedValue([]);
    vi.stubGlobal('browser', {
      runtime: { onMessage: { addListener: vi.fn((listener) => { activate = listener; }) } },
      commands: { onCommand: { addListener: vi.fn() } },
      tabs: { query: vi.fn(), sendMessage },
      scripting: { executeScript },
    });
    vi.stubGlobal('defineBackground', (main: () => void) => main);
    vi.resetModules();
    const entrypoint = await import('../entrypoints/background');
    (entrypoint.default as unknown as () => void)();

    expect(sendMessage).not.toHaveBeenCalled();
    expect(executeScript).not.toHaveBeenCalled();
    await expect(activate?.({ type: 'listen-back-activate', tabId: 7 })).resolves.toEqual({ count: 2, current: 0, text: 'First.', rate: 1 });
    expect(executeScript).toHaveBeenCalledWith({ target: { tabId: 7 }, files: ['/content-scripts/content.js'] });
    expect(sendMessage).toHaveBeenNthCalledWith(1, 7, { type: 'listen-back-get-state' });
    expect(sendMessage).toHaveBeenNthCalledWith(2, 7, { type: 'listen-back-get-state' });
    vi.unstubAllGlobals();
  }, 30_000);

  it('@claim:installable-package builds the linked download as a valid MV3 extension archive', () => {
    execFileSync('npm', ['run', 'build:site'], { stdio: 'pipe' });
    const manifest = JSON.parse(execFileSync('unzip', ['-p', 'dist/site/downloads/listen-back-reader.zip', 'manifest.json'], { encoding: 'utf8' }));
    expect(manifest).toMatchObject({ manifest_version: 3, name: 'Listen Back Reader' });
    expect(manifest.permissions).toEqual(['activeTab', 'scripting']);
    expect(manifest).not.toHaveProperty('content_scripts');
    expect(manifest).not.toHaveProperty('host_permissions');
    const builtSite = execFileSync('sh', ['-c', 'cat dist/site/assets/*.js'], { encoding: 'utf8' });
    expect(builtSite).toContain('/downloads/listen-back-reader.zip');
  }, 30_000);

  it('@claim:no-remote-services has no account, analytics, tracking, upload, or runtime network client', () => {
    const runtimeFiles = [
      'src/site.tsx',
      'src/reader.ts',
      'entrypoints/content.ts',
      'entrypoints/background.ts',
      'entrypoints/popup/main.tsx',
    ].map((path) => readFileSync(path, 'utf8')).join('\n');
    expect(runtimeFiles).not.toMatch(/\bfetch\s*\(|\bnew\s+XMLHttpRequest|\bnew\s+WebSocket|\bsendBeacon\s*\(/i);
    const dependencies = Object.keys(JSON.parse(readFileSync('package.json', 'utf8')).dependencies);
    expect(dependencies).not.toEqual(expect.arrayContaining([
      expect.stringMatching(/analytics|telemetry|auth|billing|stripe|sentry/i),
    ]));
    const manifest = readFileSync('wxt.config.ts', 'utf8');
    expect(manifest).not.toMatch(/identity|cookies|webRequest|externally_connectable/);
    expect(manifest).not.toMatch(/storage|<all_urls>/);
  });

  it('@claim:session-memory keeps position and speed in memory without a reading history', () => {
    const extensionRuntime = [
      readFileSync('entrypoints/content.ts', 'utf8'),
      readFileSync('entrypoints/popup/main.tsx', 'utf8'),
    ].join('\n');
    expect(extensionRuntime).toContain('let current = 0');
    expect(extensionRuntime).toContain('let rate = 1');
    expect(extensionRuntime).not.toMatch(/localStorage|sessionStorage|indexedDB|browser\.storage/);
  });
});
