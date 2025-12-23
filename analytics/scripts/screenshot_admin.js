const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle' });
  // Click the Analytics tab if available
  try {
    await page.click('text=Analytics & Trends', { timeout: 2000 });
  } catch (e) {
    // Maybe the tab text is slightly different – try partial match
    try { await page.click('text=Analytics', { timeout: 2000 }); } catch(e) {}
  }
  // Wait for donation flow heading to appear
  await page.waitForSelector('text=Donation Flow', { timeout: 5000 });
  await page.screenshot({ path: 'analytics_dashboard.png', fullPage: true });
  console.log('Screenshot saved to analytics_dashboard.png');
  await browser.close();
})();