import { test, expect } from '@playwright/test';
// E2E Test Suite: Login (เข้าสู่ระบบ)

const BASE = 'http://localhost:5173';

// ข้อมูล user ที่มีในระบบแล้ว (ต้องสมัครก่อนรัน test นี้)
const EXISTING_USER = {
  username: 'ppolll',
  password: 'Philip2549',
};

//  1. ตรวจสอบ UI ของหน้า Login

test.describe('Login Page — UI Elements', () => {

  test('แสดงหน้า Login และ elements ครบถ้วน', async ({ page }) => {
    await page.goto(`${BASE}/login`);

    // ตรวจสอบหัวข้อ
    await expect(page.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeVisible();

    // ตรวจสอบ input fields
    await expect(page.getByPlaceholder('กรอกอีเมล หรือ ชื่อผู้ใช้งาน')).toBeVisible();
    await expect(page.getByPlaceholder('กรอกรหัสผ่าน')).toBeVisible();

    // ตรวจสอบ checkbox "จดจำฉัน"
    await expect(page.getByText('จดจำฉัน')).toBeVisible();

    // ตรวจสอบลิงก์ "ลืมรหัสผ่าน?"
    await expect(page.getByRole('link', { name: 'ลืมรหัสผ่าน?' })).toBeVisible();

    // ตรวจสอบปุ่มยืนยัน
    await expect(page.getByRole('button', { name: 'ยืนยัน' })).toBeVisible();

    // ตรวจสอบลิงก์ไปหน้า Register
    await expect(page.getByRole('link', { name: 'สมัครสมาชิก' })).toBeVisible();

    // ตรวจสอบปุ่ม Google Login
    await expect(page.getByText('เข้าสู่ระบบผ่าน Google')).toBeVisible();
  });

  test('กดลิงก์ "สมัครสมาชิก" -> ไปหน้า Register', async ({ page }) => {
    await page.goto(`${BASE}/login`);

    await page.getByRole('link', { name: 'สมัครสมาชิก' }).click();
    await page.waitForURL('**/register');

    await expect(page.getByRole('heading', { name: 'สมัครบัญชี' })).toBeVisible();
  });

  test('กดลิงก์ "ลืมรหัสผ่าน?" -> ไปหน้า Forgot Password', async ({ page }) => {
    await page.goto(`${BASE}/login`);

    await page.getByRole('link', { name: 'ลืมรหัสผ่าน?' }).click();
    await page.waitForURL('**/forgot-password');
  });

});

// Validation — กรอกข้อมูลไม่ครบ

test.describe('Login — Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
  });

  test('ไม่กรอกอะไรเลย -> แสดง SweetAlert เตือน', async ({ page }) => {
    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    // SweetAlert แสดงข้อความเตือน
    await expect(page.getByText('กรุณากรอกข้อมูล')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน')).toBeVisible();

    // กดตกลง
    await page.getByRole('button', { name: 'ตกลง' }).click();
  });

  test('กรอกแค่ username ไม่กรอกรหัสผ่าน -> แสดง SweetAlert เตือน', async ({ page }) => {
    await page.getByPlaceholder('กรอกอีเมล หรือ ชื่อผู้ใช้งาน').fill('someuser');

    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    await expect(page.getByText('กรุณากรอกข้อมูล')).toBeVisible({ timeout: 5000 });
  });

  test('กรอกแค่รหัสผ่าน ไม่กรอก username -> แสดง SweetAlert เตือน', async ({ page }) => {
    await page.getByPlaceholder('กรอกรหัสผ่าน').fill('somepassword');

    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    await expect(page.getByText('กรุณากรอกข้อมูล')).toBeVisible({ timeout: 5000 });
  });

});

//  3. Login — ข้อมูลผิด

test.describe('Login — Wrong Credentials', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
  });

  test('กรอก username ผิด -> แสดง SweetAlert แจ้งเข้าสู่ระบบไม่สำเร็จ', async ({ page }) => {
    await page.getByPlaceholder('กรอกอีเมล หรือ ชื่อผู้ใช้งาน').fill('wronguser999');
    await page.getByPlaceholder('กรอกรหัสผ่าน').fill('SomePassword1');

    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    await expect(page.getByText('เข้าสู่ระบบไม่สำเร็จ')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')).toBeVisible();

    // กด ตกลง เพื่อปิด SweetAlert
    await page.getByRole('button', { name: 'ตกลง' }).click();
  });

  test('กรอกรหัสผ่านผิด -> แสดง SweetAlert แจ้งเข้าสู่ระบบไม่สำเร็จ', async ({ page }) => {
    await page.getByPlaceholder('กรอกอีเมล หรือ ชื่อผู้ใช้งาน').fill(EXISTING_USER.username);
    await page.getByPlaceholder('กรอกรหัสผ่าน').fill('WrongPassword999');

    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    await expect(page.getByText('เข้าสู่ระบบไม่สำเร็จ')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')).toBeVisible();

    await page.getByRole('button', { name: 'ตกลง' }).click();
  });

});

