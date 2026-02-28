import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, CheckCircle } from 'lucide-react'; 
import axios from 'axios';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isPromotion?: boolean;
  promotionPrice?: number;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🌟 State เดิมสำหรับโชว์รูปบนหน้าเว็บ
  const [slipImage, setSlipImage] = useState<string | null>(null);
  
  // 🌟 State ใหม่! สำหรับเก็บรูปภาพที่แปลงเป็นข้อความ (Base64) เพื่อส่งไป Backend
  const [slipImageBase64, setSlipImageBase64] = useState<string | null>(null);

  const [deliveryAddress, setDeliveryAddress] = useState<string>('กำลังโหลดข้อมูลที่อยู่...');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const cartItems: CartItem[] = location.state?.cartItems || [];
  const totalPrice: number = location.state?.totalPrice || 0;

  const shippingFee = 0; 
  const discount = 0;
  const finalTotal = totalPrice + shippingFee - discount;
  const qrCodeUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';

  useEffect(() => {
    const savedAddress = localStorage.getItem('shippingAddress');
    
    if (savedAddress) {
      const addr = JSON.parse(savedAddress);
      const fullAddress = `${addr.nameSurname || 'ไม่ระบุชื่อ'} เบอร์โทร: ${addr.phone || '-'}\nเลขที่: ${addr.houseNumber || ''} ถนน/ซอย: ${addr.streetSoi || ''}\nตำบล: ${addr.subDistrict || ''} อำเภอ: ${addr.district || ''}\nจังหวัด: ${addr.province || ''} รหัสไปรษณีย์ ${addr.postalCode || ''}`;
      setDeliveryAddress(fullAddress);
    } else {
      setDeliveryAddress('ไม่พบข้อมูลการจัดส่ง กรุณากลับไปเพิ่มที่อยู่ในหน้าโปรไฟล์');
    }
  }, []);

  // 🌟 แก้ไขฟังก์ชันตอนอัปโหลดรูป ให้มีการแปลงเป็น Base64 ด้วย
  const handleUploadSlip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. สร้าง URL ชั่วคราวไว้โชว์บนหน้าเว็บ (UI)
      const imageUrl = URL.createObjectURL(file);
      setSlipImage(imageUrl);

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
      const savedAddress = localStorage.getItem('shippingAddress');
      const addr = savedAddress ? JSON.parse(savedAddress) : { nameSurname: 'ลูกค้าทั่วไป' };

      // 🌟 นำตัวแปร slipImageBase64 ใส่เข้าไปใน Payload
      const orderPayload = {
        customerName: addr.nameSurname,
        totalAmount: finalTotal,
        products: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.isPromotion && item.promotionPrice ? item.promotionPrice : item.price
        })),
        paymentSlip: slipImageBase64 // <-- ส่งรูปสลิปไปแล้วตรงนี้!
      };

      const response = await axios.post('http://localhost:3000/api/admin/orders', orderPayload);
      console.log('บันทึกออเดอร์สำเร็จ:', response.data);

      setShowSuccessOverlay(true);

      setTimeout(() => {
        navigate('/profile');
      }, 1000); 

    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการสั่งซื้อ:', error);
      alert('ขออภัยครับ ไม่สามารถบันทึกคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center font-['Prompt'] relative">
      
      <div className="w-full max-w-4xl flex justify-start mb-4">
        <button
          onClick={() => navigate('/cart')}
          className="bg-white text-[#256D45] font-bold py-2! px-6! rounded-xl shadow-sm hover:bg-gray-50 border border-gray-200"
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
          
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-4 max-h-75 overflow-y-auto pr-2 no-scrollbar">
              <h3 className="text-xl font-bold text-[#256D45] border-b pb-2">รายการสินค้า ({cartItems.length} รายการ)</h3>
              
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
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-[#256D45]">{item.name}</h2>
                      <div className="flex justify-between mt-1">
                        <p className="text-[#256D45] font-medium">จำนวน: {item.quantity} ชิ้น</p>
                        <p className="text-[#256D45] font-bold">
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
              <div className="border-2 border-[#256D45]/30 rounded-2xl p-4 bg-[#F8FBF8]">
                <p className="text-[#256D45] whitespace-pre-line text-sm md:text-base leading-relaxed font-medium">
                  {deliveryAddress}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:block w-0.5 bg-[#256D45]"></div>
          <div className="md:hidden h-0.5 w-full bg-[#256D45]"></div>

          <div className="flex-1 flex flex-col justify-between py-2">
            <h3 className="text-xl font-bold text-[#256D45] border-b pb-2 mb-4">สรุปยอด</h3>
            
            <div className="space-y-4 text-lg font-bold text-[#256D45]">
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
            
            <div className="flex justify-between mt-8 text-xl md:text-2xl font-black text-[#256D45] pt-4 border-t-2 border-[#256D45]">
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
            {slipImage && (
              <p className="text-sm text-[#256D45] mt-2 font-medium">อัปโหลดรูปสำเร็จ (กดที่รูปเพื่อเปลี่ยน)</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button 
            onClick={handleConfirm}
            className="bg-[#256D45] border-2 border-[#256D45] text-white font-bold text-xl px-5! py-2! rounded-full hover:bg-white hover:text-[#256D45] transition-all shadow-md"
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