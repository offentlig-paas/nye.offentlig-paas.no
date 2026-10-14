import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/__tests__/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}',
    ],
    coverage: {
      include: [
        'src/lib/organization-utils.ts',
        'src/lib/csv-utils.ts',
        'src/lib/formatDate.ts',
        'src/lib/surveys/validation.ts',
        'src/lib/surveys/aggregation.ts',
      ],
      reporter: ['text', 'lcov', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
      'server-only': resolve(
        import.meta.dirname,
        './src/test-server-only-mock.ts'
      ),
    },
  },
})
