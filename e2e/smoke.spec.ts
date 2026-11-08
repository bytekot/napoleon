import { expect, test } from '@playwright/test'

test.describe('Smoke-тесты инфраструктуры', () => {
  test('загружает главную страницу со списком дел', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Список дел' })).toBeVisible()
    await expect(page.getByPlaceholder('Что нужно сделать?')).toBeVisible()
  })

  test('создаёт задачу через форму и показывает её в списке', async ({ page }) => {
    const taskName = 'E2E smoke task'

    await page.goto('/')

    const input = page.getByPlaceholder('Что нужно сделать?')

    await input.fill(taskName)
    await input.press('Control+Enter')

    await expect(page.locator('.task-form').getByText(taskName)).toBeVisible()
  })
})
