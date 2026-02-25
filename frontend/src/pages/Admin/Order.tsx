import { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react'; // 🌟 Import ไอคอนกากบาทสำหรับปิด Popup

// 🌟 Interface ข้อมูล
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerId?: string;
  products: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  // 🌟 เพิ่ม field สำหรับสลิปโอนเงิน (ให้ตรงกับชื่อใน Database ของคุณ)
  paymentSlip?: string; 
}

export default function Order() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 🌟 State สำหรับเปิด/ปิด Popup และเก็บข้อมูลออเดอร์ที่เลือก
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // ดึงข้อมูล
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/admin/orders/all-pending');
      setOrders(response.data);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🌟 ฟังก์ชันกดยืนยันคำสั่งซื้อ
  const handleConfirmOrder = async (orderId: string) => {
    try {
      setIsUpdating(true);
      // ยิง API ไปอัปเดตสถานะเป็นรอจัดส่ง (ปรับ URL ให้ตรงกับ Backend ของคุณ)
      await axios.patch(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
        status: 'pending_delivery'
      });
      
      // ปิด Popup
      setSelectedOrder(null);
      // โหลดข้อมูลตารางใหม่ เพื่ออัปเดตตัวเลขและสีสถานะ
      fetchOrders(); 
      alert('ยืนยันคำสั่งซื้อสำเร็จ! สถานะเปลี่ยนเป็นรอจัดส่งแล้ว');
      
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ:', error);
      alert('ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsUpdating(false);
    }
  };

  // คำนวณจำนวนออเดอร์
  const pendingConfirmCount = orders.filter(o => o.status === 'pending_confirm' || !o.status).length;
  const pendingDeliveryCount = orders.filter(o => o.status === 'pending_delivery').length;

  // ฟังก์ชันจุดสีสถานะ
  const renderStatusDot = (status: string) => {
    if (status === 'completed') {
      return <div className="w-4 h-4 rounded-full bg-green-500 mx-auto shadow-sm"></div>;
    }
    if (status === 'pending_delivery') {
      return <div className="w-4 h-4 rounded-full bg-yellow-400 mx-auto shadow-sm"></div>;
    }
    if (status === 'pending_confirm' || !status) {
      return <div className="w-4 h-4 rounded-full bg-orange-400 mx-auto shadow-sm"></div>; // ใช้สีส้มสำหรับรอยืนยัน
    }
    if (status === 'cancelled') {
      return <div className="w-4 h-4 rounded-full bg-red-500 mx-auto shadow-sm"></div>;
    }
    return <div className="w-4 h-4 rounded-full bg-gray-400 mx-auto shadow-sm"></div>;
  };

  return (
    <div className="bg-[#F9FCF9] min-h-screen p-8 font-['Prompt'] w-full relative">
      <div className="max-w-6xl mx-auto">
        
        <div className="border-b-2 border-[#256D45] pb-2 mb-10">
          <h1 className="text-4xl font-extrabold text-[#256D45]">จัดการคำสั่งซื้อ</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="text-[#256D45] text-xl font-bold">กำลังโหลดข้อมูล...</span></div>
        ) : (
          <>
            {/* 📊 การ์ดสรุปยอด */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="bg-white rounded-3xl shadow-sm p-8 w-64 text-center border-2 border-transparent hover:border-[#256D45] hover:shadow-md transition-all cursor-pointer">
                <h3 className="text-3xl font-extrabold text-[#256D45]">รอยืนยัน</h3>
                <p className="text-7xl font-black text-[#256D45] mt-6">{pendingConfirmCount}</p>
              </div>
              <div className="bg-white rounded-3xl shadow-sm p-8 w-64 text-center border-2 border-transparent hover:border-[#256D45] hover:shadow-md transition-all cursor-pointer">
                <h3 className="text-3xl font-extrabold text-[#256D45]">รอจัดส่ง</h3>
                <p className="text-7xl font-black text-[#256D45] mt-6">{pendingDeliveryCount}</p>
              </div>
            </div>

            {/* 📋 ตารางข้อมูล */}
            <div className="relative mt-8">
              <div className="flex justify-start">
                <div className="bg-[#256D45] text-white px-10 py-3 rounded-t-2xl font-bold text-xl relative z-10 shadow-sm border-b-0">
                  สำเร็จ
                </div>
              </div>

              <div className="bg-white rounded-tr-2xl rounded-b-2xl shadow-md overflow-hidden relative z-0 -mt-1">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-100 text-[#256D45] text-lg bg-white">
                        <th className="p-4 font-bold whitespace-nowrap text-center">รหัสสั่งซื้อ</th>
                        <th className="p-4 font-bold whitespace-nowrap text-center">ชื่อ</th>
                        <th className="p-4 font-bold whitespace-nowrap text-center">ไอดีผู้ใช้</th>
                        <th className="p-4 font-bold whitespace-nowrap text-center">ชื่อสินค้า</th>
                        <th className="p-4 font-bold whitespace-nowrap text-center">จำนวน</th>
                        <th className="p-4 font-bold whitespace-nowrap text-center">ราคารวม</th>
                        <th className="p-4 font-bold whitespace-nowrap text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-gray-500 font-medium">ยังไม่มีข้อมูลคำสั่งซื้อ</td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr 
                            key={order.id} 
                            onClick={() => setSelectedOrder(order)}
                            className="border-b border-gray-50 hover:bg-[#F4F9F4] transition-colors bg-white cursor-pointer"
                          >
                            <td className="p-4 font-bold text-[#256D45] text-center align-top">
                              #{order.orderNumber || order.id.substring(0, 8).toUpperCase()}
                            </td>
                            <td className="p-4 font-bold text-[#256D45] text-center align-top">
                              {order.customerName || 'ไม่ระบุชื่อ'}
                            </td>
                            <td className="p-4 font-bold text-[#256D45] text-center align-top">
                              {order.customerId || '#26MF00000'}
                            </td>
                            <td className="p-4 font-bold text-[#256D45] text-center align-top">
                              {order.products.map((product, idx) => (
                                <div key={idx} className="mb-1">{product.name}</div>
                              ))}
                            </td>
                            <td className="p-4 font-bold text-[#256D45] text-center align-top">
                              {order.products.map((product, idx) => (
                                <div key={idx} className="mb-1">{product.quantity}</div>
                              ))}
                            </td>
                            <td className="p-4 font-bold text-[#256D45] text-center align-top">
                              ฿ {order.totalAmount}
                            </td>
                            <td className="p-4 align-top pt-5">
                              {renderStatusDot(order.status)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* คำอธิบายสี */}
                <div className="bg-white p-4 flex gap-6 text-[#256D45] font-bold text-sm border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div> สำเร็จ
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div> รอจัดส่ง
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400"></div> รอยืนยัน
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================== */}
      {/* 🟢 POPUP (Modal) แสดงรายละเอียดและสลิปโอนเงิน */}
      {/* ========================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header ของ Popup */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#F9FCF9]">
              <h2 className="text-2xl font-extrabold text-[#256D45]">
                รายละเอียดคำสั่งซื้อ #{selectedOrder.orderNumber || selectedOrder.id.substring(0, 8).toUpperCase()}
              </h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-1 shadow-sm"
              >
                <X size={28} />
              </button>
            </div>

            {/* เนื้อหาด้านใน (แบ่ง 2 ฝั่ง ซ้ายข้อมูล ขวาสลิป) */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* ฝั่งซ้าย: ข้อมูลลูกค้าและสินค้า */}
                <div className="space-y-6 text-[#256D45]">
                  <div>
                    <h3 className="font-bold text-lg mb-2 border-b-2 border-green-100 pb-1">ข้อมูลลูกค้า</h3>
                    <p><strong>ชื่อ:</strong> {selectedOrder.customerName}</p>
                    <p><strong>รหัสลูกค้า:</strong> {selectedOrder.customerId}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2 border-b-2 border-green-100 pb-1">รายการสินค้า</h3>
                    <ul className="space-y-2">
                      {selectedOrder.products.map((product, idx) => (
                        <li key={idx} className="flex justify-between font-medium">
                          <span>{product.name} (x{product.quantity})</span>
                          {/* ถ้ามีราคาต่อชิ้นก็ใส่ได้ครับ ตอนนี้ใช้โครงเดิมไปก่อน */}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t-2 border-green-100 flex justify-between items-end">
                    <span className="font-bold text-xl">ยอดชำระสุทธิ:</span>
                    <span className="text-3xl font-black text-[#256D45]">฿ {selectedOrder.totalAmount}</span>
                  </div>
                </div>

                {/* ฝั่งขวา: สลิปโอนเงิน */}
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-200">
                  <h3 className="font-bold text-lg text-[#256D45] mb-4 w-full text-center">สลิปโอนเงิน</h3>
                  {selectedOrder.paymentSlip ? (
                    <img 
                      src={selectedOrder.paymentSlip} 
                      alt="Slip" 
                      className="max-h-[300px] object-contain rounded-xl shadow-sm"
                    />
                  ) : (
                    <div className="h-[200px] flex flex-col items-center justify-center text-gray-400">
                      <span className="text-4xl mb-2">📄</span>
                      <p>ไม่พบรูปสลิปโอนเงิน</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Footer: ปุ่มกดยืนยัน */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-200 transition-colors"
              >
                ปิด
              </button>
              
              {/* ซ่อนปุ่มถ้าสถานะไม่ใช่ รอยืนยัน (pending_confirm) */}
              {(selectedOrder.status === 'pending_confirm' || !selectedOrder.status) && (
                <button 
                  onClick={() => handleConfirmOrder(selectedOrder.id)}
                  disabled={isUpdating}
                  className={`px-8 py-3 rounded-full font-bold text-white shadow-md transition-all 
                    ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#256D45] hover:bg-[#1A4D31] hover:shadow-lg'}`}
                >
                  {isUpdating ? 'กำลังอัปเดต...' : 'ยืนยันคำสั่งซื้อ (รอจัดส่ง)'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}