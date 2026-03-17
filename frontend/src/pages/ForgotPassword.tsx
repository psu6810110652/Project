import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณากรอกอีเมลของคุณ',
        icon: 'warning',
        confirmButtonColor: '#256D45',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    setLoading(true);

    try {
      // เรียก API ส่งอีเมลขอลืมรหัสผ่าน
      await api.post('/users/forgot-password', { email });

      Swal.fire({
        title: 'ส่งอีเมลสำเร็จ!',
        text: 'กรุณาตรวจสอบกล่องข้อความในอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน',
        icon: 'success',
        confirmButtonColor: '#256D45',
        confirmButtonText: 'ตกลง',
      });
      setEmail(''); // เคลียร์ช่องกรอก
    } catch (err: any) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ไม่พบอีเมลนี้ในระบบ หรือเซิร์ฟเวอร์มีปัญหา',
        icon: 'error',
        confirmButtonColor: '#256D45',
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DCEDC1] flex flex-col items-center justify-center font-['Prompt'] p-4">
      <h1
        className="text-[#256D45] text-4xl md:text-[60px] font-semibold mb-8 text-center tracking-wider"
        style={{ textShadow: '0px 2px 10px rgba(0, 0, 0, 0.15)' }}
      >
        ลืมรหัสผ่าน
      </h1>

      <div className="bg-[#FFFEF2] w-full max-w-140.75 rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.25)] p-8 md:p-12 relative">
        <p className="text-[#256D45] text-lg text-center mb-6">
          กรุณากรอกอีเมลที่ใช้สมัครสมาชิก ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้คุณ
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[#256D45] text-xl font-semibold ml-2">อีเมล</label>
            <input
              type="email"
              placeholder="กรอกอีเมลของคุณ"
              value={email}
              required
              name="email" /* 🟢 เพิ่ม name="email" ด้วยเพื่อให้เบราว์เซอร์จำง่ายขึ้น */
              autoComplete="email" /* 🟢 หัวใจสำคัญอยู่ที่ตรงนี้ครับ! */
              className="bg-[#EDEDED] w-full h-15 rounded-2xl px-6 text-[#256D45] text-xl placeholder:text-[#BFBFBF] outline-none border-2 border-transparent focus:border-[#256D45] transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="group relative bg-white border-2 border-[#256D45] text-[#256D45] text-2xl font-semibold w-48 h-14 rounded-2xl shadow-lg hover:bg-[#256D45] hover:text-white transition-all duration-300 flex items-center justify-center active:scale-95 disabled:opacity-50"
            >
              <span className="relative z-10">{loading ? 'กำลังส่ง...' : 'ยืนยัน'}</span>
            </button>
          </div>
        </form>

        <div className="mt-8 flex justify-center">
          <Link to="/login" className="text-[#BFBFBF] text-xl font-medium underline hover:text-[#256D45]">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;