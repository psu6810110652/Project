import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Select, ConfigProvider } from 'antd';

const EditProfile = () => {
  const navigate = useNavigate();

  // 🌟 เพิ่ม State ควบคุมการแสดง Overlay สั่งซื้อสำเร็จ
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

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

  // 🌟 State จัดเก็บข้อมูลที่อยู่ในไทย
  const [addressData, setAddressData] = useState<any[]>([]);

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

      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim()}` // ✅ แก้ปัญหา Bearer ติดกัน
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("ดึงข้อมูลสำเร็จ:", userData);

        // Mapping ข้อมูลลง State (ใส่ || '' ป้องกันค่า null จาก DB)
        setFormData({
          username: userData.username || '',
          nameSurname: userData.nameSurname || '',
          phone: userData.phone || '',
          occupation: userData.occupation || '',
          email: userData.email || '',
          houseNumber: userData.houseNumber || '',
          dormRoom: userData.dormRoom || '',
          streetSoi: userData.streetSoi || '',
          province: userData.province || '',
          district: userData.district || '',
          subDistrict: userData.subDistrict || '',
          postalCode: userData.postalCode || ''
        });
      } else {
        const errorText = await response.text();
        console.error(`❌ ดึงข้อมูลไม่สำเร็จ (${response.status}):`, errorText);
        if (response.status === 401) {
          alert('เซสชั่นหมดอายุ กรุณาล็อกอินใหม่');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error("ระบบ Fetch พัง (JSON Input Error):", error);
    }
  };

  // 🌟 เรียกใช้ครั้งเดียวตอน Mount
  useEffect(() => {
    fetchUserData();

    // โหลดไฟล์ข้อมูลที่อยู่จาก github earthchie
    fetch('https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json')
      .then(res => res.json())
      .then(data => setAddressData(data))
      .catch(err => console.error("ไม่สามารถโหลดฐานข้อมูลที่อยู่จัดส่งได้:", err));
  }, []);

  // --- Address Computations ---
  const provinces = Array.from(new Set(addressData.map(item => item.province))).sort();

  const districts = formData.province
    ? Array.from(new Set(addressData.filter(item => item.province === formData.province).map(item => item.amphoe))).sort()
    : [];

  const subDistricts = formData.district
    ? Array.from(new Set(addressData.filter(item => item.province === formData.province && item.amphoe === formData.district).map(item => item.district))).sort()
    : [];

  const handleProvinceChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      province: val,
      district: '',
      subDistrict: '',
      postalCode: ''
    }));
  };

  const handleDistrictChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      district: val,
      subDistrict: '',
      postalCode: ''
    }));
  };

  const handleSubDistrictChange = (val: string) => {
    const matched = addressData.find(item => item.province === formData.province && item.amphoe === formData.district && item.district === val);
    setFormData(prev => ({
      ...prev,
      subDistrict: val,
      postalCode: matched ? matched.zipcode.toString() : ''
    }));
  };
  // -----------------------------
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
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim()}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('Update Success:', updatedUser);
        localStorage.setItem('shippingAddress', JSON.stringify(formData));

        // 🌟 เปิด Overlay แจ้งเตือน และหน่วงเวลา 2.5 วิ ก่อนไปหน้า Profile
        setShowSuccessOverlay(true);
        setTimeout(() => {
          navigate('/profile');
        }, 1000);

      } else {
        const errorData = await response.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.message || 'บันทึกไม่ได้'}`);
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
          className="absolute top-4 right-8 bg-white border-2 border-red-500 text-red-500 font-bold !py-2 !px-4 rounded-full shadow hover:bg-red-50 transition-colors"
        >
          ลบบัญชี
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto px-6 md:px-12 py-8">
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
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">ชื่อ - นามสกุล</label>
                <input
                  type="text"
                  name="nameSurname"
                  value={formData.nameSurname}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">อาชีพ</label>
                <select
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

              <div className="md:col-span-2">
                <label className="block text-lg font-medium text-left mb-2">อีเมล</label>
                <input
                  type="email"
                  name="email"
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
              <div className="md:col-span-2">
                <label className="block text-lg font-medium text-left mb-2">บ้านเลขที่/หอพัก/ห้อง</label>
                <input
                  type="text"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">ถนน/ซอย</label>
                <input
                  type="text"
                  name="streetSoi"
                  value={formData.streetSoi}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">จังหวัด</label>
                <ConfigProvider theme={{ token: { fontFamily: 'Prompt', fontSize: 18, controlHeight: 52 } }}>
                  <Select
                    showSearch
                    value={formData.province || undefined}
                    onChange={handleProvinceChange}
                    className="w-full text-lg"
                    placeholder="เลือก/ค้นหาจังหวัด"
                    options={provinces.map(p => ({ value: p as string, label: p as string }))}
                    filterOption={(input, option) => String(option?.label ?? '').includes(input)}
                  />
                </ConfigProvider>
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">อำเภอ/เขต</label>
                <ConfigProvider theme={{ token: { fontFamily: 'Prompt', fontSize: 18, controlHeight: 52 } }}>
                  <Select
                    showSearch
                    value={formData.district || undefined}
                    onChange={handleDistrictChange}
                    className="w-full text-lg"
                    placeholder={formData.province ? "เลือก/ค้นหาอำเภอ" : "เลือกจังหวัดก่อน"}
                    disabled={!formData.province}
                    options={districts.map(d => ({ value: d as string, label: d as string }))}
                    filterOption={(input, option) => String(option?.label ?? '').includes(input)}
                  />
                </ConfigProvider>
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">ตำบล/แขวง</label>
                <ConfigProvider theme={{ token: { fontFamily: 'Prompt', fontSize: 18, controlHeight: 52 } }}>
                  <Select
                    showSearch
                    value={formData.subDistrict || undefined}
                    onChange={handleSubDistrictChange}
                    className="w-full text-lg"
                    placeholder={formData.district ? "เลือก/ค้นหาตำบล" : "เลือกอำเภอก่อน"}
                    disabled={!formData.district}
                    options={subDistricts.map(sd => ({ value: sd as string, label: sd as string }))}
                    filterOption={(input, option) => String(option?.label ?? '').includes(input)}
                  />
                </ConfigProvider>
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">รหัสไปรษณีย์</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  disabled
                  readOnly
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-300 rounded-lg shadow-sm text-gray-500 font-semibold focus:outline-none text-lg cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="!px-8 !py-3 bg-[#256D45] text-white font-semibold rounded-lg hover:bg-[#1a5434] transition-colors text-lg shadow-md"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"></div>

          {/* เลเยอร์ 2: ตัวกล่อง Popup สีขาว */}
          <div className="fixed inset-0 flex items-center justify-center z-[110]">
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