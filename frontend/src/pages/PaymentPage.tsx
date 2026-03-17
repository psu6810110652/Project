import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { type CartItem } from '../types';
import { useCart } from '../context/CartContext';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  // 🌟 State เดิมสำหรับโชว์รูปบนหน้าเว็บ
  const [slipImage, setSlipImage] = useState<string | null>(null);

  // 🌟 State ใหม่! สำหรับเก็บรูปภาพที่แปลงเป็นข้อความ (Base64) เพื่อส่งไป Backend
  const [slipImageBase64, setSlipImageBase64] = useState<string | null>(null);

  const [deliveryAddress, setDeliveryAddress] = useState<string>('กำลังโหลดข้อมูลที่อยู่...');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  // เก็บข้อมูลผู้ใช้ (ชื่อ, เบอร์โทร) แยกจาก Address
  const [userData, setUserData] = useState<{ name: string; phone: string }>({
    name: 'ไม่ระบุชื่อ',
    phone: '-'
  });
  const userDataRef = useRef({ name: 'ไม่ระบุชื่อ', phone: '-' });

  const cartItems: CartItem[] = location.state?.cartItems || [];
  const totalPrice: number = location.state?.totalPrice || 0;

  const shippingFee = 0;
  const discount = 0;
  const finalTotal = totalPrice + shippingFee - discount;
  const qrCodeUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';

  // 🌟 ฟังก์ชันสำหรับดึงข้อมูลที่อยู่ทั้งหมดของผู้ใช้
  const fetchUserAddresses = async () => {
    try {
      // ดึงข้อมูลผู้ใช้จาก localStorage และ API ก่อน เพื่อเอาชื่อและเบอร์โทร
      let userName = 'ไม่ระบุชื่อ';
      let userPhone = '-';
      const userStr = localStorage.getItem('user');
      const localUser = userStr ? JSON.parse(userStr) : null;

      if (localUser?.id) {
        try {
          const userRes = await api.get(`/users/${localUser.id}`);
          if (userRes.data) {
            userName = userRes.data.name || userRes.data.username || 'ไม่ระบุชื่อ';
            userPhone = userRes.data.phone || '-';
            const newUserData = { name: userName, phone: userPhone };
            userDataRef.current = newUserData;
            setUserData(newUserData);
          }
        } catch (uErr) {
          console.warn('ไม่สามารถดึงข้อมูล user API ได้ ใช้ข้อมูลจาก localStorage ถ้ามี', uErr);
          // ถ้า userRes ล้มเหลว ปล่อยให้ค่า default จาก localStorage อยู่
        }
      }

      // ดึงที่อยู่เหมือนเดิม
      const response = await api.get('/addresses');
      const addresses = response.data;
      setSavedAddresses(addresses);

      if (addresses.length > 0) {
        const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];
        setSelectedAddressId(defaultAddress.id);

        // สร้างข้อความที่อยู่แบบเต็ม โดยใช้ชื่อ/เบอร์จาก userData (หรือค่าที่เพิ่งดึงมา)
        const fullAddress = `${userName} เบอร์โทร: ${userPhone}\n` +
          `เลขที่: ${defaultAddress.houseNumber || ''} ถนน/ซอย: ${defaultAddress.streetSoi || ''}\n` +
          `ตำบล: ${defaultAddress.subDistrict || ''} อำเภอ: ${defaultAddress.district || ''}\n` +
          `จังหวัด: ${defaultAddress.province || ''} รหัสไปรษณีย์ ${defaultAddress.postalCode || ''}`;
        setDeliveryAddress(fullAddress);
      } else {
        // ถ้าไม่มีที่อยู่ในระบบ ลองดึงจาก localStorage เดิม
        const savedAddress = localStorage.getItem('shippingAddress');
        if (savedAddress) {
          const addr = JSON.parse(savedAddress);
          const fullAddress = `${addr.nameSurname || userData.name || 'ไม่ระบุชื่อ'} เบอร์โทร: ${addr.phone || userData.phone || '-'}\nเลขที่: ${addr.houseNumber || ''} ถนน/ซอย: ${addr.streetSoi || ''}\nตำบล: ${addr.subDistrict || ''} อำเภอ: ${addr.district || ''}\nจังหวัด: ${addr.province || ''} รหัสไปรษณีย์ ${addr.postalCode || ''}`;
          setDeliveryAddress(fullAddress);
        } else {
          setDeliveryAddress('ไม่พบข้อมูลการจัดส่ง กรุณากลับไปเพิ่มที่อยู่ในหน้าโปรไฟล์');
        }
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลที่อยู่:', error);
      // ถ้า API ล้มเหลว ใช้วิธีเดิม (localStorage)
      const savedAddress = localStorage.getItem('shippingAddress');
      if (savedAddress) {
        const addr = JSON.parse(savedAddress);
        const fullAddress = `${addr.nameSurname || userData.name || 'ไม่ระบุชื่อ'} เบอร์โทร: ${addr.phone || userData.phone || '-'}\nเลขที่: ${addr.houseNumber || ''} ถนน/ซอย: ${addr.streetSoi || ''}\nตำบล: ${addr.subDistrict || ''} อำเภอ: ${addr.district || ''}\nจังหวัด: ${addr.province || ''} รหัสไปรษณีย์ ${addr.postalCode || ''}`;
        setDeliveryAddress(fullAddress);
      } else {
        setDeliveryAddress('ไม่พบข้อมูลการจัดส่ง กรุณากลับไปเพิ่มที่อยู่ในหน้าโปรไฟล์');
      }
    }
  };

  // 🌟 ฟังก์ชันสำหรับเลือกที่อยู่
  const handleAddressSelect = (address: any) => {
    setSelectedAddressId(address.id);

    const fullAddress = `${userDataRef.current.name} เบอร์โทร: ${userDataRef.current.phone}\n` +
      `เลขที่: ${address.houseNumber || ''} ถนน/ซอย: ${address.streetSoi || ''}\n` +
      `ตำบล: ${address.subDistrict || ''} อำเภอ: ${address.district || ''}\n` +
      `จังหวัด: ${address.province || ''} รหัสไปรษณีย์ ${address.postalCode || ''}`;

    setDeliveryAddress(fullAddress);
    setShowAddressDropdown(false);
  };

  // 🌟 ฟังก์ชันสำหรับสลับการแสดง dropdown
  const toggleAddressDropdown = () => {
    if (savedAddresses.length > 1) {
      setShowAddressDropdown(!showAddressDropdown);
    }
  };

  useEffect(() => {
    fetchUserAddresses();
  }, []);

  // 🌟 แก้ไขฟังก์ชันตอนอัปโหลดรูป ให้มีการแปลงเป็น Base64 ด้วย
  const handleUploadSlip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. สร้าง URL ชั่วคราวไว้โชว์บนหน้าเว็บ (UI)
      const imageUrls = URL.createObjectURL(file);
      setSlipImage(imageUrls);

      // 2. แปลงไฟล์รูปภาพเป็น Base64 string เพื่อส่งไปเซฟใน Database
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipImageBase64(reader.result as string); // จะได้ข้อความยาวๆ นำหน้าด้วย data:image/...
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    if (cartItems.length === 0) {
      alert("ไม่มีสินค้าในตะกร้า กลับไปเลือกสินค้าก่อนนะครับ");
      navigate('/cart');
      return;
    }

    if (deliveryAddress.includes('ไม่พบข้อมูล')) {
      alert("กรุณาระบุที่อยู่จัดส่งในหน้าแก้ไขโปรไฟล์ก่อนยืนยันครับ");
      return;
    }

    // 🌟 เปลี่ยนมาเช็คตัวแปร base64 แทน
    if (!slipImageBase64) {
      alert("กรุณาอัปโหลดสลิปโอนเงินก่อนยืนยันครับ");
      return;
    }

    try {
      // ใช้ที่อยู่ที่เลือกจาก API แทน localStorage
      let selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
      let addr;

      if (selectedAddress) {
        // ถ้าเจอที่อยู่ที่เลือกจาก API ให้ใช้ที่อยู่นั้น
        addr = selectedAddress;
      } else if (savedAddresses.length > 0) {
        // ถ้ามีที่อยู่ใน API แต่ไม่มีการเลือก ให้ใช้ที่อยู่แรก
        addr = savedAddresses[0];
      } else {
        // ถ้าไม่มีที่อยู่ใน API ให้ใช้วิธีเดิมจาก localStorage
        const savedAddress = localStorage.getItem('shippingAddress');
        addr = savedAddress ? JSON.parse(savedAddress) : { nameSurname: 'ลูกค้าทั่วไป', phone: '-' };
        // แปลงชื่อฟิลด์ให้ตรงกับที่ API ใช้
        addr = {
          name: addr.nameSurname || addr.name || 'ลูกค้าทั่วไป',
          phone: addr.phone || '-'
        };
      }

      // ดึง userId จาก localStorage เพื่อเชื่อมโยง order กับ user
      const userStr = localStorage.getItem('user');
      const localUser = userStr ? JSON.parse(userStr) : null;
      const customerId = localUser?.id ? String(localUser.id) : undefined;

      const orderPayload = {
        customerName: userData.name || 'ลูกค้าทั่วไป', // ✅ ดึงจาก userData (User table)
        address: deliveryAddress, // ✅ ส่งที่อยู่จัดส่งแบบเต็มที่โชว์ใน UI
        phone: userData.phone || '-', // ✅ ดึงจาก userData (User table)
        totalAmount: finalTotal,
        products: cartItems.map(item => ({
          productId: item.id, // ✅ เก็บ ID สินค้าไว้เผื่อเรียกดูภายหลัง
          name: item.name,
          quantity: item.quantity,
          price: item.isPromotion && item.promotionPrice ? item.promotionPrice : item.price,
          imageUrl: item.imageUrl // ✅ เก็บรูปสินค้าไว้ในประวัติออเดอร์
        })),
        paymentSlip: slipImageBase64,
        customerId, // ✅ เชื่อม order กับ user เพื่อให้ my-orders ดึงได้
      };

      // ✅ ตรวจสอบข้อมูลที่จำเป็นก่อนส่ง
      if (!orderPayload.customerName || orderPayload.customerName.trim() === '') {
        alert('กรุณาระบุชื่อลูกค้าให้ถูกต้อง');
        return;
      }

      if (!orderPayload.products || orderPayload.products.length === 0) {
        alert('ไม่พบสินค้าในคำสั่งซื้อ กรุณาลองใหม่');
        return;
      }

      if (!orderPayload.totalAmount || orderPayload.totalAmount <= 0) {
        alert('ราคาสินค้าไม่ถูกต้อง กรุณาลองใหม่');
        return;
      }

      // ใช้ api instance (มี JWT token) แทน axios ตรงๆ
      console.log('กำลังส่งออเดอร์:', orderPayload);
      const response = await api.post('/api/admin/orders', orderPayload);
      console.log('บันทึกออเดอร์สำเร็จ:', response.data);

      // ✅ Update sold counts for purchased products
      try {
        for (const item of cartItems) {
          const currentProductResponse = await api.get(`/product/${item.id}`);
          const currentProduct = currentProductResponse.data;
          const newSoldCount = (currentProduct.soldCount || 0) + item.quantity;

          await api.patch(`/product/${item.id}/stats`, {
            soldCount: newSoldCount
          });

          console.log(`Updated sold count for ${item.name}: ${newSoldCount}`);
        }
      } catch (soldCountError) {
        console.error('Error updating sold counts:', soldCountError);
        // Continue with order process even if sold count update fails
      }

      // ✅ ล้างตะกร้าสินค้าหลังจากสั่งซื้อสำเร็จ
      clearCart();

      setShowSuccessOverlay(true);

      setTimeout(() => {
        navigate('/profile');
      }, 1000);

    } catch (error: any) {
      console.error('เกิดข้อผิดพลาดในการสั่งซื้อ:', error);

      // แสดงข้อมูลข้อผิดพลาดเพิ่มเติมเพื่อการ debug
      if (error.response) {
        console.error('Response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        alert(`ข้อผิดพลาดจากเซิร์ฟเวอร์: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        console.error('Request error:', error.request);
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      } else {
        console.error('Other error:', error.message);
        alert(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center font-['Prompt'] relative">

      <div className="w-full max-w-4xl flex justify-start mb-4">
        <button
          onClick={() => navigate('/cart')}
          className="bg-white text-[#256D45] font-bold !py-2 !px-6 rounded-xl shadow-sm hover:bg-gray-50 border border-gray-200"
        >
          กลับไปตะกร้า
        </button>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-[#256D45] mb-8">
        ชำระเงิน
      </h1>

      <div className="w-full max-w-4xl flex flex-col gap-6">

        {/* === การ์ดที่ 1: สรุปคำสั่งซื้อ === */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row gap-8">

          <div className="flex-1 flex flex-col">
            <div className="flex flex-col gap-4 pr-2">
              <h3 className="text-xl font-bold text-[#256D45] border-b pb-2 mb-6">รายการสินค้า ({cartItems.length} รายการ)</h3>

              {cartItems.length === 0 ? (
                <p className="text-red-500">ไม่พบข้อมูลสินค้า กรุณากลับไปที่ตะกร้า</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl text-gray-400">📦</span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <h2 className="text-lg font-bold text-[#256D45] text-left">{item.name}</h2>
                      <div className="flex justify-between mt-1 items-end">
                        <p className="text-[#256D45] font-medium text-left">จำนวน: {item.quantity} ชิ้น</p>
                        <p className="text-[#256D45] font-bold text-right">
                          {(item.isPromotion && item.promotionPrice ? item.promotionPrice : item.price) * item.quantity} ฿
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-bold text-[#256D45] mb-2">สถานที่จัดส่ง</h3>
              <div className="relative">
                <div
                  className={`border-2 border-[#256D45]/30 rounded-2xl p-4 bg-[#F8FBF8] ${savedAddresses.length > 1 ? 'cursor-pointer hover:border-[#256D45]/60 transition-colors' : ''}`}
                  onClick={toggleAddressDropdown}
                >
                  <p className="text-[#256D45] whitespace-pre-line text-sm md:text-base leading-relaxed font-medium">
                    {deliveryAddress}
                  </p>
                  {savedAddresses.length > 1 && (
                    <div className="absolute top-2 right-2 text-[#256D45] text-xs font-medium">
                      {showAddressDropdown ? '▲' : '▼'} เลือกที่อยู่อื่น
                    </div>
                  )}
                </div>

                {/* 🌟 Dropdown สำหรับเลือกที่อยู่ */}
                {showAddressDropdown && savedAddresses.length > 1 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-[#256D45]/30 rounded-2xl shadow-lg z-50 max-h-60 overflow-y-auto">
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-3 cursor-pointer hover:bg-[#F8FBF8] border-b border-gray-100 last:border-b-0 ${selectedAddressId === address.id ? 'bg-[#F0F7F0] border-l-4 border-l-[#256D45]' : ''}`}
                        onClick={() => handleAddressSelect(address)}
                      >
                        <div className="text-sm text-[#256D45] font-medium">
                          <div className="font-bold">{userDataRef.current.name}</div>
                          <div className="text-xs mt-1">
                            เบอร์โทร: {userDataRef.current.phone}
                          </div>
                          <div className="text-xs mt-1">
                            เลขที่: {address.houseNumber || ''} {address.streetSoi ? `ถนน/ซอย: ${address.streetSoi}` : ''}
                          </div>
                          <div className="text-xs">
                            ตำบล: {address.subDistrict || ''} อำเภอ: {address.district || ''} จังหวัด: {address.province || ''} {address.postalCode ? `รหัสไปรษณีย์ ${address.postalCode}` : ''}
                          </div>
                          {address.isDefault && (
                            <div className="text-xs font-bold text-[#256D45] mt-1">✓ ที่อยู่หลัก</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:block w-0.5 bg-[#256D45]"></div>
          <div className="md:hidden h-0.5 w-full bg-[#256D45]"></div>

          <div className="flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-[#256D45] border-b pb-2 mb-6">สรุปยอด</h3>

            <div className="space-y-4 text-lg font-bold text-[#256D45] flex-1">
              <div className="flex justify-between">
                <span>ราคาสินค้ารวม</span>
                <span>{totalPrice} ฿</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง</span>
                <span>{shippingFee} ฿</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>ส่วนลด</span>
                  <span>-{discount} ฿</span>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8 text-xl md:text-2xl font-black text-[#256D45] pt-4 border-t-2 border-[#256D45] mt-auto">
              <span>ยอดชำระสุทธิ</span>
              <span className="text-2xl">฿ {finalTotal}</span>
            </div>
          </div>
        </div>

        {/* === การ์ดที่ 2: ช่องทางการชำระเงิน & อัปโหลดสลิป === */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 flex items-center gap-6 w-full">
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
            </div>
            <div className="text-[#256D45]">
              <h3 className="text-xl font-bold mb-1">Prompt pay</h3>
              <p className="text-2xl md:text-3xl font-black mb-2 tracking-wider">098-1911669</p>
              <p className="font-bold">ชื่อบัญชี :</p>
              <p className="font-bold">Teerayutkankasatshop</p>
              <p className="font-bold">ธีรยุทธการเกษตร</p>
            </div>
          </div>

          <div className="hidden md:block w-0.5 h-32 bg-[#256D45]"></div>
          <div className="md:hidden h-0.5 w-full bg-[#256D45]"></div>

          <div className="flex-1 flex flex-col items-center w-full">
            <h3 className="text-xl font-bold text-[#256D45] mb-4">อัปโหลดสลิป</h3>
            <label className="w-full max-w-xs h-24 border-2 border-[#256D45] rounded-2xl flex items-center justify-center cursor-pointer hover:bg-[#F0F7F0] transition-colors relative overflow-hidden">
              <input type="file" className="hidden" accept="image/*" onChange={handleUploadSlip} />

              {slipImage ? (
                <img src={slipImage} alt="Slip Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload size={32} className="text-[#256D45]" />
              )}
            </label>
            {slipImage ? (
              <p className="text-sm text-[#256D45] mt-2 font-medium text-center">
                อัปโหลดรูปสำเร็จ (กดที่รูปเพื่อเปลี่ยน)
              </p>
            ) : null}

            {/* PDPA Notice — แสดงเสมอ ไม่ว่าจะอัปโหลดแล้วหรือยัง */}
            <p className="text-[10px] text-gray-400 mt-3 text-center max-w-xs leading-relaxed px-2">
              🔒 ข้อมูลสลิปการโอนเงินจะถูกใช้เพื่อตรวจสอบยอดเงิน
              และยืนยันการสั่งซื้อเท่านั้น ตามนโยบายความเป็นส่วนตัว (PDPA)
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleConfirm}
            className="bg-[#256D45] border-2 border-[#256D45] text-white font-bold text-xl !px-5 !py-2 rounded-full hover:bg-white hover:text-[#256D45] transition-all shadow-md"
          >
            ยืนยันการสั่งซื้อ
          </button>
        </div>

      </div>

      {showSuccessOverlay && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100"></div>
          <div className="fixed inset-0 flex items-center justify-center z-110">
            <div className="bg-white rounded-3xl p-8 md:p-12 flex flex-col items-center shadow-2xl border border-gray-100 w-[90%] max-w-md">
              <CheckCircle size={80} className="text-[#256D45] mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-[#256D45] mb-3 text-center">ยืนยันคำสั่งซื้อสำเร็จแล้ว!</h2>
              <p className="text-gray-500 text-center font-medium">ระบบกำลังพาท่านกลับสู่หน้าโปรไฟล์...</p>
              <div className="mt-6 w-8 h-8 border-4 border-gray-200 border-t-[#256D45] rounded-full animate-spin"></div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default PaymentPage;
