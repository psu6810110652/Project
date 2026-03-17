import { test as base, Page, BrowserContext } from '@playwright/test';

/**
 * 🛠️ Local Test Helpers for Order Management
 * Fixed login/registration selectors and added better error logging.
 */

export interface TestUser {
  email: string;
  username: string;
  password: string;
  name: string;
  role: 'Admin' | 'User';
}

// Credentials that satisfy BOTH Login and Register validation rules
export const LOCAL_TEST_USERS = {
  ADMIN: {
    email: 'adminT@example.com',
    username: 'adminT', // Non-reserved, valid chars
    password: 'Teerayut1', // Complexity: Uppercase, Lowercase, Digit, Special, >8 chars
    name: 'Teerayut Admin',
    role: 'Admin' as const
  },
  USER: {
    email: 'pamornwatee@example.com',
    username: 'pamornwatee',
    password: 'Maemae_2550',
    name: 'pamornwatee',
    role: 'User' as const
  }
} as const;

export interface TestFixtures {
  authenticatedPage: Page;
  adminPage: Page;
  userPage: Page;
}

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsUser(page, context, LOCAL_TEST_USERS.USER);
    await use(page);
    await context.close();
  },

  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsUser(page, context, LOCAL_TEST_USERS.ADMIN);
    await use(page);
    await context.close();
  },

  userPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsUser(page, context, LOCAL_TEST_USERS.USER);
    await use(page);
    await context.close();
  }
});

async function loginAsUser(page: Page, context: BrowserContext, user: TestUser) {
  console.log(`🔑 Attempting login as ${user.role}: ${user.username}`);

  // Navigate to login page
  await page.goto('/login');

  // Wait for the form to be visible
  await page.waitForSelector('input[name="username"]', { timeout: 10000 });

  // Fill login form
  await page.fill('input[name="username"]', user.username);
  await page.fill('input[name="password"]', user.password);

  // Log all network responses to help debug login issues
  page.on('response', async response => {
    if (response.url().includes('/auth/login') && response.status() >= 400) {
      console.log(`❌ Login API Error: ${response.status()} - ${await response.text()}`);
    }
  });

  // Click the confirm button
  await page.click('button:has-text("ยืนยัน")');

  // Wait for navigation or successful login
  try {
    await page.waitForURL(url => url.pathname !== '/login', { timeout: 10000 });
    console.log(`✅ Logged in successfully: ${page.url()}`);
  } catch (error) {
    console.log(`❌ Login failed. Current URL: ${page.url()}`);

    // Check if we need to register the user
    if (page.url().includes('/login')) {
      console.log(`ℹ️ Attempting registration fallback...`);
      await page.goto('/register');

      // Wait for registration form
      await page.waitForSelector('input[name="username"]');

      // Fill registration form
      await page.fill('input[name="username"]', user.username);
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.fill('input[name="confirmPassword"]', user.password);

      // Check terms checkbox
      const termsCheckbox = page.locator('input[type="checkbox"]').first();
      await termsCheckbox.check();

      // Submit registration
      await page.click('button:has-text("สมัครสมาชิก")');

      // Handle Swal and redirect
      try {
        const swalButton = page.locator('.swal2-confirm');
        await swalButton.waitFor({ state: 'visible', timeout: 5000 });
        await swalButton.click();
      } catch (e) {
        console.log('ℹ️ Swat popup not found or failed to click');
      }

      await page.waitForURL('**/login', { timeout: 10000 });

      // Try login again
      console.log(`🔑 Re-attempting login after registration...`);
      await page.fill('input[name="username"]', user.username);
      await page.fill('input[name="password"]', user.password);
      await page.click('button:has-text("ยืนยัน")');
      await page.waitForURL(url => url.pathname !== '/login', { timeout: 10000 });
    }
  }
}

export const expect = test.expect;
