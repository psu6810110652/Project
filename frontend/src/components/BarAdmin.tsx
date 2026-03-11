import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, ShoppingBag } from "lucide-react";

const adminMenus = [
    { name: 'หน้าหลัก', icon: <Home className="w-6 h-6 text-[#256D45] stroke-[2.5px]" />, path: '/admin' },
    {
        name: 'คำสั่งซื้อ', icon: <ShoppingCart className="w-6 h-6 text-[#256D45] stroke-[2.5px]" />, path: '/admin/orders'
    },
    {
        name: 'สินค้า', icon: <ShoppingBag className="w-6 h-6 text-[#256D45] stroke-[2.5px]" />, path: '/admin/products',
        subMenus: [
            { id: 1, name: 'ปุ๋ย' },
            { id: 2, name: 'อุปกรณ์' },
            { id: 3, name: 'เมล็ด' },
            { id: 4, name: 'สารเคมี' },
            { id: 5, name: 'อื่นๆ' }
        ]
    },
    // { name: 'ลูกค้า', icon: '👤', path: '/admin/customers' },
];

const BarAdmin: React.FC = () => {
    const location = useLocation();

    const [openMenu, setOpenMenu] = useState<string | null>(null);

    useEffect(() => {
        const currentMenu = adminMenus.find(m => location.pathname.startsWith(m.path));
        if (currentMenu?.subMenus) {
            setOpenMenu(currentMenu.name);
        }
    }, [location.pathname]);

    return (
        <div className="z-10 w-64 h-full bg-[#256D45] flex flex-col py-8 relative">

            {/* รายการเมนู (Navigation List) */}
            <nav className="flex-1 flex flex-col gap-3 pr-2 mt-3">
                {adminMenus.map((menu) => {
                    const isActive = menu.path === '/admin'
                        ? location.pathname === menu.path
                        : location.pathname.startsWith(menu.path);
                    const isOpen = openMenu === menu.name;

                    return (
                        <div key={menu.name} className="flex flex-col">
                            {/* เมนูหลัก */}
                            <Link
                                to={menu.path}
                                className="no-underline"
                                onClick={() => {
                                    if (menu.subMenus) {
                                        setOpenMenu(menu.name);
                                    } else {
                                        setOpenMenu(null);
                                    }
                                }}
                            >
                                <div className={`
                                    h-14 flex items-center px-10 gap-3 transition-all self-center duration-300 cursor-pointer
                                    rounded-tr-[20px] rounded-br-[20px]
                                    ${isActive
                                        ? 'w-full bg-[#DCEDC1]'
                                        : 'w-[90%] bg-[#FFFEF2] hover:w-full'
                                    }
                                `}>
                                    <span className={`text-2xl ${isActive ? 'text-[#256D45]' : ''}`}>
                                        {menu.icon}
                                    </span>
                                    <span className={`
                                        text-[22px] font-semibold
                                        ${isActive ? 'text-[#256D45]' : 'text-[#256D45]'}
                                    `}>
                                        {menu.name}
                                    </span>
                                </div>
                            </Link>

                            {/* ส่วนเมนูย่อย */}
                            {menu.subMenus && isOpen && (
                                <div className="bg-[#FFFEF2] rounded-br-[20px] flex flex-col w-[85%]">
                                    {menu.subMenus.map((sub, idx, arr) => {
                                        const subPath = `${menu.path}/${sub.id}`;
                                        const isSubActive = location.pathname === subPath;

                                        return (
                                            <React.Fragment key={sub.id}>
                                                <Link
                                                    to={subPath}
                                                    className={`pt-2 text-xl font-bold transition-all ${isSubActive ? 'text-[#256D45] scale-110' : 'text-[#256D45]'
                                                        }`}
                                                >
                                                    {sub.name}
                                                </Link>
                                                {idx !== arr.length && (
                                                    <div className="w-3/4 border-2 border-[#256D45] my-2 rounded-full mx-auto" />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
};

export default BarAdmin;