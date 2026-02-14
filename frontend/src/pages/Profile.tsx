import React from 'react';
import { useNavigate } from 'react-router-dom';

const statusList = [
  { label: 'รอยืนยัน', value: 7, color: 'text-[#256D45] border-[#256D45] bg-white', link: '/pending-confirm' },
  { label: 'รอจัดส่ง', value: 7, color: 'text-[#256D45] border-[#256D45] bg-white', link: '/pending-delivery' },
  { label: 'รอได้รับ', value: 7, color: 'text-[#256D45] border-[#256D45] bg-white', link: '/pending-received' },
  { label: 'ไม่สำเร็จ', value: 7, color: 'text-red-600 border-red-400 bg-white', link: '/failed' },
  { label: 'สำเร็จ', value: 7, color: 'text-[#256D45] border-[#256D45] bg-white', link: '/success' },
];

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#DCEDC1] font-['Prompt'] text-[#256D45] pb-0">
      <div className="max-w-5xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="text-4xl font-bold mb-2 flex flex-wrap items-center gap-2">
              ชื่อผู้ใช้ <span className="text-2xl font-normal text-[#256D45]">#ไอดีผู้ใช้</span>
            </div>
            <div className="text-lg font-medium border-b-2 border-[#256D45] w-fit pb-1">อีเมล</div>
          </div>
          <div className="flex flex-row gap-3 items-center self-start md:self-auto mt-2 md:mt-0">
            <button className="bg-white border border-[#256D45] text-[#256D45] font-semibold rounded-lg px-6 py-2 shadow-sm hover:bg-[#f3fbe9] transition text-lg" onClick={() => navigate('/favorites')}>รายการโปรด</button>
            <button className="bg-white border border-[#256D45] text-[#256D45] font-semibold rounded-lg px-6 py-2 shadow-sm hover:bg-[#f3fbe9] transition text-lg">แก้ไข</button>
            <button className="bg-white border border-red-500 text-red-600 font-semibold rounded-lg px-6 py-2 shadow-sm hover:bg-red-50 transition text-lg" onClick={() => navigate('/')}>ออกจากระบบ</button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="flex flex-wrap gap-x-8 gap-y-8 justify-center mb-16">
          {statusList.map((s, i) => (
            s.link ? (
              <button
                key={s.label}
                className={`w-48 h-48 flex flex-col items-center justify-center rounded-xl border-2 shadow-md text-2xl font-bold ${s.color} ${s.label === 'ไม่สำเร็จ' ? 'order-last md:order-none' : ''} cursor-pointer focus:outline-none`}
                style={{ minWidth: '180px', minHeight: '180px' }}
                onClick={() => navigate(s.link)}
              >
                <span className={s.label === 'ไม่สำเร็จ' ? 'text-red-600' : ''}>{s.label}</span>
                <span className={`mt-2 text-4xl ${s.label === 'ไม่สำเร็จ' ? 'text-red-600' : ''}`}>{s.value}</span>
              </button>
            ) : (
              <div
                key={s.label}
                className={`w-48 h-48 flex flex-col items-center justify-center rounded-xl border-2 shadow-md text-2xl font-bold ${s.color} ${s.label === 'ไม่สำเร็จ' ? 'order-last md:order-none' : ''}`}
                style={{ minWidth: '180px', minHeight: '180px' }}
              >
                <span className={s.label === 'ไม่สำเร็จ' ? 'text-red-600' : ''}>{s.label}</span>
                <span className={`mt-2 text-4xl ${s.label === 'ไม่สำเร็จ' ? 'text-red-600' : ''}`}>{s.value}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
