import { test, expect } from './test-helpers';

/**
 * 📦 ชุดทดสอบ Order Management (The Stealthy Journey)
 * แก้ไข: 
 * 1. ตรวจสอบความพร้อมของ User ก่อนเริ่ม Admin สำหรับ S1 
 * 2. เพิ่ม Log ละเอียดในทุกรอยต่อ 
 */

test.describe('Order Scenarios - Final Polish', () => {

    test.setTimeout(240000); // เพิ่มเป็น 4 นาที

    test.beforeEach(async ({ userPage, adminPage }) => {
        await userPage?.setViewportSize({ width: 1920, height: 1080 });
        await adminPage?.setViewportSize({ width: 1920, height: 1080 });
    });

    test('Scenario 1: One Order Journey (From Pending to Success)', async ({ adminPage, userPage }) => {
        console.log('--- 🚀 S1 Starts: Initializing windows... ---');

        // --- 0. เตรียมความพร้อม ---
        await userPage.goto('/');
        await expect(userPage.locator('nav').first()).toBeVisible({ timeout: 20000 });
        console.log('👤 User window: Ready and Logged in.');

        // --- 1. Admin Confirm ---
        await adminPage.goto('/admin/orders');
        console.log('🛡️ Admin: Searching for pending orders...');
        await adminPage.waitForSelector('.ant-table-row', { timeout: 30000 });

        const pendingRow = adminPage.locator('.ant-table-row').filter({
            has: adminPage.locator('.bg-orange-500')
        }).first();

        const orderIdText = await pendingRow.locator('td').first().innerText();
        const cleanOrderNo = orderIdText.replace('#', '').trim();
        console.log(`🆔 TARGET ORDER: ${cleanOrderNo}`);

        await pendingRow.locator('button:has-text("จัดการ")').scrollIntoViewIfNeeded();
        await pendingRow.locator('button:has-text("จัดการ")').click();

        console.log('🛡️ Admin: Clicking Confirm button...');
        await adminPage.click('button:has-text("Confirm Order"), button:has-text("ยืนยันออเดอร์")');
        await expect(adminPage.locator('text=อัปเดตสถานะสำเร็จ')).toBeVisible();
        await adminPage.waitForTimeout(3000);

        // --- 2. Admin Ship ---
        console.log('🛡️ Admin: Moving to Shipping process...');
        await adminPage.goto('/admin/orders');
        await adminPage.fill('input[placeholder*="ค้นหา"]', cleanOrderNo);
        await adminPage.waitForTimeout(2000);

        const shippingRow = adminPage.locator('.ant-table-row', { hasText: cleanOrderNo }).first();
        await expect(shippingRow.locator('.bg-yellow-500')).toBeVisible({ timeout: 20000 });

        await shippingRow.locator('button:has-text("จัดการ")').click();
        await adminPage.fill('input[placeholder*="EB123456789TH"]', `TRK-${Date.now()}`);
        await adminPage.click('button:has-text("ยืนยันการจัดส่ง")');
        await expect(adminPage.locator('text=อัปเดตสถานะสำเร็จ')).toBeVisible();
        await adminPage.waitForTimeout(3000);
        console.log('✅ Admin tasks: Completed.');

        // --- 3. User Received ---
        console.log(`👤 User: Navigating to Profile to check: ${cleanOrderNo}`);
        await userPage.goto('/profile');

        // รอดูสัญญาณ API
        const responsePromise = userPage.waitForResponse(res => res.url().includes('/my-orders'), { timeout: 30000 });
        await responsePromise;

        await userPage.click('text=รอได้รับสินค้า');
        await userPage.waitForTimeout(2000);

        const row = userPage.locator('.ant-table-row', { hasText: cleanOrderNo }).first();

        // ระบบรีลองถ้าหาไม่เจอ
        try {
            await expect(row).toBeVisible({ timeout: 15000 });
        } catch (e) {
            console.log('⚠️ Order not visible yet, refreshing User page...');
            await userPage.reload();
            await userPage.click('text=รอได้รับสินค้า');
            await expect(row).toBeVisible({ timeout: 15000 });
        }

        console.log('👤 User: Clicking "Received" button...');
        await row.locator('button:has-text("ยืนยันได้รับสินค้า")').scrollIntoViewIfNeeded();
        await row.locator('button:has-text("ยืนยันได้รับสินค้า")').click();

        const swal = userPage.locator('.swal2-confirm');
        await swal.waitFor({ state: 'visible' });
        await swal.click(); // ยันยันรับ
        await swal.waitFor({ state: 'hidden' });
        await swal.waitFor({ state: 'visible' });
        await swal.click(); // ตกลงจบงาน

        await userPage.click('text=สำเร็จ');
        await expect(userPage.locator('.ant-table-tbody')).toContainText(cleanOrderNo);
        console.log('🏁 S1 SUCCESS: The cycle is complete!');
        await userPage.waitForTimeout(3000);
    });

    test('Scenario 2: User Cancellation', async ({ userPage }) => {
        console.log('--- 🚀 S2: User Cancellation ---');
        await userPage.goto('/profile');
        await userPage.waitForResponse(res => res.url().includes('/my-orders'));
        await userPage.click('text=รอยืนยัน');
        await userPage.waitForTimeout(2000);
        const firstRow = userPage.locator('.ant-table-row').first();
        const oid = (await firstRow.locator('span').first().innerText()).replace('#', '').trim();
        await firstRow.locator('button:has-text("ยกเลิก")').scrollIntoViewIfNeeded();
        await firstRow.locator('button:has-text("ยกเลิก")').click();
        const swal = userPage.locator('.swal2-confirm');
        await swal.waitFor({ state: 'visible' });
        await swal.click();
        await swal.waitFor({ state: 'hidden' });
        await swal.waitFor({ state: 'visible' });
        await swal.click();
        await userPage.click('text=ไม่สำเร็จ');
        await expect(userPage.locator('.ant-table-tbody')).toContainText(oid);
        await userPage.waitForTimeout(3000);
    });

    test('Scenario 3: Admin Cancellation (With Explicit Horizontal Scroll)', async ({ adminPage }) => {
        console.log('--- 🚀 S3 Starts: Admin Cancellation ---');
        await adminPage.goto('/admin/orders');
        await adminPage.waitForSelector('.ant-table-row');
        await adminPage.evaluate(() => {
            const tableBody = document.querySelector('.ant-table-body, .ant-table-content');
            if (tableBody) tableBody.scrollLeft = 5000;
        });
        const pendingRow = adminPage.locator('.ant-table-row').filter({
            has: adminPage.locator('.bg-orange-500')
        }).first();
        await expect(pendingRow).toBeVisible();
        const oid = (await pendingRow.locator('td').first().innerText()).replace('#', '').trim();
        await pendingRow.locator('button:has-text("จัดการ")').scrollIntoViewIfNeeded();
        await pendingRow.locator('button:has-text("จัดการ")').click();
        await adminPage.click('button:has-text("ยกเลิก")');
        await expect(adminPage.locator('text=อัปเดตสถานะสำเร็จ')).toBeVisible();
        console.log('✅ S3 Finished');
        await adminPage.waitForTimeout(3000);
    });
});
