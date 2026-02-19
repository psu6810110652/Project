import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', 
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.access_token);
      navigate('/'); 
    } catch (err: any) {
      setError('อีเมล/ชื่อผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-[#DCEDC1] flex flex-col items-center justify-center font-['Prompt'] p-4">
      
      {/* เข้าสู่ระบบ */}
      <h1 
        className="text-[#256D45] text-5xl md:text-[80px] font-semibold mb-8 text-center"
        style={{ textShadow: '0px 4px 20px rgba(0, 0, 0, 0.25)' }}
      >
        เข้าสู่ระบบ
      </h1>

      {/* Card สีครีม */}
      <div className="bg-[#FFFEF2] w-full max-w-[563px] rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.25)] p-8 md:p-12 relative">
        
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* ใส่ Username/Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[#256D45] text-xl md:text-2xl font-semibold relative right-30">อีเมล หรือ ชื่อผู้ใช้งาน</label>
            <input
              type="text"
              name="username"
              placeholder="อีเมล หรือ ชื่อผู้ใช้งาน"
              required
              className="bg-[#EDEDED] w-full h-[58px] rounded-[20px] px-6 text-[#256D45] text-xl placeholder:text-[#BFBFBF] outline-none focus:ring-2 focus:ring-[#256D45]"
              onChange={handleChange}
            />
          </div>

          {/* ใส่รหัสผ่าน */}
          <div className="flex flex-col gap-2">
            <label className="text-[#256D45] text-xl md:text-2xl font-semibold relative right-47">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              placeholder="รหัสผ่าน"
              required
              className="bg-[#EDEDED] w-full h-[58px] rounded-[20px] px-6 text-[#256D45] text-xl placeholder:text-[#BFBFBF] outline-none focus:ring-2 focus:ring-[#256D45]"
              onChange={handleChange}
            />
          </div>

          {/* จดจำฉัน กับ ลืมรหัสผ่าน */}
          <div className="flex justify-between items-center mt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 md:w-[22px] md:h-[22px] accent-[#256D45]" />
              <span className="text-[#256D45] text-lg md:text-xl font-semibold">จดจำฉัน</span>
            </label>
            <Link to="/forgot-password" className="text-[#BFBFBF] text-lg md:text-xl font-semibold underline">
              ลืมรหัสผ่าน?
            </Link>
          </div>

          {/* Button: Login */}
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#FFFEF2] border-2 border-[#256D45] text-[#256D45] text-5xl md:text-2xl font-semibold w-[121px] h-[56px] rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.25)] hover:bg-[#256D45] hover:text-[#FFFEF2] transition-colors duration-300 flex items-center justify-center"
            >
              {loading ? '...' : 'ยืนยัน'}
            </button>
          </div>
        </form>

        {/* Footer/Or section */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 w-full">
            <span className="text-[#BFBFBF] text-xl md:text-2xl font-semibold">ยังไม่มีบัญชี?</span>
            <Link to="/register" className="text-[#256D45] text-xl md:text-2xl font-semibold underline">
              สมัครสมาชิก
            </Link>
            <span className="text-[#256D45] text-xl md:text-2xl font-semibold ml-auto">หรือ</span>
          </div>

          {/* Google Login Button */}
          <button className="bg-[#D9D9D9] w-full h-[72px] rounded-[20px] flex items-center justify-center gap-4 hover:bg-gray-300 transition-colors">
            {/* ใส่ Icon Google ตรงนี้แทน placehold */}
            <div className="w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center font-bold text-lg">G</div>
            <span className="text-[#256D45] text-xl md:text-2xl font-semibold">เข้าสู่ระบบผ่าน Google</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;