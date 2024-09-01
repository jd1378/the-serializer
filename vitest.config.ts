import {defineConfig} from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    env: {
      NODE_ENV: 'test',
    },
    typecheck: {
      tsconfig: './tsconfig.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,ts}'],
      exclude: ['**/*.test.{js,ts}'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
    // for performance
    maxConcurrency: 20,
    css: false,
    deps: {
      optimizer: {
        web: {
          enabled: true,
        },
      },
    },
    // when debugging, uncomment lines below:
    // testTimeout: 1000000000,
    // hookTimeout: 1000000000,
    // teardownTimeout: 1000000000,
  },
  esbuild: {
    target: 'ESNEXT',
  },
  plugins: [tsconfigPaths()],
});
