import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { type OrderData } from '../../types';
import { Table, ConfigProvider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AdminSearchContext } from '../../context/AdminSearchContext';

export default function Order() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ดึงข้อมูล
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/orders/all-pending');
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

  // กรองข้อมูลทั้งหมดด้วยคำค้นหา (จากช่องค้นหาด้านบน)
  const filteredOrders = orders.filter(o => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();

    const customerName = o.customerName || '';
    const customerId = o.customerId || '';
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

  // คอลัมน์สำหรับตาราง
  const columns: ColumnsType<OrderData> = [
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

        return <span className="font-bold text-[#256D45]">#{record.orderNumber || formattedId}</span>;
      },
    },
    {
      title: 'ชื่อ',
      dataIndex: 'customerName',
      key: 'customerName',
      align: 'center',
      render: (text) => <span className="font-bold text-[#256D45] whitespace-nowrap">{text || 'ไม่ระบุชื่อ'}</span>,
    },
    {
      title: 'ไอดีผู้ใช้',
      dataIndex: 'userid',
      key: 'customerId',
      align: 'center',
      render: (text) => <span className="font-bold text-gray-500 whitespace-nowrap">{text || '-'}</span>,
    },
    {
      title: 'ชื่อสินค้า',
      key: 'productName',
      align: 'center',
      render: (_, record) => (
        <div className="font-bold text-[#256D45] text-left inline-block">
          {record.products?.map((product, idx) => (
            <div key={idx} className="mb-1 truncate max-w-50" title={product.name}>{product.name}</div>
          ))}
        </div>
      ),
    },
    {
      title: 'จำนวน',
      key: 'productQty',
      align: 'center',
      width: 120, // เพิ่มความกว้างให้คอลัมน์นี้
      render: (_, record) => (
        <div className="font-bold text-[#256D45]">
          {record.products?.map((product, idx) => (
            // ใส่ whitespace-nowrap ป้องกันตัวเลขถูกปัดตกบรรทัด
            <div key={idx} className="mb-1 whitespace-nowrap">{product.quantity} ชิ้น</div>
          ))}
        </div>
      ),
    },
    {
      title: 'ราคารวม',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'center',
      width: 120,
      render: (text) => <span className="font-bold text-[#256D45] whitespace-nowrap">฿ {Number(text).toLocaleString()}</span>,
    },
    {
      title: 'สถานะ',
      key: 'status',
      align: 'center',
      width: 100,
      // --- ระบบ Filter โดยกดที่ไอคอนกรวยตรงหัวตาราง ---
      filters: [
        { text: 'รอยืนยัน', value: 'pending_confirm' },
        { text: 'รอจัดส่ง', value: 'pending_delivery' },
        { text: 'สำเร็จ', value: 'completed' },
        { text: 'ยกเลิก', value: 'cancelled' },
      ],
      onFilter: (value, record) => {
        const status = record.status || 'pending_confirm';
        return status === value;
      },
      // --- เปลี่ยนเป็นจุดสี ---
      // --- เปลี่ยนเป็นจุดสี ---
      render: (_, record) => {
        const status = record.status || 'pending_confirm';
        let dotClass = "w-4 h-4 rounded-full inline-block shadow-sm ";

        if (status === 'pending_confirm') {
          dotClass += "bg-orange-500";
        } else if (status === 'pending_delivery') {
          dotClass += "bg-yellow-500";
        } else if (status === 'completed') {
          dotClass += "bg-green-500";
        } else if (status === 'cancelled') {
          dotClass += "bg-red-500";
        }

        return (
          <div className="flex justify-center items-center">
            <span className={dotClass} title={status}></span>
          </div>
        );
      },
    },
    {
      title: 'จัดการ',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <button
          onClick={() => navigate(`/admin/orders/${record.id}`)}
          className="bg-[#256D45] hover:bg-[#1A5434] text-white font-bold px-5! py-1.5! rounded-xl text-sm shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          จัดการ
        </button>
      ),
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
            headerBg: '#f0fdf4',
            headerColor: '#256D45',
            rowHoverBg: '#F4F9F4',
          },
        },
      }}
    >
      <div className="min-h-screen bg-[#DCEDC1] p-6 lg:p-10 font-['Prompt'] w-full">
        <div className="max-w-400 mx-auto">

          {/* หัวข้อ */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#256D45] drop-shadow-sm">จัดการคำสั่งซื้อ</h1>
          </div>

          <div className="bg-[#FFFEF2] rounded-3xl p-6 md:p-8 shadow-xl border border-[#256D45]/10">
            {loading ? (
              <div className="flex justify-center py-20">
                <span className="text-[#256D45] text-xl font-bold">กำลังโหลดข้อมูล...</span>
              </div>
            ) : (
              <div className="w-full overflow-hidden flex flex-col">
                <Table
                  columns={columns}
                  dataSource={filteredOrders}
                  rowKey="id"
                  pagination={{ pageSize: 10, position: ['bottomCenter'] }}
                  scroll={{ x: 1000 }}
                  className="w-full"
                />

                {/* --- คำอธิบายสีสถานะ --- */}
                <div className="mt-6 self-center md:self-end bg-[#E8F3EE] border-2 border-[#256D45]/20 rounded-2xl px-6 py-3 flex flex-wrap gap-4 md:gap-6 justify-center items-center shadow-sm">
                  <span className="font-bold text-gray-600 text-sm md:text-base mr-2">คำอธิบายสถานะ:</span>
                  <div className="flex items-center gap-2 text-sm md:text-base font-bold text-[#256D45]">
                    <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-sm"></span> รอยืนยัน
                  </div>
                  <div className="flex items-center gap-2 text-sm md:text-base font-bold text-[#256D45]">
                    <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 shadow-sm"></span> รอจัดส่ง
                  </div>
                  <div className="flex items-center gap-2 text-sm md:text-base font-bold text-[#256D45]">
                    <span className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-sm"></span> สำเร็จ
                  </div>
                  <div className="flex items-center gap-2 text-sm md:text-base font-bold text-[#256D45]">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm"></span> ยกเลิก
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </ConfigProvider>
  );
}