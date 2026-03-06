import { useState, useEffect } from 'react';
import { Home, ChevronUp, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { type Product } from '../../types';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();

    // States for dashboard data
    const [lowStockItems, setLowStockItems] = useState<Product[]>([]);

    // Placeholder states for APIs that don't exist in backend yet
    const salesToday = 0;
    const pendingOrders = 0;
    const [newCustomers, setNewCustomers] = useState(0);

    useEffect(() => {
        // Fetch all products to calculate low stock items
        const fetchProducts = async () => {
            try {
                // Using the api interceptor which attaches the token automatically
                const response = await api.get('/product');
                const allProducts: Product[] = response.data;
                // Filter items with stock <= 5 (Checking both stock types)
                const lowStock = allProducts.filter(p => {
                    const currentStock = typeof p.stock === 'number' ? p.stock : (p.stockQuantity ?? 0);
                    return currentStock <= 5;
                });
                // Sort by stock quantity ascending (lowest first)
                lowStock.sort((a, b) => {
                    const stockA = typeof a.stock === 'number' ? a.stock : (a.stockQuantity ?? 0);
                    const stockB = typeof b.stock === 'number' ? b.stock : (b.stockQuantity ?? 0);
                    return stockA - stockB;
                });
                setLowStockItems(lowStock);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();

        // Fetch all users to get the total customers count
        api.get('/users')
            .then(res => {
                const customers = res.data.filter((user: any) => user.role !== 'Admin');
                setNewCustomers(customers.length);
            })
            .catch(err => console.error("Error fetching users:", err));

        // TODO: Fetch Sales and Orders when the backend APIs are ready
        // api.get('/api/orders/today-sales').then(res => setSalesToday(res.data.total));
        // api.get('/api/orders/pending').then(res => setPendingOrders(res.data.count));
    }, []);

    return (
        <div className="min-h-screen p-4 md:p-8 text-left">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 w-full justify-start">
                <Home className="w-8 h-8 text-[#1E5631]" />
                <h1 className="text-2xl font-bold text-[#1E5631]">หน้าภาพรวม</h1>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 w-full">
                {/* Card 1 */}
                <div className="bg-[#FFFEF4] rounded-[1.25rem] p-6 shadow-sm flex flex-col justify-between relative h-32 items-start text-left">
                    <div className="flex justify-between items-start w-full">
                        <div className="text-[2rem] leading-none font-bold text-[#1E5631]">{salesToday.toLocaleString()}</div>
                        <ChevronUp className="w-8 h-8 text-[#1E5631] -mt-1 shrink-0" strokeWidth={3} />
                    </div>
                    <div className="text-[#1E5631] font-medium text-sm">ยอดขายวันนี้</div>
                </div>

                {/* Card 2 */}
                <div className="bg-[#FFFEF4] rounded-[1.25rem] p-6 shadow-sm flex flex-col justify-between relative h-32 items-start text-left">
                    <div className="text-[2rem] leading-none font-bold text-[#1E5631]">{pendingOrders.toLocaleString()}</div>
                    <div className="text-[#1E5631] font-medium text-sm">รอการจัดส่ง</div>
                    <div className="absolute bottom-6 right-6 flex items-center gap-1.5 text-[0.65rem] text-[#1E5631] font-bold bg-transparent">
                        <div className="w-2 h-2 bg-[#1E5631] rounded-full"></div>
                        คำสั่งซื้อใหม่
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-[#FFFEF4] rounded-[1.25rem] p-6 shadow-sm flex flex-col justify-between relative h-32 items-start text-left">
                    <div className="text-[2rem] leading-none font-bold text-red-600">{lowStockItems.length}</div>
                    <div className="text-red-600 font-bold text-sm">แจ้งเตือนสต็อกต่ำ</div>
                    <div className="absolute bottom-6 right-6 flex items-center gap-1.5 text-[0.65rem] text-red-600 font-bold bg-transparent">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        สต็อกต่ำ
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-[#FFFEF4] rounded-[1.25rem] p-6 shadow-sm flex flex-col justify-between relative h-32 items-start text-left">
                    <div className="text-[2rem] leading-none font-bold text-[#1E5631]">{newCustomers.toLocaleString()}</div>
                    <div className="text-[#1E5631] font-medium text-sm">ลูกค้าทั้งหมด</div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 w-full text-left">
                {/* Graph Area */}
                <div className="xl:col-span-3 bg-[#FFFEF4] rounded-[1.5rem] p-4 sm:p-8 shadow-sm min-h-[400px] flex flex-col items-start text-left">
                    <h2 className="text-xl font-bold text-[#1E5631] mb-8">กราฟยอดขาย 7 วันล่าสุด</h2>
                    <div className="flex-1 border-l-[1.5px] border-b-[1.5px] border-[#1E5631] ml-4 mb-4 relative w-full">
                        {/* Placeholder for the graph line */}
                    </div>
                </div>

                {/* Low Stock Items Area */}
                <div className="xl:col-span-2 bg-[#FFFEF4] rounded-[1.5rem] p-4 sm:p-8 shadow-sm min-h-[400px] overflow-hidden flex flex-col items-start text-left">
                    <h2 className="text-xl font-bold text-red-600 mb-6 shrink-0">สินค้าในสต็อกต่ำ</h2>
                    <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar w-full">
                        {lowStockItems.length > 0 ? (
                            lowStockItems.map((product) => (
                                <div key={product.id} className="bg-[#F5F7EC] rounded-[1.25rem] p-3 flex justify-between items-center shadow-sm w-full">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white rounded-[0.8rem] border-[3px] border-[#1E5631] flex items-center justify-center shrink-0 overflow-hidden">
                                            {product.thumbnailUrl || product.imageUrl ? (
                                                <img src={product.thumbnailUrl || product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-[#1E5631]" strokeWidth={2} />
                                            )}
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <span className="text-[#1E5631] font-bold text-sm line-clamp-1">{product.name}</span>
                                            <span className="text-red-600 text-[0.75rem] font-bold mt-0.5">
                                                มีจำนวน {typeof product.stock === 'number' ? product.stock : (product.stockQuantity ?? 0)} ชิ้น
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

            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}
            </style>
        </div>
    );
}