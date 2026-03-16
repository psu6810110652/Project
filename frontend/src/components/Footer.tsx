import { Link } from "react-router-dom";

import logo from "../assets/images/logo.png";

export default function Footer() {
  return (
    <footer className="w-full bg-[#FFFEF2] pt-8 flex flex-col justify-between min-h-max">
      <div className="w-full px-6 md:px-12 xl:pl-30 xl:pr-20 flex flex-col lg:flex-row justify-between items-start gap-12 pb-12">
        {/* Logo and Description */}
        <div className="flex-1 flex flex-col text-left items-start max-w-3xl">
          <img
            src={logo}
            alt="logo.png"
            className="w-20 h-20 md:w-30 md:h-30"
          />
          <h2 className="text-[#256D45] text-2xl md:text-3xl font-bold mt-3 whitespace-nowrap [-webkit-text-stroke:1px_#256d45]">
            ธีรยุทธการเกษตร
          </h2>
          <div className="text-[#256D45] text-base md:text-xl leading-normal mt-3">
            บริการจัดส่งสินค้าเกษตรถึงหน้าบ้านคุณ ด้วยระบบขนส่งที่ได้มาตรฐาน มั่นใจได้ว่าสินค้าจะถึงมืออย่างปลอดภัยและทันเวลาฤดูกาลเพาะปลูก
          </div>
        </div>

        {/* Pages and Services Navigation */}
        <div className="flex gap-12 md:gap-20">
          {/* Pages Navigation */}
          <div className="flex flex-col">
            <h3 className="text-[#256D45] text-xl md:text-2xl font-bold border-b-[3px] border-[#256D45] px-6 md:px-10 pb-2 [-webkit-text-stroke:1px_#256d45]">
              หน้าเว็บ
            </h3>
            <nav className="flex flex-col gap-2 items-center pt-2">
              <Link to="/" className="text-[#256D45] text-lg md:text-xl">หน้าหลัก</Link>
              <Link to="/ปุ๋ย" className="text-[#256D45] text-lg md:text-xl">ปุ๋ย</Link>
              <Link to="/อุปกรณ์" className="text-[#256D45] text-lg md:text-xl">อุปกรณ์</Link>
              <Link to="/เมล็ดพันธุ์" className="text-[#256D45] text-lg md:text-xl">เมล็ดพันธุ์</Link>
              <Link to="/อื่นๆ" className="text-[#256D45] text-lg md:text-xl">อื่นๆ</Link>
            </nav>
          </div>

          {/* Services Navigation */}
          <div className="flex flex-col">
            <h3 className="text-[#256D45] text-xl md:text-2xl font-bold border-b-[3px] border-[#256D45] px-6 md:px-10 pb-2 [-webkit-text-stroke:1px_#256d45]">
              บริการ
            </h3>
            <nav className="flex flex-col gap-2 items-center pt-2">
              <Link to="/profile" className="text-[#256D45] text-lg md:text-xl">หน้าผู้ใช้</Link>
              <Link to="/cart" className="text-[#256D45] text-lg md:text-xl">รถเข็น</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t-[3px] border-[#256D45] w-full mt-auto">
        <div className="text-[#256D45] text-center text-[1rem] py-1 [-webkit-text-stroke:0.5px_#256d45]">
          © 2026 TEERAYUTKANKASED. All rights reserved.
        </div>
      </div>
    </footer>
  );
}