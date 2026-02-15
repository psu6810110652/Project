import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    nameSurname: '',
    phone: '',
    occupation: '',
    email: '',
    houseNumber: '',
    dormRoom: '',
    streetSoi: '',
    province: '',
    district: '',
    subDistrict: '',
    postalCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send data to your backend
    console.log('Profile updated:', formData);
    navigate('/profile');
  };

  const handleDeleteAccount = () => {
    // Handle account deletion
    console.log('Delete account');
  };

  return (
    <div className="min-h-screen bg-[#DCEDC1] font-['Prompt'] text-[#256D45]">
      <div className="relative">
        <BackButton />
        <button 
          onClick={handleDeleteAccount}
          className="absolute top-4 right-8 bg-white border-2 border-red-500 text-red-500 font-bold py-2 px-4 rounded-full shadow hover:bg-red-50 transition-colors"
        >
          ลบบัญชี
        </button>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* แก้ไขข้อมูลส่วนตัว */}
          <div className="top-32 left-32 bg-[#FFFEF2] rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-[#256D45] mb-6 pb-2 border-b-2 border-[#256D45] text-left">
              แก้ไขข้อมูลส่วนตัว
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-left mb-2" htmlFor="username">
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="ชื่อผู้ใช้"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2" htmlFor="nameSurname">
                  ชื่อ - นามสกุล
                </label>
                <input
                  type="text"
                  id="nameSurname"
                  name="nameSurname"
                  placeholder="ชื่อ - นามสกุล"
                  value={formData.nameSurname}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2" htmlFor="phone">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="เบอร์โทรศัพท์"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2" htmlFor="occupation">
                  อาชีพ
                </label>
                <select
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                >
                  <option value="">เลือกอาชีพ</option>
                  <option value="student">นักเรียน</option>
                  <option value="teacher">ครู</option>
                  <option value="farmer">เกษตรกร</option>
                  <option value="business">ธุรกิจ</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2" htmlFor="email">
                  อีเมล
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="อีเมล"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* ที่อยู่ในการจัดส่ง */}
          <div className="bg-[#FFFEF2] rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-[#256D45] mb-6 pb-2 border-b-2 border-[#256D45] text-left">
              ที่อยู่ในการจัดส่ง
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-left mb-2" htmlFor="houseNumber">
                  บ้านเลขที่/ชื่อหอพักและเลขห้อพัก
                </label>
                <input
                  type="text"
                  id="houseNumber"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                  placeholder="บ้านเลขที่/ชื่อหอพักและเลขห้อพัก"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2" htmlFor="streetSoi">
                  ถนน/ซอย
                </label>
                <input
                  type="text"
                  id="streetSoi"
                  name="streetSoi"
                  value={formData.streetSoi}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                  placeholder="ถนน/ซอย"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2" htmlFor="province">
                  จังหวัด
                </label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                  placeholder="จังหวัด"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2" htmlFor="district">
                  อำเภอ
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                  placeholder="อำเภอ"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2" htmlFor="subDistrict">
                  ตำบล
                </label>
                <input
                  type="text"
                  id="subDistrict"
                  name="subDistrict"
                  value={formData.subDistrict}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                  placeholder="ตำบล"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2" htmlFor="postalCode">
                  รหัสไปรษณีย์
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                  placeholder="รหัสไปรษณีย์"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="px-8 py-3 bg-[#256D45] text-white font-semibold rounded-lg hover:bg-[#1a5434] transition-colors text-lg"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
