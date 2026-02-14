import React from 'react';

const Failed = () => {
  return (
    <div className="min-h-screen bg-[#DCEDC1] flex items-center justify-center font-['Prompt'] text-[#256D45]">
      <div className="bg-white rounded-xl shadow-lg p-10 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">ไม่สำเร็จ</h1>
        <p className="text-lg mb-6">คำสั่งซื้อที่ไม่สำเร็จจะแสดงที่นี่</p>
        {/* เพิ่มรายละเอียดหรือรายการคำสั่งซื้อที่ไม่สำเร็จได้ */}
      </div>
    </div>
  );
};

export default Failed;
