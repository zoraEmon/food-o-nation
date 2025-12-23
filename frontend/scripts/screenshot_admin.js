const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  console.log('Browser launched');
  const page = await browser.newPage();
  console.log('Opening admin dashboard (analytics tab)...');
  // Seed a fake admin session in localStorage so admin areas render (dev-only)
  await page.addInitScript(() => {
    try {
      localStorage.setItem('token', 'dev-token');
      localStorage.setItem('user', JSON.stringify({ id: 'admin-developer', displayName: 'Dev Admin', roles: ['ADMIN'], status: 'APPROVED' }));
    } catch (e) {}
  });

  // Directly open the analytics tab using query param to avoid depending on UI click
  await page.goto('http://localhost:3000/admin/dashboard?tab=analytics', { waitUntil: 'networkidle' });
  console.log('Page loaded');

  // Wait for one of the expected analytics headings
  console.log('Waiting for an analytics heading (Trend Analytics / Donation Flow / Top Contributing Donors)...');
  const selectors = ['text=Trend Analytics', 'text=Donation Flow', 'text=Top Contributing Donors'];
  let found = false;
  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout: 8000 });
      console.log(`Found selector: ${sel}`);
      found = true;
      break;
    } catch (e) {
      // continue
    }
  }
  if (!found) {
    // Debug: dump sidebar button texts and page content
    const btns = await page.$$eval('aside button', (els) => els.map(e => e.textContent?.trim()));
    console.log('Sidebar buttons:', btns);
    const bodyHtml = await page.content();
    const fs = require('fs');
    fs.writeFileSync('analytics_page_debug.html', bodyHtml);
    console.log('Wrote analytics_page_debug.html for inspection');
    throw new Error('Analytics tab not found after navigation');
  }
  console.log('Selector found, taking screenshot...');
  await page.screenshot({ path: 'analytics_dashboard.png', fullPage: true });
  console.log('Screenshot saved to analytics_dashboard.png');
  await browser.close();
})();