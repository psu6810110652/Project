import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#DCEDC1] font-['Prompt'] text-[#256D45] pb-0">
      <div className="max-w-7xl mx-auto px-8 pt-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-16">
          <div className="flex-1">
            <div className="text-5xl font-bold mb-4 flex flex-wrap items-baseline gap-3">
              ชื่อผู้ใช้ <span className="text-3xl font-normal text-[#256D45]">#ไอดีผู้ใช้</span>
            </div>
            <div className="text-xl font-medium w-fit pb-2">อีเมล</div>
          </div>
          <div className="flex flex-row gap-4 items-center shrink-0">
            <button className="bg-white border border-[#256D45] text-[#256D45] font-semibold rounded-lg !px-8 !py-2 shadow-sm hover:bg-[#f3fbe9] transition text-2xl" onClick={() => navigate('/favorites')}>รายการโปรด</button>
            <button className="bg-white border border-[#256D45] text-[#256D45] font-semibold rounded-lg !px-8 !py-2 shadow-sm hover:bg-[#f3fbe9] transition text-2xl" onClick={() => navigate('/edit-profile')}>แก้ไข</button>
            <button className="bg-white border border-red-500 text-red-600 font-semibold rounded-lg !px-8 !py-2 shadow-sm hover:bg-red-50 transition text-2xl" onClick={() => navigate('/')}>ออกจากระบบ</button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="flex flex-col items-center gap-12 mb-24">
          {/* Top row - 3 cards */}
          <div className="flex gap-12 justify-center">
            <button className="w-44 h-44 rounded-xl border-2 border-[#256D45] bg-white flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-5xl font-bold text-[#256D45]">7</div>
              <div className="text-lg font-medium mt-3 text-[#256D45]">รอยืนยัน</div>
            </button>
            <button className="w-44 h-44 rounded-xl border-2 border-[#256D45] bg-white flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-5xl font-bold text-[#256D45]">7</div>
              <div className="text-lg font-medium mt-3 text-[#256D45]">รอจัดส่ง</div>
            </button>
            <button className="w-44 h-44 rounded-xl border-2 border-[#256D45] bg-white flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-5xl font-bold text-[#256D45]">7</div>
              <div className="text-lg font-medium mt-3 text-[#256D45]">รอได้รับ</div>
            </button>
          </div>
          
          {/* Bottom row - 2 cards */}
          <div className="flex gap-12 justify-center">
            <button className="w-44 h-44 rounded-xl border-2 border-red-400 bg-white flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-5xl font-bold text-red-600">7</div>
              <div className="text-lg font-medium mt-3 text-red-600">ไม่สำเร็จ</div>
            </button>
            <button className="w-44 h-44 rounded-xl border-2 border-[#256D45] bg-white flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-5xl font-bold text-[#256D45]">7</div>
              <div className="text-lg font-medium mt-3 text-[#256D45]">สำเร็จ</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
