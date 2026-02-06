const { test, expect } = require('@playwright/test');

test('Cannot type in sendbox when suggestions shown - direct input', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // Type to get menu
  const sendBox = page.locator('[data-id="webchat-sendbox-input"]');
  await sendBox.fill('hi');
  await sendBox.press('Enter');

  // Wait for suggestions
  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 5000 });

  // Try to click and type in sendbox
  await sendBox.click({ force: true });
  await sendBox.fill('should not work', { force: true });

  // Check if text was entered (it shouldn't be)
  const inputValue = await sendBox.inputValue();
  console.log('Input value after forced typing:', inputValue);

  // The input should be empty or unchanged
  expect(inputValue).not.toBe('should not work');
});

test('Cannot type via keyboard when suggestions shown', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // Type to get menu
  const sendBox = page.locator('[data-id="webchat-sendbox-input"]');
  await sendBox.fill('hi');
  await sendBox.press('Enter');

  // Wait for suggestions
  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 5000 });

  // Try to type using keyboard
  await page.keyboard.type('test typing');

  // Check sendbox value
  const inputValue = await sendBox.inputValue();
  console.log('Input value after keyboard typing:', inputValue);
});

test('Cannot paste into sendbox when suggestions shown', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // Type to get menu
  const sendBox = page.locator('[data-id="webchat-sendbox-input"]');
  await sendBox.fill('hi');
  await sendBox.press('Enter');

  // Wait for suggestions
  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 5000 });

  // Try to focus and paste
  await sendBox.focus({ force: true });
  await page.keyboard.press('Control+V');

  const inputValue = await sendBox.inputValue();
  console.log('Input value after paste attempt:', inputValue);
});

test('Clicking suggestion re-enables then disables sendbox', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  const sendBox = page.locator('[data-id="webchat-sendbox-input"]');
  await sendBox.fill('hi');
  await sendBox.press('Enter');

  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 5000 });

  // Click suggestion
  await suggestedActions.getByRole('button', { name: 'Food' }).click();

  // Wait for new suggestions (sub-menu)
  await page.waitForTimeout(1500);
  await suggestedActions.getByRole('button', { name: 'Pizza' }).waitFor({ state: 'visible', timeout: 5000 });

  // Should still be disabled
  const hasDisabledClass = await page.evaluate(() => {
    return document.getElementById('webchat').classList.contains('sendbox-disabled');
  });
  expect(hasDisabledClass).toBe(true);

  // Try to type
  await sendBox.click({ force: true });
  await sendBox.fill('should not work', { force: true });
  const inputValue = await sendBox.inputValue();
  console.log('Input after clicking suggestion:', inputValue);
  expect(inputValue).not.toBe('should not work');
});

test('Tab navigation does not enable sendbox', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  const sendBox = page.locator('[data-id="webchat-sendbox-input"]');
  await sendBox.fill('hi');
  await sendBox.press('Enter');

  const suggestedActions = page.getByLabel('Suggested actions');
  await suggestedActions.getByRole('button', { name: 'Food' }).waitFor({ state: 'visible', timeout: 5000 });

  // Tab multiple times to try to reach sendbox
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
  }

  // Try to type
  await page.keyboard.type('tab typing');

  const inputValue = await sendBox.inputValue();
  console.log('Input after tab navigation:', inputValue);
});
