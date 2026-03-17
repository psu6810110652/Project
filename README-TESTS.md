# Product Management E2E Tests with Playwright

This directory contains comprehensive End-to-End (E2E) tests for the product management functionality using Playwright.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Categories](#test-categories)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## 🎯 Overview

The test suite covers all aspects of product management including:

- ✅ **Create, Read, Update, Delete (CRUD) operations**
- ✅ **Form validation and error handling**
- ✅ **Image upload functionality**
- ✅ **Promotion and featured product settings**
- ✅ **Search and pagination**
- ✅ **Accessibility testing**
- ✅ **Cross-browser compatibility**
- ✅ **Mobile responsiveness**

## 🛠️ Prerequisites

Before running the tests, ensure you have:

- Node.js (v18 or higher)
- npm or yarn
- Access to the frontend and backend applications
- Admin user credentials for testing

## 📦 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Install Playwright browsers:**
```bash
npm run test:install
```

3. **Set up environment variables:**
```bash
# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

## 🏗️ Test Structure

```
tests/
├── fixtures/
│   └── test-data.ts          # Test data and constants
├── helpers/
│   └── test-helpers.ts       # Utility functions and helpers
├── product-management/
│   ├── product-management.spec.ts    # Main E2E tests
│   ├── product-crud.spec.ts          # CRUD operation tests
│   └── product-validation.spec.ts    # Validation tests
├── global-setup.ts              # Global test setup
├── global-teardown.ts           # Global test cleanup
└── playwright.config.ts         # Playwright configuration
```

## 🚀 Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in headed mode (show browser)
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Debug tests
npm run test:debug

# Generate test report
npm run test:report
```

### Running Specific Tests

```bash
# Run specific test file
npx playwright test tests/product-management/product-management.spec.ts

# Run tests with specific pattern
npx playwright test --grep "should create product"

# Run tests for specific browser
npx playwright test --project=chromium

# Run tests in mobile view
npx playwright test --project="Mobile Chrome"
```

### Running Tests with Options

```bash
# Run tests with retries
npx playwright test --retries=3

# Run tests in parallel
npx playwright test --workers=4

# Run tests with timeout
npx playwright test --timeout=60000

# Run tests and generate video
npx playwright test --video=retain-on-failure
```

## 📊 Test Categories

### 1. Product Management E2E Tests (`product-management.spec.ts`)

**Coverage:**
- Page navigation and layout
- Product creation workflow
- Product editing workflow
- Product deletion workflow
- Search functionality
- Pagination handling
- Form validation
- Promotion settings
- Featured product settings
- Image upload
- Product specifications

**Key Test Scenarios:**
```typescript
test('should display product management page correctly')
test('should navigate to create product page')
test('should create a new product successfully')
test('should edit an existing product')
test('should delete a product')
test('should search products correctly')
test('should handle product pagination')
test('should validate product form fields')
test('should handle promotion settings correctly')
test('should handle featured product settings')
test('should handle image upload')
test('should handle product specifications')
```

### 2. CRUD Operations Tests (`product-crud.spec.ts`)

**Coverage:**
- CREATE operations with all field combinations
- READ operations and data display
- UPDATE operations for all fields
- DELETE operations with confirmation
- Error handling and edge cases
- Network error simulation
- Authorization testing

**Key Test Scenarios:**
```typescript
test.describe('CREATE Operations')
test('should create product with all fields')
test('should create product without optional fields')
test('should generate product ID automatically')
test('should handle multiple image uploads')

test.describe('READ Operations')
test('should display product list with correct data')
test('should display product details correctly')
test('should filter products by category')

test.describe('UPDATE Operations')
test('should update all product fields')
test('should update product promotion status')
test('should update product specifications')
test('should update product images')

test.describe('DELETE Operations')
test('should delete product with confirmation')
test('should cancel deletion when clicking cancel')
test('should handle deletion of product with images')

test.describe('Error Handling')
test('should handle network errors gracefully')
test('should handle unauthorized access')
```

### 3. Validation Tests (`product-validation.spec.ts`)

**Coverage:**
- Required field validations
- Field length validations
- Promotion price validations
- Image upload validations
- Specification validations
- Form state validations
- Accessibility validations

**Key Test Scenarios:**
```typescript
test.describe('Required Field Validations')
test('should validate product name is required')
test('should validate product type is required')
test('should validate price is required and positive')
test('should validate stock is non-negative')

test.describe('Field Length Validations')
test('should handle very long product names')
test('should handle very long descriptions')
test('should handle very long how-to-use text')

test.describe('Promotion Validations')
test('should validate promotion price when promotion is enabled')
test('should hide promotion price field when promotion is disabled')
test('should toggle promotion price field visibility')

test.describe('Image Upload Validations')
test('should validate image file types')
test('should handle large image files')
test('should limit number of uploaded images')

test.describe('Specification Validations')
test('should validate specification fields')
test('should handle duplicate specification keys')
test('should remove specifications correctly')

test.describe('Form State Validations')
test('should prevent double submission')
test('should handle form reset/cancel')
test('should handle browser refresh during editing')

test.describe('Accessibility Validations')
test('should have proper form labels and ARIA attributes')
test('should support keyboard navigation')
test('should have proper error messages for screen readers')
```

## ⚙️ Configuration

### Playwright Configuration (`playwright.config.ts`)

Key configuration options:

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Environment Variables

Create a `.env` file:

```env
# Base URL for frontend application
BASE_URL=http://localhost:3000

# API URL for backend
API_BASE_URL=http://localhost:3001

# Test credentials
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=admin123
TEST_USER_EMAIL=user@test.com
TEST_USER_PASSWORD=user123

# Test mode
TEST_MODE=true
```

## 🔧 Troubleshooting

### Common Issues

1. **Tests fail with "Backend not ready" error:**
   ```bash
   # Ensure backend is running
   cd backend && npm run start:dev
   
   # Or wait for backend to start before running tests
   npm run dev:backend
   sleep 10
   npm test
   ```

2. **Tests fail with authentication errors:**
   ```bash
   # Check if test users exist in database
   # Verify login credentials in .env file
   # Check if authentication endpoints are accessible
   ```

3. **Tests timeout on slow connections:**
   ```bash
   # Increase timeout in playwright.config.ts
   timeout: 60 * 1000, // 60 seconds
   
   # Or run with increased timeout
   npx playwright test --timeout=120000
   ```

4. **Browser installation issues:**
   ```bash
   # Reinstall Playwright browsers
   npx playwright install
   
   # Install specific browsers
   npx playwright install chromium firefox webkit
   ```

5. **Tests fail on CI/CD:**
   ```bash
   # Ensure proper CI configuration
   # Check environment variables
   # Verify test dependencies are installed
   ```

### Debugging Tests

1. **Run tests in debug mode:**
   ```bash
   npm run test:debug
   ```

2. **Run tests with UI mode:**
   ```bash
   npm run test:ui
   ```

3. **Run tests in headed mode:**
   ```bash
   npm run test:headed
   ```

4. **Generate traces for debugging:**
   ```bash
   npx playwright test --trace=on
   # View trace: npx playwright show-trace trace.zip
   ```

5. **Take screenshots manually:**
   ```typescript
   await page.screenshot({ path: 'debug.png' });
   ```

## 📈 Best Practices

### Test Organization

1. **Use descriptive test names:**
   ```typescript
   test('should create product with promotion and featured settings')
   test('should validate required fields when creating product')
   ```

2. **Group related tests:**
   ```typescript
   test.describe('Product Creation', () => {
     test('should create basic product')
     test('should create product with images')
   })
   ```

3. **Use beforeEach/afterEach for setup:**
   ```typescript
   test.beforeEach(async ({ adminPage }) => {
     helper = new ProductManagementHelper(adminPage);
     await helper.navigateToProductManagement(testCategory.id);
   });
   ```

### Test Data Management

1. **Use factory functions for test data:**
   ```typescript
   const testProduct = generateRandomProduct(testCategory.id);
   ```

2. **Clean up test data:**
   ```typescript
   test.afterEach(async ({ adminPage }) => {
     // Clean up created products
     await cleanupTestData();
   });
   ```

3. **Use meaningful test data:**
   ```typescript
   const testProduct = {
     name: 'Test Vitamin C 1000mg',
     price: 299,
     type: 'วิตามิน',
     // ... other fields
   };
   ```

### Error Handling

1. **Wait for elements properly:**
   ```typescript
   await expect(page.locator('button')).toBeVisible();
   await page.waitForLoadState('networkidle');
   ```

2. **Handle async operations:**
   ```typescript
   const apiResponse = waitForApiCall(page, '/product');
   await helper.saveProduct();
   await apiResponse;
   ```

3. **Use proper assertions:**
   ```typescript
   await expect(productRow).toContainText('Test Product');
   await expect(saveButton).toBeDisabled();
   ```

### Performance Optimization

1. **Reuse page instances:**
   ```typescript
   test.use({ storageState: 'admin-auth.json' });
   ```

2. **Parallel test execution:**
   ```typescript
   fullyParallel: true,
   workers: 4,
   ```

3. **Optimize selectors:**
   ```typescript
   // Good: Specific and stable
   page.locator('button[data-testid="save-product"]')
   
   // Bad: Brittle and slow
   page.locator('div > button > span')
   ```

## 📝 Test Reports

After running tests, you can view detailed reports:

1. **HTML Report:**
   ```bash
   npm run test:report
   # Opens: http://localhost:9323
   ```

2. **JSON Report:**
   ```bash
   # View test-results/results.json
   ```

3. **JUnit Report:**
   ```bash
   # View test-results/results.xml
   ```

4. **Console Report:**
   ```bash
   # Results are printed to console
   ```

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:install
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Organization Guide](https://playwright.dev/docs/test-organization)
- [Debugging Tests](https://playwright.dev/docs/debug)

## 🤝 Contributing

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Add proper assertions
4. Clean up test data
5. Update documentation

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review Playwright documentation
3. Check test logs and traces
4. Verify application is running correctly

---

**Happy Testing! 🎉**
