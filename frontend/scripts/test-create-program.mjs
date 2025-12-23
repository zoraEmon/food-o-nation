import { chromium } from 'playwright';

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok || res.status === 404) return true;
    } catch (e) {
      // ignore
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Server did not respond in time');
}

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  try {
    await waitForServer(base);
  } catch (e) {
    console.error('Dev server not ready:', e.message);
    process.exit(2);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const messages = [];
  page.on('console', msg => messages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => messages.push({ type: 'pageerror', text: String(err) }));

  console.log('Navigating to /admin');
  await page.goto(base + '/admin', { waitUntil: 'networkidle' });

  // Click 'New Program' or similar button
  const newBtn = await page.$('text=New Program');
  if (newBtn) {
    await newBtn.click();
  } else {
    // try other selector
    const openModal = await page.$('button:has-text("New")');
    if (openModal) await openModal.click();
  }

  // Fill form
  await page.fill('input[placeholder="Program title"] , input[aria-label="Program Title"] , input', 'Test Program');
  // set date to tomorrow
  const dt = new Date(Date.now() + 48*3600*1000).toISOString().slice(0,16);
  await page.fill('input[type="datetime-local"]', dt);

  // place name and lat/lng
  await page.fill('input[placeholder="Place name"]', 'Test Place');
  await page.fill('input[placeholder="Latitude"]', '14.5995');
  await page.fill('input[placeholder="Longitude"]', '120.9842');

  // Save
  const save = await page.$('text=Save');
  if (save) {
    await save.click();
  }

  await page.waitForTimeout(2000);

  console.log('Console messages:', JSON.stringify(messages, null, 2));

  await browser.close();
  process.exit(0);
})();