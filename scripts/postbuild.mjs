// Runs after `expo export -p web`. Expo copies public/ into dist/ already;
// this verifies the PWA files are present and writes vercel.json.
import { existsSync, writeFileSync, copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const required = ['index.html', 'sw.js', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

for (const f of required) {
  const out = join(dist, f);
  if (!existsSync(out)) {
    const src = join('public', f);
    if (!existsSync(src)) throw new Error(`Missing PWA file: ${src}`);
    mkdirSync(join(out, '..'), { recursive: true });
    copyFileSync(src, out);
    console.log(`copied ${src} -> ${out}`);
  }
}

const vercel = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  buildCommand: 'npm run build:web',
  outputDirectory: 'dist',
  cleanUrls: false,
  // SPA: every path without a file extension serves index.html.
  rewrites: [{ source: '/((?!.*\\.[a-zA-Z0-9]+$).*)', destination: '/index.html' }],
  headers: [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    },
    { source: '/manifest.json', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
    { source: '/_expo/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
  ],
};
// Root config: used when Vercel builds from the Git repo.
writeFileSync('vercel.json', JSON.stringify(vercel, null, 2) + '\n');
// dist config: used when CI uploads the already-built dist/ folder (`vercel deploy dist`).
const { buildCommand, outputDirectory, ...staticCfg } = vercel;
writeFileSync(join(dist, 'vercel.json'), JSON.stringify({ ...staticCfg, framework: null }, null, 2) + '\n');
console.log('PWA files OK:', readdirSync(dist).join(', '));
