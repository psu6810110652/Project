import { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// 🌟 Import ไอคอนทั้งของฝั่ง User และ Admin มารวมกัน
import { UserCircle, ShoppingCart, LogOut, Search, Bell } from "lucide-react";
import logo from "../assets/images/logo.png";
import { AuthContext } from "../context/AuthContext";
import { AdminSearchContext } from "../context/AdminSearchContext";
import api from "../services/api";

function Navbar() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();

  const { searchTerm, setSearchTerm } = useContext(AdminSearchContext);

  // ฟังก์ชันสำหรับกดออกจากระบบ
  const handleLogout = () => {
    if (logout) {
      logout();
      navigate('/login');
    }
  };

  // 🌟 เช็คสิทธิ์ว่าเป็น Admin หรือไม่ และอยู่ในหน้า Admin หรือไม่
  const isAdmin = user?.role === 'Admin';
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  // ==========================================
  // ระบบแจ้งเตือน (เช็คสต็อกต่ำ & ออเดอร์รอจัดส่ง)
  // ==========================================
  const [hasNotification, setHasNotification] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // ข้อมูลสำหรับ Global Search
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifRef]);

  useEffect(() => {
    if (isAdmin && isAdminPage) {
      const checkNotifications = async () => {
        try {
          // 1. เช็คสินค้าที่มีสต็อกใกล้หมด (<= 5)
          const productsRes = await api.get('/product');
          setAllProducts(productsRes.data || []);
          const hasLowStock = productsRes.data.some((p: any) => {
            const currentStock = typeof p.stock === 'number' ? p.stock : (p.stockQuantity ?? 0);
            return currentStock <= 5;
          });

          // 2. เช็คคำสั่งซื้อใหม่ / รอจัดส่ง
          const ordersRes = await api.get('/admin/orders/all-pending');
          setAllOrders(ordersRes.data || []);
          const hasPendingOrders = ordersRes.data.some((o: any) =>
            o.status === 'pending_confirm' || o.status === 'pending_delivery' || !o.status
          );

          const newNotifs = [];
          if (hasLowStock) newNotifs.push('มีสินค้าสต็อกใกล้หมด (น้อยกว่า 5 ชิ้น)');
          if (hasPendingOrders) newNotifs.push('มีคำสั่งซื้อใหม่ / รอจัดส่ง');

          setNotifications(newNotifs);
          setHasNotification(newNotifs.length > 0);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };

      checkNotifications();
    }
  }, [isAdmin, isAdminPage]);

  // เตรียมข้อมูล Suggestions สำหรับ Global Search
  let suggestions: { id: string; label: string; subLabel?: string; type: string; path: string }[] = [];
  if (isAdmin && isAdminPage && searchTerm && searchTerm.length >= 1) {
    const term = searchTerm.toLowerCase();

    // ค้นหาสินค้า
    const matchedProducts = allProducts.filter(p =>
      p.id?.toLowerCase().includes(term) || p.name?.toLowerCase().includes(term)
    ).slice(0, 4).map(p => ({
      id: `p-${p.id}`,
      label: p.name,
      subLabel: `รหัส: ${p.id}`,
      type: 'สินค้า',
      path: p.category ? `/admin/products/${p.category.id}/${p.id}` : `/admin/products`
    }));

    // ค้นหาคำสั่งซื้อ
    const matchedOrders = allOrders.filter(o =>
      o.id?.toLowerCase().includes(term) ||
      o.orderNumber?.toLowerCase().includes(term) ||
      o.customerName?.toLowerCase().includes(term)
    ).slice(0, 4).map(o => ({
      id: `o-${o.id}`,
      label: `ออเดอร์ #${o.orderNumber || o.id.toString().substring(0, 8)}`,
      subLabel: `ลูกค้า: ${o.customerName || 'ไม่ระบุ'}`,
      type: 'คำสั่งซื้อ',
      path: '/admin/orders'
    }));

    suggestions = [...matchedProducts, ...matchedOrders];
  }

  // ==========================================
  // 🔴 1. ถ้าเป็น ADMIN และอยู่ในหน้า Admin จะแสดงส่วนนี้
  // ==========================================
  if (isAdmin && isAdminPage) {
    return (
      <div className="sticky top-0 z-50 w-full bg-[#FFFEF2] border-b border-gray-200 shadow-sm h-16 md:h-20 flex items-center px-4 md:px-10 lg:px-20 font-['Prompt']">
        <div className="flex w-full items-center justify-between">

          {/* ฝั่งซ้าย: Logo + ชื่อร้าน + เส้นคั่น */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <Link to="/" className="flex items-center gap-2" title="ไปหน้าแรกของร้านค้า">
              <img src={logo} alt="Logo" className="w-10 h-10 md:w-14 md:h-14 object-contain shrink-0" />
              <span className="text-[#256D45] text-lg md:text-2xl font-extrabold whitespace-nowrap">
                ธีรยุทธการเกษตร
              </span>
            </Link>
            <div className="hidden md:block h-8 w-[2.5px] bg-[#256D45] ml-2 rounded-full"></div>
          </div>

          {/* ตรงกลาง: ช่องค้นหา พร้อม Dropdown */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative z-50">
            <div className={`relative flex items-center w-full h-11 bg-white border-2 overflow-hidden shadow-sm transition-colors ${isSearchFocused ? 'border-[#256D45] rounded-t-xl rounded-b-none' : 'border-gray-100 rounded-full hover:border-[#256D45]/30'}`}>
              <input
                type="text"
                placeholder="ค้นหาข้อมูล สินค้า, คำสั่งซื้อ, หรือรหัสลูกค้า..."
                className="w-full h-full pl-5 pr-12 outline-none text-gray-700 font-medium placeholder-gray-400 bg-transparent"
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setIsNotifOpen(false);
                }}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay for click
              />
              <button className="absolute right-3 p-1">
                <Search className="text-[#256D45] w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>

            {/* Global Search Dropdown */}
            {isSearchFocused && searchTerm && (
              <div className="absolute top-11 left-0 w-full bg-white border border-t-0 border-[#256D45] rounded-b-xl shadow-lg" style={{ zIndex: 60 }}>
                <div className="max-h-80 overflow-y-auto">
                  {suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer"
                        onClick={() => {
                          if (item.path) navigate(item.path);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="text-[#256D45] font-bold text-sm">{item.label}</span>
                          {item.subLabel && <span className="text-gray-500 text-xs mt-0.5">{item.subLabel}</span>}
                        </div>
                        <span className="bg-[#E8F3EE] text-[#256D45] text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-[#256D45]/20">
                          {item.type}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm font-medium">
                      ไม่พบข้อมูลที่ค้นหา
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ฝั่งขวา: กระดิ่งแจ้งเตือน + ชื่อแอดมิน + รูปโปรไฟล์ + ปุ่มออก */}
          <div className="flex items-center gap-4 md:gap-6 shrink-0 relative">
            <div className="relative" ref={notifRef}>
              <button
                className="relative text-[#256D45] hover:opacity-80 transition-opacity mr-2 flex items-center justify-center p-1"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell className="w-6 h-6 md:w-7 md:h-7 fill-[#256D45]" strokeWidth={1} />
                {hasNotification && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#FFFEF2] rounded-full"></span>
                )}
              </button>

              {/* Dropdown กล่องแจ้งเตือน */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-64 md:w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-3 z-100">
                  <div className="px-4 pb-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-[#256D45] text-lg">การแจ้งเตือน</span>
                    {hasNotification && (
                      <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{notifications.length}</span>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto pt-2">
                    {notifications.length > 0 ? (
                      notifications.map((msg, idx) => (
                        <div key={idx} className="px-4 py-3 hover:bg-gray-50 text-sm text-[#256D45] font-medium border-b border-gray-50 last:border-0 cursor-default">
                          • {msg}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 flex flex-col items-center justify-center text-gray-400">
                        <Bell className="w-8 h-8 mb-2 opacity-30 fill-gray-300" strokeWidth={1} />
                        <span className="text-sm font-medium">ไม่มีแจ้งเตือน</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="hidden md:block text-[#256D45] text-base md:text-lg font-bold">
                {user?.name || "ชื่อแอดมิน"}
              </span>
              <UserCircle size={28} className="md:w-8 md:h-8 text-[#256D45]" strokeWidth={1.5} />
            </div>
            {/* ปุ่มออกจากระบบเพิ่มเข้ามาตามภาพ */}
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors flex items-center" title="ออกจากระบบ">
              <LogOut size={28} className="md:w-8 md:h-8" strokeWidth={1.5} />
            </button>
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
            <div className="h-10 w-0.5 bg-[#256D45] mx-6"></div>
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