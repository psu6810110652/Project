import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
// 🌟 Import ไอคอนทั้งของฝั่ง User และ Admin มารวมกัน
import { UserCircle, ShoppingCart, LogOut, Search, Bell, CircleUser } from "lucide-react"; 
import logo from "../assets/images/logo.png";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();

  // ฟังก์ชันสำหรับกดออกจากระบบ
  const handleLogout = () => {
    if (logout) {
      logout();
      navigate('/login');
    }
  };

  // 🌟 เช็คสิทธิ์ว่าเป็น Admin หรือไม่ (ปรับคำว่า 'admin' ให้ตรงกับ Database ของคุณได้เลยครับ)
  const isAdmin = user?.role === 'Admin';

  // ==========================================
  // 🔴 1. ถ้าเป็น ADMIN จะแสดงส่วนนี้
  // ==========================================
  if (isAdmin) {
    return (
      <div className="sticky top-0 z-50 w-full bg-[#FFFEF2] border-b border-gray-200 shadow-sm h-16 md:h-20 flex items-center px-4 md:px-8 lg:px-12 font-['Prompt']">
        <div className="flex w-full items-center justify-between">
          
          {/* ฝั่งซ้าย: Logo + ชื่อร้าน + เส้นคั่น */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <Link to="/admin" className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
              <span className="text-[#256D45] text-lg md:text-2xl font-extrabold whitespace-nowrap">
                ธีรยุทธการเกษตร
              </span>
            </Link>
            <div className="hidden md:block h-8 w-[2.5px] bg-[#256D45] ml-2 rounded-full"></div>
          </div>

          {/* ตรงกลาง: ช่องค้นหา */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative flex items-center w-full h-11 bg-white border-2 border-gray-100 rounded-full overflow-hidden shadow-sm hover:border-[#256D45]/30 transition-colors">
              <input 
                type="text" 
                placeholder="ค้นหา..." 
                className="w-full h-full pl-5 pr-12 outline-none text-gray-700 font-medium placeholder-gray-400"
              />
              <button className="absolute right-3 p-1">
                <Search className="text-[#256D45] w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* ฝั่งขวา: กระดิ่งแจ้งเตือน + ชื่อแอดมิน + รูปโปรไฟล์ */}
          <div className="flex items-center gap-4 md:gap-8 shrink-0">
            <button className="relative text-[#256D45] hover:opacity-80 transition-opacity">
              <Bell className="w-6 h-6 md:w-7 md:h-7 fill-[#256D45]" strokeWidth={1} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#FFFEF2] rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="hidden md:block text-[#256D45] text-base md:text-lg font-bold">
                {user?.name || "ชื่อแอดมิน"}
              </span>
              <CircleUser className="w-9 h-9 md:w-11 md:h-11 text-[#256D45] fill-[#256D45] text-white" strokeWidth={1} />
            </div>
          </div>
          
        </div>
      </div>
    );
  }

  // ==========================================
  // 🟢 2. ถ้าเป็นลูกค้าปกติ (USER) จะมาแสดงส่วนนี้แทน
  // ==========================================
  return (
    <div className="sticky top-0 z-50 w-full bg-[#FFFEF2] border-b border-gray-100 shadow-sm flex flex-col font-['Prompt']">
      {/* แถวบน: Logo และ ไอคอนผู้ใช้/ตะกร้า */}
      <div className="flex w-full items-center justify-between px-4 md:px-10 lg:px-20 h-16 md:h-20">
        
        {/* ฝั่งซ้าย: Logo (และเมนูแนวนอนสำหรับจอใหญ่) */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Logo" className="w-10 h-10 md:w-14 md:h-14 object-contain shrink-0" />
            <span className="text-[#256D45] text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap">ธีรยุทธการเกษตร</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center">
            <div className="h-10 w-[2px] bg-[#256D45] mx-6"></div>
            <nav className="flex gap-6 xl:gap-8 items-center">
              <Link to="/fertilizers" className="text-[#256D45] text-lg font-medium hover:opacity-80 whitespace-nowrap">ปุ๋ย</Link>
              <Link to="/tools" className="text-[#256D45] text-lg font-medium hover:opacity-80 whitespace-nowrap">อุปกรณ์</Link>
              <Link to="/seeds" className="text-[#256D45] text-lg font-medium hover:opacity-80 whitespace-nowrap">เมล็ด</Link>
              <Link to="/chemicals" className="text-[#256D45] text-lg font-medium hover:opacity-80 whitespace-nowrap">สารเคมี</Link>
              <Link to="/others" className="text-[#256D45] text-lg font-medium hover:opacity-80 whitespace-nowrap">อื่นๆ</Link>
            </nav>
          </div>
        </div>

        {/* ฝั่งขวา: Login และ Cart */}
        <div className="flex items-center gap-4 md:gap-6 text-[#256D45] shrink-0">
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              {user.role === 'Admin' && (
                <Link to="/admin" className="text-sm md:text-lg font-bold text-blue-600 hover:opacity-80 bg-blue-100 px-3 py-1 rounded-md">
                  หลังบ้าน
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-1 md:gap-2 hover:opacity-80">
                <span className="hidden md:inline text-lg font-bold">{user.name}</span>
                <UserCircle size={28} className="md:w-8 md:h-8" strokeWidth={1.5} />
              </Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors flex items-center" title="ออกจากระบบ">
                <LogOut size={24} className="md:w-7 md:h-7" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1 md:gap-2 hover:opacity-80">
              <span className="hidden md:inline text-lg font-medium">เข้าสู่ระบบ</span>
              <UserCircle size={28} className="md:w-8 md:h-8" strokeWidth={1.5} />
            </Link>
          )}

          <Link to="/cart" className="hover:opacity-80 flex items-center">
            <ShoppingCart size={28} className="md:w-8 md:h-8" strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* แถวล่าง: Navigation Links (สำหรับมือถือ) */}
      <div className="lg:hidden w-full px-4 pb-3">
        <nav className="flex overflow-x-auto gap-6 items-center w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Link to="/fertilizers" className="text-[#256D45] text-base font-medium hover:opacity-80 whitespace-nowrap shrink-0">ปุ๋ย</Link>
          <Link to="/tools" className="text-[#256D45] text-base font-medium hover:opacity-80 whitespace-nowrap shrink-0">อุปกรณ์</Link>
          <Link to="/seeds" className="text-[#256D45] text-base font-medium hover:opacity-80 whitespace-nowrap shrink-0">เมล็ด</Link>
          <Link to="/chemicals" className="text-[#256D45] text-base font-medium hover:opacity-80 whitespace-nowrap shrink-0">สารเคมี</Link>
          <Link to="/others" className="text-[#256D45] text-base font-medium hover:opacity-80 whitespace-nowrap shrink-0">อื่นๆ</Link>
        </nav>
      </div>

    </div>
  );
}

export default Navbar;