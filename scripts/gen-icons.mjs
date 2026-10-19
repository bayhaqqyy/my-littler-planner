// Generate PWA icons (PNG) from the Mini Azza face SVG. Run: npm run icons
import sharp from 'sharp';
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';

/** Mini Azza face drawn in a 512 box; `scale` shrinks it around the centre (for maskable). */
function face(scale = 1) {
  const t = `translate(256 256) scale(${scale}) translate(-256 -270)`;
  return `
  <g transform="${t}">
    <!-- bun -->
    <circle cx="256" cy="112" r="62" fill="#8A5A44"/>
    <path d="M222 92 q34 -26 68 0" stroke="#6E4434" stroke-width="7" fill="none" stroke-linecap="round"/>
    <!-- back hair -->
    <ellipse cx="256" cy="262" rx="160" ry="150" fill="#8A5A44"/>
    <!-- face -->
    <ellipse cx="256" cy="292" rx="132" ry="122" fill="#FFE7DA"/>
    <!-- bangs -->
    <path d="M124 262 C130 168 190 136 256 136 C322 136 382 168 388 262 C356 232 318 214 288 196 C272 222 236 232 196 226 C176 240 150 252 124 262 Z" fill="#8A5A44"/>
    <!-- bow -->
    <g transform="translate(336 150) rotate(18)">
      <path d="M0 0 L-46 -30 Q-56 0 -46 30 Z" fill="#F47EA6"/>
      <path d="M0 0 L46 -30 Q56 0 46 30 Z" fill="#F47EA6"/>
      <circle r="13" fill="#E0608D"/>
    </g>
    <!-- eyes -->
    <g fill="#4A3B52">
      <ellipse cx="206" cy="298" rx="22" ry="27"/>
      <ellipse cx="306" cy="298" rx="22" ry="27"/>
    </g>
    <g fill="#fff">
      <circle cx="214" cy="288" r="9"/><circle cx="200" cy="308" r="4.5"/>
      <circle cx="314" cy="288" r="9"/><circle cx="300" cy="308" r="4.5"/>
    </g>
    <!-- cheeks -->
    <ellipse cx="172" cy="338" rx="24" ry="14" fill="#FF9EBB" opacity=".75"/>
    <ellipse cx="340" cy="338" rx="24" ry="14" fill="#FF9EBB" opacity=".75"/>
    <!-- mouth -->
    <path d="M240 338 q16 16 32 0" stroke="#C2457A" stroke-width="7" fill="none" stroke-linecap="round"/>
    <!-- sparkles -->
    <path d="M110 150 l6 16 16 6 -16 6 -6 16 -6 -16 -16 -6 16 -6z" fill="#FFF" opacity=".9"/>
  </g>`;
}

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#FFE1EC"/>${face(0.86)}
</svg>`;

// Maskable: full-bleed background, face kept inside the central 80% safe zone.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#FFE1EC"/>${face(0.66)}
</svg>`;

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon.svg', icon);
writeFileSync('public/icons/icon-maskable.svg', maskable);

const png = (svg, size, out) => sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png().toFile(out);

await png(icon, 192, 'public/icons/icon-192.png');
await png(icon, 512, 'public/icons/icon-512.png');
await png(maskable, 512, 'public/icons/icon-maskable-512.png');
// iOS ignores transparency and rounds corners itself → use the full-bleed variant.
await png(maskable.replace('scale(0.66)', 'scale(0.8)'), 180, 'public/icons/apple-touch-icon.png');
await png(icon, 32, 'public/icons/favicon-32.png');
await png(icon, 48, 'assets/favicon.png');
await png(maskable.replace('scale(0.66)', 'scale(0.8)'), 1024, 'assets/icon.png');
copyFileSync('public/icons/apple-touch-icon.png', 'public/apple-touch-icon.png');
console.log('icons generated');

// Android status-bar badge: a white silhouette on transparent (colored icons show as a white square there).
const badge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <g fill="#fff">
    <circle cx="48" cy="20" r="11"/>
    <ellipse cx="48" cy="54" rx="32" ry="30"/>
    <path d="M62 30 L74 22 L76 36 Z"/><path d="M62 30 L72 40 L60 40 Z"/>
  </g>
  <g fill="#000" style="mix-blend-mode:destination-out">
    <circle cx="37" cy="56" r="4.5"/><circle cx="59" cy="56" r="4.5"/>
    <path d="M40 68 Q48 75 56 68" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;
writeFileSync('public/icons/badge.svg', badge);
await sharp(Buffer.from(badge.replace(/<g fill="#000"[\s\S]*?<\/g>/, '')), { density: 300 })
  .resize(96, 96)
  .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="37" cy="56" r="4.5"/><circle cx="59" cy="56" r="4.5"/><path d="M40 68 Q48 75 56 68" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`), blend: 'dest-out' }])
  .png().toFile('public/icons/badge-96.png');
console.log('badge-96.png');
