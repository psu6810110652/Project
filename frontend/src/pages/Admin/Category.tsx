import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { type CategoryStat } from '../../types';
import { AdminSearchContext } from '../../context/AdminSearchContext';

const ManageCategories: React.FC = () => {
    const [stats, setStats] = useState<CategoryStat[]>([]);
    const navigate = useNavigate();
    const { searchTerm } = useContext(AdminSearchContext);

    useEffect(() => {
        axios.get('/api/category/stats')
            .then(res => {
                setStats(res.data);
            })
            .catch(err => console.error("เรียกข้อมูลพลาดนะเพื่อน:", err));
    }, []);

    return (
        <div className="flex flex-col gap-10 w-full min-h-screen bg-[#DCEDC1] p-6 lg:p-10">
            <div className="flex flex-col items-center justify-center w-full mx-auto">
                <h1 className="text-6xl font-semibold text-[#256D45] drop-shadow-md [-webkit-text-stroke:1.75px_#256d45] tracking-[0.05em]">
                    จัดการสินค้า
                </h1>
                <div className="mt-4 h-1 w-full bg-[#256D45] rounded-full shadow-sm"></div>
            </div>

            <div className="flex flex-wrap justify-center gap-10">
                {stats
                    .filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((item) => {
                        const countNumber = Number(item.productCount) || 0;
                        const isEmpty = countNumber === 0;

                        return (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/admin/products/${item.id}`)}
                                className={`
                                h-90 w-90 rounded-[20px] shadow-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105
                                ${isEmpty ? 'bg-gray-50 border-2 border-dashed border-gray-300' : 'bg-[#FFFEF2]'} 
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