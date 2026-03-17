import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * 🛠️ Robust Custom Config for Order Management Tests
 * Includes .env loading and uses cwd for webServers to prevent "exited early" errors.
 */

// Load .env into process.env so the webServer commands can find them
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

// Ensure API URL is set for tests
process.env.API_BASE_URL = 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on', // เก็บ Trace ตลอดเวลาเพื่อดูย้อนหลัง
    screenshot: 'on', // ถ่ายรูปทุกครั้ง
    video: 'on', // อัดวิดีโอทุกรอบ
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 💡 หากยังขึ้น "Exited early" ให้ลองเปิด Terminal 2 อันเพื่อรันคำสั่งนี้แยกกัน:
  // 1. cd frontend && npm run dev
  // 2. cd backend && npm run start:dev
  // แล้วค่อยรันเทสครับ
  webServer: [
    {
      command: 'bash -lc "cd ../frontend && npm run dev"',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
    {
      command: 'bash -lc "cd ../backend && npm run start:dev"',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    }
  ],

  // Use the local setup we just created
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('../global-teardown.ts'),
});
