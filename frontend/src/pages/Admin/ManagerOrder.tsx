import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { type OrderData } from '../../types';
import { message } from 'antd';

export default function ManagerOrder() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [trackingNumber, setTrackingNumber] = useState('');

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/orders/${orderId}`);
            if (res.data) {
                setOrder(res.data);
                if (res.data.trackingNumber) setTrackingNumber(res.data.trackingNumber);
            }
        } catch (err) {
            console.error(err);
            message.error("ไม่สามารถขอดูข้อมูลคำสั่งซื้อได้");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            if (newStatus === 'pending_received' && !trackingNumber.trim()) {
                message.warning('กรุณากรอกเลขแจ้งพัสดุก่อนยืนยันการจัดส่ง');
                return;
            }
            await api.put(`/admin/orders/${orderId}/status`, {
                status: newStatus,
                trackingNumber: trackingNumber.trim() || undefined
            });
            message.success("อัปเดตสถานะสำเร็จ");
            fetchOrder();
        } catch (err) {
            console.error(err);
            message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
        }
    };

    if (loading) return <div className="p-8 text-center text-[#256D45] font-['Prompt'] text-xl">กำลังโหลด...</div>;
    if (!order) return <div className="p-8 text-center text-red-500 font-['Prompt'] text-xl">ไม่พบคำสั่งซื้อ</div>;

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending_confirm': return 'รอยืนยัน';
            case 'pending_delivery': return 'รอจัดส่ง';
            case 'pending_received': return 'กำลังจัดส่ง';
            case 'completed': return 'สำเร็จ';
            case 'cancelled': return 'ยกเลิก';
            default: return 'รอยืนยัน';
        }
    };

    const getProductImage = () => {
        if (order.products && order.products.length > 0 && order.products[0].imageUrl) {
            return order.products[0].imageUrl;
        }
        return 'https://via.placeholder.com/150';
    };

    const getProductName = () => {
        if (order.products && order.products.length > 0) {
            if (order.products.length === 1) return order.products[0].name;
            return `${order.products[0].name} และอื่นๆ`;
        }
        return '-';
    };

    const productCount = order.products?.reduce((sum, item: any) => sum + (item.quantity || 1), 0) || order.products?.length || 0;

    return (
        <div className="w-full bg-[#DCEDC1] min-h-[calc(100vh-80px)] text-[#256D45] p-6 lg:p-10 font-['Prompt'] relative">
            <div className="max-w-4xl mx-auto flex flex-col gap-6 w-full">
                {/* Top Back Button */}
                <div>
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="bg-[#FFFEF2] text-[#256D45] font-bold px-8 py-2 rounded-2xl shadow-md md:text-lg hover:bg-gray-50 flex items-center justify-center transition-transform hover:scale-105"
                    >
                        กลับ
                    </button>
                </div>

                {/* Header Title */}
                <div className="flex justify-between items-end border-b-[3px] border-[#256D45] pb-3 md:pb-4 mt-2">
                    <h1 className="text-3xl md:text-5xl font-black shrink-0 tracking-tight drop-shadow-sm">
                        รหัสคำสั่งซื้อ #{order.orderNumber || order.id.toString().substring(0, 8).toUpperCase()}
                    </h1>
                    <div className="text-xl md:text-2xl font-bold bg-transparent text-[#256D45] drop-shadow-sm">
                        {getStatusLabel(order.status)}
                    </div>
                </div>

                {/* The Main Container Card */}
                <div className="bg-[#FFFEF2] rounded-3xl p-6 md:p-10 shadow-xl border border-[#256D45]/10 mt-2 flex flex-col md:flex-row gap-8 md:gap-12 relative w-full items-stretch">

                    {/* Divider Custom Line */}
                    <div className="hidden md:block w-[3px] bg-[#256D45] rounded-full mx-2 absolute left-1/2 top-8 bottom-8 transform -translate-x-1/2 shadow-sm"></div>

                    {/* Left Side: Product */}
                    <div className="w-full md:w-1/2 flex flex-col items-center sm:flex-row sm:items-start gap-6 relative">
                        {/* Product Image */}
                        <div className="border border-gray-300 rounded-2xl overflow-hidden min-w-[140px] w-40 h-48 md:w-48 md:h-56 p-2 shrink-0 bg-white flex items-center justify-center shadow-inner">
                            <img src={getProductImage()} alt="Product" className="w-full h-full object-cover rounded-xl" />
                        </div>

                        <div className="flex flex-col flex-1 w-full pt-2 gap-4">
                            <div className="font-bold text-xl md:text-2xl whitespace-normal break-words leading-tight">{getProductName()}</div>

                            <div className="flex justify-between items-center text-lg md:text-xl font-bold text-[#256D45] tracking-wide mt-2">
                                <span>จำนวน</span>
                                <span>{productCount} ชิ้น</span>
                            </div>
                            <div className="flex justify-between items-center text-lg md:text-xl font-bold text-[#256D45] tracking-wide">
                                <span>ราคา</span>
                                <span>{Number(order.totalAmount).toLocaleString()} ฿</span>
                            </div>
                        </div>
                    </div>

                    <hr className="md:hidden border-[#256D45] border-t-2 opacity-50 my-2" />

                    {/* Right Side: User & Shipping info */}
                    <div className="w-full md:w-1/2 flex flex-col gap-5 pt-2">

                        <div className="font-bold text-xl md:text-2xl flex items-center gap-2">
                            ไอดีผู้ใช้: <span className="text-gray-600 font-semibold">{order.customerId || order.customerName}</span>
                        </div>

                        {/* Slip Button directly mapping slip location -> UI mockup slip btn */}
                        <div className="w-full">
                            <a
                                href={order.slipUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`border-[2.5px] border-[#256D45] bg-[#FFFEF2] hover:bg-[#256D45] hover:text-[#FFFEF2] transition-colors font-bold block w-full text-center py-2.5 rounded-2xl text-[#256D45] text-lg md:text-xl shadow-sm ${!order.slipUrl ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
                            >
                                ไฟล์สลิป
                            </a>
                        </div>

                        <div className="font-bold text-xl md:text-2xl mt-2">
                            ที่อยู่อาศัย
                        </div>

                        {/* Address Box */}
                        <div className="border-[2.5px] border-[#256D45] rounded-2xl p-4 md:p-5 flex flex-col gap-1 shadow-sm bg-white tracking-wide">
                            <div className="font-bold text-lg md:text-xl text-gray-800">{order.customerName} {order.phone && `เบอร์โทร ${order.phone}`}</div>
                            <div className="font-medium text-gray-600 leading-relaxed text-[15px] md:text-base mt-1">
                                {order.address || 'ไม่มีข้อมูลที่อยู่'}
                            </div>
                        </div>

                        {/* บล็อกสำหรับกรอกเลขพัสดุ เมื่อกำลังจะจัดส่ง */}
                        {order.status === 'pending_delivery' && (
                            <div className="mt-2 flex flex-col gap-2 relative">
                                <label className="font-bold text-lg flex items-center gap-2">
                                    <span className="bg-[#256D45] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md">📦</span> เลขไปรษณีย์
                                </label>
                                <input
                                    type="text"
                                    placeholder="เช่น EB123456789TH"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    className="border-[2.5px] border-[#256D45] rounded-xl px-4 py-3 bg-white outline-none focus:ring-4 focus:ring-[#256D45]/20 font-medium text-lg shadow-sm placeholder-gray-400"
                                />
                            </div>
                        )}

                        {/* สำหรับแสดงลิ้งค์ตามพัสดุเมื่อเคยกรอกไปแล้ว */}
                        {order.trackingNumber && (
                            <div className="mt-2 flex flex-col gap-2 bg-[#E8F3EE] border-2 border-[#256D45]/30 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#256D45]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
                                <div className="font-bold text-lg md:text-xl">เลขพัสดุ: <span className="text-gray-800 ml-2 bg-white px-3 py-1 rounded-lg border border-gray-200">{order.trackingNumber}</span></div>
                                <a
                                    href={`https://track.thailandpost.co.th/?trackNumber=${order.trackingNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#256D45] text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 hover:bg-[#1A5434] transition-colors shadow-md text-lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    เช็คสถานะพัสดุ (ลูกค้ากดลิ้งนี้)
                                </a>
                            </div>
                        )}

                    </div>

                </div>

                {/* Bottom Actions */}
                <div className="flex justify-between mt-6 px-2 md:px-0">
                    <button
                        onClick={() => handleUpdateStatus('cancelled')}
                        className="border-[2.5px] border-red-500 text-red-500 bg-[#FFFEF2] hover:bg-red-50 font-bold px-8 md:px-12 py-3 rounded-[20px] shadow-lg text-lg md:text-xl transition-transform hover:scale-105 active:scale-95"
                    >
                        ยกเลิก
                    </button>

                    <button
                        onClick={() => {
                            if (order.status === 'pending_confirm') handleUpdateStatus('pending_delivery');
                            else if (order.status === 'pending_delivery') handleUpdateStatus('pending_received');
                            else handleUpdateStatus('completed');
                        }}
                        className="bg-[#FFFEF2] border-[2.5px] border-[#256D45] hover:bg-[#256D45] hover:text-[#FFFEF2] text-[#256D45] font-bold px-8 md:px-12 py-3 rounded-[20px] shadow-lg text-lg md:text-xl transition-all hover:scale-105 active:scale-95"
                    >
                        {order.status === 'pending_confirm' ? 'ยืนยันออเดอร์' : order.status === 'pending_delivery' ? 'ยืนยันการจัดส่ง' : 'อัปเดตสถานะ'}
                    </button>
                </div>

            </div>
        </div>
    );
}
