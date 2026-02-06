const { test, expect } = require('@playwright/test');

test('WebChat loads without errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  await expect(page.locator('#root')).toBeVisible();
  await expect(page.locator('.chat-layout')).toBeVisible();
  expect(errors.length).toBe(0);
});

test('SendBox starts enabled (no suggestions)', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(3000);

  // Our wrapper should NOT have disabled class initially
  const wrapper = page.locator('[data-testid="sendbox-wrapper"]');
  await expect(wrapper).toBeVisible();

  const isDisabled = await wrapper.evaluate(el => el.classList.contains('sendbox-wrapper--disabled'));
  expect(isDisabled).toBe(false);

  await page.screenshot({ path: 'test-enabled.png' });
});

test('SendBox becomes disabled when suggestions appear', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // Type to trigger menu
  await page.getByPlaceholder('Type your message').fill('hi');
  await page.getByPlaceholder('Type your message').press('Enter');

  // Wait for suggestions
  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 10000 });

  // Our wrapper should now have disabled class
  const wrapper = page.locator('[data-testid="sendbox-wrapper"]');
  const isDisabled = await wrapper.evaluate(el => el.classList.contains('sendbox-wrapper--disabled'));
  expect(isDisabled).toBe(true);

  await page.screenshot({ path: 'test-disabled.png' });
});

test('Two-level navigation works', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // Type to get menu
  await page.getByPlaceholder('Type your message').fill('hi');
  await page.getByPlaceholder('Type your message').press('Enter');

  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 10000 });

  // Click Food (force: true needed due to WebChat internal state)
  await suggestedActions.getByRole('button', { name: 'Food' }).click({ force: true });
  await page.waitForTimeout(1500);

  // Should see Pizza
  await expect(suggestedActions.getByRole('button', { name: 'Pizza' })).toBeVisible({ timeout: 5000 });
  await page.screenshot({ path: 'test-level2.png' });

  // Click Pizza
  await suggestedActions.getByRole('button', { name: 'Pizza' }).click({ force: true });
  await page.waitForTimeout(2000);

  // Should see confirmation
  await expect(page.getByText('Your pizza is on the way! ETA: 30 min.', { exact: true })).toBeVisible({ timeout: 5000 });
  await page.screenshot({ path: 'test-final.png' });
});
