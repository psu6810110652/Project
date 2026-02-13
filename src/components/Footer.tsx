import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#FFFEF2] py-12 md:py-16 lg:py-20 px-6 md:px-12 lg:px-24 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-12 lg:gap-16">
          {/* Logo and Description */}
          <div className="flex flex-col items-start">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/6276452e0c0becd6e36c2ee94230f719645bbc1e?width=396"
              alt="ธีรยุทธการเกษตร Logo"
              className="w-32 h-32 md:w-40 md:h-40 lg:w-[198px] lg:h-[198px] mb-4"
            />
            <h2 className="text-[#256D45] text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
              ธีรยุทธการเกษตร
            </h2>
            <p className="text-[#256D45] text-lg md:text-2xl lg:text-3xl font-semibold leading-relaxed">
              บริการจัดส่งสินค้าเกษตรถึงหน้าบ้านคุณ ด้วยระบบขนส่งที่ได้มาตรฐาน
              มั่นใจได้ว่าสินค้าจะถึงมืออย่างปลอดภัยและทันเวลาฤดูกาลเพาะปลูก
            </p>
          </div>

          {/* Pages Navigation */}
          <div className="flex flex-col">
            <h3 className="text-[#256D45] text-3xl md:text-4xl font-semibold mb-6 pb-3 border-b-2 border-[#256D45]">
              หน้าเว็บ
            </h3>
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-[#256D45] text-2xl md:text-3xl lg:text-[35px] font-semibold hover:opacity-70 transition-opacity"
              >
                หน้าหลัก
              </Link>
              <Link
                to="/seeds"
                className="text-[#256D45] text-2xl md:text-3xl lg:text-[35px] font-semibold hover:opacity-70 transition-opacity"
              >
                เมล็ด
              </Link>
              <Link
                to="/equipment"
                className="text-[#256D45] text-2xl md:text-3xl lg:text-[35px] font-semibold hover:opacity-70 transition-opacity"
              >
                อุปกรณ์
              </Link>
              <Link
                to="/fertilizer"
                className="text-[#256D45] text-2xl md:text-3xl lg:text-[35px] font-semibold hover:opacity-70 transition-opacity"
              >
                ปุ๋ย
              </Link>
              <Link
                to="/others"
                className="text-[#256D45] text-2xl md:text-3xl lg:text-[35px] font-semibold hover:opacity-70 transition-opacity"
              >
                อื่นๆ
              </Link>
            </nav>
          </div>

          {/* Services Navigation */}
          <div className="flex flex-col">
            <h3 className="text-[#256D45] text-3xl md:text-4xl font-semibold mb-6 pb-3 border-b-2 border-[#256D45]">
              บริการ
            </h3>
            <nav className="flex flex-col gap-4">
              <Link
                to="/profile"
                className="text-[#256D45] text-2xl md:text-3xl lg:text-[35px] font-semibold hover:opacity-70 transition-opacity"
              >
                หน้าผู้ใช้
              </Link>
              <Link
                to="/cart"
                className="text-[#256D45] text-2xl md:text-3xl lg:text-[35px] font-semibold hover:opacity-70 transition-opacity"
              >
                รถเข็น
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-[#256D45]/20">
          <p className="text-[#256D45] text-center text-sm md:text-base font-medium">
            © 2026 TEERAYUTKANKASED. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}