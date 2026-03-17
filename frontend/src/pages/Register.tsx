import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

const Register = () => {
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showModal, setShowModal] = useState<'terms' | 'privacy' | false>(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    const reservedWords = ['admin', 'administrator', 'support', 'system', 'root', 'staff'];
    const profanityList = ['fuck', 'shit', 'ass']; // เพิ่มคำหยาบได้เรื่อยๆ

    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    } else if (formData.username.length > 20) {
      newErrors.username = 'ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร';
    } else if (!/^[a-zA-Zก-๙]/.test(formData.username)) {
      newErrors.username = 'ชื่อผู้ใช้ต้องขึ้นต้นด้วยตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น';
    } else if (!/^[ก-๙a-zA-Z0-9._]+$/.test(formData.username)) {
      newErrors.username = 'ชื่อผู้ใช้ใช้ได้เฉพาะภาษาไทย ภาษาอังกฤษ ตัวเลข จุด (.) และขีดล่าง (_)';
    } else if (/[._]{2,}/.test(formData.username)) {
      newErrors.username = 'ชื่อผู้ใช้ไม่สามารถใช้จุดหรือขีดล่างติดกันได้ (เช่น .. หรือ __)';
    } else if (reservedWords.includes(formData.username.toLowerCase())) {
      newErrors.username = 'ชื่อผู้ใช้นี้ไม่สามารถใช้ได้ กรุณาเลือกชื่ออื่น';
    } else if (profanityList.some(word => formData.username.toLowerCase().includes(word))) {
      newErrors.username = 'ชื่อผู้ใช้นี้ไม่เหมาะสม กรุณาเลือกชื่ออื่น';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง (เช่น name@example.com)';
    } else if (formData.email.length > 100) {
      newErrors.email = 'อีเมลต้องไม่เกิน 100 ตัวอักษร';
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 8) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว (0-9)';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง';
    }

    if (!agreedToTerms) {
      newErrors.agreedToTerms = 'กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว';
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
      await api.post('/users', {
        ...dataToSend,
        agreedToTerms,
        marketingConsent
      });


      await Swal.fire({
        title: 'สมัครสมาชิกสำเร็จ!',
        text: 'คุณสามารถเข้าสู่ระบบได้แล้ว',
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

          <div className="flex flex-col gap-4 mt-2 border-t border-[#e0e0c8] pt-5 w-full">
            <label className="flex items-start gap-3 cursor-pointer group text-left w-full">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-[#256D45] focus:ring-[#256D45] cursor-pointer"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                ฉันตกลงยอมรับ <button type="button" onClick={() => setShowModal('terms')} className="text-[#256D45] underline font-medium hover:text-[#1a4a2e]">เงื่อนไขการใช้งาน</button> และ <button type="button" onClick={() => setShowModal('privacy')} className="text-[#256D45] underline font-medium hover:text-[#1a4a2e]">นโยบายความเป็นส่วนตัว</button> ของระบบ
              </span>
            </label>
            {errors.agreedToTerms && <p className="text-red-500 text-xs pl-8 mt-0.5">{errors.agreedToTerms}</p>}

            <label className="flex items-start gap-3 cursor-pointer text-left w-full">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-[#256D45] focus:ring-[#256D45] cursor-pointer"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                ฉันยินยอมรับข้อมูลข่าวสาร โปรโมชัน และสิทธิพิเศษจากทางร้าน (ไม่บังคับ)
              </span>
            </label>
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="group relative bg-white border-2 border-[#256D45] text-[#256D45] text-2xl font-semibold w-48 h-14 rounded-2xl shadow-lg hover:bg-[#256D45] hover:text-white transition-all duration-300 flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">{loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}</span>
            </button>
          </div>

        </form>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
            <div
              className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto text-left"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-[#256D45] text-xl font-bold mb-4 border-b pb-2 text-left">
                {showModal === 'terms' ? 'เงื่อนไขการใช้งาน (Terms of Service)' : 'นโยบายความเป็นส่วนตัว (Privacy Policy)'}
              </h2>
              <div className="overflow-y-auto py-2 text-sm text-[#444] leading-relaxed flex-1 text-left mb-6">
                {showModal === 'terms' ? (
                  <>
                    <p className="text-xs text-gray-400 mb-4">ประกาศเมื่อวันที่: 15 มีนาคม 2569</p>
                    <p className="mb-4">
                      การเข้าใช้งานเว็บไซต์ "ธีรยุทธการเกษตร" ถือว่าท่านยอมรับข้อตกลงดังต่อไปนี้:
                    </p>

                    <div className="space-y-4">
                      <div>
                        <p className="font-bold text-[#256D45] text-left">1. การสั่งซื้อสินค้า</p>
                        <p className="mt-1">
                          ผู้ซื้อต้องตรวจสอบรายละเอียดสินค้า (ปุ๋ย, เมล็ดพันธุ์, อุปกรณ์)
                          ให้ถูกต้องก่อนยืนยันคำสั่งซื้อ ราคาสินค้าเป็นราคาที่ตกลงกัน ณ ขณะทำรายการ
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-[#256D45] text-left">2. การชำระเงิน</p>
                        <p className="mt-1">
                          เราใช้ระบบการชำระเงินผ่าน PromptPay เท่านั้น โดยผู้ซื้อต้องอัปโหลดหลักฐานการโอนเงิน (Slip)
                          ที่ชัดเจนผ่านระบบหน้าเว็บไซต์เพื่อยืนยันออเดอร์
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-[#256D45] text-left">3. การจัดส่ง</p>
                        <p className="mt-1">
                          ร้านจะดำเนินการจัดส่งผ่าน Kerry, Flash หรือไปรษณีย์ไทย ตามความเหมาะสม
                          สินค้าเกษตรบางชนิดอาจมีข้อจำกัดเรื่องระยะเวลาการขนส่ง
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-[#256D45] text-left">4. ข้อจำกัดความรับผิดชอบ</p>
                        <p className="mt-1">
                          เนื่องจากผลผลิตทางการเกษตรขึ้นอยู่กับปัจจัยภายนอก (สภาพอากาศ, วิธีการปลูก, สภาพดิน)
                          ทางร้านไม่สามารถรับประกันผลผลิต 100% จากการใช้สินค้าได้
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-[#256D45] text-left">5. นโยบายการเคลมสินค้า</p>
                        <p className="mt-1">
                          หากสินค้าเสียหายจากการขนส่ง หรือไม่ครบตามจำนวน ต้องแจ้งทางร้าน
                          <span className="font-bold text-[#256D45]"> ภายใน 48 ชั่วโมง </span>
                          นับจากวันที่ได้รับสินค้า พร้อมแนบวิดีโอหลักฐานขณะแกะกล่อง
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-4">
                      ร้าน <span className="font-bold text-[#256D45]">ธีรยุทธการเกษตร</span> ("เรา")
                      เคารพความเป็นส่วนตัวของผู้ใช้งาน ("ท่าน") และดำเนินการตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
                      พ.ศ. 2562 (PDPA) ดังนี้:
                    </p>

                    <div className="space-y-4">
                      <div>
                        <p className="font-bold text-[#256D45] text-left">1. ข้อมูลที่เราจัดเก็บ</p>
                        <ul className="mt-1 space-y-1 pl-4 list-disc">
                          <li><span className="font-medium">ข้อมูลเพื่อการจัดส่ง:</span> ชื่อ-นามสกุล, ที่อยู่, เบอร์โทรศัพท์ และอีเมล</li>
                          <li><span className="font-medium">ข้อมูลการชำระเงิน:</span> ภาพสลิปโอนเงิน (เพื่อตรวจสอบยอดเงินเท่านั้น)</li>
                          <li><span className="font-medium">ข้อมูลทางเทคนิค:</span> หมายเลข IP Address (เพื่อความปลอดภัยของระบบ)</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-bold text-[#256D45] text-left">2. วัตถุประสงค์การใช้ข้อมูล</p>
                        <ul className="mt-1 space-y-1 pl-4 list-disc">
                          <li>เพื่อดำเนินการตามคำสั่งซื้อและจัดส่งสินค้าผ่านผู้ให้บริการขนส่ง (Kerry, Flash, ไปรษณีย์ไทย)</li>
                          <li>เพื่อติดต่อสื่อสารและแจ้งสถานะการจัดส่ง</li>
                          <li>เพื่อปฏิบัติตามกฎหมายบัญชีและภาษี (เก็บรักษาข้อมูล 5 - 10 ปี)</li>
                          <li>หากท่านให้ความยินยอมเพิ่มเติม เราจะส่งข้อมูลโปรโมชันสินค้าเกษตรผ่านช่องทางติดต่อที่ท่านระบุ</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-bold text-[#256D45] text-left">3. การรักษาความปลอดภัย</p>
                        <p className="mt-1">
                          เราเก็บข้อมูลของท่านในระบบฐานข้อมูลที่เข้ารหัสและจำกัดการเข้าถึงเฉพาะเจ้าหน้าที่ที่เกี่ยวข้องเท่านั้น
                          เราจะ<span className="font-bold">ไม่ขาย</span>ข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอกโดยเด็ดขาด
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-[#256D45] text-left">4. สิทธิของท่าน</p>
                        <p className="mt-1">
                          ท่านมีสิทธิในการขอเข้าถึง, แก้ไขข้อมูลให้ถูกต้อง, ขอให้ลบข้อมูล (เมื่อสิ้นสุดความจำเป็นทางกฎหมาย),
                          หรือถอนความยินยอมในการรับข่าวสารการตลาดได้ทุกเมื่อ
                        </p>
                      </div>

                      <div className="bg-[#F8FBF8] rounded-xl p-4 border border-[#e0e0c8] mt-6">
                        <p className="font-bold text-[#256D45] mb-2 text-left">5. ช่องทางการติดต่อ</p>
                        <p>ร้านธีรยุทธการเกษตร</p>
                        <p>เบอร์โทร: 099-9999999</p>
                        <p>อีเมล: <a href="mailto:TEERAYUTKANKASED@gmail.com" className="text-[#256D45] underline">TEERAYUTKANKASED@gmail.com</a></p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="px-8 py-5 border-t border-[#e0e0c8] flex justify-between items-center">
                {/* ปุ่มปิด — ซ้าย */}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-sm font-semibold text-gray-400 underline hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
                >
                  ปิด
                </button>

                {/* ปุ่มยอมรับ — ขวา */}
                <button
                  type="button"
                  onClick={() => {
                    setAgreedToTerms(true);
                    setErrors(prev => { const { agreedToTerms: _, ...rest } = prev; return rest; });
                    setShowModal(false);
                  }}
                  className="group relative bg-white border-2 border-[#256D45] text-[#256D45] text-sm font-semibold min-w-[80px] px-8 py-2.5 rounded-xl shadow-md hover:bg-[#256D45] hover:text-white transition-all duration-300 flex items-center justify-center active:scale-95"
                >
                  <span className="relative z-10">ยอมรับ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-[#BFBFBF] mt-6 font-semibold">
          มีบัญชีอยู่แล้ว? <Link to="/login" className="text-[#256D45] underline">เข้าสู่ระบบ</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;