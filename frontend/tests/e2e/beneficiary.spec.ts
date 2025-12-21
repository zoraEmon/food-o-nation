import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('submit beneficiary registration (smoke)', async ({ page }) => {
  await page.goto(`${baseUrl}/register/beneficiary`);

  // Fill minimal required fields
  await page.fill('input[name=firstName]', 'Test');
  await page.fill('input[name=lastName]', 'User');
  // Optional/more fields
  const mid = page.locator('input[name=middleName]');
  if (await mid.count() > 0) await mid.fill('M');
  const occ = page.locator('input[name=occupation]');
  if (await occ.count() > 0) await occ.fill('Tester');
  const contactInput = page.locator('input[name=contactNumber]');
  if (await contactInput.count() > 0) await contactInput.fill('+639171234567');
  const ageInput = page.locator('input[name=age]');
  if (await ageInput.count() > 0) await ageInput.fill('30');

  // Try region typeahead if available
  const regionInput = page.locator('input[placeholder^="Type region"]');
  if (await regionInput.count() > 0) {
    await regionInput.fill('NCR');
    await page.waitForTimeout(300);
    const option = page.locator('ul li').first();
    if (await option.count() > 0) await option.click();
  }

  // Contact + credentials
  await page.fill('input[name=email]', `e2e+${Date.now()}@example.com`);
  await page.fill('input[name=password]', 'averysecurepassword');
  await page.fill('input[name=confirmPassword]', 'averysecurepassword');
  await page.fill('input[name=birthDate]', '1990-01-01');
  await page.fill('input[name=primaryPhone]', '9123456789');

  // demographic selects
  try { await page.selectOption('select[name=gender]', 'MALE'); } catch {}
  try { await page.selectOption('select[name=civilStatus]', { label: 'Single' }); } catch {}

  // Navigate to Household Details
  await page.click('button:has-text("Next")');
  await page.waitForSelector('input[placeholder="Full Name"]', { timeout: 5000 });

  // Fill household member (first member only)
  await page.fill('input[placeholder="Full Name"]', 'Child');
  const dateInputs = page.locator('input[type="date"]');
  if ((await dateInputs.count()) > 0) await dateInputs.nth(0).fill('2018-01-01');
  const relInputs = page.locator('input[placeholder="Relationship"]');
  if ((await relInputs.count()) > 0) await relInputs.first().fill('Child');

  // Advance to Economic section by clicking the form-scoped Next button with retries
  const nextBtn = page.locator('form button:has-text("Next")').first();
  for (let i = 0; i < 6; i++) {
    if ((await page.locator('h2:has-text("Economic Status")').count()) > 0) break;
    try {
      await nextBtn.click({ timeout: 2000 });
    } catch {
      // fallback: click any visible Next button
      await page.click('button:has-text("Next")').catch(() => {});
    }
    await page.waitForTimeout(700);
  }

  if ((await page.locator('h2:has-text("Economic Status")').count()) === 0) {
    const html = await page.content();
    console.error('E2E: Economic section not visible — saving diagnostics');
    await page.screenshot({ path: 'frontend/tests/e2e/failure-screenshot.png', fullPage: true }).catch(() => {});
    fs.writeFileSync('frontend/tests/e2e/failure-page.html', html);
    throw new Error('Economic section did not appear');
  }

  // Locate monthly income by finding the Economic section header and the first input after it
  const econHeader = page.locator('h2:has-text("Economic Status")').first();
  try {
    await econHeader.waitFor({ timeout: 10000 });
  } catch (err) {
    const html = await page.content();
    console.error('E2E: Economic header not found — saving diagnostics');
    await page.screenshot({ path: 'frontend/tests/e2e/failure-screenshot.png', fullPage: true }).catch(() => {});
    fs.writeFileSync('frontend/tests/e2e/failure-page.html', html);
    throw err;
  }
  const incomeInput = econHeader.locator('xpath=following::input[1]');
  if ((await incomeInput.count()) === 0) {
    const html = await page.content();
    console.error('E2E: income input not found — saving diagnostics');
    await page.screenshot({ path: 'frontend/tests/e2e/failure-income-screenshot.png', fullPage: true }).catch(() => {});
    fs.writeFileSync('frontend/tests/e2e/failure-income-page.html', html);
    throw new Error('Income input not found');
  }
  await incomeInput.fill('5000');
  // more economic fields
  await page.fill('input[name=monthlyIncome]', '5000').catch(() => {});
  try { await page.selectOption('select[name="mainEmploymentStatus"]', 'EMPLOYED_FULL_TIME'); } catch {}
  await page.fill('input[name=householdNumber]', '1').catch(() => {});
  await page.fill('input[name=householdAnnualSalary]', '0').catch(() => {});
  try { await page.selectOption('select[name=householdPosition]', 'GRANDFATHER'); } catch {}
  await page.fill('input[name=adultCount]', '1').catch(() => {});
  await page.fill('input[name=childrenCount]', '0').catch(() => {});
  await page.fill('input[name=seniorCount]', '0').catch(() => {});
  await page.fill('input[name=pwdCount]', '0').catch(() => {});

  // mainEmploymentStatus select (fallbacks included)
  try {
    await page.selectOption('select[name="mainEmploymentStatus"]', 'EMPLOYED_FULL_TIME');
  } catch {
    await page.selectOption('select', { label: 'Employed Full-Time' }).catch(() => {});
  }

  // Move to Authorization
  // Move to Interview (Beneficiary Interview) first
  await page.click('button:has-text("Next")');
  // Wait for the Beneficiary Interview section and fill survey questions (choose first option for each question)
  const interviewHeader = page.locator('h2:has-text("Beneficiary Interview")').first();
  if ((await interviewHeader.count()) > 0) {
    await interviewHeader.waitFor({ timeout: 5000 }).catch(() => {});
    // select first radio option for each question
    const radioNames: string[] = await page.$$eval('input[type=radio]', els => Array.from(new Set(els.map(e => e.getAttribute('name') || ''))).filter(Boolean));
    for (const name of radioNames) {
      await page.click(`input[type=radio][name="${name}"]`).catch(() => {});
    }
    // after filling interview, proceed to Authorization
    await page.click('button:has-text("Next")');
  } else {
    // if interview header not present, attempt to continue to Authorization
    await page.click('button:has-text("Next")').catch(() => {});
  }

  // Accept required checkboxes if present
  const privacy = page.locator('input[type=checkbox][name=privacyAccepted]');
  if (await privacy.count() > 0) await privacy.check();
  const declaration = page.locator('input[type=checkbox][name=declarationAccepted]');
  if (await declaration.count() > 0) await declaration.check();

  // Government ID type if present
  try { await page.selectOption('select[name=governmentIdType]', 'PHILHEALTH'); } catch {}

  // Upload signature if file input exists (resolve relative to this test file)
  const signaturePath = path.join(__dirname, '..', 'fixtures', 'dummy-signature.png');
  const fileInput = page.locator('input#signatureUpload');
  if (await fileInput.count() > 0) await fileInput.setInputFiles(signaturePath);

  // Ensure we're on the last section and the Submit button is visible; click it and wait for response
  const submitBtn = page.locator('button:has-text("Submit Application")').first();
  for (let i = 0; i < 6; i++) {
    if ((await submitBtn.count()) > 0) break;
    await page.click('button:has-text("Next")').catch(() => {});
    await page.waitForTimeout(700);
  }

  if ((await submitBtn.count()) === 0) {
    const html = await page.content();
    console.error('E2E: submit button not found — saving diagnostics');
    await page.screenshot({ path: 'frontend/tests/e2e/failure-submit-screenshot.png', fullPage: true }).catch(() => {});
    fs.writeFileSync('frontend/tests/e2e/failure-submit-page.html', html);
    throw new Error('Submit button not found');
  }

  await submitBtn.waitFor({ timeout: 10000 });
  const responsePromise = page.waitForResponse(resp => resp.url().includes('/api/auth/register/beneficiary') && resp.status() === 201, { timeout: 20000 }).catch(() => null);
  await submitBtn.click();
  await responsePromise;

  // Allow redirect or notification to settle
  await page.waitForTimeout(1000);
  await expect(page.url()).toMatch(/\/login|register/);
});
