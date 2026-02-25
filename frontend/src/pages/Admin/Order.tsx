import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { type OrderData } from '../../types';
import { Table, ConfigProvider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AdminSearchContext } from '../../context/AdminSearchContext';

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

  const { searchTerm } = useContext(AdminSearchContext);

  // กรองข้อมูลทั้งหมดด้วยคำค้นหาก่อน
  const filteredOrders = orders.filter(o => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();

    const customerName = o.customerName || '';
    const customerId = o.customerId || ''; // If not in type, maybe it's not but we map it in column anyway
    const id = o.id || '';
    const orderNumber = o.orderNumber || '';
    const productsNameStr = o.products?.map(p => p.name).join(' ') || '';

    return (
      customerName.toLowerCase().includes(lowerTerm) ||
      customerId.toLowerCase().includes(lowerTerm) ||
      id.toLowerCase().includes(lowerTerm) ||
      orderNumber.toLowerCase().includes(lowerTerm) ||
      productsNameStr.toLowerCase().includes(lowerTerm)
    );
  });

  // แบ่งกลุ่มข้อมูลออเดอร์ตามสถานะ
  const pendingConfirmOrders = filteredOrders.filter(o => o.status === 'pending_confirm' || !o.status);
  const pendingDeliveryOrders = filteredOrders.filter(o => o.status === 'pending_delivery');
  const finishedOrders = filteredOrders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  const pendingConfirmCount = pendingConfirmOrders.length;
  const pendingDeliveryCount = pendingDeliveryOrders.length;

  // ฟังก์ชันจุดสีสถานะ
  const renderStatusDot = (status: string) => {
    if (status === 'completed') {
      return <div className="w-4 h-4 rounded-full bg-green-500 mx-auto shadow-sm" title="สำเร็จ"></div>;
    }
    if (status === 'pending_delivery' || status === 'pending_confirm' || !status) {
      return <div className="w-4 h-4 rounded-full bg-yellow-400 mx-auto shadow-sm" title="รอยืนยัน / รอจัดส่ง"></div>;
    }
    if (status === 'pending_received') {
      return <div className="w-4 h-4 rounded-full bg-blue-500 mx-auto shadow-sm" title="กำลังจัดส่ง"></div>;
    }
    if (status === 'cancelled') {
      return <div className="w-4 h-4 rounded-full bg-red-500 mx-auto shadow-sm" title="ยกเลิก"></div>;
    }
    return <div className="w-4 h-4 rounded-full bg-gray-400 mx-auto shadow-sm"></div>;
  };

  // คอลัมน์ที่ใช้ร่วมกันสำหรับ Antd Table
  const commonColumns: ColumnsType<OrderData> = [
    {
      title: 'รหัสสั่งซื้อ',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      align: 'center',
      render: (_, record: any) => {
        const dateStr = record.createdAt || record.orderDate || record.created_at;
        let d = new Date();
        if (dateStr) {
          d = new Date(dateStr);
        }

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
    {
      title: 'จัดการ',
      key: 'action',
      align: 'center',
      render: (_, record) => renderStatusDot(record.status),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Prompt', sans-serif",
          colorPrimary: '#256D45',
        },
        components: {
          Table: {
            headerBg: '#ffffff',
            headerColor: '#256D45',
            rowHoverBg: '#F4F9F4',
          },
        },
      }}
    >
      <div className="min-h-screen p-8 font-['Prompt'] w-full">
        <div className="max-w-[1600px] mx-auto">

          {/* หัวข้อ */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-[#256D45]">จัดการคำสั่งซื้อ</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><span className="text-[#256D45] text-xl font-bold">กำลังโหลดข้อมูล...</span></div>
          ) : (
            <>
              {/* === ส่วนบน: แบ่ง 2 คอลัมน์ (รอยืนยัน, รอจัดส่ง) === */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">

                {/* 🔴 บล็อก: รอยืนยัน */}
                <div className="flex flex-col w-full h-full">
                  <div className="flex justify-start relative z-10">
                    <div className="bg-[#256D45] text-white px-8 py-2 rounded-t-xl rounded-b-none font-bold text-lg shadow-sm">
                      รอยืนยัน
                    </div>
                  </div>
                  <div className="bg-white rounded-b-xl rounded-tr-xl rounded-tl-none shadow-md p-6 flex flex-col items-center flex-1 relative z-0 -mt-1">
                    <h3 className="text-3xl font-extrabold text-[#256D45]">รอยืนยัน</h3>
                    <p className="text-6xl font-black text-[#256D45] mt-2 mb-6">{pendingConfirmCount}</p>
                    <div className="w-full border-t-2 border-gray-100 mb-6"></div>
                    <div className="w-full max-w-full overflow-hidden">
                      <Table
                        columns={commonColumns}
                        dataSource={pendingConfirmOrders}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: 700 }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* 🔵 บล็อก: รอจัดส่ง */}
                <div className="flex flex-col w-full h-full">
                  <div className="flex justify-start relative z-10">
                    <div className="bg-[#256D45] text-white px-8 py-2 rounded-t-xl rounded-b-none font-bold text-lg shadow-sm">
                      รอจัดส่ง
                    </div>
                  </div>
                  <div className="bg-white rounded-b-xl rounded-tr-xl rounded-tl-none shadow-md p-6 flex flex-col items-center flex-1 relative z-0 -mt-1">
                    <h3 className="text-3xl font-extrabold text-[#256D45]">รอจัดส่ง</h3>
                    <p className="text-6xl font-black text-[#256D45] mt-2 mb-6">{pendingDeliveryCount}</p>
                    <div className="w-full border-t-2 border-gray-100 mb-6"></div>
                    <div className="w-full max-w-full overflow-hidden">
                      <Table
                        columns={commonColumns}
                        dataSource={pendingDeliveryOrders}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: 700 }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* === ส่วนล่าง: สำเร็จ / ยกเลิก === */}
              <div className="mt-8 w-full">
                <div className="flex justify-start relative z-10">
                  <div className="bg-[#256D45] text-white px-10 py-3 rounded-t-2xl rounded-b-none font-bold text-xl shadow-sm">
                    สำเร็จ / ยกเลิก
                  </div>
                </div>
                <div className="bg-white rounded-b-2xl rounded-tr-2xl rounded-tl-none shadow-md overflow-hidden relative z-0 -mt-1 p-6">
                  <Table
                    columns={commonColumns}
                    dataSource={finishedOrders}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                    className="w-full mb-6"
                  />

                  {/* คำอธิบายสี */}
                  <div className="flex flex-wrap gap-6 justify-center text-[#256D45] font-bold text-sm bg-gray-50 py-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div> สำเร็จ
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div> ยกเลิก / ไม่สำเร็จ
                    </div>
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
}