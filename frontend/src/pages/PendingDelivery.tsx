import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
const PendingDelivery = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#DCEDC1] font-['Prompt'] text-[#256D45] flex flex-col items-center justify-center">
      <BackButton />
      <h1 className="text-4xl font-bold mb-6">รายการรอจัดส่ง</h1>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
        <p className="text-lg text-[#256D45]">แสดงรายการที่ต้องรอจัดส่ง...</p>
      </div>
    </div>
  );
};

export default PendingDelivery;
