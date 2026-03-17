import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import Swal from 'sweetalert2';

const Login = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (auth?.user) {
      if (auth.user?.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [auth?.user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLoginSuccess = async (tokenResponse: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google', {
        token: tokenResponse.access_token,
      });

      localStorage.setItem('token', response.data.access_token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      if (auth) {
        auth.login({
          ...response.data.user,
          id: response.data.user?.id,
          name: response.data.user?.name || response.data.username,
          token: response.data.access_token,
          role: response.data.user?.role,
        });
      }

      const userRole = response.data.user?.role;
      if (userRole === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      Swal.fire({
        title: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ',
        text: 'ไม่สามารถเข้าสู่ระบบผ่าน Google ได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonColor: '#256D45',
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: () => Swal.fire({
      title: 'เกิดข้อผิดพลาด',
      text: 'Google Login ล้มเหลว กรุณาลองใหม่อีกครั้ง',
      icon: 'error',
      confirmButtonColor: '#256D45',
      confirmButtonText: 'ตกลง',
    }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate ก่อน submit
    if (!formData.username.trim() || !formData.password.trim()) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน',
        icon: 'warning',
        confirmButtonColor: '#256D45',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);

      localStorage.setItem('token', response.data.access_token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      if (auth) {
        auth.login({
          ...response.data.user,
          id: response.data.user?.id,
          name: response.data.user?.name || formData.username,
          token: response.data.access_token,
          role: response.data.user?.role,
        });
      }

      const userRole = response.data.user?.role;
      if (userRole === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err: any) {
      Swal.fire({
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
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

      {/* เข้าสู่ระบบ */}
      <h1
        className="text-[#256D45] text-5xl md:text-[80px] font-semibold mb-8 text-center tracking-wider"
        style={{ textShadow: '0px 2px 10px rgba(0, 0, 0, 0.15)' }}
      >
        เข้าสู่ระบบ
      </h1>

      {/* Card สีครีม */}
      <div className="bg-[#FFFEF2] w-full max-w-140.75 rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.25)] p-8 md:p-12 relative">

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ใส่ Username/Email */}
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[#256D45] text-xl font-semibold ml-2">อีเมล หรือ ชื่อผู้ใช้งาน</label>
            <input
              type="text"
              name="username"
              placeholder="กรอกอีเมล หรือ ชื่อผู้ใช้งาน"
              required
              className="bg-[#EDEDED] w-full h-15 rounded-2xl px-6 text-[#256D45] text-xl placeholder:text-[#BFBFBF] outline-none border-2 border-transparent focus:border-[#256D45] transition-all"
              onChange={handleChange}
            />
          </div>

          {/* ใส่รหัสผ่าน */}
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[#256D45] text-xl font-semibold ml-2">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              placeholder="กรอกรหัสผ่าน"
              required
              className="bg-[#EDEDED] w-full h-15 rounded-2xl px-6 text-[#256D45] text-xl placeholder:text-[#BFBFBF] outline-none border-2 border-transparent focus:border-[#256D45] transition-all"
              onChange={handleChange}
            />
          </div>

          {/* จดจำฉัน กับ ลืมรหัสผ่าน */}
          <div className="flex justify-between items-center mt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 md:w-5.5 md:h-5.5 accent-[#256D45]" />
              <span className="text-[#256D45] text-lg md:text-xl font-medium">จดจำฉัน</span>
            </label>
            <Link 
              to="/forgot-password" 
              className="text-[#BFBFBF] hover:text-[#256D45] text-lg md:text-xl font-medium underline relative z-10 transition-colors"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>

          {/* Button: Login */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="group relative bg-white border-2 border-[#256D45] text-[#256D45] text-2xl font-semibold w-48 h-14 rounded-2xl shadow-lg hover:bg-[#256D45] hover:text-white transition-all duration-300 flex items-center justify-center active:scale-95"
            >
              <span className="relative z-10">{loading ? 'กำลังโหลด...' : 'ยืนยัน'}</span>
            </button>
          </div>
        </form>

        {/* Footer/Or section */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <span className="text-[#256D45] text-xl md:text-2xl font-medium mx-auto">หรือ</span>
          <div className="flex items-center gap-4 justify-center">
            <span className="text-[#BFBFBF] text-xl md:text-2xl font-medium">ยังไม่มีบัญชี?</span>
            <Link to="/register" className="text-[#256D45] text-xl md:text-2xl font-medium underline">
              สมัครสมาชิก
            </Link>
          </div>

          {/* Google Login Button */}
          <button
            type="button" // ต้องระบุเป็น button เพื่อไม่ให้ไป trigger form submit
            onClick={() => loginWithGoogle()}
            disabled={loading}
            className="bg-[#D9D9D9] w-full h-18 rounded-[20px] flex items-center justify-center gap-4 hover:bg-gray-300 transition-colors"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google Logo"
              className="w-7.5 h-7.5"
            />
            <span className="text-[#256D45] text-xl md:text-2xl font-medium">
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบผ่าน Google'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;