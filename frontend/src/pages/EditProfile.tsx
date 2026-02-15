import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: 'ชื่อผู้ใช้',
    email: 'อีเมล',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Profile updated:', formData);
    navigate('/profile');
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-[#DCEDC1] font-['Prompt'] text-[#256D45] pb-0">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">แก้ไขโปรไฟล์</h1>
          <p className="text-lg">แก้ไขข้อมูลส่วนตัวของคุณ</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="username">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#256D45] rounded-lg focus:outline-none focus:border-[#1a5434] text-lg"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="email">
                อีเมล
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#256D45] rounded-lg focus:outline-none focus:border-[#1a5434] text-lg"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="phone">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#256D45] rounded-lg focus:outline-none focus:border-[#1a5434] text-lg"
                placeholder="กรอกเบอร์โทรศัพท์"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="address">
                ที่อยู่
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-[#256D45] rounded-lg focus:outline-none focus:border-[#1a5434] text-lg resize-none"
                placeholder="กรอกที่อยู่ของคุณ"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="password">
                รหัสผ่านใหม่
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#256D45] rounded-lg focus:outline-none focus:border-[#1a5434] text-lg"
                placeholder="ปล่อยว่างหากไม่ต้องการเปลี่ยน"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-lg font-medium mb-2" htmlFor="confirmPassword">
                ยืนยันรหัสผ่านใหม่
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#256D45] rounded-lg focus:outline-none focus:border-[#1a5434] text-lg"
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-3 border-2 border-gray-400 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition text-lg"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-[#256D45] text-white font-semibold rounded-lg hover:bg-[#1a5434] transition text-lg"
            >
              ยืนยันการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
