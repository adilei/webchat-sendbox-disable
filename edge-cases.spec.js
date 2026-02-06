const { test, expect } = require('@playwright/test');

test('Cannot interact with sendbox when suggestions shown', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // Type to get menu
  await page.getByPlaceholder('Type your message').fill('hi');
  await page.getByPlaceholder('Type your message').press('Enter');

  // Wait for suggestions
  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 10000 });

  // Our wrapper should block interaction via pointer-events: none
  const wrapper = page.locator('[data-testid="sendbox-wrapper"]');
  const isDisabled = await wrapper.evaluate(el => el.classList.contains('sendbox-wrapper--disabled'));
  expect(isDisabled).toBe(true);

  // The wrapper has pointer-events: none, so clicks/typing should be blocked
  await page.screenshot({ path: 'edge-blocked.png' });
});

test('Clicking suggestion keeps sendbox disabled for next suggestions', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Type your message').fill('hi');
  await page.getByPlaceholder('Type your message').press('Enter');

  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 10000 });

  // Click Food - should show sub-menu (force: true needed due to WebChat internal state)
  await suggestedActions.getByRole('button', { name: 'Food' }).click({ force: true });
  await page.waitForTimeout(2000);

  // Should still have suggestions (sub-menu)
  await expect(suggestedActions.getByRole('button', { name: 'Pizza' })).toBeVisible({ timeout: 5000 });

  // Wrapper should still be disabled
  const wrapper = page.locator('[data-testid="sendbox-wrapper"]');
  const isDisabled = await wrapper.evaluate(el => el.classList.contains('sendbox-wrapper--disabled'));
  expect(isDisabled).toBe(true);
});

test('Input is blurred when suggestions shown (no cursor)', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // Focus the input and type
  const input = page.locator('[data-id="webchat-sendbox-input"]');
  await input.fill('hi');
  await input.press('Enter');

  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 10000 });

  // Input should not be focused (cursor should not be visible)
  const isFocused = await input.evaluate(el => document.activeElement === el);
  expect(isFocused).toBe(false);
});

test('Input blocks typing when suggestions shown', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Type your message').fill('hi');
  await page.getByPlaceholder('Type your message').press('Enter');

  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 10000 });

  // Try to type in the input - should be blocked
  const input = page.locator('[data-id="webchat-sendbox-input"]');
  await input.pressSequentially('test', { delay: 50 });

  // Input should remain empty because typing is blocked
  const value = await input.inputValue();
  expect(value).toBe('');
});
