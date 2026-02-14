import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-[#FFFEF2] px-0 pt-10 pb-0 border-t-2 border-[#D1E7C6]">
      <div className="  flex flex-col lg:flex-row items-start lg:items-stretch justify-between w-full ">
        {/* Logo and Description */}
        <div className="flex-1 flex flex-col items-start  ml-30">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/6276452e0c0becd6e36c2ee94230f719645bbc1e?width=396"
            alt="ธีรยุทธการเกษตร Logo"
            className="w-24 h-24 md:w-32  lg:w-[120px] lg:h-[120px] mb-2 mt-2 "
          />
          <h2 className="text-[#256D45] text-3xl font-bold mb-2 mt-2 whitespace-nowrap">
            ธีรยุทธการเกษตร
          </h2>
          <p className="text-[#256D45] text-lg font-medium leading-relaxed max-w-3xl text-balance text-left ">
          บริการจัดส่งสินค้าเกษตรถึงหน้าบ้านคุณ ด้วยระบบขนส่งที่ได้มาตรฐาน 
          <br className="hidden lg:inline"/> มั่นใจได้ว่าสินค้าจะถึงมืออย่างปลอดภัยและทันเวลาฤดูกาลเพาะปลูก
          </p>
        </div>

        {/* Pages Navigation */}
        <div className=" flex flex-col  justify-start  mt-10 ml-170 ">
          <h3 className="text-[#256D45] text-2xl font-bold mb-6 pb-3 border-b-2 border-[#256D45] w-full  max-w-[180px]">
            หน้าเว็บ
          </h3>
          <nav className="flex flex-col gap-4 w-full items-end max-w-[180px]">
            <Link
              to="/"
              className="text-[#256D45] text-lg font-semibold hover:opacity-70 transition-opacity  w-full"
            >
              หน้าหลัก
            </Link>
            <Link
              to="/seeds"
              className="text-[#256D45] text-lg  font-semibold hover:opacity-70 transition-opacity  w-full"
            >
              เมล็ด
            </Link>
            <Link
              to="/tools"
              className="text-[#256D45] text-lg  font-semibold hover:opacity-70 transition-opacity  w-full"
            >
              อุปกรณ์
            </Link>
            <Link
              to="/fertilizers"
              className="text-[#256D45] text-lg  font-semibold hover:opacity-70 transition-opacity  w-full"
            >
              ปุ๋ย
            </Link>
            <Link
              to="/others"
              className="text-[#256D45] text-lg  font-semibold hover:opacity-70 transition-opacity  w-full"
            >
              อื่นๆ
            </Link>
          </nav>
        </div>

        {/* Services Navigation */}
        <div className="flex-1 flex flex-col items-end justify-start mr-25 mt-10 ">
          <h3 className="text-[#256D45] text-2xl  font-bold mb-6 pb-3 border-b-2 border-[#256D45] w-full  max-w-[180px]">
            บริการ
          </h3>
          <nav className="flex flex-col gap-4 w-full items-end max-w-[180px]">
            <Link
              to="/profile"
              className="text-[#256D45] text-lg  font-semibold hover:opacity-70 transition-opacity  w-full"
            >
              หน้าผู้ใช้
            </Link>
            <Link
              to="/cart"
              className="text-[#256D45] text-lg  font-semibold hover:opacity-70 transition-opacity  w-full"
            >
              รถเข็น
            </Link>
          </nav>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 pt-6 border-t border-[#256D45]/20 w-full">
        <p className="text-[#256D45] text-center text-xs md:text-sm font-medium">
          © 2026 TEERAYUTKANKASED. All rights reserved.
        </p>
      </div>
    </footer>
  );
}