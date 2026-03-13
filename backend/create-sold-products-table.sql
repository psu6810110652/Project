-- Create sold_products table for banner data
CREATE TABLE IF NOT EXISTS sold_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_image_url TEXT,
    category_id VARCHAR(255),
    category_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sold_products_product_id ON sold_products(product_id);
CREATE INDEX IF NOT EXISTS idx_sold_products_created_at ON sold_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sold_products_category_id ON sold_products(category_id);

-- Create index for order_id for foreign key performance
CREATE INDEX IF NOT EXISTS idx_sold_products_order_id ON sold_products(order_id);
