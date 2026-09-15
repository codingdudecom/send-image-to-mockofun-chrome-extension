import {readFile, access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
if (manifest.manifest_version !== 3) throw new Error('manifest_version must be 3');
if (!manifest.background?.service_worker) throw new Error('background service worker is missing');

const runtimeFiles = [
  'manifest.json',
  manifest.background.service_worker,
  ...manifest.content_scripts.flatMap((entry) => [...(entry.js || []), ...(entry.css || [])]),
  ...Object.values(manifest.icons)
];

for (const file of new Set(runtimeFiles)) await access(file);
for (const file of [...new Set(runtimeFiles)].filter((file) => file.endsWith('.js'))) {
  const result = spawnSync(process.execPath, ['--check', file], {stdio: 'inherit'});
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Validated Chrome extension v${manifest.version} (${new Set(runtimeFiles).size} runtime files).`);
