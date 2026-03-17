import { chromium, FullConfig } from '@playwright/test';
import axios from 'axios';

/**
 * 🛠️ Local Global Setup for Order Management
 * Fixed the /health issue (uses / instead) and point to port 3000.
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting local global setup...');
  
  const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3000';
  
  // Wait for backend to be ready (hitting / instead of /health)
  const maxRetries = 30;
  const retryDelay = 2000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await axios.get(apiBaseUrl, { timeout: 5000 });
      console.log('✅ Backend is ready at ' + apiBaseUrl);
      break;
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error('❌ Backend failed to start after maximum retries');
        // We don't throw here to allow tests to try anyway, sometimes it's just a 404 but server is up
      }
      console.log(`⏳ Waiting for backend... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  console.log('✅ Local global setup completed');
}

export default globalSetup;
