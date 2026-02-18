import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { type CategoryStat } from '../../types';

const ManageCategories: React.FC = () => {
    const [stats, setStats] = useState<CategoryStat[]>([]); 
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/category/stats') 
            .then(res => {
                setStats(res.data);
            })
            .catch(err => console.error("เรียกข้อมูลพลาดนะเพื่อน:", err));
    }, []);

    return (
        <div className="flex flex-col gap-10 font-['Prompt'] p-8">
            <h1 className="text-6xl font-semibold text-[#256D45] drop-shadow-md">
                จัดการสินค้า
            </h1>

            <div className="grid grid-cols-2 gap-10">
                {stats.map((item, index) => {
                    // ✅ แปลง productCount เป็นตัวเลขเพื่อเช็คค่า 0
                    const countNumber = Number(item.productCount) || 0;
                    const isEmpty = countNumber === 0;
                    const isLastItem = index === stats.length - 1 && stats.length % 2 !== 0;

                    return (
                        <div 
                            key={item.id}
                            onClick={() => navigate(`/admin/products/${item.id}`)}
                            className={`
                                h-96 rounded-[30px] shadow-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105
                                ${isEmpty ? 'bg-gray-50 border-2 border-dashed border-gray-300' : 'bg-[#FFFEF2]'} 
                                ${isLastItem ? 'col-span-2 w-1/2 mx-auto' : ''}
                            `}
                        >
                            <span className={`text-7xl font-semibold ${isEmpty ? 'text-gray-400' : 'text-[#256D45]'}`}>
                                {item.name}
                            </span>

                            <div className="flex flex-col items-center">
                                <span className={`text-9xl font-semibold ${isEmpty ? 'text-gray-300' : 'text-[#256D45]'}`}>
                                    {countNumber}
                                </span>
                                
                                {isEmpty && (
                                    <span className="text-gray-400 text-2xl font-['Prompt']">
                                        ยังไม่มีสินค้าในหมวดนี้
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ManageCategories;