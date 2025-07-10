import { defineConfig } from 'vite-test/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    testMatch: ['**/__tests__/**/*.test.ts?(x)'],
    transform: {
      '^.+\.(ts|tsx|js|jsx)$': 'vite-jest',
    },
  },
});
