import { test, expect } from '@playwright/test';

test('Flow ผู้ใช้: สั่งซื้อสินค้า -> ขาดที่อยู่ -> เพิ่มที่อยู่ -> สั่งซื้อสำเร็จ -> ลบที่อยู่ทิ้ง (Clean up)', async ({ page }) => {

  // 1. ขั้นตอนการ Login
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'กรอกอีเมล หรือ ชื่อผู้ใช้งาน' }).fill('ppolll');
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่าน' }).fill('Philip2549');
  await page.getByRole('checkbox', { name: 'จดจำฉัน' }).check();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  await expect(page.getByRole('link', { name: 'ppolll' })).toBeVisible();

  // 2. เลือกสินค้าเข้าตะกร้า
  await page.getByRole('link', { name: 'ppolll' }).click();
  await page.getByRole('button', { name: 'รายการโปรด' }).click();
  await page.getByText('ปุ๋ยอินทรีย์มูลค้างคาว').first().click(); 
  await page.locator('button').filter({ hasText: '+' }).click({ clickCount: 2 });
  await page.getByRole('button', { name: 'เพิ่มไปยังรถเข็น' }).first().click();

  // 3. กดสั่งซื้อ -> ตรวจสอบการแจ้งเตือนเมื่อไม่มีที่อยู่
  await page.locator('a[href="/cart"]').first().click(); 
  await page.getByRole('button', { name: 'สั่งซื้อ' }).click();
  await expect(page.getByText('ไม่พบข้อมูลการจัดส่ง')).toBeVisible({ timeout: 15000 });

  // 4. ไปเพิ่มที่อยู่จัดส่งในหน้า Profile
  await page.getByRole('link', { name: 'ppolll' }).click();
  await page.getByRole('button', { name: 'แก้ไขข้อมูล' }).click();
  await page.getByRole('button', { name: 'เพิ่มที่อยู่' }).click();
  await page.getByRole('textbox', { name: 'เลขที่บ้าน' }).first().fill('104');
  await page.getByRole('textbox', { name: 'ถนน' }).fill('สามแยก');

  // ค้นหาและเลือก จังหวัด
  await page.locator('div').filter({ hasText: /^เลือก\/ค้นหาจังหวัด$/ }).nth(1).click({ force: true });
  await page.keyboard.type('กระบี่', { delay: 100 });
  await page.waitForTimeout(1000); 
  await page.keyboard.press('Enter'); 

  // ค้นหาและเลือก อำเภอ
  await page.locator('div').filter({ hasText: /^เลือกอำเภอ$/ }).nth(0).click({ force: true });
  await page.keyboard.type('คลองท่อม', { delay: 100 });
  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');

  // ค้นหาและเลือก ตำบล
  await page.locator('div').filter({ hasText: /^เลือกตำบล$/ }).nth(0).click({ force: true });
  await page.keyboard.type('พรุดินนา', { delay: 100 });
  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');

  // บันทึกที่อยู่ และรอให้ระบบเซฟสำเร็จ
  await page.getByRole('button', { name: 'บันทึกที่อยู่' }).click();
  await page.waitForTimeout(2000); 

  // 5. กลับไปสั่งซื้ออีกครั้ง พร้อมแนบสลิป
  await page.locator('a[href="/cart"]').first().click(); 
  await page.getByRole('button', { name: 'สั่งซื้อ' }).click();

  await page.locator('input[type="file"]').setInputFiles('สลิปโอนเงิน.webp');
  await page.waitForTimeout(500); // รอระบบแปลงรูปเป็น Base64
  await page.getByRole('button', { name: 'ยืนยันการสั่งซื้อ' }).click({ force: true });

  // รอให้สั่งซื้อสำเร็จและ Auto-Redirect ไปหน้า Profile
  await page.waitForURL('**/profile', { timeout: 15000 });

  // 6. CLEAN UP: ลบที่อยู่ทิ้ง (คืนค่าเริ่มต้นให้ระบบ)
  await page.getByRole('button', { name: 'แก้ไขข้อมูล' }).click();
  await page.getByRole('button', { name: 'ลบที่อยู่' }).first().click(); // กดไอคอนถังขยะ
  await page.getByRole('button', { name: 'ลบที่อยู่' }).last().click();  // ยืนยันการลบใน Popup
  
  // ตรวจสอบว่าลบที่อยู่สำเร็จ
  await expect(page.getByRole('button', { name: 'เพิ่มที่อยู่' })).toBeVisible({ timeout: 10000 });

});