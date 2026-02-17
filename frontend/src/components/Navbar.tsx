import { Link } from "react-router-dom";
import { UserCircle, ShoppingCart } from "lucide-react"; // แนะนำให้ใช้ lucide-react สำหรับ icon
import logo from "../assets/images/logo.png";

function Navbar() {
  return (
    <div className="sticky w-full h-20 top-0 z-50 bg-[#FFFEF2] flex items-center justify-between px-10 md:px-20 border-b border-gray-100">
      
      {/* ฝั่งซ้าย: Logo และ Menu */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-14 h-14 object-contain" />
          <span className="text-[#256D45] text-2xl font-bold">ธีรยุทธการเกษตร</span>
        </Link>

        {/* เส้นคั่นแนวตั้ง */}
        <div className="h-10 w-[2px] bg-[#256D45] mx-2"></div>

        {/* Navigation Links */}
        <nav className="flex gap-8 items-center">
          <Link to="/fertilizers" className="text-[#256D45] text-lg font-medium hover:opacity-80">ปุ๋ย</Link>
          <Link to="/tools" className="text-[#256D45] text-lg font-medium hover:opacity-80">อุปกรณ์</Link>
          <Link to="/seeds" className="text-[#256D45] text-lg font-medium hover:opacity-80">เมล็ด</Link>
          <Link to="/chemicals" className="text-[#256D45] text-lg font-medium hover:opacity-80">สารเคมี</Link>
          <Link to="/others" className="text-[#256D45] text-lg font-medium hover:opacity-80">อื่นๆ</Link>
        </nav>
      </div>

      {/* ฝั่งขวา: Login และ Cart */}
      <div className="flex items-center gap-6 text-[#256D45]">
        <Link to="/login" className="flex items-center gap-2 hover:opacity-80">
          <span className="text-lg font-medium">เข้าสู่ระบบ</span>
          <UserCircle size={32} strokeWidth={1.5} />
        </Link>
        
        <Link to="/cart" className="hover:opacity-80">
          <ShoppingCart size={32} strokeWidth={1.5} />
        </Link>
      </div>

    </div>
  );
}

export default Navbar;