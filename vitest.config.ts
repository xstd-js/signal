import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    dir: 'src',
    // pool: 'forks',
    // poolOptions: {
    //   forks: {
    //     // singleFork: true,
    //     execArgv: ['--expose-gc'],
    //   },
    // },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/types/**/*.ts',
        'src/**/traits/**/*.ts',
        'src/**/*.bench.ts',
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
