import React from 'react';
import BackButton from '../components/BackButton';

const Success = () => {
  return (
    <div className="min-h-screen bg-[#DCEDC1] flex items-center justify-center font-['Prompt'] text-[#256D45]">
      <BackButton />
      <div className="bg-white rounded-xl shadow-lg p-10 text-center">
        <h1 className="text-4xl font-bold text-[#256D45] mb-4">สำเร็จ</h1>
        <p className="text-lg mb-6">คำสั่งซื้อที่สำเร็จจะแสดงที่นี่</p>
        {/* เพิ่มรายละเอียดหรือรายการคำสั่งซื้อที่สำเร็จได้ */}
      </div>
    </div>
  );
};

export default Success;
