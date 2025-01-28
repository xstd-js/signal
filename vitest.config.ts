import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    dir: 'src',
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.{test,bench,protected,private}.ts',
        'src/**/*.private/**/*.ts',
        'src/**/*.protected/**/*.ts',
        // TODO add tests later
        'src/functions/**/*.ts',
      ],
      thresholds: {
        100: true,
      },
    },
  },
});
