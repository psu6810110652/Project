import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

const ResetPassword = () => {
  const navigate = useNavigate();
  // สมมติว่าใน Route คุณตั้งไว้แบบ path="/reset-password/:token"
  const { token } = useParams(); 

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      Swal.fire({
        title: 'รหัสผ่านไม่ตรงกัน',
        text: 'กรุณากรอกรหัสผ่านและการยืนยันรหัสผ่านให้ตรงกัน',
        icon: 'warning',
        confirmButtonColor: '#256D45',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
        Swal.fire({
          title: 'รหัสผ่านสั้นเกินไป',
          text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
          icon: 'warning',
          confirmButtonColor: '#256D45',
          confirmButtonText: 'ตกลง',
        });
        return;
      }

    setLoading(true);

    try {
      // เรียก API เปลี่ยนรหัสผ่าน โดยส่ง token และ รหัสผ่านใหม่ไป
      await api.post('/users/reset-password', { token: token, newPassword: passwords.newPassword });
      Swal.fire({
        title: 'เปลี่ยนรหัสผ่านสำเร็จ!',
        text: 'คุณสามารถใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบได้ทันที',
        icon: 'success',
        confirmButtonColor: '#256D45',
        confirmButtonText: 'ไปหน้าเข้าสู่ระบบ',
      }).then(() => {
        navigate('/login');
      });
    } catch (err: any) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ลิงก์หมดอายุหรือไม่ถูกต้อง',
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
        ตั้งรหัสผ่านใหม่
      </h1>

      <div className="bg-[#FFFEF2] w-full max-w-140.75 rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.25)] p-8 md:p-12 relative">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[#256D45] text-xl font-semibold ml-2">รหัสผ่านใหม่</label>
            <input
              type="password"
              name="newPassword"
              placeholder="กรอกรหัสผ่านใหม่"
              required
              className="bg-[#EDEDED] w-full h-15 rounded-2xl px-6 text-[#256D45] text-xl placeholder:text-[#BFBFBF] outline-none border-2 border-transparent focus:border-[#256D45] transition-all"
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2 text-left">
            <label className="text-[#256D45] text-xl font-semibold ml-2">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              required
              className="bg-[#EDEDED] w-full h-15 rounded-2xl px-6 text-[#256D45] text-xl placeholder:text-[#BFBFBF] outline-none border-2 border-transparent focus:border-[#256D45] transition-all"
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="group relative bg-white border-2 border-[#256D45] text-[#256D45] text-2xl font-semibold w-48 h-14 rounded-2xl shadow-lg hover:bg-[#256D45] hover:text-white transition-all duration-300 flex items-center justify-center active:scale-95 disabled:opacity-50"
            >
              <span className="relative z-10">{loading ? 'กำลังบันทึก...' : 'บันทึก'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;