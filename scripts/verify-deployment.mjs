import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseUrl = process.env.VERIFY_BASE_URL?.replace(/\/$/, '');
const archivePath = 'dist/site/downloads/listen-back-reader.zip';

if (!baseUrl) throw new Error('VERIFY_BASE_URL is required (for example, https://listen-back-reader.sociobot.in).');
if (statSync(archivePath).size < 1_000) throw new Error(`Local release archive is missing: ${archivePath}`);

const siteResponse = await fetch(`${baseUrl}/`, { redirect: 'error', cache: 'no-store' });
if (!siteResponse.ok) throw new Error(`${baseUrl}/ returned HTTP ${siteResponse.status}, expected HTTP 200.`);
const policy = siteResponse.headers.get('content-security-policy') ?? '';
if (!policy.includes("frame-ancestors 'none'")) {
  throw new Error(`${baseUrl}/ is missing the frame-ancestors 'none' response policy.`);
}
const site = await siteResponse.text();
if (!site.includes('<title>Listen Back Reader — replay one sentence</title>')) {
  throw new Error(`${baseUrl}/ does not identify the Listen Back Reader release.`);
}

const url = `${baseUrl}/downloads/listen-back-reader.zip`;
const response = await fetch(url, { redirect: 'error', cache: 'no-store' });
if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}, expected HTTP 200.`);

const contentType = response.headers.get('content-type') ?? '';
if (!/^application\/(zip|x-zip-compressed)(?:;|$)/i.test(contentType)) {
  throw new Error(`${url} returned Content-Type ${JSON.stringify(contentType)}, expected a ZIP content type.`);
}
const disposition = response.headers.get('content-disposition') ?? '';
if (!/^attachment(?:;|$)/i.test(disposition)) {
  throw new Error(`${url} returned Content-Disposition ${JSON.stringify(disposition)}, expected an attachment response.`);
}

const downloaded = Buffer.from(await response.arrayBuffer());
const local = readFileSync(archivePath);
const digest = (value) => createHash('sha256').update(value).digest('hex');
if (digest(downloaded) !== digest(local)) {
  throw new Error(`${url} is not byte-identical to ${archivePath} (live ${digest(downloaded)}, local ${digest(local)}).`);
}

const scratch = mkdtempSync(join(tmpdir(), 'listen-back-release-'));
try {
  const downloadedPath = join(scratch, 'listen-back-reader.zip');
  writeFileSync(downloadedPath, downloaded);
  execFileSync('unzip', ['-tqq', downloadedPath], { stdio: 'inherit' });
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

console.log(`Verified live identity and frame policy plus extension archive: HTTP 200, ZIP response headers, byte hash ${digest(local)}, and archive integrity.`);
