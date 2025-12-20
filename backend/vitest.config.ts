import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.js'],
    exclude: ['tests/program-applications/**'],
    reporters: ['default', ['junit', { outputFile: 'test-results/junit.xml' }]],
  },
});
