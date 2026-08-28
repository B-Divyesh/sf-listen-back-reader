import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';

const archive = 'dist/site/downloads/listen-back-reader.zip';
const landing = [
  readFileSync('dist/site/index.html', 'utf8'),
  ...readdirSync('dist/site/assets')
    .filter((file) => file.endsWith('.js'))
    .map((file) => readFileSync(`dist/site/assets/${file}`, 'utf8')),
].join('\n');

if (!landing.includes('/downloads/listen-back-reader.zip')) {
  throw new Error('The built landing page does not link to the extension archive.');
}
if (statSync(archive).size < 1_000) {
  throw new Error('The extension archive is missing or unexpectedly small.');
}

execFileSync('unzip', ['-tqq', archive], { stdio: 'inherit' });
const manifest = JSON.parse(execFileSync('unzip', ['-p', archive, 'manifest.json'], { encoding: 'utf8' }));
if (manifest.manifest_version !== 3 || manifest.name !== 'Listen Back Reader') {
  throw new Error('The downloadable archive is not the expected MV3 extension.');
}

console.log(`Verified ${archive} (${statSync(archive).size} bytes), including its MV3 manifest and landing-page link.`);
