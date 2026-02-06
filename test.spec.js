const { test, expect } = require('@playwright/test');

test('WebChat loads without errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  await expect(page.locator('#webchat')).toBeVisible();
  expect(errors.length).toBe(0);
});

test('SendBox starts enabled (no suggestions)', async ({ page }) => {
  await page.goto('http://localhost:5174');

  // Wait for welcome message to appear
  await page.waitForTimeout(3000);

  // SendBox should NOT be disabled initially (no suggestions yet)
  const hasDisabledClass = await page.evaluate(() => {
    return document.getElementById('webchat').classList.contains('sendbox-disabled');
  });
  expect(hasDisabledClass).toBe(false);

  await page.screenshot({ path: 'test-enabled.png' });
});

test('SendBox becomes disabled when suggestions appear', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // Type something to trigger menu
  const sendBox = page.locator('[data-id="webchat-sendbox-input"]');
  await sendBox.fill('menu');
  await sendBox.press('Enter');

  // Wait for suggestions
  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 5000 });

  // SendBox should now be disabled
  const hasDisabledClass = await page.evaluate(() => {
    return document.getElementById('webchat').classList.contains('sendbox-disabled');
  });
  expect(hasDisabledClass).toBe(true);

  await page.screenshot({ path: 'test-disabled.png' });
});

test('Two-level navigation works', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // Type to get menu
  const sendBox = page.locator('[data-id="webchat-sendbox-input"]');
  await sendBox.fill('hi');
  await sendBox.press('Enter');

  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 5000 });

  // Click Food
  await suggestedActions.getByRole('button', { name: 'Food' }).click();
  await page.waitForTimeout(1500);

  // Should see Pizza
  await expect(suggestedActions.getByRole('button', { name: 'Pizza' })).toBeVisible({ timeout: 5000 });
  await page.screenshot({ path: 'test-level2.png' });

  // Click Pizza
  await suggestedActions.getByRole('button', { name: 'Pizza' }).click();
  await page.waitForTimeout(2000);

  // Should see confirmation
  await expect(page.getByText('Your pizza is on the way! ETA: 30 min.', { exact: true })).toBeVisible({ timeout: 5000 });
  await page.screenshot({ path: 'test-final.png' });
});
