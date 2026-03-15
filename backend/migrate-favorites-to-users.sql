-- Migration script to move favorite_count from products table to user_favorites table

-- 1. Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_user_favorites_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_favorites_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    -- Prevent duplicate favorites
    UNIQUE (user_id, product_id)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON user_favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at DESC);

-- 3. Drop favorite_count column from products table (if it exists)
ALTER TABLE products DROP COLUMN IF EXISTS favorite_count;

-- 4. Optional: Create a view for backward compatibility
CREATE OR REPLACE VIEW product_favorite_counts AS
SELECT 
    product_id,
    COUNT(id) as favorite_count
FROM user_favorites 
GROUP BY product_id;

-- Usage notes:
-- This script will:
-- 1. Create the new user_favorites table with proper relationships
-- 2. Add performance indexes
-- 3. Remove the old favorite_count column from products
-- 4. Create a view for backward compatibility if needed

-- To check the migration:
-- SELECT * FROM user_favorites LIMIT 5;
-- SELECT COUNT(*) as total_favorites FROM user_favorites;
-- SELECT product_id, COUNT(*) as count FROM user_favorites GROUP BY product_id ORDER BY count DESC LIMIT 10;
