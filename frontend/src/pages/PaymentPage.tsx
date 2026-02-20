import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [slipImage, setSlipImage] = useState<string | null>(null);

  // จำลองข้อมูล (ของจริงอาจจะดึงมาจาก Context, Redux หรือ API)
  const orderData = {
    productName: 'ชื่อสินค้า',
    quantity: 1000,
    price: 100,
    shippingFee: 10000,
    discount: 1000,
    total: 9100,
    address: 'ชื่อ-นามสกุล เบอร์โทร\nบ้านเลขที่/ชื่อหอพักและเลขห้องพัก ซอย ถนน ตำบล จังหวัด\nรหัสไปรษณีย์',
    qrCodeUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg' // เปลี่ยนเป็นรูป QR Code จริงของคุณ
  };

  const handleUploadSlip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSlipImage(imageUrl);
    }
  };

  const handleConfirm = () => {
    if (!slipImage) {
      alert("กรุณาอัปโหลดสลิปโอนเงินก่อนยืนยันครับ");
      return;
    }
    // ส่งข้อมูลไป API สร้างออเดอร์
    alert("ยืนยันการสั่งซื้อเรียบร้อย!");
    navigate('/success'); // เปลี่ยนไปหน้าขอบคุณหรือหน้าออเดอร์
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      {/* หัวข้อหน้า */}
      <h1 className="text-4xl md:text-5xl font-bold text-[#256D45] mb-8 mt-4">
        ชำระเงิน
      </h1>

      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* === การ์ดที่ 1: สรุปคำสั่งซื้อ === */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row gap-8">
          {/* ซ้าย: ข้อมูลสินค้าและที่อยู่ */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex gap-4">
              {/* รูปสินค้า */}
              <div className="w-24 h-24 bg-gray-100 rounded-xl border border-gray-200 flex-shrink-0 overflow-hidden">
                 <img src="https://via.placeholder.com/100" alt="Product" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#256D45]">{orderData.productName}</h2>
                <p className="text-[#256D45] font-semibold mt-1">จำนวน <span className="ml-4">{orderData.quantity} ชิ้น</span></p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#256D45] mb-2">สถานที่จัดส่ง</h3>
              <div className="border-2 border-[#256D45]/30 rounded-2xl p-4 bg-[#F8FBF8]">
                <p className="text-[#256D45] whitespace-pre-line text-sm md:text-base leading-relaxed font-medium">
                  {orderData.address}
                </p>
              </div>
            </div>
          </div>

          {/* เส้นคั่นกลาง (แสดงเฉพาะจอใหญ่) */}
          <div className="hidden md:block w-[2px] bg-[#256D45]"></div>
          {/* เส้นคั่นแนวนอน (แสดงเฉพาะจอมือถือ) */}
          <div className="md:hidden h-[2px] w-full bg-[#256D45]"></div>

          {/* ขวา: สรุปยอดเงิน */}
          <div className="flex-1 flex flex-col justify-between py-2">
            <div className="space-y-4 text-lg font-bold text-[#256D45]">
              <div className="flex justify-between">
                <span>ราคาสินค้า</span>
                <span>{orderData.price} ฿</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง</span>
                <span>{orderData.shippingFee} ฿</span>
              </div>
              <div className="flex justify-between">
                <span>ส่วนลด</span>
                <span>{orderData.discount} ฿</span>
              </div>
            </div>
            
            <div className="flex justify-between mt-8 text-xl md:text-2xl font-black text-[#256D45] pt-4 border-t-2 border-transparent">
              <span>รวมยอดสั่งซื้อทั้งหมด</span>
              <span>{orderData.total} ฿</span>
            </div>
          </div>
        </div>

        {/* === การ์ดที่ 2: ช่องทางการชำระเงิน & อัปโหลดสลิป === */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row gap-8 items-center">
          {/* ซ้าย: QR Code */}
          <div className="flex-1 flex items-center gap-6 w-full">
            <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
              <img src={orderData.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
            </div>
            <div className="text-[#256D45]">
              <h3 className="text-xl font-bold mb-1">Prompt pay</h3>
              <p className="text-2xl md:text-3xl font-black mb-2 tracking-wider">09X-XXXXXXX</p>
              <p className="font-bold">ชื่อบัญชี :</p>
              <p className="font-bold">Teerayutkankasatshop</p>
              <p className="font-bold">ธีรยุทธการเกษตร</p>
            </div>
          </div>

          {/* เส้นคั่น */}
          <div className="hidden md:block w-[2px] h-32 bg-[#256D45]"></div>
          <div className="md:hidden h-[2px] w-full bg-[#256D45]"></div>

          {/* ขวา: อัปโหลดสลิป */}
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

        {/* ปุ่มยืนยัน */}
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleConfirm}
            className="bg-white border-2 border-[#256D45] text-[#256D45] font-bold text-xl px-12 py-3 rounded-full hover:bg-[#256D45] hover:text-white transition-all shadow-md"
          >
            ยืนยัน
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;