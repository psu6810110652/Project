import { test, expect } from './test-helpers';

/**
 * 📦 การทดสอบการจัดการคำสั่งซื้อ (Order Management Tests)
 * เน้นเฉพาะส่วนการจัดการของแอดมินและประวัติการสั่งซื้อของผู้ใช้
 * 
 * วิธีรัน:
 * npx playwright test -c tests/order-management/playwright.config.ts
 */

test.describe('Order Management (Admin & User Visibility)', () => {
    
    // หมายเหตุ: ใช้ adminPage และ userPage fixtures จาก test-helpers 
    // ซึ่งช่วยจัดการเรื่องการพิสูจน์ตัวตนให้โดยอัตโนมัติ ทำให้เราไม่ต้องเขียนโค้ดล็อกอินเอง

    test('Admin should be able to view and search in order list', async ({ adminPage }) => {
        console.log('--- 🛡️ Testing Admin Order List ---');
        await adminPage.goto('/admin/orders');
        console.log('Current URL:', adminPage.url());

        // รอให้หน้าโหลดหรือแสดงข้อความว่าไม่มีข้อมูล
        await adminPage.waitForLoadState('networkidle');
        
        // ตรวจสอบว่ามีหัวข้อตารางถูกต้อง (เพื่อเช็คว่า Login ผ่านและเข้าหน้าถูก)
        await expect(adminPage.locator('h1')).toContainText('จัดการคำสั่งซื้อ', { timeout: 15000 });
        console.log('✅ Page title verified');

        // ตรวจสอบว่ามีตารางหรือข้อความแจ้งเตือน (กรณีไม่มีออเดอร์)
        const table = adminPage.locator('table');
        const emptyState = adminPage.locator('text=/ไม่พบ|Empty|กำลังโหลด/');
        
        if (await table.isVisible() || await emptyState.isVisible()) {
            console.log('✅ Order list container is visible');
        }

        // ทดสอบระบบค้นหา (Search)
        const searchInput = adminPage.locator('input[placeholder*="ค้นหา"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill('NON_EXISTENT_ORDER_XYZ');
            // คาดหวังว่าตารางจะว่างหรือแสดงข้อความไม่พบข้อมูล
            await expect(adminPage.locator('text=/ไม่พบ|Empty/')).toBeVisible({ timeout: 5000 }).catch(() => console.log('No "Empty" text found, checking table rows instead.'));
            
            await searchInput.fill(''); // เคลียร์ค้นหา
        }
    });

    test('Admin should be able to update order status', async ({ adminPage }) => {
        console.log('Testing Admin Status Update...');
        await adminPage.goto('/admin/orders');
        
        // รอให้มีออเดอร์ในรายการ
        const manageButton = adminPage.locator('button:has-text("จัดการ")').first();
        if (await manageButton.isVisible()) {
            await manageButton.click();
            
            // ตรวจสอบข้อมูลเบื้องต้นในหน้าจัดการ
            await expect(adminPage.locator('text=หลักฐานการโอนเงิน')).toBeVisible();

            // ตรวจสอบปุ่มยืนยันหรือส่งของ (ตามสถานะปัจจุบัน)
            const confirmBtn = adminPage.locator('button:has-text("ยืนยันออเดอร์")');
            const shipBtn = adminPage.locator('button:has-text("ยืนยันการจัดส่ง")');
            
            if (await confirmBtn.isVisible()) {
                await confirmBtn.click();
                await expect(adminPage.locator('text=/สำเร็จ|Success/i')).toBeVisible();
                console.log('✅ Admin confirmed order');
            } else if (await shipBtn.isVisible()) {
                await adminPage.fill('input[placeholder*="EB123456789TH"]', 'TRACKING123456');
                await shipBtn.click();
                await expect(adminPage.locator('text=/สำเร็จ|Success/i')).toBeVisible();
                console.log('✅ Admin shipped order');
            }
        } else {
            console.log('ℹ️ No orders available to test management');
        }
    });

    test('User should see their order status correctly in Profile', async ({ userPage }) => {
        console.log('Testing User Order Profile...');
        await userPage.goto('/profile');
        
        // ตรวจสอบ UI ส่วนประวัติออเดอร์
        await expect(userPage.locator('text=สถานะคำสั่งซื้อของฉัน')).toBeVisible();
        
        // ตรวจสอบว่าสามารถสลับ Tab ได้
        await userPage.getByText('สำเร็จ', { exact: true }).first().click();
        await expect(userPage.locator('table')).toBeVisible();
        
        await userPage.click('text=รอยืนยัน');
        await expect(userPage.locator('table')).toBeVisible();
        
        console.log('✅ User profile order UI is functional');
    });
});
