import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

const Register = () => {
  const navigate = useNavigate();

  // ✅ State ทุกตัวอยู่ระดับ component ไม่ใช่ใน function
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ validate แยกออกมาต่างหาก
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'กรุณากรอกรูปแบบอีเมลให้ถูกต้อง (เช่น name@example.com)';
    }

    const passwordRegex = /^(?=.*[0-9!@#$%^&*])/;
    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 8) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'รหัสผ่านต้องมีตัวเลขหรือสัญลักษณ์อย่างน้อย 1 ตัว';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง';
    }

    return newErrors;
  };

  // ✅ handleSubmit อันเดียว สะอาด
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors); // ✅ ชื่อตรงกันแล้ว
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;
      await api.post('/users', dataToSend);

  
      await Swal.fire({
        title: 'สมัครสมาชิกสำเร็จ!',
        text: 'ยินดีด้วย! คุณสามารถเข้าสู่ระบบได้แล้ว',
        icon: 'success',
        confirmButtonColor: '#256D45',
        confirmButtonText: 'ตกลง',
      });

      navigate('/login'); //รอให้กด OK ก่อน

    } catch (err: any) {
      const message = err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครบัญชี';
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: message,
        icon: 'error',
        confirmButtonColor: '#e74c3c',
        confirmButtonText: 'ตกลง',
      });

  // ยังเก็บ errors.general ไว้แสดงใน form ด้วย
      setErrors({ general: message });

    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-[#DCEDC1] flex flex-col items-center justify-center font-['Prompt'] p-4">
      
      <h1 
        className="text-[#256D45] text-5xl md:text-[80px] font-semibold mb-8 text-center"
        style={{ textShadow: '0px 4px 20px rgba(0, 0, 0, 0.25)' }}
      >
        สมัครบัญชี
      </h1>

      <div className="bg-[#FFFEF2] w-full max-w-140 rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.25)] p-8 md:p-12">
        
        {errors.general && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-center font-medium">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[#256D45] text-xl font-semibold relative right-51">ชื่อผู้ใช้</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              placeholder="ชื่อผู้ใช้"
              className="bg-[#EDEDED] w-full h-14 rounded-[20px] px-6 text-[#256D45] text-xl placeholder:text-[#BFBFBF] outline-none focus:ring-2 focus:ring-[#256D45]"
              onChange={handleChange}
            />
            {errors.username && <p className="text-red-500 text-sm px-2">{errors.username}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#256D45] text-xl font-semibold relative right-52">อีเมล</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              placeholder="อีเมล"
              className="bg-[#EDEDED] w-full h-14 rounded-[20px] px-6 text-[#256D45] text-xl placeholder:text-[#BFBFBF] outline-none focus:ring-2 focus:ring-[#256D45]"
              onChange={handleChange}
            />
            {errors.email && <p className="text-red-500 text-sm px-2">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#256D45] text-xl font-semibold relative right-49">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              placeholder="รหัสผ่าน"
              className="bg-[#EDEDED] w-full h-14 rounded-[20px] px-6 text-[#256D45] text-xl placeholder:text-[#BFBFBF] outline-none focus:ring-2 focus:ring-[#256D45]"
              onChange={handleChange}
            />
            {errors.password && <p className="text-red-500 text-sm px-2">{errors.password}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#256D45] text-xl font-semibold relative right-35">ยืนยันรหัสผ่านอีกครั้ง</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              placeholder="รหัสผ่าน"
              className="bg-[#EDEDED] w-full h-14 rounded-[20px] px-6 text-[#256D45] text-xl placeholder:text-[#BFBFBF] outline-none focus:ring-2 focus:ring-[#256D45]"
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm px-2">{errors.confirmPassword}</p>}
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#FFFEF2] border-2 border-[#256D45] text-[#256D45] text-2xl font-semibold w-30 h-12 rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.25)] hover:bg-[#256D45] hover:text-[#FFFEF2] transition-colors duration-300 flex items-center justify-center"
            >
              {loading ? '...' : 'ยืนยัน'}
            </button>
          </div>

        </form>

        <p className="text-center text-[#BFBFBF] mt-6 font-semibold">
          มีบัญชีอยู่แล้ว? <Link to="/login" className="text-[#256D45] underline">เข้าสู่ระบบ</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;