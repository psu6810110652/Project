import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import api from '../services/api';
import ShippingAddressForm from '../components/ShippingAddressForm';
import Swal from 'sweetalert2';

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // ✅ Username
    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    } else if (formData.username.length < 4 || formData.username.length > 20) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีความยาวระหว่าง 4 - 20 ตัวอักษร';
    } else if (!/^[ก-๙a-zA-Z0-9._]+$/.test(formData.username)) {
      newErrors.username = 'ชื่อผู้ใช้ต้องเป็นภาษาไทย ภาษาอังกฤษ ตัวเลข หรือเครื่องหมาย . และ _ เท่านั้น';
    }

    // ✅ ชื่อ-นามสกุล
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อและนามสกุล';
    } else if (!/^[ก-๙a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'ชื่อ-นามสกุล ต้องไม่มีตัวเลขหรือเครื่องหมายพิเศษ';
    } else if (!formData.name.trim().includes(' ')) {
      newErrors.name = 'กรุณากรอกทั้งชื่อและนามสกุล (เว้นวรรค 1 ครั้ง)';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'ชื่อ-นามสกุล ต้องไม่เกิน 100 ตัวอักษร';
    }

    // ✅ เบอร์โทร — ลบขีดและเว้นวรรคก่อนเช็ค
    const cleanPhone = formData.phone.replace(/[-\s]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^(06|08|09)\d{8}$/.test(cleanPhone)) {
      newErrors.phone = 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องมี 10 หลัก และขึ้นต้นด้วย 06, 08 หรือ 09)';
    }

    // ✅ อาชีพ
    if (!formData.occupation || formData.occupation === '') {
      newErrors.occupation = 'กรุณาเลือกอาชีพของคุณ';
    }

    // ✅ Email — trim ก่อนเช็คเสมอ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง (เช่น name@email.com)';
    }

    // ✅ ที่อยู่
    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = 'กรุณากรอกบ้านเลขที่';
    }
    if (!formData.province.trim()) {
      newErrors.province = 'กรุณากรอกจังหวัด';
    }
    if (!formData.district.trim()) {
      newErrors.district = 'กรุณากรอกอำเภอ/เขต';
    }
    if (!formData.subDistrict.trim()) {
      newErrors.subDistrict = 'กรุณากรอกตำบล/แขวง';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'กรุณากรอกรหัสไปรษณีย์';
    } else if (!/^\d{5}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
    }

    return newErrors;
  };

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
    let { name, value } = e.target;

    // ✅ Username — ลบเว้นวรรคออกอัตโนมัติ
    if (name === 'username') {
      value = value.replace(/\s/g, '');
    }

    // ✅ Phone — อนุญาตเฉพาะตัวเลข ขีด และเว้นวรรค
    if (name === 'phone') {
      value = value.replace(/[^0-9\-\s]/g, '');
    }

    // ✅ Email — trim อัตโนมัติ
    if (name === 'email') {
      value = value.trim();
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // ✅ Validate ก่อน submit
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // เลื่อนขึ้นไปบนสุดเพื่อให้เห็น error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!userStr || !token) {
      navigate('/login', { replace: true });
      return;
    }

    let userId;
    try {
      userId = JSON.parse(userStr).id;
    } catch {
      navigate('/login', { replace: true });
      return;
    }

    try {
      // ✅ ลบ - และเว้นวรรคออกจาก phone ก่อนส่ง
      const cleanPhone = formData.phone.replace(/[-\s]/g, '');

      const userPayload = {
        username: formData.username.trim(),
        name: formData.name.trim(),
        phone: cleanPhone,
        occupation: formData.occupation,
        email: formData.email.trim(),
        addressSummary: `${formData.houseNumber} ${formData.streetSoi} ${formData.subDistrict} ${formData.district} ${formData.province} ${formData.postalCode}`
      };

      const userResponse = await api.patch(`/users/${userId}`, userPayload);

      if (userResponse.status === 200) {
        localStorage.setItem('shippingAddress', JSON.stringify(formData));
        setShowSuccessOverlay(true);
        setTimeout(() => navigate('/profile'), 1000);
      }

    } catch (error: any) {
      const message = error.response?.data?.message || '';

      // ✅ เช็ค duplicate จาก Backend
      if (message.toLowerCase().includes('email')) {
        setErrors({ email: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' });
      } else if (message.toLowerCase().includes('username')) {
        setErrors({ username: 'ชื่อผู้ใช้นี้มีคนใช้งานแล้ว กรุณาลองใช้ชื่ออื่น' });
      } else {
        // ✅ เปลี่ยนจาก alert() เป็น Swal
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonColor: '#256D45',
          confirmButtonText: 'ตกลง',
        });
      }
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
                  className={`w-full px-4 py-3 h-14 bg-gray-100 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg`}
                  required
                />
                {errors.username && <p className="text-red-500 text-sm mt-1 text-left">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">ชื่อ - นามสกุล</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 h-14 bg-gray-100 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1 text-left">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 h-14 bg-gray-100 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1 text-left">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-lg font-medium text-left mb-2">อาชีพ</label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 h-14 bg-gray-100 border ${errors.occupation ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg`}
                >
                  <option value="">เลือกอาชีพ</option>
                  <option value="student">นักเรียน</option>
                  <option value="teacher">ครู</option>
                  <option value="farmer">เกษตรกร</option>
                  <option value="business">ธุรกิจ</option>
                  <option value="other">อื่นๆ</option>
                </select>
                {errors.occupation && <p className="text-red-500 text-sm mt-1 text-left">{errors.occupation}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-lg font-medium text-left mb-2">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 h-14 bg-gray-100 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:border-green-500 text-lg`}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1 text-left">{errors.email}</p>}
              </div>
            </div>
          </div>

          <ShippingAddressForm
            formData={formData}
            onFormChange={handleFormFieldChange}
            errors={errors}
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