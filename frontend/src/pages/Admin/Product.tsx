import React from 'react';

const MangerProducts: React.FC = () => {
    return (
        <div className="flex flex-col gap-10 font-['Prompt'] p-8">
            <h1 className="text-6xl font-semibold text-[#256D45] drop-shadow-md">
                จัดการสินค้า
            </h1>
            <div className="grid grid-cols-2 gap-10">
                <div className="h-96 rounded-[30px] shadow-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 bg-[#FFFEF2]">
                    <span className="text-7xl font-semibold text-[#256D45]">
                        หมวดหมู่ 1
                    </span>
                    <div className="flex flex-col items-center">
                        <span className="text-9xl font-semibold text-[#256D45]">
                            10
                        </span>
                    </div>
                </div>
                <div className="h-96 rounded-[30px] shadow-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 bg-[#FFFEF2]">
                    <span className="text-7xl font-semibold text-[#256D45]">
                        หมวดหมู่ 2
                    </span>
                    <div className="flex flex-col items-center">
                        <span className="text-9xl font-semibold text-[#256D45]">
                            5
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MangerProducts; 