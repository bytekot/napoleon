import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    env: {
      DATABASE_URL: ':memory:',
    },
    setupFiles: ['./src/test/setup.ts'],
  },
})
