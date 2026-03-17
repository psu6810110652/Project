import { test, expect } from './test-helpers';

/**
 * 📦 การทดสอบการจัดการคำสั่งซื้อ (Order Management Tests)
 * เน้นเฉพาะส่วนการจัดการของแอดมินและประวัติการสั่งซื้อของผู้ใช้
 * ตามคำขอของผู้ใช้: ไม่ยุ่งกับส่วน Login, Payment, และ Product Management UI (ให้เพื่อนทำ)
 */

test.describe('Order Management (Admin & User Visibility)', () => {
    
    // หมายเหตุ: ใช้ adminPage และ userPage fixtures จาก test-helpers 
    // ซึ่งข้ามขั้นตอนการเขียนโค้ดล็อกอินในไฟล์นี้เอง

    test('Admin should be able to view and filter order list', async ({ adminPage }) => {
        console.log('--- 🛡️ Testing Admin Order Filter ---');
        await adminPage.goto('/admin/orders');
        
        // รอให้หน้าโหลด
        await adminPage.waitForLoadState('networkidle');
        
        // ตรวจสอบหัวข้อหน้า
        await expect(adminPage.locator('h1')).toContainText('จัดการคำสั่งซื้อ', { timeout: 15000 });
        console.log('✅ Admin dashboard loaded');
        
        // ตรวจสอบคอลัมน์สำคัญ
        const headers = adminPage.locator('th');
        await expect(headers).toContainText(['รหัสสั่งซื้อ', 'ชื่อ', 'สถานะ', 'จัดการ']);

        // ทดสอบฟิลเตอร์สถานะ (ถ้ามี)
        const filterIcon = adminPage.locator('.ant-table-filter-trigger').first();
        if (await filterIcon.isVisible()) {
            await filterIcon.click();
            await adminPage.click('text=รอยืนยัน');
            // ใช้ selector ที่ครอบคลุมขึ้นสำหรับปุ่ม OK ใน Filter ของ Ant Design
            const okButton = adminPage.locator('.ant-table-filter-dropdown button:has-text("OK"), .ant-popover button:has-text("OK"), button:has-text("OK")').first();
            await okButton.click({ force: true });
            // ตรวจสอบว่าตารางอัปเดต (อย่างน้อยไม่พัง)
            await expect(adminPage.locator('table')).toBeVisible();
        }
    });

    test('Admin should be able to view order details and update status', async ({ adminPage }) => {
        console.log('Testing Admin Order Details & Status Update...');
        await adminPage.goto('/admin/orders');
        
        // รอให้มีออเดอร์ในรายการ (ถ้าไม่มีออเดอร์ เทสนี้จะข้ามไป)
        const manageButton = adminPage.locator('button:has-text("จัดการ")').first();
        if (await manageButton.isVisible()) {
            await manageButton.click();
            
            // ตรวจสอบหน้าจัดการออเดอร์
            await expect(adminPage.locator('h1')).toContainText('#'); // เลขที่สั่งซื้อ
            await expect(adminPage.locator('text=หลักฐานการโอนเงิน')).toBeVisible();
            await expect(adminPage.locator('text=ที่อยู่อาศัย')).toBeVisible();

            // ตรวจสอบปุ่มดำเนินการตามสถานะ
            const confirmBtn = adminPage.locator('button:has-text("ยืนยันออเดอร์")');
            const shipBtn = adminPage.locator('button:has-text("ยืนยันการจัดส่ง")');
            
            if (await confirmBtn.isVisible()) {
                await confirmBtn.click();
                await expect(adminPage.locator('text=อัปเดตสถานะสำเร็จ')).toBeVisible();
                console.log('✅ Admin confirmed order successfully');
            } else if (await shipBtn.isVisible()) {
                // ถ้าเป็นขั้นตอนส่ง ต้องใส่เลขพัสดุ
                await adminPage.fill('input[placeholder*="EB123456789TH"]', 'TEST-TRACKING-123');
                await shipBtn.click();
                await expect(adminPage.locator('text=อัปเดตสถานะสำเร็จ')).toBeVisible();
                console.log('✅ Admin shipped order successfully');
            }
        } else {
            console.log('ℹ️ No orders found to manage, skipping detail test.');
        }
    });

    test('User should be able to see their order history in Profile', async ({ userPage }) => {
        console.log('Testing User Order History Visibility...');
        await userPage.goto('/profile');
        
        // ตรวจสอบว่ามีส่วนของสถานะคำสั่งซื้อ
        await expect(userPage.locator('text=สถานะคำสั่งซื้อของฉัน')).toBeVisible();
        
        // ตรวจสอบ Tab สถานะต่างๆ
        const statusTabs = ['รอยืนยัน', 'รอจัดส่ง', 'รอได้รับสินค้า', 'สำเร็จ', 'ไม่สำเร็จ'];
        for (const status of statusTabs) {
            // ใช้ exact เพื่อไม่ให้ 'สำเร็จ' ไปตรงกับ 'ไม่สำเร็จ'
            await expect(userPage.getByText(status, { exact: true }).first()).toBeVisible();
        }

        // ตรวจสอบว่าตารางประวัติโหลด (ถ้ามีออเดอร์)
        const orderRow = userPage.locator('.ant-table-row').first();
        if (await orderRow.isVisible()) {
            await expect(orderRow).toContainText('#');
            console.log('✅ User can see their orders');
        } else {
            console.log('ℹ️ No orders found for user, but UI components are visible.');
        }
    });

    test('Admin filter search by order number or name', async ({ adminPage }) => {
        await adminPage.goto('/admin/orders');
        
        // เราใช้ AdminSearchContext ซึ่งอยู่ด้านบน
        // เนื่องจาก Navbar อยู่ใน Layout แอดมิน
        const searchInput = adminPage.locator('input[placeholder*="ค้นหา"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill('XYZ-NON-EXISTENT');
            await expect(adminPage.locator('text=ไม่พบข้อมูล')).toBeVisible();
            
            await searchInput.fill(''); // เคลียร์ค้นหา
            await expect(adminPage.locator('table')).toBeVisible();
        }
    });
});
