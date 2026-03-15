# Favorites Migration: From Products to Users Table

## Overview
This migration moves the favorite tracking system from a simple `favorite_count` column in the products table to a proper relational `user_favorites` table that tracks which users favorited which products.

## 🔄 **What Changed**

### Before (Products Table)
```sql
products.favorite_count -- Simple counter
```

### After (User Favorites Table)
```sql
user_favorites table -- Tracks individual user favorites
- id (UUID)
- user_id (Integer) 
- product_id (String)
- created_at (Timestamp)
```

## 📁 **Files Created/Modified**

### New Files
- `src/users/entities/favorite.entity.ts` - Favorite entity
- `src/users/favorites.service.ts` - Favorites business logic
- `src/users/favorites.controller.ts` - Favorites API endpoints
- `migrate-favorites-to-users.sql` - Database migration script
- `FAVORITES_MIGRATION.md` - This documentation

### Modified Files
- `src/users/entities/user.entity.ts` - Added favorites relationship
- `src/product/entities/product.entity.ts` - Removed favorite_count, added favorites relationship
- `src/users/users.module.ts` - Added favorites functionality
- `src/product/product.module.ts` - Added UsersModule import
- `src/product/product.controller.ts` - Updated to use FavoritesService
- `src/typeorm.config.ts` - Added Favorite entity

## 🚀 **New API Endpoints**

### Favorites Management
```
POST   /favorites/:productId          - Add to favorites
DELETE /favorites/:productId          - Remove from favorites
GET    /favorites                     - Get user's favorites
GET    /favorites/:productId/check    - Check if favorited
```

### Public Endpoints
```
GET    /favorites/:productId/count    - Get favorite count
GET    /favorites/banner/most-favorited - Get most favorited products
```

## 🗄️ **Database Migration**

### Step 1: Run Migration Script
```bash
# In Supabase SQL Editor or psql
\i migrate-favorites-to-users.sql
```

### Step 2: Verify Migration
```sql
-- Check table exists
SELECT * FROM user_favorites LIMIT 5;

-- Check favorite counts
SELECT product_id, COUNT(*) as count 
FROM user_favorites 
GROUP BY product_id 
ORDER BY count DESC LIMIT 10;
```

## 📊 **Benefits of New System**

### 1. **User-Specific Tracking**
- Know exactly which users favorited which products
- Enable personalization features
- User-specific favorite lists

### 2. **Better Data Integrity**
- No more manual favorite count updates
- Real-time accurate counts
- Prevents duplicate favorites

### 3. **Enhanced Features**
- "Users who liked this also liked..."
- Favorite history and analytics
- Targeted recommendations

### 4. **Scalability**
- Better performance with proper indexing
- Efficient queries for user-specific data
- Supports advanced filtering

## 🔧 **Frontend Integration**

### Example Usage
```javascript
// Add to favorites
await fetch('/favorites/product-123', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' }
});

// Check if favorited
const response = await fetch('/favorites/product-123/check', {
  headers: { 'Authorization': 'Bearer token' }
});
const { isFavorite } = await response.json();

// Get user's favorites
const favorites = await fetch('/favorites', {
  headers: { 'Authorization': 'Bearer token' }
});

// Get favorite count (public)
const { favoriteCount } = await fetch('/favorites/product-123/count');
```

## 🔄 **Data Migration Process**

### Existing Data
If you have existing `favorite_count` data, you'll need to migrate it:

```sql
-- Example: Distribute existing counts to sample users
-- (This would need to be customized based on your data)
INSERT INTO user_favorites (user_id, product_id)
SELECT 
  -- Logic to assign favorites to users
  -- This depends on your user data and requirements
FROM products 
WHERE favorite_count > 0;
```

## 🧪 **Testing the Migration**

### 1. Backend Tests
```bash
# Start the server
npm run start:dev

# Test endpoints
curl -X POST http://localhost:3000/favorites/product-123 \
  -H "Authorization: Bearer your-token"

curl http://localhost:3000/favorites/product-123/count
```

### 2. Database Verification
```sql
-- Test table structure
\d user_favorites

-- Test relationships
SELECT u.username, p.name, f.created_at
FROM user_favorites f
JOIN users u ON f.user_id = u.id  
JOIN products p ON f.product_id = p.id
LIMIT 10;
```

## 🚨 **Important Notes**

### 1. **Breaking Changes**
- `product.favoriteCount` no longer exists
- Must use `FavoritesService.getFavoriteCount()` instead
- Frontend needs to update to new API endpoints

### 2. **Performance Considerations**
- Added indexes for optimal performance
- Consider caching favorite counts for high-traffic products
- Monitor query performance after migration

### 3. **Backward Compatibility**
- Created view `product_favorite_counts` if needed
- API endpoints maintain similar functionality
- Gradual migration approach recommended

## 📝 **Post-Migration Checklist**

- [ ] Run SQL migration script
- [ ] Update frontend to use new endpoints
- [ ] Test favorites functionality
- [ ] Update any cron jobs using favorite_count
- [ ] Monitor database performance
- [ ] Update documentation
- [ ] Train team on new system

## 🔍 **Troubleshooting**

### Common Issues

1. **Missing FavoritesService Error**
   - Ensure UsersModule is imported in ProductModule
   - Check that FavoritesService is exported from UsersModule

2. **Foreign Key Constraint Errors**
   - Verify user_id and product_id exist in respective tables
   - Check data types match (Integer vs String)

3. **Performance Issues**
   - Ensure indexes are created
   - Monitor slow queries
   - Consider caching for frequently accessed counts

### Debug Commands
```sql
-- Check table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'user_favorites';

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename = 'user_favorites';

-- Check relationships
SELECT conname, conrelid, confrelid 
FROM pg_constraint 
WHERE conrelid = 'user_favorites'::regclass;
```

## 🎉 **Migration Complete!**

After completing this migration:
- ✅ Favorites are now properly tracked per user
- ✅ More accurate and real-time favorite counts
- ✅ Better foundation for personalization features
- ✅ Improved data integrity and performance
- ✅ Enhanced analytics capabilities

The system is now ready for advanced favorite-based features!
