import { useContext } from "react"; // 🌟 1. Import useContext
import { Link, useNavigate } from "react-router-dom";
import { UserCircle, ShoppingCart, LogOut } from "lucide-react"; // 🌟 เพิ่ม LogOut icon
import logo from "../assets/images/logo.png";
import { AuthContext } from "../context/AuthContext"; // 🌟 2. Import AuthContext

function Navbar() {
  // 🌟 3. ดึงข้อมูล user และ ฟังก์ชัน logout ออกมาจาก Context
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();

  // ฟังก์ชันสำหรับกดออกจากระบบ
  const handleLogout = () => {
    if (logout) {
      logout();
      navigate('/login'); // ออกจากระบบแล้วเด้งไปหน้า Login
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-[#FFFEF2] border-b border-gray-100 shadow-sm flex flex-col">

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
            {/* เส้นคั่นแนวตั้ง */}
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

      {/* แถวล่าง: Navigation Links (ซ่อนในจอใหญ่, แสดงและเลื่อนได้ในจอมือถือ/แท็บเล็ต) */}
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