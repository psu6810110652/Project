import { useState, useEffect } from 'react';
import axios from 'axios';

// 🌟 1. สร้าง Interface เพื่อให้ TypeScript รู้จักหน้าตาของข้อมูลออเดอร์
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  products: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function Order() {
  // 🌟 2. สร้าง State สำหรับเก็บข้อมูลออเดอร์ และสถานะการโหลด
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🌟 3. ฟังก์ชันดึงข้อมูลจาก Backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // ยิง GET Request ไปที่ API ที่เราสร้างไว้
      const response = await axios.get('http://localhost:3000/api/admin/orders');
      
      // เอาข้อมูลที่ได้มาใส่ใน State
      setOrders(response.data);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์:', error);
      alert('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่หรือไม่');
    } finally {
      setLoading(false);
    }
  };

  // ให้ดึงข้อมูลทันทีที่เปิดหน้านี้ขึ้นมา
  useEffect(() => {
    fetchOrders();
  }, []);

  // ฟังก์ชันตัวช่วยสำหรับแปลงสถานะ (Status) ให้เป็นป้ายสีสวยๆ
  const renderStatusBadge = (status: string) => {
    // สมมติว่าในระบบมีสถานะเหล่านี้ (ปรับแก้คำตาม DB ของคุณได้เลย)
    if (status === 'pending_confirm' || !status) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">รอยืนยัน</span>;
    }
    if (status === 'completed') {
      return <span className="px-3 py-1 bg-[#DCEDC1] text-[#256D45] rounded-full text-xs font-bold">สำเร็จ</span>;
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
  };

  return (
    <div className="bg-[#F8FBF8] min-h-screen p-6 md:p-8 font-['Prompt']">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[#256D45] mb-8">จัดการคำสั่งซื้อ (Admin)</h1>

        {loading ? (
          // ⏳ หน้าจอตอนกำลังโหลดข้อมูล
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#256D45] rounded-full animate-spin"></div>
            <span className="ml-4 text-[#256D45] font-medium text-lg">กำลังโหลดข้อมูล...</span>
          </div>
        ) : (
          // 📊 ตารางแสดงข้อมูล
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#256D45] text-white">
                    <th className="p-4 font-medium whitespace-nowrap">วันที่สั่งซื้อ</th>
                    <th className="p-4 font-medium whitespace-nowrap">เลขที่ออเดอร์</th>
                    <th className="p-4 font-medium whitespace-nowrap">ชื่อลูกค้า</th>
                    <th className="p-4 font-medium whitespace-nowrap">ยอดรวม</th>
                    <th className="p-4 font-medium whitespace-nowrap">สถานะ</th>
                    <th className="p-4 font-medium whitespace-nowrap text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-gray-500 font-medium text-lg">
                        ยังไม่มีคำสั่งซื้อในระบบ
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        
                        {/* คอลัมน์วันที่ (แปลง Format ให้ดูอ่านง่าย) */}
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('th-TH', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        
                        {/* คอลัมน์เลขที่ออเดอร์ */}
                        <td className="p-4 font-bold text-[#256D45]">
                          {order.orderNumber || order.id.substring(0, 8).toUpperCase()}
                        </td>
                        
                        {/* คอลัมน์ชื่อลูกค้า */}
                        <td className="p-4 text-gray-800 font-medium">{order.customerName}</td>
                        
                        {/* คอลัมน์ยอดรวม */}
                        <td className="p-4 font-bold text-gray-900">฿ {order.totalAmount}</td>
                        
                        {/* คอลัมน์สถานะ */}
                        <td className="p-4">{renderStatusBadge(order.status)}</td>
                        
                        {/* คอลัมน์ปุ่มจัดการ */}
                        <td className="p-4 text-center">
                          <button 
                            className="bg-white border border-[#256D45] text-[#256D45] px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-[#256D45] hover:text-white transition-colors shadow-sm"
                            onClick={() => {
                              // ตอนนี้แค่ alert โชว์ข้อมูลไปก่อน อนาคตเราทำ Popup เปิดดูรายละเอียดได้ครับ
                              const productList = order.products.map(p => `- ${p.name} (x${p.quantity})`).join('\n');
                              alert(`รายการสินค้าของ ${order.customerName}:\n\n${productList}`);
                            }}
                          >
                            ดูรายละเอียด
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}