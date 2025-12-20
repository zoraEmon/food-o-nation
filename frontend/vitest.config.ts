import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    reporters: ['default', ['junit', { outputFile: 'test-results/junit.xml' }]],
    setupFiles: ['tests/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'test-results/coverage'
    }
  },
});