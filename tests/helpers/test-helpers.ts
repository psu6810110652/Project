import { test as base, Page, BrowserContext } from '@playwright/test';
import { TEST_USERS, TestUser } from '../fixtures/test-data';

export interface TestFixtures {
  authenticatedPage: Page;
  adminPage: Page;
  userPage: Page;
}

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page, context }, use) => {
    await loginAsUser(page, context, TEST_USERS.USER);
    await use(page);
  },
  
  adminPage: async ({ page, context }, use) => {
    await loginAsUser(page, context, TEST_USERS.ADMIN);
    await use(page);
  },
  
  userPage: async ({ page, context }, use) => {
    await loginAsUser(page, context, TEST_USERS.USER);
    await use(page);
  }
});

async function loginAsUser(page: Page, context: BrowserContext, user: TestUser) {
  // Navigate to login page
  await page.goto('/login');
  
  // Fill login form
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');
  
  // Store authentication token if needed
  const cookies = await context.cookies();
  const authCookie = cookies.find(cookie => cookie.name.includes('auth') || cookie.name.includes('token'));
  
  if (authCookie) {
    console.log(`✅ Logged in as ${user.role}: ${user.email}`);
  } else {
    // Try alternative login methods
    await page.waitForTimeout(2000);
    if (page.url().includes('/login')) {
      // Try register if login fails
      await page.goto('/register');
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.fill('input[name="confirmPassword"]', user.password);
      await page.fill('input[name="name"]', user.name);
      if (await page.locator('select[name="role"]').isVisible()) {
        await page.selectOption('select[name="role"]', user.role);
      }
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }
  }
}

export const expect = test.expect;

// Helper functions for common actions
export class ProductManagementHelper {
  constructor(private page: Page) {}

  async navigateToProductManagement(categoryId: number) {
    await this.page.goto(`/admin/products/${categoryId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToCreateProduct(categoryId: number) {
    await this.page.goto(`/admin/products/${categoryId}/new`);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToEditProduct(categoryId: number, productId: string) {
    await this.page.goto(`/admin/products/${categoryId}/${productId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async fillProductForm(productData: any) {
    // Product name
    if (productData.name) {
      await this.page.fill('input[placeholder*="ชื่อสินค้า"], input[value*="name"]', productData.name);
    }

    // Product type
    if (productData.type) {
      await this.page.fill('input[placeholder*="ประเภทสินค้า"], input[list="type-options"]', productData.type);
    }

    // Price
    if (productData.price) {
      await this.page.fill('input[type="number"][placeholder*="ราคา"]', productData.price.toString());
    }

    // Stock
    if (productData.stockQuantity) {
      await this.page.fill('input[type="number"][placeholder*="จำนวน"]', productData.stockQuantity.toString());
    }

    // Description
    if (productData.description) {
      await this.page.fill('textarea[placeholder*="รายละเอียด"]', productData.description);
    }

    // How to use
    if (productData.howToUse) {
      await this.page.fill('textarea[placeholder*="วิธีใช้"]', productData.howToUse);
    }

    // Promotion settings
    if (productData.isPromotion) {
      await this.page.check('input[type="checkbox"][value*="promotion"], input[type="checkbox"]:has-text("โปรโมชั่น")');
      if (productData.promotionPrice) {
        await this.page.fill('input[type="number"][placeholder*="โปรโมชั่น"]', productData.promotionPrice.toString());
      }
    }

    // Featured setting
    if (productData.isFeatured) {
      await this.page.check('input[type="checkbox"]:has-text("แนะนำ"), input[type="checkbox"]:has-text("featured")');
    }

    // Specifications
    if (productData.specifications && Object.keys(productData.specifications).length > 0) {
      for (const [key, value] of Object.entries(productData.specifications)) {
        await this.page.click('button:has-text("เพิ่มรายการคุณสมบัติ")');
        const lastSpecInputs = this.page.locator('input[placeholder*="หัวข้อ"]').last();
        await lastSpecInputs.fill(key);
        
        const lastValueInputs = this.page.locator('input[placeholder*="รายละเอียด"]').last();
        await lastValueInputs.fill(value as string);
      }
    }
  }

  async saveProduct() {
    await this.page.click('button:has-text("บันทึกข้อมูล"), button:has-text("Save")');
    await this.page.waitForLoadState('networkidle');
  }

  async deleteProduct(productId: string) {
    await this.page.click(`button:has-text("ลบ"):has([data-product-id="${productId}"])`);
    await this.page.click('button:has-text("ลบ"):has-text("confirm")');
    await this.page.waitForLoadState('networkidle');
  }

  async searchProducts(searchTerm: string) {
    await this.page.fill('input[placeholder*="ค้นหา"], input[type="search"]', searchTerm);
    await this.page.waitForTimeout(500); // Wait for debounced search
  }

  async uploadTestImages(imagePaths: string[] = []) {
    // If no images provided, create simple test images
    if (imagePaths.length === 0) {
      const fileInput = this.page.locator('input[type="file"][accept="image/*"]');
      await fileInput.setInputFiles({
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      });
    } else {
      const fileInput = this.page.locator('input[type="file"][accept="image/*"]');
      await fileInput.setInputFiles(imagePaths);
    }
    await this.page.waitForTimeout(2000); // Wait for image processing
  }

  async getProductCount(): Promise<number> {
    const rows = await this.page.locator('table tbody tr').count();
    return rows;
  }

  async getProductByName(productName: string) {
    return this.page.locator(`table tbody tr:has-text("${productName}")`);
  }

  async verifyProductExists(productName: string) {
    const productRow = await this.getProductByName(productName);
    await expect(productRow).toBeVisible();
  }

  async verifyProductNotExists(productName: string) {
    const productRow = await this.getProductByName(productName);
    await expect(productRow).not.toBeVisible();
  }

  async waitForSuccessMessage() {
    await this.page.waitForSelector('text=/สำเร็จ|เรียบร้อย|success/i', { timeout: 5000 });
  }

  async waitForErrorMessage() {
    await this.page.waitForSelector('text=/ผิดพลาด|ไม่สำเร็จ|error/i', { timeout: 5000 });
  }
}

// Utility functions
export const waitForApiCall = (page: Page, urlPattern: string) => {
  return page.waitForResponse(response => 
    response.url().includes(urlPattern) && 
    response.status() < 400
  );
};

export const createTestImageBuffer = (): Buffer => {
  // Create a simple 1x1 pixel PNG image
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk start
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // Bit depth, color type, compression, filter, interlace
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // CRC and IDAT chunk start
    0x54, 0x08, 0x99, 0x01, 0x01, 0x01, 0x00, 0x00, // Compressed image data
    0xFE, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // More compressed data
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
    0xAE, 0x42, 0x60, 0x82 // CRC
  ]);
  return pngData;
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
