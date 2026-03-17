import { FullConfig } from '@playwright/test';
import axios from 'axios';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  try {
    // Clean up test data
    const apiBase = process.env.API_BASE_URL || 'http://localhost:3001';
    
    // Delete test products created during tests
    try {
      await axios.delete(`${apiBase}/test/cleanup`, {
        headers: { 'X-Test-Cleanup': 'true' }
      });
      console.log('✅ Test data cleaned up');
    } catch (error) {
      console.log('ℹ️ Test cleanup endpoint not available or failed');
    }
    
    console.log('✅ Global teardown completed');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
  }
}

export default globalTeardown;
