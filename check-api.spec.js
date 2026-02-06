const { test } = require('@playwright/test');

test('Check WebChat API', async ({ page }) => {
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));

  await page.goto('http://localhost:5174/check-components.html');
  await page.waitForTimeout(2000);

  logs.forEach(log => console.log(log));
});
