import { test, expect } from '@playwright/test';
// E2E Test Suite: Register (สมัครบัญชี)

const BASE = 'http://localhost:5173';

// สร้าง unique username/email สำหรับแต่ละ test run
const timestamp = Date.now();
const VALID_USER = {
  username: `testuser_${timestamp}`,
  email: `testuser_${timestamp}@test.com`,
  password: 'Test1234',
  confirmPassword: 'Test1234',
};

// ตรวจสอบ UI ของหน้า Register

test.describe('Register Page — UI Elements', () => {

  test('แสดงหน้า Register และ elements ครบถ้วน', async ({ page }) => {
    await page.goto(`${BASE}/register`);

    // ตรวจสอบหัวข้อ
    await expect(page.getByRole('heading', { name: 'สมัครบัญชี' })).toBeVisible();

    // ตรวจสอบ input fields
    await expect(page.getByPlaceholder('ชื่อผู้ใช้')).toBeVisible();
    await expect(page.getByPlaceholder('อีเมล')).toBeVisible();
    await expect(page.getByPlaceholder('รหัสผ่าน')).toBeVisible();
    await expect(page.getByPlaceholder('ยืนยันรหัสผ่าน')).toBeVisible();

    // ตรวจสอบ checkbox เงื่อนไข
    await expect(page.getByText('ฉันตกลงยอมรับ')).toBeVisible();
    await expect(page.getByText('ฉันยินยอมรับข้อมูลข่าวสาร')).toBeVisible();

    // ตรวจสอบปุ่ม submit
    await expect(page.getByRole('button', { name: 'สมัครสมาชิก' })).toBeVisible();

    // ตรวจสอบลิงก์ไปหน้า login
    await expect(page.getByRole('link', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  });

  test('กดลิงก์ "เข้าสู่ระบบ" -> ไปหน้า Login', async ({ page }) => {
    await page.goto(`${BASE}/register`);

    await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
    await page.waitForURL('**/login');

    await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  });

});

// Validation — ชื่อผู้ใช้

test.describe('Register — Validation: ชื่อผู้ใช้', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/register`);
  });

  test('กรอกชื่อผู้ใช้ว่าง -> แสดง error "กรุณากรอกชื่อผู้ใช้"', async ({ page }) => {
    // กรอกข้อมูลอื่นให้ครบ แต่เว้นชื่อผู้ใช้
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill(VALID_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(VALID_USER.confirmPassword);
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('กรุณากรอกชื่อผู้ใช้')).toBeVisible();
  });

  test('ชื่อผู้ใช้น้อยกว่า 3 ตัวอักษร -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill('ab');
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill(VALID_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(VALID_USER.confirmPassword);
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')).toBeVisible();
  });

  test('ชื่อผู้ใช้เกิน 20 ตัวอักษร -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill('abcdefghijklmnopqrstu'); // 21 ตัว
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill(VALID_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(VALID_USER.confirmPassword);
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร')).toBeVisible();
  });

  test('ชื่อผู้ใช้ขึ้นต้นด้วยตัวเลข -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill('123user');
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill(VALID_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(VALID_USER.confirmPassword);
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('ชื่อผู้ใช้ต้องขึ้นต้นด้วยตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น')).toBeVisible();
  });

  test('ชื่อผู้ใช้มีอักขระพิเศษ เช่น @#$ -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill('user@name');
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill(VALID_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(VALID_USER.confirmPassword);
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('ชื่อผู้ใช้ใช้ได้เฉพาะภาษาไทย ภาษาอังกฤษ ตัวเลข จุด (.) และขีดล่าง (_)')).toBeVisible();
  });

  test('ชื่อผู้ใช้มีจุดหรือขีดล่างติดกัน -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill('user..name');
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill(VALID_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(VALID_USER.confirmPassword);
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('ชื่อผู้ใช้ไม่สามารถใช้จุดหรือขีดล่างติดกันได้')).toBeVisible();
  });

  test('ชื่อผู้ใช้เป็นคำสงวน (admin) -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill('admin');
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill(VALID_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(VALID_USER.confirmPassword);
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('ชื่อผู้ใช้นี้ไม่สามารถใช้ได้ กรุณาเลือกชื่ออื่น')).toBeVisible();
  });

  test('ชื่อผู้ใช้มีคำหยาบ -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill('fuckuser');
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill(VALID_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(VALID_USER.confirmPassword);
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('ชื่อผู้ใช้นี้ไม่เหมาะสม กรุณาเลือกชื่ออื่น')).toBeVisible();
  });

});

// Validation — อีเมล

test.describe('Register — Validation: อีเมล', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/register`);
  });

  test('อีเมลว่าง -> แสดง error "กรุณากรอกอีเมล"', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill(VALID_USER.username);
    await page.getByPlaceholder('รหัสผ่าน').fill(VALID_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(VALID_USER.confirmPassword);
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('กรุณากรอกอีเมล')).toBeVisible();
  });

  test('อีเมลรูปแบบผิด -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill(VALID_USER.username);
    await page.getByPlaceholder('อีเมล').fill('invalid-email');
    await page.getByPlaceholder('รหัสผ่าน').fill(VALID_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(VALID_USER.confirmPassword);
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('รูปแบบอีเมลไม่ถูกต้อง')).toBeVisible();
  });

});

// Validation — รหัสผ่าน

