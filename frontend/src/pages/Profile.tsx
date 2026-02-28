import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Edit, User } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    displayUsername: 'กำลังโหลด...', // สำหรับแสดงใต้รูปโปรไฟล์
    name: 'กำลังโหลด...',           // สำหรับแสดงในข้อมูล (ชื่อ-สกุล จริง)
    phone: '-',
    email: '-',
    address: '-'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const userStr = localStorage.getItem('user');
      const addressStr = localStorage.getItem('shippingAddress');
      
      let currentEmail = '-';
      let currentUsername = 'ผู้ใช้งาน';
      let currentName = 'ไม่ได้ระบุชื่อ';
      let currentPhone = '-';
      let currentAddress = 'ยังไม่ได้ระบุที่อยู่จัดส่ง';

      // 1. จัดการที่อยู่ก่อน (เหมือนเดิม)
      if (addressStr) {
        const addr = JSON.parse(addressStr);
        if (addr.nameSurname) currentName = addr.nameSurname;
        if (addr.phone) currentPhone = addr.phone;
        
        const parts = [
          addr.houseNumber ? `เลขที่: ${addr.houseNumber}` : '',
          addr.streetSoi ? `ถนน/ซอย: ${addr.streetSoi}` : '',
          addr.subDistrict ? `ตำบล: ${addr.subDistrict}` : '',
          addr.district ? `อำเภอ: ${addr.district}` : '',
          addr.province ? `จังหวัด: ${addr.province}` : '',
          addr.postalCode ? `รหัสไปรษณีย์: ${addr.postalCode}` : ''
        ].filter(Boolean);
        
        if (parts.length > 0) {
          currentAddress = parts.join(' ');
        }
      }

      // 2. ดึงข้อมูล User เบื้องต้น และยิง API ไปขอข้อมูลเต็ม
      if (userStr) {
        const localUser = JSON.parse(userStr);
        
        // เซ็ตชื่อจาก localStorage แก้ขัดไปก่อนเผื่อ API โหลดช้า
        currentUsername = localUser.name || 'ผู้ใช้งาน'; 

        try {
          // 🌟 ยิง API ไปดึงข้อมูลเต็ม (อ้างอิงจาก Postman ของคุณ)
          const response = await fetch(`http://localhost:3000/users/${localUser.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localUser.token}` // ใส่ Token เพื่อขออนุญาต
            }
          });

          if (response.ok) {
            const apiData = await response.json();
            console.log("3. ข้อมูลแบบเต็มจาก API:", apiData);
            
            // นำข้อมูลจาก API มาอัปเดตทับ
            currentEmail = apiData.email || currentEmail;
            currentUsername = apiData.username || localUser.name;
            
            // ถ้าใน API มีชื่อ-นามสกุล หรือเบอร์โทรด้วย จะให้มันเอาจาก API ก็ได้
            if (apiData.nameSurname) currentName = apiData.nameSurname;
            if (apiData.phone) currentPhone = apiData.phone;
          } else {
            console.error("ดึงข้อมูลจาก API ไม่สำเร็จ (อาจจะ Token หมดอายุ)");
          }
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ API:", error);
        }
      }

      // 3. อัปเดต State ทีเดียว
      setUserData({
        displayUsername: currentUsername,
        name: currentName,
        phone: currentPhone,
        email: currentEmail,
        address: currentAddress
      });
    };

    fetchUserData();
  }, []);

  return (
    <div className="bg-[#DCEDC1] font-['Prompt'] text-[#256D45] !px-6 !py-15 md:px-6 md:py-10">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* 🌟 ย้ายหัวข้อมาตรงกลางด้านบนสุด */}
        <h1 className="text-4xl font-bold text-[#256D45] text-center mb-10 mt-4">โปรไฟล์ลูกค้า</h1>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* === คอลัมน์ซ้าย: รูปโปรไฟล์และเมนู === */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-100">
              {/* รูปโปรไฟล์ */}
              <div className="p-8 flex flex-col items-center border-b border-gray-100">
                <div className="w-32 h-32 bg-gray-100 rounded-full mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                  <User size={64} className="text-gray-400" />
                </div>
                {/* 🌟 แสดง Username ใต้รูป */}
                <h2 className="text-xl font-bold text-[#256D45] text-center">{userData.displayUsername}</h2>
              </div>
              
              {/* เมนูด้านซ้าย */}
              <div className="flex flex-col">
                <button 
                  onClick={() => navigate('/favorites')}
                  className="flex items-center justify-center gap-2 !py-4 bg-[#256D45] text-white font-medium hover:bg-[#1a5434] transition-colors"
                >
                  <Heart size={20} /> รายการโปรด
                </button>
                <button 
                  onClick={() => navigate('/edit-profile')}
                  className="flex items-center justify-center gap-2 !py-4 bg-white text-[#256D45] font-medium hover:bg-gray-50 transition-colors border-b border-gray-200"
                >
                  <Edit size={20} /> แก้ไขข้อมูล
                </button>
              </div>
            </div>
          </div>

          {/* === คอลัมน์ขวา: ข้อมูลและสถานะ === */}
          <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col gap-6">

            {/* การ์ดข้อมูลส่วนตัว */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex flex-col gap-5 text-left">
                <div className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] border-b border-gray-100 pb-4">
                  <span className="font-bold text-gray-500">ชื่อ:</span>
                  <span className="font-medium text-gray-800">{userData.name}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] border-b border-gray-100 pb-4">
                  <span className="font-bold text-gray-500">เบอร์:</span>
                  <span className="font-medium text-gray-800">{userData.phone}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] border-b border-gray-100 pb-4">
                  <span className="font-bold text-gray-500">อีเมล:</span>
                  <span className="font-medium text-gray-800">{userData.email}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr]">
                  <span className="font-bold text-gray-500">ที่อยู่:</span>
                  <span className="font-medium text-gray-800 leading-relaxed">{userData.address}</span>
                </div>
              </div>
            </div>

            {/* การ์ดสถานะคำสั่งซื้อ */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-[#256D45] mb-6 text-left">สถานะคำสั่งซื้อของฉัน</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                
                {/* 1. รอยืนยัน -> ไปที่หน้า PendingPage */}
                <div 
                  onClick={() => navigate('/pending/confirm')}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center hover:border-[#256D45] hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  <span className="text-4xl font-bold text-[#256D45] mb-2">7</span>
                  <span className="text-sm font-medium text-gray-600">รอยืนยัน</span>
                </div>

                {/* 2. รอจัดส่ง -> ไปที่หน้า PendingPage */}
                <div 
                  onClick={() => navigate('/pending/delivery')}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center hover:border-[#256D45] hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  <span className="text-4xl font-bold text-[#256D45] mb-2">3</span>
                  <span className="text-sm font-medium text-gray-600">รอจัดส่ง</span>
                </div>

                {/* 3. รอได้รับ -> ไปที่หน้า PendingPage */}
                <div 
                  onClick={() => navigate('/pending/received')}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center hover:border-[#256D45] hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  <span className="text-4xl font-bold text-[#256D45] mb-2">5</span>
                  <span className="text-sm font-medium text-gray-600">รอได้รับ</span>
                </div>

                {/* 4. สำเร็จ -> ไปที่หน้า PendingPage */}
                <div 
                  onClick={() => navigate('/pending/completed')}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center hover:border-[#256D45] hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  <span className="text-4xl font-bold text-[#256D45] mb-2">12</span>
                  <span className="text-sm font-medium text-gray-600">สำเร็จ</span>
                </div>

                {/* 5. ไม่สำเร็จ -> ไปที่หน้า PendingPage */}
                <div 
                  onClick={() => navigate('/pending/failed')}
                  className="border border-red-200 rounded-xl p-4 flex flex-col items-center justify-center hover:border-red-500 hover:shadow-md transition-all cursor-pointer bg-red-50"
                >
                  <span className="text-4xl font-bold text-red-500 mb-2">1</span>
                  <span className="text-sm font-medium text-red-500">ไม่สำเร็จ</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;