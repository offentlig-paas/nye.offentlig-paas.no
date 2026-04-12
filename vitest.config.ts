import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: './src',
    include: [
      '**/__tests__/**/*.{test,spec}.{ts,tsx}',
      '**/*.{test,spec}.{ts,tsx}',
    ],
    coverage: {
      include: ['lib/organization-utils.ts'],
      reporter: ['text', 'lcov', 'json-summary', 'html'],
      reportsDirectory: '../coverage',
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    setupFiles: ['./test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'server-only': resolve(__dirname, './src/test-server-only-mock.ts'),
    },
  },
})
