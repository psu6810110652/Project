import React from 'react';
import Search from '../components/search.tsx';

const Category = () => {
  // ข้อมูลจำลองสำหรับสินค้า (Mock Data)
    const products = [
        { id: 1, name: 'แตงโม', image: 'https://placehold.co/160x240', count: 'xx' },
        { id: 2, name: 'ผักกาดขาว', image: 'https://placehold.co/160x240', count: 'xx' },
        { id: 3, name: 'มะละกอ', image: 'https://placehold.co/160x240', count: 'xx' },
        { id: 4, name: 'ข้าวโพด', image: 'https://placehold.co/160x240', count: 'xx' },
        { id: 5, name: 'ผักบุ้ง', image: 'https://placehold.co/160x240', count: 'xx' },
        { id: 6, name: 'มะเขือเทศ', image: 'https://placehold.co/160x240', count: 'xx' },
    ];

    return (
        <div className="min-h-screen bg-lime-100 font-['Prompt'] text-green-800 pb-20">
            
        {/* --- ส่วน Hero Banner (เมล็ด) --- */}
            <div className="relative w-full h-[400px] overflow-hidden">
            {/* รูปพื้นหลัง */}
            <img 
                src="https://placehold.co/1920x670" 
                alt="Background" 
                className="w-full h-full object-cover"
            />
            {/* Overlay สีส้มจางๆ */}
            <div className="absolute inset-0 bg-amber-50/50"></div>
            
            {/* ข้อความตรงกลาง */}
            <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-8xl font-semibold drop-shadow-md">เมล็ด</h1>
            </div>
        </div>

        {/* --- ส่วนเนื้อหาหลัก (Sidebar + Grid) --- */}
        <div className="container mx-auto px-4 mt-12 flex gap-8">
            
            {/* 1. Sidebar (หมวดหมู่) */}
            <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-amber-50 rounded-r-[20px] p-8 shadow-lg min-h-[500px]">
                <h2 className="text-5xl font-semibold mb-6">หมวดหมู่</h2>
                <div className="w-full h-[5px] bg-green-800 mb-8"></div>
                
                <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white border-[5px] border-green-800 rounded-[10px] cursor-pointer"></div>
                <span className="text-3xl font-semibold">ตัวเลือก</span>
                </div>
            </div>
            </aside>

            {/* 2. พื้นที่สินค้า (Main Content) */}
            <main className="flex-1">
            
            {/* ช่องค้นหา (Search Bar) */}
            <Search />

            {/* ตารางสินค้า (Product Grid)
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            </div> */}
            
            </main>
        </div>

        </div>
    );
};

export default Category;