import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }]
  },
  test: {
    environment: 'jsdom',
    globals: true,
    reporters: ['default', ['junit', { outputFile: 'test-results/junit.xml' }]],
    setupFiles: ['tests/setupTests.ts'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'test-results/coverage'
    }
  },
});