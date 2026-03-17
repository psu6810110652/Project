import { chromium, FullConfig } from '@playwright/test';
import axios from 'axios';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Set up test environment variables
  process.env.TEST_MODE = 'true';
  process.env.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
  
  // Wait for backend to be ready
  const maxRetries = 30;
  const retryDelay = 2000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await axios.get(`${process.env.API_BASE_URL}/health`, { timeout: 5000 });
      console.log('✅ Backend is ready');
      break;
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error('❌ Backend failed to start after maximum retries');
        throw new Error('Backend is not responding');
      }
      console.log(`⏳ Waiting for backend... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  // Create test admin user if needed
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to login page and create test admin
    await page.goto('/login');
    
    // Check if admin exists, if not create one
    try {
      await page.fill('input[name="email"]', 'admin@test.com');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // Wait for navigation or error
      await page.waitForTimeout(2000);
      
      // If login fails, create admin user
      if (page.url().includes('/login')) {
        await page.goto('/register');
        await page.fill('input[name="email"]', 'admin@test.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.fill('input[name="confirmPassword"]', 'admin123');
        await page.fill('input[name="name"]', 'Test Admin');
        await page.selectOption('select[name="role"]', 'Admin');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log('ℹ️ Admin setup skipped - using existing user');
    }
    
    await browser.close();
    console.log('✅ Global setup completed');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;
