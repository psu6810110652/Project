import { Link } from "react-router-dom";

import logo from "../assets/images/logo.png";

export default function Footer() {
  return (
    <div className="relative w-full h-83 bg-[#FFFEF2]">
      <div className="flex flex-col items-start justify-between w-full ">
        {/* Logo and Description */}
        <div className="absolute flex-1 flex flex-col text-left items-start left-30 top-8">
          <img
            src={logo}
            alt="logo.png"
            className="w-30 h-30"
          />
          <h2 className="text-[#256D45] text-3xl font-bold mt-3 whitespace-nowrap [-webkit-text-stroke:1px_#256d45]">
            ธีรยุทธการเกษตร
          </h2>
          <div className="text-[#256D45] text-xl leading-normal max-w-3xl mt-3">
          บริการจัดส่งสินค้าเกษตรถึงหน้าบ้านคุณ ด้วยระบบขนส่งที่ได้มาตรฐาน มั่นใจได้ว่าสินค้าจะถึงมืออย่างปลอดภัยและทันเวลาฤดูกาลเพาะปลูก
          </div>
        </div>

        {/* Pages Navigation */}
        <div className="absolute right-20 top-8 flex gap-20">
          <div className="flex flex-col">
            <h3 className="text-[#256D45] text-2xl font-bold border-b-3 border-[#256D45] px-10 pb-2 [-webkit-text-stroke:1px_#256d45]">
              หน้าเว็บ
            </h3>

            <nav className="flex flex-col gap-2 items-center pt-2">
              <Link
                to="/"
                className="text-[#256D45] text-xl"
              >
                หน้าหลัก
              </Link>

              <Link
                to="/fertilizers"
                className="text-[#256D45] text-xl"
              >
                ปุ๋ย
              </Link>

              <Link
                to="/tools"
                className="text-[#256D45] text-xl"
              >
                อุปกรณ์
              </Link>

              <Link
                to="/seeds"
                className="text-[#256D45] text-xl"
              >
                เมล็ด
              </Link>
              
              <Link
                to="/others"
                className="text-[#256D45] text-xl"
              >
                อื่นๆ
              </Link>
            </nav>
          </div>

          {/* Services Navigation */}
          <div className="flex flex-col">
            <h3 className="text-[#256D45] text-2xl font-bold border-b-3 border-[#256D45] px-10 pb-2 [-webkit-text-stroke:1px_#256d45]">
              บริการ
            </h3>
            <nav className="flex flex-col gap-2 w-full items-center pt-2">
              <Link
                to="/profile"
                className="text-[#256D45] text-xl"
              >
                หน้าผู้ใช้
              </Link>
              <Link
                to="/cart"
                className="text-[#256D45] text-xl"
              >
                รถเข็น
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="absolute border-t-[0.1875rem] border-[#256D45] w-full bottom-0">
        <div className="text-[#256D45] text-center text-[1rem] [-webkit-text-stroke:0.5px_#256d45]">
          © 2026 TEERAYUTKANKASED. All rights reserved.
        </div>
      </div>
    </div>
  );
}