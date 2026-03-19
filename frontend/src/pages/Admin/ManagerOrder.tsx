import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { type OrderData } from '../../types';
import { message, Modal } from 'antd'; // เพิ่ม Modal ตรงนี้

const COURIER_NAMES: Record<string, string> = {
    'thailand-post': 'ไปรษณีย์ไทย',
    'flashexpress': 'Flash',
    'kerry-logistics': 'Kerry',
};

export default function ManagerOrder() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [courierSlug, setCourierSlug] = useState('');

    // State สำหรับเปิด/ปิดรูปสลิปเต็ม
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/admin/orders/${orderId}`);
            if (res.data) {
                console.log("👉 ข้อมูลที่ได้จาก API:", res.data);
                setOrder(res.data);
                if (res.data.trackingNumber) setTrackingNumber(res.data.trackingNumber);
                if (res.data.courierSlug) setCourierSlug(res.data.courierSlug);
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
            await api.put(`/api/admin/orders/${orderId}/status`, {
                status: newStatus,
                trackingNumber: trackingNumber.trim() || undefined,
                courierSlug: courierSlug || undefined,
                cancelReason: newStatus === 'cancelled' ? 'สลิปไม่ถูกต้อง' : undefined
            });
            message.success("อัปเดตสถานะสำเร็จ");
            navigate('/admin/orders');
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
            case 'pending_received': return 'รอได้รับสินค้า';
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
                        className="bg-[#FFFEF2] text-[#256D45] font-bold !px-8 !py-2 rounded-2xl shadow-md md:text-lg hover:bg-gray-50 flex items-center justify-center transition-transform hover:scale-105"
                    >
                        กลับ
                    </button>
                </div>

                {/* Header Title */}
                <div className="flex justify-between items-end border-b-[3px] border-[#256D45] pb-3 md:pb-4 mt-2">
                    <h1 className="text-3xl md:text-5xl font-black shrink-0 tracking-tight drop-shadow-sm">
                        #{order.orderNumber || 'ไม่มีรหัส'}
                    </h1>
                    <div className="text-xl md:text-2xl font-bold bg-transparent text-[#256D45] drop-shadow-sm">
                        {getStatusLabel(order.status)}
                    </div>
                </div>

                {/* The Main Container Card */}
                <div className="bg-[#FFFEF2] rounded-3xl p-6 md:p-10 shadow-xl border border-[#256D45]/10 mt-2 flex flex-col md:flex-row gap-8 md:gap-12 relative w-full items-stretch">

                    {/* Divider Custom Line */}
                    <div className="hidden md:block w-0.75 bg-[#256D45] rounded-full mx-2 absolute left-1/2 top-8 bottom-8 transform -translate-x-1/2 shadow-sm"></div>

                    {/* Left Side: Product */}
                    <div className="w-full md:w-1/2 flex flex-col items-center sm:flex-row sm:items-start gap-6 relative">
                        {/* Product Image */}
                        <div className="border border-gray-300 rounded-2xl overflow-hidden min-w-35 w-40 h-48 md:w-48 md:h-56 p-2 shrink-0 bg-white flex items-center justify-center shadow-inner">
                            <img src={getProductImage()} alt="Product" className="w-full h-full object-cover rounded-xl" />
                        </div>

                        <div className="flex flex-col flex-1 w-full pt-2 gap-4">
                            <div className="font-bold text-xl md:text-2xl whitespace-normal wrap-break-words leading-tight">{getProductName()}</div>

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

                        {/* --- ส่วนแสดงรูปสลิป --- */}
                        <div className="w-full">
                            <div className="font-bold text-xl md:text-2xl mb-2 text-[#256D45]">
                                หลักฐานการโอนเงิน
                            </div>
                            {order.paymentSlip ? (
                                // เปลี่ยนจากแท็ก <a> เป็น <div> และจับ onClick เพื่อเปิด Modal
                                <div
                                    onClick={() => setIsImageModalOpen(true)}
                                    className="cursor-pointer block border-[2.5px] border-[#256D45] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative bg-gray-50 h-48 md:h-64 flex items-center justify-center"
                                >
                                    <img
                                        src={order.paymentSlip}
                                        alt="สลิปโอนเงิน"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'https://via.placeholder.com/300x400?text=Slip+Image+Not+Found';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white font-bold text-lg bg-[#256D45] px-4 py-2 rounded-xl">คลิกเพื่อดูรูปเต็ม</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-[2.5px] border-dashed border-gray-400 bg-gray-50 rounded-2xl h-32 md:h-40 flex items-center justify-center text-gray-500 font-medium shadow-inner">
                                    ไม่มีไฟล์สลิปแนบมา
                                </div>
                            )}
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

                        {/* บล็อกสำหรับกรอกเลขพัสดุและเลือกขนส่ง */}
                        {order.status === 'pending_delivery' && (
                            <div className="mt-2 flex flex-col gap-4">
                                <div className="flex flex-col gap-2 relative">
                                    <label className="font-bold text-lg flex items-center gap-2">
                                        <span className="bg-[#256D45] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md">🚚</span> เลือกขนส่ง
                                    </label>
                                    <select
                                        value={courierSlug}
                                        onChange={(e) => setCourierSlug(e.target.value)}
                                        className="border-[2.5px] border-[#256D45] rounded-xl px-4 py-3 bg-white outline-none focus:ring-4 focus:ring-[#256D45]/20 font-medium text-lg shadow-sm"
                                    >
                                        <option value="">-- เลือกขนส่ง --</option>
                                        <option value="thailand-post">ไปรษณีย์ไทย</option>
                                        <option value="flash-express">Flash</option>
                                        <option value="kerry-logistics">Kerry</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2 relative">
                                    <label className="font-bold text-lg flex items-center gap-2">
                                        <span className="bg-[#256D45] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md">📦</span> เลขพัสดุ
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="เช่น EB123456789TH"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        className="border-[2.5px] border-[#256D45] rounded-xl px-4 py-3 bg-white outline-none focus:ring-4 focus:ring-[#256D45]/20 font-medium text-lg shadow-sm placeholder-gray-400"
                                    />
                                </div>
                            </div>
                        )}

                        {/* สำหรับแสดงลิ้งค์ตามพัสดุเมื่อเคยกรอกไปแล้ว */}
                        {order.trackingNumber && (
                            <div className="mt-2 flex flex-col gap-2 bg-[#E8F3EE] border-2 border-[#256D45]/30 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#256D45]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
                                <div className="font-bold text-lg md:text-xl flex flex-col gap-1">
                                    {order.courierSlug && (
                                        <div>ขนส่ง: <span className="text-gray-800 ml-2 font-semibold">{COURIER_NAMES[order.courierSlug] || order.courierSlug}</span></div>
                                    )}
                                    <div>เลขพัสดุ: <span className="text-gray-800 ml-2 bg-white px-3 py-1 rounded-lg border border-gray-200">{order.trackingNumber}</span></div>
                                </div>
                                <a
                                    href={`https://www.aftership.com/track/${order.courierSlug}/${order.trackingNumber}`}
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
                <div className={`flex ${order.status === 'pending_confirm' ? 'justify-between' : 'justify-end'} mt-6 px-2 md:px-0`}>
                    {order.status === 'pending_confirm' && (
                        <button
                            onClick={() => handleUpdateStatus('cancelled')}
                            className="border-[2.5px] border-red-500 text-red-500 bg-[#FFFEF2] hover:bg-red-50 font-bold !px-8 md:px-12 !py-3 rounded-[20px] shadow-lg text-lg md:text-xl transition-transform hover:scale-105 active:scale-95"
                        >
                            ยกเลิก
                        </button>
                    )}

                    {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'pending_received' && (
                        <button
                            onClick={() => {
                                if (order.status === 'pending_confirm') handleUpdateStatus('pending_delivery');
                                else if (order.status === 'pending_delivery') handleUpdateStatus('pending_received');
                                else handleUpdateStatus('completed');
                            }}
                            className="bg-[#FFFEF2] border-[2.5px] border-[#256D45] hover:bg-[#256D45] hover:text-[#FFFEF2] text-[#256D45] font-bold !px-8 md:px-12 !py-3 rounded-[20px] shadow-lg text-lg md:text-xl transition-all hover:scale-105 active:scale-95"
                        >
                            {order.status === 'pending_confirm' ? 'ยืนยันออเดอร์' : order.status === 'pending_delivery' ? 'ยืนยันการจัดส่ง' : 'อัปเดตสถานะ'}
                        </button>
                    )}
                </div>

            </div>

            {/* --- เพิ่มหน้าต่าง Modal สำหรับดูรูปเต็ม --- */}
            <Modal
                open={isImageModalOpen}
                footer={null}
                onCancel={() => setIsImageModalOpen(false)}
                centered
                width={600}
                bodyStyle={{ padding: 0, backgroundColor: 'transparent' }}
            >
                {order?.paymentSlip && (
                    <img
                        src={order.paymentSlip}
                        alt="สลิปโอนเงินแบบเต็ม"
                        className="w-full h-auto rounded-xl object-contain"
                    />
                )}
            </Modal>
        </div>
    );
}