import { test, expect } from '../helpers/test-helpers';
import { ProductManagementHelper } from '../helpers/test-helpers';
import { TEST_PRODUCTS, TEST_CATEGORIES, generateRandomProduct } from '../fixtures/test-data';
import { waitForApiCall } from '../helpers/test-helpers';

test.describe('Product CRUD Operations', () => {
  let helper: ProductManagementHelper;
  const testCategory = TEST_CATEGORIES[1]; // ผลิตภัณฑ์ดูแลผิว

  test.beforeEach(async ({ adminPage }) => {
    helper = new ProductManagementHelper(adminPage);
  });

  test.describe('CREATE Operations', () => {
    test('should create product with all fields', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      
      await helper.navigateToCreateProduct(testCategory.id);
      
      // Wait for API call when page loads
      const apiResponse = waitForApiCall(adminPage, '/product/generate-id');
      
      await helper.fillProductForm(testProduct);
      await helper.uploadTestImages();
      
      // Wait for product creation API call
      const createResponse = waitForApiCall(adminPage, '/product');
      
      await helper.saveProduct();
      
      // Verify API calls were made
      await apiResponse;
      await createResponse;
      
      // Verify success
      await helper.waitForSuccessMessage();
      
      // Verify product exists in list
      await helper.navigateToProductManagement(testCategory.id);
      await helper.verifyProductExists(testProduct.name);
    });

    test('should create product without optional fields', async ({ adminPage }) => {
      const minimalProduct = {
        name: `Minimal Product ${Date.now()}`,
        price: 299,
        promotionPrice: 0,
        isPromotion: false,
        isFeatured: false,
        stockQuantity: 10,
        description: '',
        type: 'ทดสอบ',
        specifications: {},
        howToUse: ''
      };
      
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(minimalProduct);
      await helper.saveProduct();
      
      await helper.waitForSuccessMessage();
      await helper.navigateToProductManagement(testCategory.id);
      await helper.verifyProductExists(minimalProduct.name);
    });

    test('should generate product ID automatically', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      
      await helper.navigateToCreateProduct(testCategory.id);
      
      // Product ID field should be disabled initially
      const idField = adminPage.locator('input[disabled][placeholder*="รหัสสินค้า"]');
      await expect(idField).toBeVisible();
      await expect(idField).toHaveValue('ระบุประเภทสินค้าก่อน...');
      
      // Fill product type
      await adminPage.fill('input[placeholder*="ประเภทสินค้า"]', testProduct.type);
      
      // Wait for ID generation
      await adminPage.waitForTimeout(1000);
      
      // ID should be generated
      await expect(idField).not.toHaveValue('ระบุประเภทสินค้าก่อน...');
      await expect(idField).not.toHaveValue('กำลังคำนวณรหัส...');
      const generatedId = await idField.inputValue();
      expect(generatedId).toMatch(/^\d+$/); // Should be numeric
      
      // Fill remaining fields and save
      await adminPage.fill('input[placeholder*="ชื่อสินค้า"]', testProduct.name);
      await adminPage.fill('input[type="number"][placeholder*="ราคา"]', testProduct.price.toString());
      await adminPage.fill('input[type="number"][placeholder*="จำนวน"]', testProduct.stockQuantity.toString());
      
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Verify product exists with generated ID
      await helper.navigateToProductManagement(testCategory.id);
      const productRow = await helper.getProductByName(testProduct.name);
      await expect(productRow).toContainText('#' + generatedId);
    });

    test('should handle multiple image uploads', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      
      // Upload multiple images
      const fileInput = adminPage.locator('input[type="file"][accept="image/*"]');
      await fileInput.setInputFiles([
        {
          name: 'test-image-1.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-data-1')
        },
        {
          name: 'test-image-2.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-data-2')
        },
        {
          name: 'test-image-3.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-data-3')
        }
      ]);
      
      await adminPage.waitForTimeout(2000);
      
      // Verify all images are uploaded
      await expect(adminPage.locator('img[alt*="product"]')).toHaveCount(3);
      
      // Verify first image is marked as thumbnail
      await expect(adminPage.locator('text=รูปปก')).toBeVisible();
      
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
    });
  });

  test.describe('READ Operations', () => {
    test('should display product list with correct data', async ({ adminPage }) => {
      // Create test products
      const products = [generateRandomProduct(testCategory.id), generateRandomProduct(testCategory.id)];
      
      for (const product of products) {
        await helper.navigateToCreateProduct(testCategory.id);
        await helper.fillProductForm(product);
        await helper.saveProduct();
        await helper.waitForSuccessMessage();
      }
      
      await helper.navigateToProductManagement(testCategory.id);
      
      // Verify all products are displayed
      for (const product of products) {
        const productRow = await helper.getProductByName(product.name);
        await expect(productRow).toBeVisible();
        
        // Verify price display
        const displayPrice = product.isPromotion ? product.promotionPrice : product.price;
        await expect(productRow).toContainText(displayPrice.toString());
        
        // Verify stock display
        await expect(productRow).toContainText(product.stockQuantity.toString());
        
        // Verify status indicator
        const statusDot = productRow.locator('.rounded-full');
        await expect(statusDot).toBeVisible();
        
        // Verify action buttons
        await expect(productRow.locator('button:has-text("แก้ไข")')).toBeVisible();
        await expect(productRow.locator('button:has-text("ลบ")')).toBeVisible();
      }
    });

    test('should display product details correctly', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      testProduct.specifications = {
        'น้ำหนัก': '50g',
        'ประเภทผิว': 'ผิวมัน',
        'การรับรอง': 'FDA'
      };
      
      // Create product
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Navigate back to product list
      await helper.navigateToProductManagement(testCategory.id);
      
      // Click edit to view product details
      const productRow = await helper.getProductByName(testProduct.name);
      await productRow.locator('button:has-text("แก้ไข")').click();
      
      // Verify all fields are populated correctly
      await expect(adminPage.locator('input[placeholder*="ชื่อสินค้า"]')).toHaveValue(testProduct.name);
      await expect(adminPage.locator('input[placeholder*="ประเภทสินค้า"]')).toHaveValue(testProduct.type);
      await expect(adminPage.locator('input[type="number"][placeholder*="ราคา"]')).toHaveValue(testProduct.price.toString());
      await expect(adminPage.locator('input[type="number"][placeholder*="จำนวน"]')).toHaveValue(testProduct.stockQuantity.toString());
      await expect(adminPage.locator('textarea[placeholder*="รายละเอียด"]')).toHaveValue(testProduct.description);
      await expect(adminPage.locator('textarea[placeholder*="วิธีใช้"]')).toHaveValue(testProduct.howToUse);
      
      // Verify specifications
      const specKeys = adminPage.locator('input[placeholder*="หัวข้อ"]');
      const specValues = adminPage.locator('input[placeholder*="รายละเอียด"]');
      
      expect(await specKeys.count()).toBe(Object.keys(testProduct.specifications).length);
      
      for (let i = 0; i < Object.keys(testProduct.specifications).length; i++) {
        const key = Object.keys(testProduct.specifications)[i];
        const value = testProduct.specifications[key];
        await expect(specKeys.nth(i)).toHaveValue(key);
        await expect(specValues.nth(i)).toHaveValue(value);
      }
    });

    test('should filter products by category', async ({ adminPage }) => {
      // Create products in different categories
      const product1 = generateRandomProduct(TEST_CATEGORIES[0].id);
      const product2 = generateRandomProduct(TEST_CATEGORIES[1].id);
      
      // Create product in first category
      await helper.navigateToCreateProduct(TEST_CATEGORIES[0].id);
      await helper.fillProductForm(product1);
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Create product in second category
      await helper.navigateToCreateProduct(TEST_CATEGORIES[1].id);
      await helper.fillProductForm(product2);
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Verify category 1 shows only product1
      await helper.navigateToProductManagement(TEST_CATEGORIES[0].id);
      await helper.verifyProductExists(product1.name);
      await helper.verifyProductNotExists(product2.name);
      
      // Verify category 2 shows only product2
      await helper.navigateToProductManagement(TEST_CATEGORIES[1].id);
      await helper.verifyProductExists(product2.name);
      await helper.verifyProductNotExists(product1.name);
    });
  });

  test.describe('UPDATE Operations', () => {
    test('should update all product fields', async ({ adminPage }) => {
      const originalProduct = generateRandomProduct(testCategory.id);
      const updatedProduct = generateRandomProduct(testCategory.id);
      
      // Create original product
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(originalProduct);
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Navigate to edit
      await helper.navigateToProductManagement(testCategory.id);
      const productRow = await helper.getProductByName(originalProduct.name);
      await productRow.locator('button:has-text("แก้ไข")').click();
      
      // Update all fields
      await helper.fillProductForm(updatedProduct);
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Verify updates
      await helper.navigateToProductManagement(testCategory.id);
      await helper.verifyProductExists(updatedProduct.name);
      await helper.verifyProductNotExists(originalProduct.name);
    });

    test('should update product promotion status', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      testProduct.isPromotion = false;
      
      // Create product without promotion
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Edit to add promotion
      await helper.navigateToProductManagement(testCategory.id);
      const productRow = await helper.getProductByName(testProduct.name);
      await productRow.locator('button:has-text("แก้ไข")').click();
      
      // Enable promotion
      await adminPage.check('input[type="checkbox"]:has-text("โปรโมชั่น")');
      await adminPage.fill('input[type="number"][placeholder*="โปรโมชั่น"]', '199');
      
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Verify promotion is applied
      await helper.navigateToProductManagement(testCategory.id);
      const updatedRow = await helper.getProductByName(testProduct.name);
      await expect(updatedRow).toContainText('199');
    });

    test('should update product specifications', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      testProduct.specifications = {
        'น้ำหนัก': '30g',
        'ประเภทผิว': 'ผิวแห้ง'
      };
      
      // Create product
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Edit specifications
      await helper.navigateToProductManagement(testCategory.id);
      const productRow = await helper.getProductByName(testProduct.name);
      await productRow.locator('button:has-text("แก้ไข")').click();
      
      // Add new specification
      await adminPage.click('button:has-text("เพิ่มรายการคุณสมบัติ")');
      const lastKeyInput = adminPage.locator('input[placeholder*="หัวข้อ"]').last();
      const lastValueInput = adminPage.locator('input[placeholder*="รายละเอียด"]').last();
      
      await lastKeyInput.fill('วันหมดอายุ');
      await lastValueInput.fill('2 ปี');
      
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Verify specifications were updated
      await helper.navigateToProductManagement(testCategory.id);
      await helper.verifyProductExists(testProduct.name);
    });

    test('should update product images', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      
      // Create product with images
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      await helper.uploadTestImages();
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Edit to add more images
      await helper.navigateToProductManagement(testCategory.id);
      const productRow = await helper.getProductByName(testProduct.name);
      await productRow.locator('button:has-text("แก้ไข")').click();
      
      // Add more images
      const fileInput = adminPage.locator('input[type="file"][accept="image/*"]');
      await fileInput.setInputFiles({
        name: 'additional-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('additional-image-data')
      });
      
      await adminPage.waitForTimeout(2000);
      
      // Verify image count increased
      const imageCount = await adminPage.locator('img[alt*="product"]').count();
      expect(imageCount).toBeGreaterThan(1);
      
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
    });
  });

  test.describe('DELETE Operations', () => {
    test('should delete product with confirmation', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      
      // Create product
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Navigate to product list
      await helper.navigateToProductManagement(testCategory.id);
      await helper.verifyProductExists(testProduct.name);
      
      // Get initial product count
      const initialCount = await helper.getProductCount();
      
      // Start deletion process
      const productRow = await helper.getProductByName(testProduct.name);
      await productRow.locator('button:has-text("ลบ")').click();
      
      // Verify confirmation dialog appears
      await expect(adminPage.locator('text=คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')).toBeVisible();
      await expect(adminPage.locator('button:has-text("ลบ"):has-text("confirm")')).toBeVisible();
      await expect(adminPage.locator('button:has-text("ยกเลิก")')).toBeVisible();
      
      // Confirm deletion
      await adminPage.click('button:has-text("ลบ"):has-text("confirm")');
      
      // Verify deletion success
      await helper.waitForSuccessMessage();
      
      // Verify product is removed
      await helper.verifyProductNotExists(testProduct.name);
      
      // Verify product count decreased
      const finalCount = await helper.getProductCount();
      expect(finalCount).toBe(initialCount - 1);
    });

    test('should cancel deletion when clicking cancel', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      
      // Create product
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Navigate to product list
      await helper.navigateToProductManagement(testCategory.id);
      await helper.verifyProductExists(testProduct.name);
      
      // Start deletion process
      const productRow = await helper.getProductByName(testProduct.name);
      await productRow.locator('button:has-text("ลบ")').click();
      
      // Cancel deletion
      await adminPage.click('button:has-text("ยกเลิก")');
      
      // Verify product still exists
      await helper.verifyProductExists(testProduct.name);
      
      // Verify confirmation dialog is closed
      await expect(adminPage.locator('text=คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')).not.toBeVisible();
    });

    test('should handle deletion of product with images', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      
      // Create product with images
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      await helper.uploadTestImages();
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
      
      // Delete product
      await helper.navigateToProductManagement(testCategory.id);
      const productRow = await helper.getProductByName(testProduct.name);
      await productRow.locator('button:has-text("ลบ")').click();
      await adminPage.click('button:has-text("ลบ"):has-text("confirm")');
      
      // Verify deletion success
      await helper.waitForSuccessMessage();
      await helper.verifyProductNotExists(testProduct.name);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      
      // Simulate network error by intercepting and failing the request
      await adminPage.route('/product', route => route.abort());
      
      await helper.saveProduct();
      
      // Should show error message
      await helper.waitForErrorMessage();
      await expect(adminPage.locator('text=/ไม่สามารถบันทึกข้อมูล|ผิดพลาด/')).toBeVisible();
    });

    test('should handle unauthorized access', async ({ userPage }) => {
      // Try to access admin product management as regular user
      const userHelper = new ProductManagementHelper(userPage);
      await userHelper.navigateToProductManagement(testCategory.id);
      
      // Should be redirected or show error
      await expect(userPage.locator('text=/คุณไม่มีสิทธิ|Unauthorized/')).toBeVisible({ timeout: 5000 });
    });
  });
});
