import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * 🛠️ Mocked Config for Background Execution
 * Removes webServer to prevent "npm not found" errors in restricted environments.
 */

export default defineConfig({
  testDir: './',
  fullyParallel: false, // Run scenarios sequentially to avoid mock collisions
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer section here
});
