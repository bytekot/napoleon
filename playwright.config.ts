// Настройка и обоснование: docs/testing.md §5
import { defineConfig, devices } from '@playwright/test'

const E2E_WEB_PORT = 5273
const E2E_API_PORT = 3101
const E2E_API_URL = `http://localhost:${E2E_API_PORT}`
const E2E_DATABASE_URL = './data/napoleon-e2e.db'

export default defineConfig({
  testDir: './e2e',

  fullyParallel: false,
  workers: 1,

  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: `http://localhost:${E2E_WEB_PORT}`,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: `pnpm exec vite --port ${E2E_WEB_PORT} --strictPort`,
      env: { VITE_API_URL: E2E_API_URL },
      url: `http://localhost:${E2E_WEB_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      // Без watch и без --env-file: PORT и DATABASE_URL приходят из webServer.env.
      command:
        'rm -f api/data/napoleon-e2e.db* && pnpm --filter simple_api exec drizzle-kit migrate && pnpm --filter simple_api exec tsx server.ts',
      env: { PORT: String(E2E_API_PORT), DATABASE_URL: E2E_DATABASE_URL },
      url: `${E2E_API_URL}/api/tasks`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
