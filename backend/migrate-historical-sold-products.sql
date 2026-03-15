-- Migration script to create historical sold products data from existing completed orders
-- สร้างข้อมูลสินค้าที่ขายแล้วย้อนหลังจากออเดอร์ที่ completed อยู่แล้ว

-- =====================================================
-- 1. ตรวจสอบข้อมูลที่จะ migrate
-- =====================================================

-- ดูจำนวนออเดอร์ที่ completed อยู่แล้ว
SELECT 
    COUNT(*) as total_completed_orders,
    MIN(created_at) as earliest_order,
    MAX(created_at) as latest_order
FROM orders 
WHERE status = 'completed';

-- ดูตัวอย่างข้อมูลในออเดอร์ที่ completed
SELECT 
    id as order_id,
    customer_id,
    total_amount,
    created_at,
    products
FROM orders 
WHERE status = 'completed' 
LIMIT 5;

-- =====================================================
-- 2. สร้างข้อมูลย้อนหลังในตาราง sold_products
-- =====================================================

-- สร้างข้อมูลสินค้าที่ขายแล้วจากออเดอร์ที่ completed ทั้งหมด
INSERT INTO sold_products (
    id,
    order_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    total_price,
    product_image_url,
    category_id,
    category_name,
    created_at
)
SELECT 
    gen_random_uuid() as id,  -- สร้าง UUID ใหม่สำหรับแต่ละรายการ
    o.id as order_id,
    (item->>'productId') as product_id,  -- ดึง productId จาก JSON
    (item->>'name') as product_name,     -- ดึง name จาก JSON
    CAST((item->>'quantity') AS INTEGER) as quantity,    -- ดึง quantity จาก JSON
    CAST(
        COALESCE(
            (item->>'price')::DECIMAL(10,2),  -- ราคาใน order
            (SELECT price FROM products WHERE id = (item->>'productId') LIMIT 1),  -- ราคาปัจจุบัน
            0
        ) AS DECIMAL(10,2)
    ) as unit_price,
    CAST(
        COALESCE(
            (item->>'price')::DECIMAL(10,2),  -- ราคาใน order
            (SELECT price FROM products WHERE id = (item->>'productId') LIMIT 1),  -- ราคาปัจจุบัน
            0
        ) * CAST((item->>'quantity') AS INTEGER)
    ) AS DECIMAL(10,2)
    ) as total_price,
    COALESCE(
        (SELECT thumbnail_urls FROM products WHERE id = (item->>'productId') LIMIT 1)->>0,  -- รูปภาพแรก
        (SELECT image_urls FROM products WHERE id = (item->>'productId') LIMIT 1)->>0,
        ''
    ) as product_image_url,
    COALESCE(
        CAST((SELECT category_id FROM products WHERE id = (item->>'productId') LIMIT 1) AS VARCHAR),
        ''
    ) as category_id,
    COALESCE(
        (SELECT name FROM categories c WHERE c.id = (SELECT category_id FROM products WHERE id = (item->>'productId') LIMIT 1) LIMIT 1),
        ''
    ) as category_name,
    o.created_at as created_at  -- ใช้เวลาสร้างออเดอร์เป็นเวลาขาย
FROM orders o,
    json_array_elements(o.products) as item  -- แยกแต่ละสินค้าใน array
WHERE o.status = 'completed'  -- เฉพาะออเดอร์ที่ completed เท่านั้น
    AND (item->>'productId') IS NOT NULL  -- ต้องมี productId
    AND (item->>'productId') != ''  -- ต้องไม่ใช่ค่าว่าง
    AND CAST((item->>'quantity') AS INTEGER) > 0;  -- จำนวนต้องมากกว่า 0

-- =====================================================
-- 3. อัพเดต soldCount ในตาราง products
-- =====================================================

-- อัพเดต soldCount ให้ตรงกับข้อมูลจริงใน sold_products
UPDATE products 
SET sold_count = (
    SELECT COALESCE(SUM(sp.quantity), 0)
    FROM sold_products sp
    WHERE sp.product_id = products.id
);

-- =====================================================
-- 4. ตรวจสอบผลลัพธ์
-- =====================================================

-- ดูจำนวนรายการที่ถูกสร้าง
SELECT 
    COUNT(*) as total_sold_records,
    COUNT(DISTINCT order_id) as orders_processed,
    COUNT(DISTINCT product_id) as unique_products_sold,
    SUM(quantity) as total_items_sold,
    SUM(total_price) as total_revenue
