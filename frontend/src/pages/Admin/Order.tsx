import { useState, useEffect } from 'react';
import axios from 'axios';

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
}

export default function Order() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  // คำนวณจำนวนออเดอร์
  const pendingConfirmCount = orders.filter(o => o.status === 'pending_confirm' || !o.status).length;
  const pendingDeliveryCount = orders.filter(o => o.status === 'pending_delivery').length;

  // ฟังก์ชันจุดสีสถานะ
  const renderStatusDot = (status: string) => {
    if (status === 'completed') {
      return <div className="w-4 h-4 rounded-full bg-green-500 mx-auto shadow-sm"></div>;
    }
    if (status === 'pending_delivery' || status === 'pending_confirm' || !status) {
      return <div className="w-4 h-4 rounded-full bg-yellow-400 mx-auto shadow-sm"></div>;
    }
    if (status === 'cancelled') {
      return <div className="w-4 h-4 rounded-full bg-red-500 mx-auto shadow-sm"></div>;
    }
    return <div className="w-4 h-4 rounded-full bg-gray-400 mx-auto shadow-sm"></div>;
  };

  return (
    // 🎨 1. เปลี่ยนสีพื้นหลังตรงนี้ เป็นขาวจางๆ (#F9FCF9)
    <div className="bg-[#F9FCF9]/50 min-h-screen p-8 font-['Prompt'] w-full">
      <div className="max-w-6xl mx-auto">
        
        {/* หัวข้อ */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-[#256D45]">จัดการคำสั่งซื้อ</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="text-[#256D45] text-xl font-bold">กำลังโหลดข้อมูล...</span></div>
        ) : (
          <>
            {/* 📊 การ์ดสรุปยอด 2 ใบ */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              
              {/* 🎨 2. แก้กรอบการ์ดตรงนี้: ใช้ border-2 รอบด้าน และทำให้บางลง + เพิ่ม cursor-pointer */}
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
              
              {/* แถบ "สำเร็จ" */}
              <div className="flex justify-start">
                <div className="bg-[#256D45] text-white px-10 py-3 rounded-t-2xl font-bold text-xl relative z-10 shadow-sm border-b-0">
                  สำเร็จ
                </div>
              </div>

              {/* ตัวตาราง */}
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
                        // 🌟 เอา , index ออกจากบรรทัดนี้แล้ว
                        orders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-50 hover:bg-[#F4F9F4] transition-colors bg-white">
                            
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
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div> รอถึงลูกค้า
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div> ยกเลิก
                  </div>
                </div>

              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}