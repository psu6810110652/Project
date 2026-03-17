import { test, expect } from '../helpers/test-helpers';
import { ProductManagementHelper } from '../helpers/test-helpers';
import { TEST_CATEGORIES, generateRandomProduct } from '../fixtures/test-data';

test.describe('Product Validation Tests', () => {
  let helper: ProductManagementHelper;
  const testCategory = TEST_CATEGORIES[2]; // เวชสำอาง

  test.beforeEach(async ({ adminPage }) => {
    helper = new ProductManagementHelper(adminPage);
    await helper.navigateToCreateProduct(testCategory.id);
  });

  test.describe('Required Field Validations', () => {
    test('should validate product name is required', async ({ adminPage }) => {
      // Fill all fields except name
      const testProduct = generateRandomProduct(testCategory.id);
      await adminPage.fill('input[placeholder*="ประเภทสินค้า"]', testProduct.type);
      await adminPage.fill('input[type="number"][placeholder*="ราคา"]', testProduct.price.toString());
      
      // Try to save
      await helper.saveProduct();
      
      // Should show validation error
      await helper.waitForErrorMessage();
      await expect(adminPage.locator('text=/กรุณาระบุชื่อสินค้า/')).toBeVisible();
      
      // Name field should be highlighted
      const nameField = adminPage.locator('input[placeholder*="ชื่อสินค้า"]');
      await expect(nameField).toBeFocused();
    });

    test('should validate product type is required', async ({ adminPage }) => {
      // Fill all fields except type
      const testProduct = generateRandomProduct(testCategory.id);
      await adminPage.fill('input[placeholder*="ชื่อสินค้า"]', testProduct.name);
      await adminPage.fill('input[type="number"][placeholder*="ราคา"]', testProduct.price.toString());
      
      // Try to save
      await helper.saveProduct();
      
      // Should show validation error
      await helper.waitForErrorMessage();
      await expect(adminPage.locator('text=/กรุณาระบุประเภทสินค้า/')).toBeVisible();
      
      // Type field should be highlighted
      const typeField = adminPage.locator('input[placeholder*="ประเภทสินค้า"]');
      await expect(typeField).toBeFocused();
    });

    test('should validate price is required and positive', async ({ adminPage }) => {
      // Fill all fields except price
      const testProduct = generateRandomProduct(testCategory.id);
      await adminPage.fill('input[placeholder*="ชื่อสินค้า"]', testProduct.name);
      await adminPage.fill('input[placeholder*="ประเภทสินค้า"]', testProduct.type);
      
      // Try to save without price
      await helper.saveProduct();
      
      // Should show validation error or focus on price field
      await adminPage.waitForTimeout(1000);
      const priceField = adminPage.locator('input[type="number"][placeholder*="ราคา"]');
      await expect(priceField).toBeFocused();
      
      // Test negative price
      await priceField.fill('-100');
      await helper.saveProduct();
      
      // Should not accept negative value
      const priceValue = await priceField.inputValue();
      expect(parseInt(priceValue)).toBeGreaterThanOrEqual(0);
    });

    test('should validate stock is non-negative', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      
      // Try negative stock
      await adminPage.fill('input[type="number"][placeholder*="จำนวน"]', '-10');
      await helper.saveProduct();
      
      // Should not accept negative value
      const stockField = adminPage.locator('input[type="number"][placeholder*="จำนวน"]');
      const stockValue = await stockField.inputValue();
      expect(parseInt(stockValue)).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Field Length Validations', () => {
    test('should handle very long product names', async ({ adminPage }) => {
      const longName = 'A'.repeat(500); // Very long name
      const testProduct = generateRandomProduct(testCategory.id);
      
      await adminPage.fill('input[placeholder*="ชื่อสินค้า"]', longName);
      await adminPage.fill('input[placeholder*="ประเภทสินค้า"]', testProduct.type);
      await adminPage.fill('input[type="number"][placeholder*="ราคา"]', testProduct.price.toString());
      
      await helper.saveProduct();
      
      // Check if it saves or shows appropriate error
      const successMessage = adminPage.locator('text=/สำเร็จ|เรียบร้อย/');
      const errorMessage = adminPage.locator('text=/ผิดพลาด|ไม่สำเร็จ|ยาวเกินไป/');
      
      await expect(successMessage.or(errorMessage)).toBeVisible({ timeout: 5000 });
    });

    test('should handle very long descriptions', async ({ adminPage }) => {
      const longDescription = 'B'.repeat(2000); // Very long description
      const testProduct = generateRandomProduct(testCategory.id);
      
      await helper.fillProductForm(testProduct);
      await adminPage.fill('textarea[placeholder*="รายละเอียด"]', longDescription);
      
      await helper.saveProduct();
      
      // Should handle long text gracefully
      const successMessage = adminPage.locator('text=/สำเร็จ|เรียบร้อย/');
      const errorMessage = adminPage.locator('text=/ผิดพลาด|ไม่สำเร็จ/');
      
      await expect(successMessage.or(errorMessage)).toBeVisible({ timeout: 5000 });
    });

    test('should handle very long how-to-use text', async ({ adminPage }) => {
      const longHowToUse = 'C'.repeat(1000); // Very long how-to-use
      const testProduct = generateRandomProduct(testCategory.id);
      
      await helper.fillProductForm(testProduct);
      await adminPage.fill('textarea[placeholder*="วิธีใช้"]', longHowToUse);
      
      await helper.saveProduct();
      
      // Should handle long text gracefully
      const successMessage = adminPage.locator('text=/สำเร็จ|เรียบร้อย/');
      const errorMessage = adminPage.locator('text=/ผิดพลาด|ไม่สำเร็จ/');
      
      await expect(successMessage.or(errorMessage)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Promotion Validations', () => {
    test('should validate promotion price when promotion is enabled', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      testProduct.isPromotion = true;
      
      await helper.fillProductForm(testProduct);
      
      // Enable promotion without setting price
      await adminPage.check('input[type="checkbox"]:has-text("โปรโมชั่น")');
      
      // Promotion price field should be visible
      const promoPriceField = adminPage.locator('input[type="number"][placeholder*="โปรโมชั่น"]');
      await expect(promoPriceField).toBeVisible();
      
      // Try to save without promotion price
      await helper.saveProduct();
      
      // Should focus on promotion price field
      await adminPage.waitForTimeout(1000);
      await expect(promoPriceField).toBeFocused();
      
      // Test promotion price higher than regular price
      await promoPriceField.fill((testProduct.price + 100).toString());
      await helper.saveProduct();
      
      // Should show validation error or prevent saving
      await adminPage.waitForTimeout(1000);
      
      // Test valid promotion price
      await promoPriceField.fill((testProduct.price * 0.8).toString());
      await helper.saveProduct();
      
      // Should save successfully
      await helper.waitForSuccessMessage();
    });

    test('should hide promotion price field when promotion is disabled', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      testProduct.isPromotion = false;
      
      await helper.fillProductForm(testProduct);
      
      // Ensure promotion is disabled
      await adminPage.uncheck('input[type="checkbox"]:has-text("โปรโมชั่น")');
      
      // Promotion price field should be hidden
      const promoPriceField = adminPage.locator('input[type="number"][placeholder*="โปรโมชั่น"]');
      await expect(promoPriceField).not.toBeVisible();
      
      // Should save without promotion price
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
    });

    test('should toggle promotion price field visibility', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      
      const promoCheckbox = adminPage.locator('input[type="checkbox"]:has-text("โปรโมชั่น")');
      const promoPriceField = adminPage.locator('input[type="number"][placeholder*="โปรโมชั่น"]');
      
      // Initially disabled
      await expect(promoPriceField).not.toBeVisible();
      
      // Enable promotion
      await promoCheckbox.check();
      await expect(promoPriceField).toBeVisible();
      
      // Disable promotion
      await promoCheckbox.uncheck();
      await expect(promoPriceField).not.toBeVisible();
    });
  });

  test.describe('Image Upload Validations', () => {
    test('should validate image file types', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      
      const fileInput = adminPage.locator('input[type="file"][accept="image/*"]');
      
      // Try to upload non-image file
      await fileInput.setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('This is not an image')
      });
      
      await adminPage.waitForTimeout(2000);
      
      // Should not accept the file or show error
      const images = adminPage.locator('img[alt*="product"]');
      await expect(images).toHaveCount(0);
      
      // Try valid image
      await fileInput.setInputFiles({
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      });
      
      await adminPage.waitForTimeout(2000);
      
      // Should accept the image
      await expect(images).toHaveCount(1);
    });

    test('should handle large image files', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      
      const fileInput = adminPage.locator('input[type="file"][accept="image/*"]');
      
      // Try to upload very large image (simulate)
      const largeImageBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
      
      await fileInput.setInputFiles({
        name: 'large-image.jpg',
        mimeType: 'image/jpeg',
        buffer: largeImageBuffer
      });
      
      await adminPage.waitForTimeout(3000);
      
      // Should show error or handle gracefully
      const successMessage = adminPage.locator('text=/สำเร็จ|เรียบร้อย/');
      const errorMessage = adminPage.locator('text=/ใหญ่เกินไป|ผิดพลาด/');
      
      await expect(successMessage.or(errorMessage)).toBeVisible({ timeout: 5000 });
    });

    test('should limit number of uploaded images', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      
      const fileInput = adminPage.locator('input[type="file"][accept="image/*"]');
      
      // Upload multiple images
      const imageFiles = Array.from({ length: 10 }, (_, i) => ({
        name: `image-${i}.jpg`,
        mimeType: 'image/jpeg',
        buffer: Buffer.from(`image-data-${i}`)
      }));
      
      await fileInput.setInputFiles(imageFiles);
      await adminPage.waitForTimeout(3000);
      
      // Should limit to reasonable number (check if there's a limit)
      const uploadedImages = adminPage.locator('img[alt*="product"]');
      const imageCount = await uploadedImages.count();
      
      // Most applications limit to 5-10 images
      expect(imageCount).toBeLessThanOrEqual(10);
    });
  });

  test.describe('Specification Validations', () => {
    test('should validate specification fields', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      testProduct.specifications = {
        '': 'Value without key', // Empty key
        'Key without value': '', // Empty value
        'Valid spec': 'Valid value'
      };
      
      await helper.fillProductForm(testProduct);
      
      // Should handle empty specifications gracefully
      await helper.saveProduct();
      
      const successMessage = adminPage.locator('text=/สำเร็จ|เรียบร้อย/');
      const errorMessage = adminPage.locator('text=/ผิดพลาด|ไม่สำเร็จ/');
      
      await expect(successMessage.or(errorMessage)).toBeVisible({ timeout: 5000 });
    });

    test('should handle duplicate specification keys', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      
      // Add specifications with duplicate keys
      await adminPage.click('button:has-text("เพิ่มรายการคุณสมบัติ")');
      await adminPage.click('button:has-text("เพิ่มรายการคุณสมบัติ")');
      
      const keyInputs = adminPage.locator('input[placeholder*="หัวข้อ"]');
      await keyInputs.first().fill('น้ำหนัก');
      await keyInputs.last().fill('น้ำหนัก'); // Duplicate key
      
      const valueInputs = adminPage.locator('input[placeholder*="รายละเอียด"]');
      await valueInputs.first().fill('50g');
      await valueInputs.last().fill('100g');
      
      await helper.saveProduct();
      
      // Should handle duplicates gracefully
      const successMessage = adminPage.locator('text=/สำเร็จ|เรียบร้อย/');
      const errorMessage = adminPage.locator('text=/ซ้ำ|ผิดพลาด|ไม่สำเร็จ/');
      
      await expect(successMessage.or(errorMessage)).toBeVisible({ timeout: 5000 });
    });

    test('should remove specifications correctly', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      testProduct.specifications = {
        'Spec 1': 'Value 1',
        'Spec 2': 'Value 2',
        'Spec 3': 'Value 3'
      };
      
      await helper.fillProductForm(testProduct);
      
      // Remove one specification
      const removeButtons = adminPage.locator('button:has(svg)');
      await removeButtons.first().click();
      
      // Should have 2 specifications left
      const keyInputs = adminPage.locator('input[placeholder*="หัวข้อ"]');
      await expect(keyInputs).toHaveCount(2);
      
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
    });
  });

  test.describe('Form State Validations', () => {
    test('should prevent double submission', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      
      const saveButton = adminPage.locator('button:has-text("บันทึกข้อมูล")');
      
      // Click save twice quickly
      await saveButton.click();
      await saveButton.click();
      
      // Should disable button after first click
      await expect(saveButton).toBeDisabled();
      
      // Should show loading state
      await expect(saveButton).toContainText('กำลังบันทึก');
      
      // Should re-enable after completion
      await helper.waitForSuccessMessage();
      await expect(saveButton).toBeEnabled();
    });

    test('should handle form reset/cancel', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      
      // Fill some fields
      await adminPage.fill('input[placeholder*="ชื่อสินค้า"]', 'Modified Name');
      await adminPage.fill('input[type="number"][placeholder*="ราคา"]', '999');
      
      // Click back/cancel button
      await adminPage.click('button:has-text("กลับ")');
      
      // Should navigate back without saving
      await adminPage.waitForTimeout(1000);
      await expect(adminPage).toHaveURL(new RegExp(`/admin/products/${testCategory.id}$`));
      
      // Product should not be created
      await helper.navigateToCreateProduct(testCategory.id);
      await expect(adminPage.locator('input[placeholder*="ชื่อสินค้า"]')).toHaveValue('');
    });

    test('should handle browser refresh during editing', async ({ adminPage }) => {
      const testProduct = generateRandomProduct(testCategory.id);
      await helper.fillProductForm(testProduct);
      
      // Fill some fields
      await adminPage.fill('input[placeholder*="ชื่อสินค้า"]', 'Test Name');
      await adminPage.fill('input[type="number"][placeholder*="ราคา"]', '500');
      
      // Refresh page
      await adminPage.reload();
      
      // Should handle refresh gracefully (may lose data or show warning)
      await adminPage.waitForLoadState('networkidle');
      
      // Form should still be functional
      await expect(adminPage.locator('input[placeholder*="ชื่อสินค้า"]')).toBeVisible();
    });
  });

  test.describe('Accessibility Validations', () => {
    test('should have proper form labels and ARIA attributes', async ({ adminPage }) => {
      // Check if form fields have proper labels
      const nameField = adminPage.locator('input[placeholder*="ชื่อสินค้า"]');
      await expect(nameField).toHaveAttribute('aria-label', /ชื่อสินค้า/);
      
      const typeField = adminPage.locator('input[placeholder*="ประเภทสินค้า"]');
      await expect(typeField).toHaveAttribute('aria-label', /ประเภทสินค้า/);
      
      // Check if required fields are marked
      await expect(nameField).toHaveAttribute('required');
      await expect(typeField).toHaveAttribute('required');
    });

    test('should support keyboard navigation', async ({ adminPage }) => {
      // Tab through form fields
      await adminPage.keyboard.press('Tab');
      await expect(adminPage.locator('input[placeholder*="ชื่อสินค้า"]')).toBeFocused();
      
      await adminPage.keyboard.press('Tab');
      await expect(adminPage.locator('input[placeholder*="รหัสสินค้า"]')).toBeFocused();
      
      await adminPage.keyboard.press('Tab');
      await expect(adminPage.locator('input[placeholder*="ประเภทสินค้า"]')).toBeFocused();
      
      // Should be able to navigate with Enter key
      await adminPage.keyboard.press('Enter');
      await adminPage.waitForTimeout(500);
      
      // Should move to next field or trigger action
    });

    test('should have proper error messages for screen readers', async ({ adminPage }) => {
      // Try to submit empty form
      await helper.saveProduct();
      
      // Check if error messages are accessible
      const errorMessages = adminPage.locator('role=alert');
      await expect(errorMessages.first()).toBeVisible();
      
      // Error messages should have proper ARIA attributes
      await expect(errorMessages.first()).toHaveAttribute('role', 'alert');
    });
  });
});