//  4. Happy Path — Login สำเร็จ

test.describe('Login — Happy Path', () => {

  test('กรอกข้อมูลถูกต้อง -> Login สำเร็จ -> redirect ไปหน้า Home', async ({ page }) => {
    await page.goto(`${BASE}/login`);

    // กรอก form
    await page.getByPlaceholder('กรอกอีเมล หรือ ชื่อผู้ใช้งาน').fill(EXISTING_USER.username);
    await page.getByPlaceholder('กรอกรหัสผ่าน').fill(EXISTING_USER.password);

    // กดยืนยัน
    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    // ต้อง redirect ออกจากหน้า login (ไปหน้า Home หรือ Admin)
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });

    // ตรวจสอบว่าชื่อ user แสดงใน Navbar (แสดงว่า login สำเร็จ)
    await expect(page.getByRole('link', { name: EXISTING_USER.username })).toBeVisible({ timeout: 10000 });
  });

  test('กรอกข้อมูลถูกต้อง + check "จดจำฉัน" -> Login สำเร็จ', async ({ page }) => {
    await page.goto(`${BASE}/login`);

    await page.getByPlaceholder('กรอกอีเมล หรือ ชื่อผู้ใช้งาน').fill(EXISTING_USER.username);
    await page.getByPlaceholder('กรอกรหัสผ่าน').fill(EXISTING_USER.password);

    // check จดจำฉัน
    await page.getByText('จดจำฉัน').click();

    // กดยืนยัน
    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    // ต้อง redirect ออกจากหน้า login
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });

    // ตรวจสอบว่า login สำเร็จ
    await expect(page.getByRole('link', { name: EXISTING_USER.username })).toBeVisible({ timeout: 10000 });
  });

});

//  5. Full Flow — สมัคร -> Login

test.describe('Full Flow — Register แล้ว Login ด้วย user ที่เพิ่งสมัคร', () => {

  const uniqueTs = Date.now();
  const NEW_USER = {
    username: `newuser_${uniqueTs}`,
    email: `newuser_${uniqueTs}@test.com`,
    password: 'NewPass1234',
  };

  test('สมัครบัญชีใหม่ -> กด OK -> redirect ไปหน้า Login -> Login ด้วย user ใหม่ -> สำเร็จ', async ({ page }) => {
    // ===== ขั้นตอน 1: สมัครบัญชี =====
    await page.goto(`${BASE}/register`);

    await page.getByPlaceholder('ชื่อผู้ใช้').fill(NEW_USER.username);
    await page.getByPlaceholder('อีเมล').fill(NEW_USER.email);
    await page.getByPlaceholder('รหัสผ่าน').fill(NEW_USER.password);
    await page.getByPlaceholder('ยืนยันรหัสผ่าน').fill(NEW_USER.password);

    // ยอมรับเงื่อนไข
    await page.locator('input[type="checkbox"]').first().check();

    // กดสมัคร
    await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();

    // รอ SweetAlert สำเร็จ
    await expect(page.getByText('สมัครสมาชิกสำเร็จ!')).toBeVisible({ timeout: 10000 });

    // กด OK
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // ต้อง redirect ไปหน้า login
    await page.waitForURL('**/login', { timeout: 10000 });

    // ===== ขั้นตอน 2: Login ด้วย user ที่เพิ่งสมัคร =====
    await page.getByPlaceholder('กรอกอีเมล หรือ ชื่อผู้ใช้งาน').fill(NEW_USER.username);
    await page.getByPlaceholder('กรอกรหัสผ่าน').fill(NEW_USER.password);

    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    // ต้อง redirect ออกจากหน้า login
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });

    // ตรวจสอบว่า login สำเร็จ — ชื่อ user แสดงใน Navbar
    await expect(page.getByRole('link', { name: NEW_USER.username })).toBeVisible({ timeout: 10000 });
  });

});
