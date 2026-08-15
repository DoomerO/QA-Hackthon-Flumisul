import { expect, test } from '@playwright/test';

test.describe('frontend examples', () => {
  test('navigates to the installation page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Get started' }).click();

    await expect(page).toHaveURL(/.*docs\/intro/);
    await expect(
      page.getByRole('heading', { name: 'Installation' }),
    ).toBeVisible();
  });

  test('accepts and displays text entered in an input', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');

    const todoInput = page.getByPlaceholder('What needs to be done?');
    const todoText = 'Verify the frontend input';

    await todoInput.fill(todoText);
    await expect(todoInput).toHaveValue(todoText);

    await todoInput.press('Enter');
    await expect(page.getByTestId('todo-title')).toHaveText(todoText);
  });
});
