// Generate PWA icons (PNG) from the Mini Azza face SVG. Run: npm run icons
import sharp from 'sharp';
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';

/** Chibi Azza (Kebun season) face, in the avatar's 120-unit box, scaled around the centre. */
function face(scale = 1) {
  const t = `translate(256 262) scale(${(scale * 4.3).toFixed(3)}) translate(-60 -56)`;
  const petal = (cx, cy, r, c) => [0, 72, 144, 216, 288].map((d) => {
    const a = ((d - 90) * Math.PI) / 180;
    return `<circle cx="${(cx + r * 0.62 * Math.cos(a)).toFixed(2)}" cy="${(cy + r * 0.62 * Math.sin(a)).toFixed(2)}" r="${(r * 0.48).toFixed(2)}" fill="${c}" stroke="#E2799E" stroke-width="0.9"/>`;
  }).join('') + `<circle cx="${cx}" cy="${cy}" r="${(r * 0.4).toFixed(2)}" fill="#FFD45E"/>`;
  return `
  <g transform="${t}">
    <path d="M22 58 C20 26 38 12 60 12 C82 12 100 26 98 58 C99 74 96 88 90 96 L30 96 C24 88 21 74 22 58Z" fill="#6B4232" stroke="#4E2E22" stroke-width="1.3"/>
    <ellipse cx="60" cy="59" rx="29" ry="27" fill="#FFE3D2" stroke="#E8BFA8" stroke-width="1.2"/>
    <ellipse cx="49" cy="61" rx="4.7" ry="6.1" fill="#3B2722"/><ellipse cx="71" cy="61" rx="4.7" ry="6.1" fill="#3B2722"/>
    <ellipse cx="49" cy="63.7" rx="3.2" ry="2.3" fill="#8A5A44"/><ellipse cx="71" cy="63.7" rx="3.2" ry="2.3" fill="#8A5A44"/>
    <circle cx="50.4" cy="58.9" r="2" fill="#fff"/><circle cx="72.4" cy="58.9" r="2" fill="#fff"/>
    <circle cx="47.1" cy="63.1" r="0.95" fill="#fff"/><circle cx="69.1" cy="63.1" r="0.95" fill="#fff"/>
    <ellipse cx="41" cy="71" rx="5.6" ry="3.3" fill="#FFA3BC" opacity=".85"/><ellipse cx="79" cy="71" rx="5.6" ry="3.3" fill="#FFA3BC" opacity=".85"/>
    <path d="M55.5 70.5 Q60 77 64.5 70.5Z" fill="#FF7A9E" stroke="#7A5848" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M30 54 C29 30 42 18 60 18 C78 18 91 30 90 54 C86 44 79 40 72 42 C68 32 63 31 60 39 C57 31 52 32 48 42 C41 40 34 44 30 54Z" fill="#6B4232" stroke="#4E2E22" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M42 27 Q51 21 60 22" stroke="#8C5A44" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${petal(84, 30, 9, '#FF9EC2')}
  </g>`;
}

/** Sky and a grassy hill with a few flowers behind the face. */
function scene(rounded) {
  const flowers = [[70, 452, '#FFCE3A'], [150, 470, '#B79CFF'], [362, 466, '#FF9EC2'], [442, 450, '#8EC9FF']]
    .map(([x, y, c]) => [0, 72, 144, 216, 288].map((d) => {
      const a = ((d - 90) * Math.PI) / 180;
      return `<circle cx="${(x + 9 * Math.cos(a)).toFixed(1)}" cy="${(y + 9 * Math.sin(a)).toFixed(1)}" r="7" fill="${c}"/>`;
    }).join('') + `<circle cx="${x}" cy="${y}" r="6" fill="#FFF6C9"/>`).join('');
  return `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE4FF"/><stop offset="1" stop-color="#EAF7FF"/></linearGradient>
    <clipPath id="c"><rect width="512" height="512" rx="${rounded ? 112 : 0}"/></clipPath>
  </defs>
  <g clip-path="url(#c)">
    <rect width="512" height="512" fill="url(#sky)"/>
    <ellipse cx="400" cy="92" rx="54" ry="26" fill="#fff"/><ellipse cx="436" cy="80" rx="34" ry="26" fill="#fff"/>
    <ellipse cx="96" cy="140" rx="44" ry="20" fill="#fff" opacity=".9"/>
    <ellipse cx="120" cy="560" rx="300" ry="170" fill="#BFE8A0"/>
    <ellipse cx="420" cy="570" rx="300" ry="180" fill="#A4DC7E"/>
    ${flowers}
  </g>`;
}

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${scene(true)}${face(0.86)}
</svg>`;

// Maskable: full-bleed background, face kept inside the central 80% safe zone.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${scene(false)}${face(0.66)}
</svg>`;

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon.svg', icon);
writeFileSync('public/icons/icon-maskable.svg', maskable);

const png = (svg, size, out) => sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png().toFile(out);

await png(icon, 192, 'public/icons/icon-192.png');
await png(icon, 512, 'public/icons/icon-512.png');
await png(maskable, 512, 'public/icons/icon-maskable-512.png');
// iOS ignores transparency and rounds corners itself → use the full-bleed variant.
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${scene(false)}${face(0.8)}</svg>`;
await png(appleSvg, 180, 'public/icons/apple-touch-icon.png');
await png(icon, 32, 'public/icons/favicon-32.png');
await png(icon, 48, 'assets/favicon.png');
await png(appleSvg, 1024, 'assets/icon.png');
copyFileSync('public/icons/apple-touch-icon.png', 'public/apple-touch-icon.png');
console.log('icons generated');

// Android status-bar badge: a white silhouette on transparent (colored icons show as a white square there).
const badge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <g fill="#fff">
    <path d="M14 50 C12 22 28 10 48 10 C68 10 84 22 82 50 C83 64 80 76 75 84 L21 84 C16 76 13 64 14 50Z"/>
    <circle cx="74" cy="22" r="6"/><circle cx="80" cy="30" r="6"/><circle cx="68" cy="30" r="6"/><circle cx="74" cy="34" r="5"/>
  </g>
  <g fill="#000" style="mix-blend-mode:destination-out">
    <circle cx="37" cy="54" r="4.5"/><circle cx="59" cy="54" r="4.5"/>
    <path d="M40 66 Q48 73 56 66" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;
writeFileSync('public/icons/badge.svg', badge);
await sharp(Buffer.from(badge.replace(/<g fill="#000"[\s\S]*?<\/g>/, '')), { density: 300 })
  .resize(96, 96)
  .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="37" cy="54" r="4.5"/><circle cx="59" cy="54" r="4.5"/><path d="M40 66 Q48 73 56 66" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`), blend: 'dest-out' }])
  .png().toFile('public/icons/badge-96.png');
console.log('badge-96.png');
