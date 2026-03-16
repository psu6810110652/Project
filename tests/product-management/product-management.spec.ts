import { test, expect } from '../helpers/test-helpers';
import { ProductManagementHelper } from '../helpers/test-helpers';
import { TEST_PRODUCTS, TEST_CATEGORIES, generateRandomProduct } from '../fixtures/test-data';

test.describe('Product Management E2E Tests', () => {
  let helper: ProductManagementHelper;
  const testCategory = TEST_CATEGORIES[0]; // อาหารเสริม

  test.beforeEach(async ({ adminPage }) => {
    helper = new ProductManagementHelper(adminPage);
    await helper.navigateToProductManagement(testCategory.id);
  });

  test('should display product management page correctly', async ({ adminPage }) => {
    // Verify page title and header
    await expect(adminPage.locator('h1')).toContainText(testCategory.name);
    await expect(adminPage.locator('button:has-text("เพิ่มสินค้า")')).toBeVisible();
    
    // Verify table structure
    await expect(adminPage.locator('table')).toBeVisible();
    await expect(adminPage.locator('table thead th')).toHaveCount(6); // รหัส, ชื่อ, ราคา, จำนวน, สถานะ, จัดการ
    
    // Verify table headers
    await expect(adminPage.locator('table thead th:nth-child(1)')).toContainText('รหัสสินค้า');
    await expect(adminPage.locator('table thead th:nth-child(2)')).toContainText('ชื่อสินค้า');
    await expect(adminPage.locator('table thead th:nth-child(3)')).toContainText('ราคา');
    await expect(adminPage.locator('table thead th:nth-child(4)')).toContainText('จำนวน');
    await expect(adminPage.locator('table thead th:nth-child(5)')).toContainText('สถานะ');
    await expect(adminPage.locator('table thead th:nth-child(6)')).toContainText('จัดการ');
  });

  test('should navigate to create product page', async ({ adminPage }) => {
    await adminPage.click('button:has-text("เพิ่มสินค้า")');
    
    // Verify navigation to create product page
    await expect(adminPage).toHaveURL(new RegExp(`/admin/products/${testCategory.id}/new`));
    await expect(adminPage.locator('h1')).toContainText('เพิ่มสินค้าใหม่');
    
    // Verify form elements are present
    await expect(adminPage.locator('input[placeholder*="ชื่อสินค้า"]')).toBeVisible();
    await expect(adminPage.locator('input[placeholder*="ประเภทสินค้า"]')).toBeVisible();
    await expect(adminPage.locator('input[placeholder*="ราคา"]')).toBeVisible();
    await expect(adminPage.locator('input[placeholder*="จำนวน"]')).toBeVisible();
    await expect(adminPage.locator('textarea[placeholder*="รายละเอียด"]')).toBeVisible();
    await expect(adminPage.locator('textarea[placeholder*="วิธีใช้"]')).toBeVisible();
  });

  test('should create a new product successfully', async ({ adminPage }) => {
    const testProduct = generateRandomProduct(testCategory.id);
    
    // Navigate to create product page
    await helper.navigateToCreateProduct(testCategory.id);
    
    // Fill product form
    await helper.fillProductForm(testProduct);
    
    // Save product
    await helper.saveProduct();
    
    // Verify success message
    await helper.waitForSuccessMessage();
    
    // Navigate back to product list
    await adminPage.waitForTimeout(1500); // Wait for redirect
    await helper.navigateToProductManagement(testCategory.id);
    
    // Verify product appears in list
    await helper.verifyProductExists(testProduct.name);
  });

  test('should edit an existing product', async ({ adminPage }) => {
    // First create a product to edit
    const testProduct = generateRandomProduct(testCategory.id);
    await helper.navigateToCreateProduct(testCategory.id);
    await helper.fillProductForm(testProduct);
    await helper.saveProduct();
    await helper.waitForSuccessMessage();
    
    // Navigate back to product list
    await helper.navigateToProductManagement(testCategory.id);
    
    // Find and click edit button for the created product
    const productRow = await helper.getProductByName(testProduct.name);
    await productRow.locator('button:has-text("แก้ไข")').click();
    
    // Verify edit page loads
    await expect(adminPage.locator('h1')).toContainText('แก้ไขรายละเอียดสินค้า');
    
    // Modify product details
    const updatedName = `${testProduct.name} (Updated)`;
    const updatedPrice = testProduct.price + 100;
    const updatedDescription = 'Updated description for testing';
    
    await adminPage.fill('input[placeholder*="ชื่อสินค้า"]', updatedName);
    await adminPage.fill('input[type="number"][placeholder*="ราคา"]', updatedPrice.toString());
    await adminPage.fill('textarea[placeholder*="รายละเอียด"]', updatedDescription);
    
    // Save changes
    await helper.saveProduct();
    
    // Verify success message
    await helper.waitForSuccessMessage();
    
    // Navigate back to product list
    await helper.navigateToProductManagement(testCategory.id);
    
    // Verify updated product appears in list
    await helper.verifyProductExists(updatedName);
  });

  test('should delete a product', async ({ adminPage }) => {
    // First create a product to delete
    const testProduct = generateRandomProduct(testCategory.id);
    await helper.navigateToCreateProduct(testCategory.id);
    await helper.fillProductForm(testProduct);
    await helper.saveProduct();
    await helper.waitForSuccessMessage();
    
    // Navigate back to product list
    await helper.navigateToProductManagement(testCategory.id);
    
    // Verify product exists before deletion
    await helper.verifyProductExists(testProduct.name);
    
    // Find and click delete button for the created product
    const productRow = await helper.getProductByName(testProduct.name);
    await productRow.locator('button:has-text("ลบ")').click();
    
    // Confirm deletion
    await adminPage.click('button:has-text("ลบ"):has-text("confirm")');
    
    // Verify success message
    await helper.waitForSuccessMessage();
    
    // Verify product is removed from list
    await helper.verifyProductNotExists(testProduct.name);
  });

  test('should search products correctly', async ({ adminPage }) => {
    // Create multiple test products
    const products = [
      generateRandomProduct(testCategory.id),
      generateRandomProduct(testCategory.id),
      generateRandomProduct(testCategory.id)
    ];
    
    // Create products
    for (const product of products) {
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(product);
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
    }
    
    // Navigate back to product list
    await helper.navigateToProductManagement(testCategory.id);
    
    // Test search functionality
    const searchTerm = products[0].name.substring(0, 10); // Search for first 10 chars
    await helper.searchProducts(searchTerm);
    
    // Verify search results
    await expect(adminPage.locator('table tbody tr')).toHaveCount(1);
    await expect(adminPage.locator('table tbody tr')).toContainText(searchTerm);
    
    // Clear search
    await adminPage.fill('input[placeholder*="ค้นหา"], input[type="search"]', '');
    await adminPage.waitForTimeout(500);
    
    // Verify all products are shown again
    const productCount = await helper.getProductCount();
    expect(productCount).toBeGreaterThanOrEqual(3);
  });

  test('should handle product pagination', async ({ adminPage }) => {
    // Create enough products to trigger pagination (more than 6)
    const products = Array.from({ length: 8 }, () => generateRandomProduct(testCategory.id));
    
    // Create products
    for (const product of products) {
      await helper.navigateToCreateProduct(testCategory.id);
      await helper.fillProductForm(product);
      await helper.saveProduct();
      await helper.waitForSuccessMessage();
    }
    
    // Navigate back to product list
    await helper.navigateToProductManagement(testCategory.id);
    
    // Verify pagination controls are visible
    await expect(adminPage.locator('.ant-pagination')).toBeVisible();
    
    // Verify initial page shows 6 products (default page size)
    const initialCount = await helper.getProductCount();
    expect(initialCount).toBeLessThanOrEqual(6);
    
    // Navigate to next page if available
    const nextPageButton = adminPage.locator('.ant-pagination-next:not(.ant-pagination-disabled)');
    if (await nextPageButton.isVisible()) {
      await nextPageButton.click();
      await adminPage.waitForTimeout(500);
      
      // Verify next page has products
      const nextPageCount = await helper.getProductCount();
      expect(nextPageCount).toBeGreaterThan(0);
    }
  });

  test('should validate product form fields', async ({ adminPage }) => {
    await helper.navigateToCreateProduct(testCategory.id);
    
    // Try to save without filling required fields
    await helper.saveProduct();
    
    // Should show validation error for name
    await helper.waitForErrorMessage();
    await expect(adminPage.locator('text=/กรุณาระบุชื่อสินค้า|กรุณาระบุประเภทสินค้า/')).toBeVisible();
    
    // Fill name but leave type empty
    await adminPage.fill('input[placeholder*="ชื่อสินค้า"]', 'Test Product');
    await helper.saveProduct();
    
    // Should show validation error for type
    await expect(adminPage.locator('text=/กรุณาระบุประเภทสินค้า/')).toBeVisible();
    
    // Fill both required fields
    await adminPage.fill('input[placeholder*="ประเภทสินค้า"]', 'วิตามิน');
    await adminPage.fill('input[type="number"][placeholder*="ราคา"]', '100');
    
    // Should save successfully now
    await helper.saveProduct();
    await helper.waitForSuccessMessage();
  });

  test('should handle promotion settings correctly', async ({ adminPage }) => {
    const testProduct = generateRandomProduct(testCategory.id);
    testProduct.isPromotion = true;
    testProduct.promotionPrice = 199;
    
    await helper.navigateToCreateProduct(testCategory.id);
    await helper.fillProductForm(testProduct);
    
    // Verify promotion checkbox is checked
    await expect(adminPage.locator('input[type="checkbox"]:has-text("โปรโมชั่น")')).toBeChecked();
    
    // Verify promotion price field is visible
    await expect(adminPage.locator('input[type="number"][placeholder*="โปรโมชั่น"]')).toBeVisible();
    
    // Save product
    await helper.saveProduct();
    await helper.waitForSuccessMessage();
    
    // Navigate back and verify promotion status
    await helper.navigateToProductManagement(testCategory.id);
    const productRow = await helper.getProductByName(testProduct.name);
    
    // Should show promotion price in the price column
    await expect(productRow).toContainText(testProduct.promotionPrice.toString());
  });

  test('should handle featured product settings', async ({ adminPage }) => {
    const testProduct = generateRandomProduct(testCategory.id);
    testProduct.isFeatured = true;
    
    await helper.navigateToCreateProduct(testCategory.id);
    await helper.fillProductForm(testProduct);
    
    // Verify featured checkbox is checked
    await expect(adminPage.locator('input[type="checkbox"]:has-text("แนะนำ")')).toBeChecked();
    
    // Save product
    await helper.saveProduct();
    await helper.waitForSuccessMessage();
    
    // Navigate back and verify product exists
    await helper.navigateToProductManagement(testCategory.id);
    await helper.verifyProductExists(testProduct.name);
  });

  test('should handle image upload', async ({ adminPage }) => {
    const testProduct = generateRandomProduct(testCategory.id);
    
    await helper.navigateToCreateProduct(testCategory.id);
    await helper.fillProductForm(testProduct);
    
    // Upload test images
    await helper.uploadTestImages();
    
    // Verify image upload area shows uploaded images
    await expect(adminPage.locator('img[alt*="product"]')).toHaveCount(1);
    
    // Save product with images
    await helper.saveProduct();
    await helper.waitForSuccessMessage();
    
    // Navigate back and verify product exists
    await helper.navigateToProductManagement(testCategory.id);
    await helper.verifyProductExists(testProduct.name);
  });

  test('should handle product specifications', async ({ adminPage }) => {
    const testProduct = generateRandomProduct(testCategory.id);
    testProduct.specifications = {
      'น้ำหนัก': '100g',
      'ประเภทผิว': 'ทุกสภาพผิว',
      'การรับรอง': 'FDA'
    };
    
    await helper.navigateToCreateProduct(testCategory.id);
    await helper.fillProductForm(testProduct);
    
    // Verify specifications are filled
    await expect(adminPage.locator('input[placeholder*="หัวข้อ"]').first()).toHaveValue('น้ำหนัก');
    await expect(adminPage.locator('input[placeholder*="รายละเอียด"]').first()).toHaveValue('100g');
    
    // Save product
    await helper.saveProduct();
    await helper.waitForSuccessMessage();
    
    // Navigate back and verify product exists
    await helper.navigateToProductManagement(testCategory.id);
    await helper.verifyProductExists(testProduct.name);
  });
});
