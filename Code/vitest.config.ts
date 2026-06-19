import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      include: [
        
        'src/app/components/calendar/**/*.ts',
        
      ],
      exclude: ['src/**/*.spec.ts']
    }
  },
});


