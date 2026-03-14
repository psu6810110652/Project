# Sold Products Table Setup for Banner Display

## Overview
This setup creates a `sold_products` table to track individual product sales from orders, which can be used by the banner system to display recently sold products, top-selling products, and category-specific sales data.

## Files Created/Modified

### 1. New Entity
- `src/orders/entities/sold-product.entity.ts` - Defines the SoldProduct entity

### 2. Modified Files
- `src/orders/entities/order.entity.ts` - Added soldProducts relationship
- `src/product/entities/product.entity.ts` - Added soldProducts relationship  
- `src/typeorm.config.ts` - Added SoldProduct entity import
- `src/orders/orders.module.ts` - Added SoldProduct to TypeORM imports
- `src/orders/orders.service.ts` - Added sold products creation and banner data methods
- `src/orders/orders.controller.ts` - Added banner endpoints

### 3. Database Setup
- `src/migrations/CreateSoldProductsTable.ts` - TypeORM migration (has syntax issues)
- `create-sold-products-table.sql` - Manual SQL script (recommended)

## Database Setup

### Option 1: Manual SQL Script (Recommended)
Run the SQL script directly in your Supabase/PostgreSQL database:

```bash
psql -h your_host -U your_user -d your_database -f create-sold-products-table.sql
```

Or run the SQL commands manually in Supabase SQL Editor.

### Option 2: TypeORM Migration (Fix Required)
The migration file has syntax issues that need to be fixed before running.

## API Endpoints

### Banner Data Endpoints (Public)

1. **Get Recent Sold Products**
   ```
   GET /api/admin/orders/banner/recent-sold?limit=10
   ```

2. **Get Top Selling Products** 
   ```
   GET /api/admin/orders/banner/top-selling?limit=10
   ```

3. **Get Recent Sold Products by Category**
   ```
   GET /api/admin/orders/banner/recent-sold/:categoryId?limit=5
   ```

### Response Examples

#### Recent Sold Products
```json
[
  {
    "id": "uuid",
    "orderId": "uuid", 
    "productId": "product-123",
    "productName": "ปุ๋ยอินทรีย์มูลไก่",
    "quantity": 2,
    "unitPrice": 150.00,
    "totalPrice": 300.00,
    "productImageUrl": "https://...",
    "categoryId": "cat-123",
    "categoryName": "ปุ๋ย",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### Top Selling Products
```json
[
  {
    "productId": "product-123",
    "productName": "ปุ๋ยอินทรีย์มูลไก่",
    "productImageUrl": "https://...",
    "categoryId": "cat-123", 
    "categoryName": "ปุ๋ย",
    "totalSold": 25,
    "totalRevenue": 3750.00,
    "orderCount": 18
  }
]
```

## How It Works

### 1. Automatic Data Creation
When an order status is changed to "completed", the system automatically:
- Creates records in the `sold_products` table for each product in the order
- Stores product details, pricing, quantity, and category information
- Preserves data even if the original product is later modified or deleted

### 2. Banner Data Queries
The banner endpoints query the `sold_products` table to provide:
- **Recent sales**: Latest products that have been sold
- **Top sellers**: Products with highest total quantity sold
- **Category-specific**: Recent sales within specific categories

### 3. Performance Optimized
- Indexed on `product_id`, `created_at`, and `category_id`
- Uses efficient SQL queries with aggregation
- Limits results to prevent excessive data transfer

## Frontend Integration

### Example Usage in React
```javascript
// Fetch recent sold products for banner
const fetchRecentSold = async () => {
  const response = await fetch('/api/admin/orders/banner/recent-sold?limit=5');
  const products = await response.json();
  return products;
};

// Fetch top selling products  
const fetchTopSelling = async () => {
  const response = await fetch('/api/admin/orders/banner/top-selling?limit=10');
  const products = await response.json();
  return products;
};
```

## Data Structure

### SoldProduct Table Schema
- `id`: UUID primary key
- `order_id`: References orders.id (CASCADE delete)
- `product_id`: Product identifier
- `product_name`: Product name at time of sale
- `quantity`: Quantity sold
- `unit_price`: Price per unit at time of sale
- `total_price`: Total price (quantity × unit_price)
- `product_image_url`: Product image URL
- `category_id`: Category identifier
- `category_name`: Category name at time of sale
- `created_at`: When the sale was recorded

## Benefits

1. **Historical Data**: Preserves product information at time of sale
2. **Performance**: Optimized queries for banner display
3. **Flexibility**: Multiple query options for different banner needs
4. **Reliability**: Data persists even if original products change
5. **Analytics**: Enables sales analytics and reporting

## Troubleshooting

### Common Issues

1. **Migration Errors**: Use the manual SQL script instead
2. **Missing Data**: Ensure orders are marked as "completed" to trigger sold product creation
3. **Empty Results**: Check that there are completed orders in the system
4. **Performance**: Add more indexes if querying specific date ranges

### Debug Commands

```sql
-- Check if table exists
SELECT * FROM sold_products LIMIT 1;

-- Check recent entries
SELECT * FROM sold_products ORDER BY created_at DESC LIMIT 10;

-- Check top selling products
SELECT product_id, product_name, SUM(quantity) as total_sold 
FROM sold_products 
GROUP BY product_id, product_name 
ORDER BY total_sold DESC LIMIT 10;
```