FROM sold_products;

-- ดูตัวอย่างข้อมูลที่ถูกสร้าง
SELECT 
    order_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    total_price,
    category_name,
    created_at
FROM sold_products
ORDER BY created_at DESC
LIMIT 10;

-- ดูสรุปยอดขายตามสินค้า
SELECT 
    product_id,
    product_name,
    SUM(quantity) as total_sold,
    SUM(total_price) as total_revenue,
    COUNT(DISTINCT order_id) as order_count
FROM sold_products
GROUP BY product_id, product_name
ORDER BY total_sold DESC
LIMIT 10;

-- ดูสรุปยอดขายตามหมวดหมู่
SELECT 
    category_name,
    SUM(quantity) as total_sold,
    SUM(total_price) as total_revenue,
    COUNT(DISTINCT product_id) as unique_products
FROM sold_products
WHERE category_name != ''
GROUP BY category_name
ORDER BY total_sold DESC;

-- =====================================================
-- 5. ตรวจสอบความสมบูรณ์ของข้อมูล
-- =====================================================

-- ตรวจสอบว่ามีออเดอร์ completed ที่ยังไม่ถูก migrate หรือไม่
SELECT 
    COUNT(*) as unmigrated_orders,
    STRING_AGG(id::TEXT, ', ') as order_ids
FROM orders o
WHERE o.status = 'completed'
    AND NOT EXISTS (
        SELECT 1 FROM sold_products sp 
        WHERE sp.order_id = o.id
    );

-- ตรวจสอบสินค้าที่มีปัญหา (ไม่พบในตาราง products)
SELECT 
    DISTINCT sp.product_id,
    sp.product_name
FROM sold_products sp
LEFT JOIN products p ON p.id = sp.product_id
WHERE p.id IS NULL;

-- =====================================================
-- 6. สรุปผลการ migrate
-- =====================================================

DO $$
DECLARE
    total_orders INTEGER;
    total_sold_records INTEGER;
    total_products INTEGER;
    total_items INTEGER;
    total_revenue DECIMAL;
BEGIN
    -- นับจำนวนออเดอร์ที่ completed
    SELECT COUNT(*) INTO total_orders FROM orders WHERE status = 'completed';
    
    -- นับจำนวนรายการที่สร้างใน sold_products
    SELECT COUNT(*) INTO total_sold_records FROM sold_products;
    
    -- นับจำนวนสินค้าที่ขายได้
    SELECT COUNT(DISTINCT product_id) INTO total_products FROM sold_products;
    
    -- นับจำนวนสินค้าทั้งหมดที่ขายได้
    SELECT COALESCE(SUM(quantity), 0) INTO total_items FROM sold_products;
    
    -- นับรายได้ทั้งหมด
    SELECT COALESCE(SUM(total_price), 0) INTO total_revenue FROM sold_products;
    
    RAISE NOTICE '=== Migration Summary ===';
    RAISE NOTICE 'Completed Orders Found: %', total_orders;
    RAISE NOTICE 'Sold Records Created: %', total_sold_records;
    RAISE NOTICE 'Unique Products Sold: %', total_products;
    RAISE NOTICE 'Total Items Sold: %', total_items;
    RAISE NOTICE 'Total Revenue: %', total_revenue;
    RAISE NOTICE '========================';
END $$;

-- =====================================================
-- คำแนะนำในการรัน script
-- =====================================================

/*
วิธีการรัน:

1. ตรวจสอบข้อมูลก่อนรัน:
   - รันส่วนที่ 1 เพื่อดูว่ามีข้อมูลอะไรบ้าง

2. รันการ migrate:
   - รันส่วนที่ 2 เพื่อสร้างข้อมูลย้อนหลัง
   - รันส่วนที่ 3 เพื่ออัพเดต soldCount

3. ตรวจสอบผลลัพธ์:
   - รันส่วนที่ 4 เพื่อดูผลลัพธ์
   - รันส่วนที่ 5 เพื่อตรวจสอบความสมบูรณ์
   - รันส่วนที่ 6 เพื่อดูสรุป

คำเตือน:
- ควร backup ข้อมูลก่อนรัน
- ทดสอบใน environment ที่ไม่ใช่ production ก่อน
- script นี้จะไม่ซ้ำข้อมูลถ้ารันซ้ำ (เพราะมีการตรวจสอบ)
*/
