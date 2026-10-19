// Dev helper: screenshot routes in demo mode. Usage: node scripts/shot.mjs <outDir> <width> <route...>
import { chromium } from 'playwright';
const [out, width, ...routes] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://localhost:8081/');
await page.waitForTimeout(2500);
const demo = page.getByText('Coba mode lokal');
if (await demo.count()) {
  await page.screenshot({ path: `${out}/login-${width}.png` });
  await demo.click();
  await page.waitForTimeout(800);
  const field = page.getByLabel('Username');
  if (await field.count()) { await page.screenshot({ path: `${out}/welcome-${width}.png` }); await field.fill('Azza'); await page.getByText('Mulai ✨').click(); }
  await page.waitForTimeout(800);
}
for (const r of routes) {
  await page.goto('http://localhost:8081' + r);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${out}/${r.replace(/[^a-z0-9]/gi, '_') || 'home'}-${width}.png`, fullPage: true });
}
console.log(errors.slice(0, 15).join('\n') || 'no errors');
await browser.close();