test.describe('Register — Validation: รหัสผ่าน', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/register`);
  });

  test('รหัสผ่านว่าง -> แสดง error "กรุณากรอกรหัสผ่าน"', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill(VALID_USER.username);
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('กรุณากรอกรหัสผ่าน')).toBeVisible();
  });

  test('รหัสผ่านน้อยกว่า 8 ตัว -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill(VALID_USER.username);
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill('Ab1');
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill('Ab1');
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')).toBeVisible();
  });

  test('รหัสผ่านไม่มีตัวพิมพ์ใหญ่ -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill(VALID_USER.username);
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill('testtest1');
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill('testtest1');
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว')).toBeVisible();
  });

  test('รหัสผ่านไม่มีตัวพิมพ์เล็ก -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill(VALID_USER.username);
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill('TESTTEST1');
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill('TESTTEST1');
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว')).toBeVisible();
  });

  test('รหัสผ่านไม่มีตัวเลข -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill(VALID_USER.username);
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill('TestTest');
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill('TestTest');
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว')).toBeVisible();
  });

  test('ยืนยันรหัสผ่านไม่ตรงกัน -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill(VALID_USER.username);
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill('Test1234');
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill('Test5678');
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง')).toBeVisible();
  });

});

// Validation — เงื่อนไข & PDPA Modal

test.describe('Register — Validation: เงื่อนไข & PDPA Modal', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/register`);
  });

  test('ไม่ยอมรับเงื่อนไข -> แสดง error', async ({ page }) => {
    await page.getByPlaceholder('ชื่อผู้ใช้').fill(VALID_USER.username);
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill(VALID_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(VALID_USER.confirmPassword);
    // ไม่ check checkbox

    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    await expect(page.getByText('กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว')).toBeVisible();
  });

  test('กดปุ่ม "เงื่อนไขการใช้งาน" -> เปิด Modal Terms of Service', async ({ page }) => {
    await page.getByRole('button', { name: 'เงื่อนไขการใช้งาน' }).click();

    await expect(page.getByText('เงื่อนไขการใช้งาน (Terms of Service)')).toBeVisible();
    await expect(page.getByText('1. การสั่งซื้อสินค้า')).toBeVisible();
    await expect(page.getByText('2. การชำระเงิน')).toBeVisible();
    await expect(page.getByText('3. การจัดส่ง')).toBeVisible();
    await expect(page.getByText('4. ข้อจำกัดความรับผิดชอบ')).toBeVisible();
    await expect(page.getByText('5. นโยบายการเคลมสินค้า')).toBeVisible();
  });

  test('กดปุ่ม "นโยบายความเป็นส่วนตัว" -> เปิด Modal Privacy Policy', async ({ page }) => {
    await page.getByRole('button', { name: 'นโยบายความเป็นส่วนตัว' }).click();

    await expect(page.getByText('นโยบายความเป็นส่วนตัว (Privacy Policy)')).toBeVisible();
    await expect(page.getByText('1. ข้อมูลที่เราจัดเก็บ')).toBeVisible();
    await expect(page.getByText('2. วัตถุประสงค์การใช้ข้อมูล')).toBeVisible();
    await expect(page.getByText('3. การรักษาความปลอดภัย')).toBeVisible();
    await expect(page.getByText('4. สิทธิของท่าน')).toBeVisible();
  });

  test('กดปุ่ม "ยอมรับ" ใน Modal -> checkbox ถูก check อัตโนมัติ', async ({ page }) => {
    // เปิด modal เงื่อนไข
    await page.getByRole('button', { name: 'เงื่อนไขการใช้งาน' }).click();
    await expect(page.getByText('เงื่อนไขการใช้งาน (Terms of Service)')).toBeVisible();

    // กดยอมรับ
    await page.getByRole('button', { name: 'ยอมรับ' }).click();

    // modal ต้องปิด
    await expect(page.getByText('เงื่อนไขการใช้งาน (Terms of Service)')).not.toBeVisible();

    // checkbox ต้องถูก check แล้ว
    await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
  });

  test('กดปุ่ม "ปิด" ใน Modal -> Modal ปิดโดยไม่ check', async ({ page }) => {
    await page.getByRole('button', { name: 'เงื่อนไขการใช้งาน' }).click();
    await expect(page.getByText('เงื่อนไขการใช้งาน (Terms of Service)')).toBeVisible();

    // กดปิด
    await page.getByRole('button', { name: 'ปิด' }).click();

    // modal ต้องปิด
    await expect(page.getByText('เงื่อนไขการใช้งาน (Terms of Service)')).not.toBeVisible();

    // checkbox ต้องยังไม่ check
    await expect(page.locator('input[type="checkbox"]').first()).not.toBeChecked();
  });

});

// Happy Path — สมัครสำเร็จ

test.describe('Register — Happy Path', () => {

  test('กรอกข้อมูลถูกต้องทั้งหมด -> สมัครสำเร็จ -> redirect ไปหน้า Login', async ({ page }) => {
    await page.goto(`${BASE}/register`);

    // กรอก form
    await page.getByPlaceholder('ชื่อผู้ใช้').fill(VALID_USER.username);
    await page.getByPlaceholder('อีเมล').fill(VALID_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill(VALID_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(VALID_USER.confirmPassword);

    // check เงื่อนไข + marketing (ไม่บังคับ)
    await page.locator('input[type="checkbox"]').first().check();
    await page.locator('input[type="checkbox"]').nth(1).check();

    // กด submit
    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    // รอ SweetAlert สำเร็จ
    await expect(page.getByText('สมัครสมาชิกสำเร็จ!')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('คุณสามารถเข้าสู่ระบบได้แล้ว')).toBeVisible();

    // กดตกลงใน SweetAlert
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // ต้อง redirect ไปหน้า login
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeVisible();
  });

});
