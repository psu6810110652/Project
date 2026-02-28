import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X } from 'lucide-react';
// 🌟 เพิ่ม Import Table จาก Ant Design (หากคุณใช้ AntD)
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

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
  paymentSlip?: string; 
}

export default function Order() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

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

  const handleConfirmOrder = async (orderId: string) => {
    try {
      setIsUpdating(true);
      await axios.patch(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
        status: 'pending_delivery'
      });
      
      setSelectedOrder(null);
      fetchOrders(); 
      alert('ยืนยันคำสั่งซื้อสำเร็จ! สถานะเปลี่ยนเป็นรอจัดส่งแล้ว');
      
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ:', error);
      alert('ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsUpdating(false);
    }
  };

  // 🌟 เพิ่มตัวแปรคัดกรองข้อมูลสำหรับใส่ใน Table แต่ละหมวดหมู่ให้ครบถ้วน
  const pendingConfirmOrders = orders.filter(o => o.status === 'pending_confirm' || !o.status);
  const pendingDeliveryOrders = orders.filter(o => o.status === 'pending_delivery');
  const finishedOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  const pendingConfirmCount = pendingConfirmOrders.length;
  const pendingDeliveryCount = pendingDeliveryOrders.length;

  // 🌟 ฟังก์ชันแสดงจุดสีสถานะ
  const renderStatusDot = (status: string) => {
    if (status === 'completed') return <div className="w-4 h-4 rounded-full bg-green-500 mx-auto shadow-sm" title="สำเร็จ"></div>;
    if (status === 'cancelled') return <div className="w-4 h-4 rounded-full bg-red-500 mx-auto shadow-sm" title="ยกเลิก"></div>;
    return <div className="w-4 h-4 rounded-full bg-gray-400 mx-auto shadow-sm" title="รอยืนยัน/รอจัดส่ง"></div>;
  };

  const baseColumns: ColumnsType<OrderData> = [
    {
      title: 'รหัสสั่งซื้อ',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      align: 'center',
      render: (_, record: any) => {
        const dateStr = record.createdAt || record.orderDate || record.created_at;
        let d = new Date();
        if (dateStr) d = new Date(dateStr);

        const day = d.getDate().toString().padStart(2, '0');
        const monthChars = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
        const monthChar = monthChars[d.getMonth()];
        const yearBE = d.getFullYear() + 543;
        const shortYear = yearBE.toString().slice(-2);
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');

        const formattedId = `${day}${monthChar}${shortYear}${hours}${minutes}`;
        return <span className="font-bold text-[#256D45]">#{formattedId}</span>;
      },
    },
    {
      title: 'ชื่อ',
      dataIndex: 'customerName',
      key: 'customerName',
      align: 'center',
      render: (text) => <span className="font-bold text-[#256D45]">{text || 'ไม่ระบุชื่อ'}</span>,
    },
    {
      title: 'ไอดีผู้ใช้',
      dataIndex: 'customerId',
      key: 'customerId',
      align: 'center',
      render: (text) => <span className="font-bold text-[#256D45]">{text || '#26MF00000'}</span>,
    },
    {
      title: 'ชื่อสินค้า',
      key: 'productName',
      align: 'center',
      render: (_, record) => (
        <div className="font-bold text-[#256D45]">
          {record.products.map((product, idx) => (
            <div key={idx} className="mb-1">{product.name}</div>
          ))}
        </div>
      ),
    },
    {
      title: 'จำนวน',
      key: 'productQty',
      align: 'center',
      render: (_, record) => (
        <div className="font-bold text-[#256D45]">
          {record.products.map((product, idx) => (
            <div key={idx} className="mb-1">{product.quantity}</div>
          ))}
        </div>
      ),
    },
    {
      title: 'ราคารวม',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'center',
      render: (text) => <span className="font-bold text-[#256D45]">฿ {text}</span>,
    },
  ];

  const pendingColumns: ColumnsType<OrderData> = [
    ...baseColumns,
    {
      title: 'จัดการ',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <button
          onClick={() => navigate(`/admin/orders/${record.id}`)}
          className="bg-[#256D45] hover:bg-[#1A5434] text-white font-bold px-4 py-1.5 rounded-xl text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          จัดการ
        </button>
      ),
    },
  ];

  const finishedColumns: ColumnsType<OrderData> = [
    ...baseColumns,
    {
      title: 'สถานะ',
      key: 'status',
      align: 'center',
      render: (_, record) => renderStatusDot(record.status),
    },
  ];

  return (
    <div className="bg-[#F9FCF9]/60 min-h-screen p-8 font-['Prompt'] w-full relative">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8">
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

            {/* 🔴 บล็อก: รอยืนยัน */}
            <div className="flex flex-col w-full h-full mb-8">
              <div className="flex justify-start relative z-10">
                <div className="bg-[#256D45] text-white px-8 py-2 rounded-t-xl font-bold text-lg shadow-sm">
                  รอยืนยัน
                </div>
              </div>
              <div className="bg-white rounded-b-xl rounded-tr-xl shadow-md p-6 flex flex-col items-center relative z-0 -mt-1">
                <h3 className="text-3xl font-extrabold text-[#256D45]">รอยืนยัน</h3>
                <p className="text-6xl font-black text-[#256D45] mt-2 mb-6">{pendingConfirmCount}</p>
                <div className="w-full border-t-2 border-gray-100 mb-6"></div>
                <div className="w-full overflow-hidden">
                  <Table
                    columns={pendingColumns}
                    dataSource={pendingConfirmOrders}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 700 }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 🟠 บล็อก: รอจัดส่ง */}
            <div className="flex flex-col w-full h-full mb-8">
              <div className="flex justify-start relative z-10">
                <div className="bg-[#256D45] text-white px-8 py-2 rounded-t-xl font-bold text-lg shadow-sm">
                  รอจัดส่ง
                </div>
              </div>
              <div className="bg-white rounded-b-xl rounded-tr-xl shadow-md p-6 flex flex-col items-center relative z-0 -mt-1">
                <h3 className="text-3xl font-extrabold text-[#256D45]">รอจัดส่ง</h3>
                <p className="text-6xl font-black text-[#256D45] mt-2 mb-6">{pendingDeliveryCount}</p>
                <div className="w-full border-t-2 border-gray-100 mb-6"></div>
                <div className="w-full overflow-hidden">
                  <Table
                    columns={pendingColumns}
                    dataSource={pendingDeliveryOrders}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 700 }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 🟢 บล็อก: ตารางออเดอร์ทั้งหมด (ประวัติ) */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
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
                      <th className="p-4 font-bold whitespace-nowrap text-center">สถานะ</th>
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
                          <td className="p-4 align-top pt-5 text-center">
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
                  <div className="w-3 h-3 rounded-full bg-red-500"></div> ยกเลิก
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div> อื่นๆ
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