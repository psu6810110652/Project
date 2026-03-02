import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import api from '../services/api';
import ShippingAddressForm from '../components/ShippingAddressForm';

const EditProfile = () => {
  const navigate = useNavigate();

  // 🌟 เพิ่ม State ควบคุมการแสดง Overlay สั่งซื้อสำเร็จ
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
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

  // 🌟 ฟังก์ชันดึงข้อมูลจาก Backend
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        console.warn("ไม่พบ Token หรือข้อมูลผู้ใช้ใน LocalStorage");
        return;
      }

      const userObj = JSON.parse(userStr);
      const userId = userObj.id;

      if (!userId) return;

      // 1️⃣ Fetch User Data
      const response = await api.get(`/users/${userId}`);

      if (response.status === 200) {
        const userData = response.data;
        console.log("ดึงข้อมูลผู้ใช้สำเร็จ:", userData);

        // Mapping ข้อมูลลง State (ใส่ || '' ป้องกันค่า null จาก DB)
        setFormData(prev => ({
          ...prev,
          username: userData.username || '',
          name: userData.name || '',
          phone: userData.phone || '',
          occupation: userData.occupation || '',
          email: userData.email || ''
        }));
      } else {
        console.error('❌ ดึงข้อมูลผู้ใช้ไม่สำเร็จ');
      }

      // 2️⃣ Fetch User's Addresses (separately)
      try {
        const addressResponse = await api.get('/addresses');
        console.log("ดึงข้อมูลที่อยู่สำเร็จ:", addressResponse.data);

        // เลือกที่อยู่แรก (หรือที่อยู่ default) เพื่อแสดงในฟอร์ม
        if (addressResponse.data && addressResponse.data.length > 0) {
          const defaultAddr = addressResponse.data.find((a: any) => a.isDefault) || addressResponse.data[0];
          setFormData(prev => ({
            ...prev,
            houseNumber: defaultAddr.houseNumber || '',
            dormRoom: defaultAddr.dormRoom || '',
            streetSoi: defaultAddr.streetSoi || '',
            province: defaultAddr.province || '',
            district: defaultAddr.district || '',
            subDistrict: defaultAddr.subDistrict || '',
            postalCode: defaultAddr.postalCode || ''
          }));
        }
      } catch (addrErr) {
        console.warn("⚠️ ไม่สามารถดึงข้อมูลที่อยู่ได้ (อาจยังไม่มีที่อยู่):", addrErr);
      }
    } catch (error) {
      console.error("ระบบ Fetch พัง:", error);
    }
  };

  // 🌟 เรียกใช้ครั้งเดียวตอน Mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Helper function to update formData fields
  const handleFormFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle basic input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!userStr || !token) return;
    const userId = JSON.parse(userStr).id;

    try {
      // 1️⃣ Update User profile (only user-specific fields)
      const userPayload = {
        username: formData.username,
        name: formData.name,
        phone: formData.phone,
        occupation: formData.occupation,
        email: formData.email,
        addressSummary: `${formData.houseNumber} ${formData.streetSoi} ${formData.subDistrict} ${formData.district} ${formData.province} ${formData.postalCode}`
      };

      const userResponse = await api.patch(`/users/${userId}`, userPayload);

      if (userResponse.status === 200) {
        console.log('✅ User updated:', userResponse.data);

        localStorage.setItem('shippingAddress', JSON.stringify(formData));

        // 🌟 Show success overlay and redirect
        setShowSuccessOverlay(true);
        setTimeout(() => {
          navigate('/profile');
        }, 1000);

      } else {
        alert('เกิดข้อผิดพลาด: บันทึกข้อมูลไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  const handleDeleteAccount = () => {
    alert('ระบบลบบัญชียังไม่เปิดใช้งานในขณะนี้ครับ');
  };

  return (
    <div className="min-h-screen bg-[#DCEDC1] font-['Prompt'] text-[#256D45] relative">
      <div className="relative">
        <button
          onClick={handleDeleteAccount}
          className="absolute top-4 right-8 bg-white border-2 border-red-500 text-red-500 font-bold py-2! px-4! rounded-full shadow hover:bg-red-50 transition-colors"
        >
          ลบบัญชี
        </button>
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* แก้ไขข้อมูลส่วนตัว */}
          <div className="bg-[#FFFEF2] rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-[#256D45] mb-6 pb-2 border-b-2 border-[#256D45] text-left">
              แก้ไขข้อมูลส่วนตัว
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-left mb-2">ชื่อผู้ใช้</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 h-14 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">ชื่อ - นามสกุล</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 h-14 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 h-14 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">อาชีพ</label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 h-14 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                >
                  <option value="">เลือกอาชีพ</option>
                  <option value="student">นักเรียน</option>
                  <option value="teacher">ครู</option>
                  <option value="farmer">เกษตรกร</option>
                  <option value="business">ธุรกิจ</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-lg font-medium text-left mb-2">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 h-14 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                  required
                />
              </div>
            </div>
          </div>

          <ShippingAddressForm
            formData={formData}
            onFormChange={handleFormFieldChange}
          />

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="px-8! py-3! bg-[#256D45] text-white font-semibold rounded-lg hover:bg-[#1a5434] transition-colors text-lg shadow-md"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>

      {/* =========================================
          🌟 ส่วน Overlay แจ้งเตือนบันทึกข้อมูลสำเร็จ
          ========================================= */}
      {showSuccessOverlay && (
        <>
          {/* เลเยอร์ 1: ฉากหลังสีดำเบลอ */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100"></div>

          {/* เลเยอร์ 2: ตัวกล่อง Popup สีขาว */}
          <div className="fixed inset-0 flex items-center justify-center z-110">
            <div className="bg-white rounded-3xl p-8 md:p-12 flex flex-col items-center shadow-2xl border border-gray-100 w-[90%] max-w-md">
              <CheckCircle size={80} className="text-[#256D45] mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-[#256D45] mb-3 text-center">บันทึกข้อมูลสำเร็จแล้ว!</h2>
              <p className="text-gray-500 text-center font-medium">ระบบกำลังพาท่านกลับสู่หน้าโปรไฟล์...</p>

              {/* โลโก้โหลดหมุนๆ (Spinning loader) */}
              <div className="mt-6 w-8 h-8 border-4 border-gray-200 border-t-[#256D45] rounded-full animate-spin"></div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default EditProfile;