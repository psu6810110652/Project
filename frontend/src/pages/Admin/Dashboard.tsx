import { useState, useEffect } from 'react';
import { Home, ChevronUp, Image as ImageIcon } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import { type Product } from '../../types';
import { useNavigate } from 'react-router-dom';

// ฟอร์แมตวันที่เป็นภาษาไทย เช่น "จ 10"
function formatDateTH(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    return `${days[date.getDay()]} ${date.getDate()}`;
}

// ฟอร์แมตตัวเลขบาท
function formatBaht(value: number): string {
    if (value >= 1000) return `฿${(value / 1000).toFixed(1)}K`;
    return `฿${value.toLocaleString()}`;
}

export default function Dashboard() {
    const navigate = useNavigate();

    const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
    const [salesToday, setSalesToday] = useState<number>(0);
    const [pendingOrders, setPendingOrders] = useState<number>(0);
    const [newCustomers, setNewCustomers] = useState(0);
    const [weeklySales, setWeeklySales] = useState<{ date: string; total: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const BASE = '/api/admin/orders';

        // ดึงข้อมูลทั้งหมดพร้อมกัน
        Promise.allSettled([
            // ยอดขายวันนี้
            api.get(`${BASE}/today-sales`)
                .then(res => setSalesToday(res.data)),

            // รอการจัดส่ง
            api.get(`${BASE}/pending-count`)
                .then(res => setPendingOrders(res.data)),

            // กราฟ 7 วัน
            api.get(`${BASE}/weekly-sales`)
                .then(res => setWeeklySales(res.data)),

            // สินค้าสต็อกต่ำ
            api.get('/product').then(res => {
                const productData = res.data;
                const productItems = Array.isArray(productData?.items) 
                    ? productData.items 
                    : (Array.isArray(productData) ? productData : []);
                const lowStock = productItems
                    .filter((p: any) => (p.stockQuantity ?? 0) <= 5)
                    .sort((a: any, b: any) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0));
                setLowStockItems(lowStock);
            }),

            // ลูกค้าทั้งหมด
            api.get('/users').then(res => {
                const customers = res.data.filter((u: any) => u.role !== 'Admin');
                setNewCustomers(customers.length);
            }),
        ]).finally(() => setLoading(false));
    }, []);

    // แปลง weekly data สำหรับ recharts
    const chartData = weeklySales.map(d => ({
        name: formatDateTH(d.date),
        ยอดขาย: d.total,
    }));

    return (
        <div className="min-h-screen p-4 md:p-8 text-left">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 w-full justify-start">
                <Home className="w-8 h-8 text-[#1E5631]" />
                <h1 className="text-2xl font-bold text-[#1E5631]">หน้าภาพรวม</h1>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 w-full">
                {/* ยอดขายวันนี้ */}
                <div className="bg-[#FFFEF4] rounded-[1.25rem] p-6 shadow-sm flex flex-col justify-between relative h-32 items-start text-left">
                    <div className="flex justify-between items-start w-full">
                        <div className="text-[2rem] leading-none font-bold text-[#1E5631]">
                            {loading ? '—' : `฿${salesToday.toLocaleString()}`}
                        </div>
                        <ChevronUp className="w-8 h-8 text-[#1E5631] -mt-1 shrink-0" strokeWidth={3} />
                    </div>
                    <div className="text-[#1E5631] font-medium text-sm">ยอดขายวันนี้</div>
                </div>

                {/* รอการจัดส่ง */}
                <div className="bg-[#FFFEF4] rounded-[1.25rem] p-6 shadow-sm flex flex-col justify-between relative h-32 items-start text-left">
                    <div className="text-[2rem] leading-none font-bold text-[#1E5631]">
                        {loading ? '—' : pendingOrders.toLocaleString()}
                    </div>
                    <div className="text-[#1E5631] font-medium text-sm">รอการจัดส่ง</div>
                    <div className="absolute bottom-6 right-6 flex items-center gap-1.5 text-[0.65rem] text-[#1E5631] font-bold">
                        <div className="w-2 h-2 bg-[#1E5631] rounded-full"></div>
                        คำสั่งซื้อใหม่
                    </div>
                </div>

                {/* สต็อกต่ำ */}
                <div className="bg-[#FFFEF4] rounded-[1.25rem] p-6 shadow-sm flex flex-col justify-between relative h-32 items-start text-left">
                    <div className="text-[2rem] leading-none font-bold text-red-600">
                        {loading ? '—' : lowStockItems.length}
                    </div>
                    <div className="text-red-600 font-bold text-sm">แจ้งเตือนสต็อกต่ำ</div>
                    <div className="absolute bottom-6 right-6 flex items-center gap-1.5 text-[0.65rem] text-red-600 font-bold">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        สต็อกต่ำ
                    </div>
                </div>

                {/* ลูกค้าทั้งหมด */}
                <div className="bg-[#FFFEF4] rounded-[1.25rem] p-6 shadow-sm flex flex-col justify-between relative h-32 items-start text-left">
                    <div className="text-[2rem] leading-none font-bold text-[#1E5631]">
                        {loading ? '—' : newCustomers.toLocaleString()}
                    </div>
                    <div className="text-[#1E5631] font-medium text-sm">ลูกค้าทั้งหมด</div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 w-full text-left">
                {/* กราฟ */}
                <div className="xl:col-span-3 bg-[#FFFEF4] rounded-[1.5rem] p-4 sm:p-8 shadow-sm min-h-[400px] flex flex-col">
                    <h2 className="text-xl font-bold text-[#1E5631] mb-6">กราฟยอดขาย 7 วันล่าสุด</h2>
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400">กำลังโหลด...</div>
                    ) : (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={
                                        weeklySales.length > 0
                                            ? chartData
                                            : Array.from({ length: 7 }, (_, i) => {
                                                  const d = new Date();
                                                  d.setDate(d.getDate() - (6 - i));
                                                  return { name: formatDateTH(d.toISOString().split('T')[0]), ยอดขาย: 0 };
                                              })
                                    }
                                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1E5631" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#1E5631" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#1E5631', fontSize: 12, fontWeight: 600 }}
                                        axisLine={{ stroke: '#1E5631' }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tickFormatter={formatBaht}
                                        tick={{ fill: '#6b7280', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={60}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, 'ยอดขาย']}
                                        contentStyle={{
                                            borderRadius: '0.75rem',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            backgroundColor: '#fff',
                                        }}
                                        labelStyle={{ color: '#1E5631', fontWeight: 700 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="ยอดขาย"
                                        stroke="#1E5631"
                                        strokeWidth={2.5}
                                        fill="url(#salesGradient)"
                                        dot={{ fill: '#1E5631', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* สินค้าสต็อกต่ำ */}
                <div className="xl:col-span-2 bg-[#FFFEF4] rounded-[1.5rem] p-4 sm:p-8 shadow-sm min-h-[400px] overflow-hidden flex flex-col items-start text-left">
                    <h2 className="text-xl font-bold text-red-600 mb-6 shrink-0">สินค้าในสต็อกต่ำ</h2>
                    <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar w-full">
                        {loading ? (
                            <div className="flex items-center justify-center h-full pt-10 text-gray-400 w-full text-center">
                                กำลังโหลด...
                            </div>
                        ) : lowStockItems.length > 0 ? (
                            lowStockItems.map((product) => (
                                <div key={product.id} className="bg-[#F5F7EC] rounded-[1.25rem] p-3 flex justify-between items-center shadow-sm w-full">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white rounded-[0.8rem] border-[3px] border-[#1E5631] flex items-center justify-center shrink-0 overflow-hidden">
                                            {product.thumbnailUrls?.[0] || product.imageUrls?.[0] ? (
                                                <img
                                                    src={product.thumbnailUrls?.[0] || product.imageUrls?.[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-[#1E5631]" strokeWidth={2} />
                                            )}
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <span className="text-[#1E5631] font-bold text-sm line-clamp-1">{product.name}</span>
                                            <span className="text-red-600 text-[0.75rem] font-bold mt-0.5">
                                                มีจำนวน {product.stockQuantity ?? 0} ชิ้น
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/admin/products/${product.category?.id}/${product.id}`)}
                                        className="w-28 h-7 px-5 py-0.5 rounded-full border border-gray-400 text-[#1E5631] text-xs font-bold hover:bg-[#1E5631] hover:text-white transition-colors bg-transparent shadow-[inset_0_0_2px_rgba(0,0,0,0.1)] shrink-0 ml-2"
                                    >
                                        จัดการ
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full pt-10 text-gray-400 font-medium w-full text-center">
                                ไม่มีสินค้าที่สต็อกต่ำ
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}</style>
        </div>
    );
}