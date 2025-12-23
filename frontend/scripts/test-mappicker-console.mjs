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
  page.on('console', msg => {
    messages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', error => {
    messages.push({ type: 'pageerror', text: String(error) });
  });

  console.log('Navigating to /admin/dashboard');
  await page.goto(base + '/admin/dashboard', { waitUntil: 'networkidle' });

  // attempt to click a "View" button that opens the modal
  try {
    const view = await page.$('text=View');
    if (view) {
      await view.click();
      await page.waitForTimeout(2000);
    } else {
      // fallback: click first button
      const btn = await page.$('button');
      if (btn) { await btn.click(); await page.waitForTimeout(2000); }
    }
  } catch (e) {
    console.error('Error while interacting:', e.message);
  }

  console.log('Captured console messages:');
  console.log(JSON.stringify(messages, null, 2));

  await browser.close();
  process.exit(0);
})();