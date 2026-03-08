import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Edit, User } from 'lucide-react';
import { Table, ConfigProvider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import api from '../services/api';

const Profile = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    displayUsername: 'กำลังโหลด...', // สำหรับแสดงใต้รูปโปรไฟล์
    name: 'กำลังโหลด...',           // สำหรับแสดงในข้อมูล (ชื่อ-สกุล จริง)
    phone: '-',
    email: '-',
    address: '-'
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('pending_confirm');
  const [tableSort, setTableSort] = useState<'descend' | 'ascend'>('descend');

  useEffect(() => {
    const fetchUserData = async () => {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      // Check if user is authenticated
      console.log('Profile page - checking auth:', { userStr: !!userStr, token: !!token });
      
      if (!token) {
        console.warn('No token found, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }
      const addressStr = localStorage.getItem('shippingAddress');

      let currentEmail = '-';
      let currentUsername = 'ผู้ใช้งาน';
      let currentName = 'ไม่ได้ระบุชื่อ';
      let currentPhone = '-';
      let currentAddress = 'ยังไม่ได้ระบุที่อยู่จัดส่ง';

      // 1. จัดการที่อยู่ก่อน (เหมือนเดิม)
      if (addressStr) {
        const addr = JSON.parse(addressStr);
        if (addr.nameSurname) currentName = addr.nameSurname;
        if (addr.phone) currentPhone = addr.phone;

        const parts = [
          addr.houseNumber ? `เลขที่: ${addr.houseNumber}` : '',
          addr.streetSoi ? `ถนน/ซอย: ${addr.streetSoi}` : '',
          addr.subDistrict ? `ตำบล: ${addr.subDistrict}` : '',
          addr.district ? `อำเภอ: ${addr.district}` : '',
          addr.province ? `จังหวัด: ${addr.province}` : '',
          addr.postalCode ? `รหัสไปรษณีย์: ${addr.postalCode}` : ''
        ].filter(Boolean);

        if (parts.length > 0) {
          currentAddress = parts.join(' ');
        }
      }

      // 2. ดึงข้อมูล User เบื้องต้น และยิง API ไปขอข้อมูลเต็ม
      if (userStr) {
        const localUser = JSON.parse(userStr);
        console.log('Local user data:', localUser);
        console.log('User ID for API call:', localUser.id);

        try {
          // Use axios instance to ensure correct baseURL and Authorization header
          console.log('Fetching user via axios api.get:', `/users/${localUser.id}`);
          const userRes = await api.get(`/users/${localUser.id}`);
          console.log('User response:', userRes.data);

          if (userRes && userRes.data) {
            const apiData = userRes.data;
            // นำข้อมูลจาก API มาอัปเดตทับ
            currentEmail = apiData.email || currentEmail;
            currentUsername = apiData.username || localUser.name;

            // ถ้าใน API มีชื่อ-นามสกุล หรือเบอร์โทรด้วย จะให้มันเอาจาก API ก็ได้
            if (apiData.name) currentName = apiData.name;
            if (apiData.phone) currentPhone = apiData.phone;
          } else {
            console.error('ดึงข้อมูลจาก API ไม่สำเร็จ (ไม่มีข้อมูลผู้ใช้)');
          }

          // ดึงคำสั่งซื้อของ user คนนี้
          console.log('Fetching orders from:', `/api/admin/orders/my-orders`);
          const ordersRes = await api.get(`/api/admin/orders/my-orders`);
          console.log('Orders response:', ordersRes.data);
          if (ordersRes.data && Array.isArray(ordersRes.data)) {
            setOrders(ordersRes.data);
          } else {
            console.warn('Orders response is not an array:', ordersRes.data);
            setOrders([]);
          }
        } catch (error: any) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ:", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method
          });
          // If it's a 401 error, redirect to login
          if (error.response?.status === 401) {
            console.warn('User not authenticated, redirecting to login');
            navigate('/login', { replace: true });
            return;
          }
        } finally {
          setLoadingOrders(false);
        }
      } else {
        setLoadingOrders(false);
      }

      // 3. อัปเดต State ทีเดียว
      setUserData({
        displayUsername: currentUsername,
        name: currentName,
        phone: currentPhone,
        email: currentEmail,
        address: currentAddress
      });
    };

    fetchUserData();
  }, []);

  const getFilteredOrders = () => {
    if (activeTab === 'pending_confirm') return orders.filter(o => o.status === 'pending_confirm' || !o.status);
    if (activeTab === 'pending_delivery') return orders.filter(o => o.status === 'pending_delivery');
    if (activeTab === 'pending_received') return orders.filter(o => o.status === 'pending_received');
    if (activeTab === 'completed') return orders.filter(o => o.status === 'completed');
    if (activeTab === 'cancelled') return orders.filter(o => o.status === 'cancelled');
    return [];
  };

  const getTableColumns = (): ColumnsType<any> => {
    const baseColumns: ColumnsType<any> = [
      {
        title: 'รหัสคำสั่งซื้อ',
        dataIndex: 'orderNumber',
        key: 'orderNumber',
        width: '20%',
        align: 'left',
        sorter: (a, b) => {
          const dateAStr = a.createdAt || a.orderDate || a.created_at || a.id;
          const dateBStr = b.createdAt || b.orderDate || b.created_at || b.id;

          let dateA = new Date();
          let dateB = new Date();

          if (dateAStr && !isNaN(Date.parse(dateAStr))) dateA = new Date(dateAStr);
          if (dateBStr && !isNaN(Date.parse(dateBStr))) dateB = new Date(dateBStr);

          // If no parsed date, fallback to localeCompare of string
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            const idA = String(dateAStr || '');
            const idB = String(dateBStr || '');
            return idA.localeCompare(idB);
          }

          return dateA.getTime() - dateB.getTime();
        },
        sortOrder: tableSort,
        sortDirections: ['descend', 'ascend'],
        render: (_, record) => {
          // If the backend has a creation date, use it; otherwise fallback to something safe
          const dateStr = record.createdAt || record.orderDate || record.created_at;
          let d = new Date();
          if (dateStr) {
            d = new Date(dateStr);
          }

          const day = d.getDate().toString().padStart(2, '0');
          // Month logic: J(Jan), F(Feb), M(Mar), A(Apr), M(May), J(Jun), J(Jul), A(Aug), S(Sep), O(Oct), N(Nov), D(Dec)
          const monthChars = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
          const monthChar = monthChars[d.getMonth()];
          // Thai Year (BE)
          const yearBE = d.getFullYear() + 543;
          const shortYear = yearBE.toString().slice(-2);

          const hours = d.getHours().toString().padStart(2, '0');
          const minutes = d.getMinutes().toString().padStart(2, '0');

          const formattedId = `${day}${monthChar}${shortYear}${hours}${minutes}`;

          return <span style={{ color: '#215A36', fontWeight: 600, backgroundColor: 'transparent' }}>#{formattedId}</span>;
        },
      },
      {
        title: 'ชื่อสินค้า',
        key: 'products',
        width: '35%',
        align: 'left',
        render: (_, record) => (
          <div style={{ color: '#215A36', fontWeight: 600 }}>
            {record.products?.map((p: any) => p.name).join(', ')}
          </div>
        ),
      },
      {
        title: 'จำนวน',
        key: 'quantity',
        width: '10%',
        align: 'center',
        render: (_, record) => {
          const totalQty = record.products?.reduce((sum: number, p: any) => sum + p.quantity, 0) || 0;
          return <span style={{ color: '#215A36', fontWeight: 600 }}>{totalQty.toLocaleString()}</span>;
        },
      },
      {
        title: 'ราคารวม',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        width: '15%',
        align: 'center',
        render: (text) => <span style={{ color: '#215A36', fontWeight: 600 }}>฿ {text}</span>,
      },
    ];

    if (activeTab === 'pending_confirm') {
      return [
        ...baseColumns,
        {
          title: 'จัดการ',
          key: 'action',
          align: 'center',
          render: () => (
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors">
              ยกเลิก
            </button>
          )
        }
      ];
    }

    if (activeTab === 'pending_delivery') {
      return baseColumns;
    }

    if (activeTab === 'pending_received') {
      return [
        ...baseColumns,
        {
          title: 'หมายเลขพัสดุ',
          dataIndex: 'trackingNumber',
          key: 'trackingNumber',
          align: 'center',
          render: (text) => text ? (
            <a
              href={`https://track.thailandpost.co.th/?trackNumber=${text}`}
              target="_blank"
              rel="noopener noreferrer"
              title="เช็คพัสดุ"
              className="text-[#256D45] font-bold underline hover:text-[#1a5434] bg-[#E8F3EE] px-3 py-1 rounded-lg border border-[#256D45]/20 inline-block"
            >
              {text}
            </a>
          ) : <span style={{ color: '#215A36', fontWeight: 600 }}>-</span>,
        },
        {
          title: 'จัดการ',
          key: 'action',
          align: 'center',
          render: () => (
            <button
              onClick={() => setActiveTab('completed')}
              className="bg-[#256D45] hover:bg-[#1a5434] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
            >
              ยืนยันรับสินค้า
            </button>
          )
        }
      ];
    }

    if (activeTab === 'completed') {
      return [
        ...baseColumns,
        {
          title: 'จัดการ',
          key: 'action',
          align: 'center',
          render: () => (
            <button className="border-2 border-[#256D45] text-[#256D45] hover:bg-green-50 px-6 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors">
              รีวิว
            </button>
          )
        }
      ];
    }

    // cancelled / failed
    return [
      ...baseColumns,
      {
        title: 'สาเหตุ',
        dataIndex: 'cancelReason',
        key: 'cancelReason',
        align: 'center',
        render: (text) => <span className="text-red-500 font-bold text-sm">{text || 'ยกเลิกเอง / สลิปไม่ถูกต้อง'}</span>,
      },
      {
        title: 'จัดการ',
        key: 'action',
        align: 'center',
        render: () => (
          <button className="bg-[#256D45] hover:bg-[#1a5434] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors whitespace-nowrap">
            สั่งซื้ออีกครั้ง
          </button>
        )
      }
    ];
  };

  const tableColumns = getTableColumns();

  return (
    <div className="bg-[#DCEDC1] font-['Prompt'] text-[#256D45] px-6! py-15! md:px-6 md:py-10">
      <div className="max-w-6xl mx-auto w-full">

        {/* 🌟 ย้ายหัวข้อมาตรงกลางด้านบนสุด */}
        <h1 className="text-4xl font-semibold text-[#256D45] text-center mb-10 mt-4 tracking-wide">โปรไฟล์ลูกค้า</h1>

        <div className="flex flex-col md:flex-row gap-8">

          {/* === คอลัมน์ซ้าย: รูปโปรไฟล์และเมนู === */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-100">
              {/* รูปโปรไฟล์ */}
              <div className="p-8 flex flex-col items-center border-b border-gray-100">
                <div className="w-32 h-32 bg-gray-100 rounded-full mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                  <User size={64} className="text-gray-400" />
                </div>
                {/* 🌟 แสดง Username ใต้รูป */}
                <h2 className="text-xl font-bold text-[#256D45] text-center">{userData.displayUsername}</h2>
              </div>

              {/* เมนูด้านซ้าย */}
              <div className="flex flex-col">
                <button
                  onClick={() => navigate('/favorites')}
                  className="flex items-center justify-center gap-2 py-4! bg-[#256D45] text-white font-medium hover:bg-[#1a5434] transition-colors"
                >
                  <Heart size={20} /> รายการโปรด
                </button>
                <button
                  onClick={() => navigate('/edit-profile')}
                  className="flex items-center justify-center gap-2 py-4! bg-white text-[#256D45] font-medium hover:bg-gray-50 transition-colors border-b border-gray-200"
                >
                  <Edit size={20} /> แก้ไขข้อมูล
                </button>
              </div>
            </div>
          </div>

          {/* === คอลัมน์ขวา: ข้อมูลและสถานะ === */}
          <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col gap-6">

            {/* การ์ดข้อมูลส่วนตัว */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
              <div className="flex flex-col gap-5 text-left">
                <div className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] border-b border-gray-100 pb-4">
                  <span className="font-bold text-gray-500">ชื่อ:</span>
                  <span className="font-medium text-gray-800">{userData.name}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] border-b border-gray-100 pb-4">
                  <span className="font-bold text-gray-500">เบอร์:</span>
                  <span className="font-medium text-gray-800">{userData.phone}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] border-b border-gray-100 pb-4">
                  <span className="font-bold text-gray-500">อีเมล:</span>
                  <span className="font-medium text-gray-800">{userData.email}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr]">
                  <span className="font-bold text-gray-500">ที่อยู่:</span>
                  <span className="font-medium text-gray-800 leading-relaxed">{userData.address}</span>
                </div>
              </div>
            </div>

            {/* การ์ดสถานะคำสั่งซื้อ */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-[#256D45] mb-6 text-left">สถานะคำสั่งซื้อของฉัน</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">

                {/* 1. รอยืนยัน */}
                <div
                  onClick={() => setActiveTab('pending_confirm')}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center hover:shadow-md transition-all cursor-pointer ${activeTab === 'pending_confirm' ? 'bg-[#256D45] border-[#256D45]' : 'bg-white border-gray-200 hover:border-[#256D45]'
                    }`}
                >
                  <span className={`text-4xl font-bold mb-2 ${activeTab === 'pending_confirm' ? 'text-white' : 'text-[#256D45]'}`}>
                    {orders.filter(o => o.status === 'pending_confirm' || !o.status).length}
                  </span>
                  <span className={`text-sm font-medium ${activeTab === 'pending_confirm' ? 'text-white' : 'text-gray-600'}`}>รอยืนยัน</span>
                </div>

                {/* 2. รอจัดส่ง */}
                <div
                  onClick={() => setActiveTab('pending_delivery')}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center hover:shadow-md transition-all cursor-pointer ${activeTab === 'pending_delivery' ? 'bg-[#256D45] border-[#256D45]' : 'bg-white border-gray-200 hover:border-[#256D45]'
                    }`}
                >
                  <span className={`text-4xl font-bold mb-2 ${activeTab === 'pending_delivery' ? 'text-white' : 'text-[#256D45]'}`}>
                    {orders.filter(o => o.status === 'pending_delivery').length}
                  </span>
                  <span className={`text-sm font-medium ${activeTab === 'pending_delivery' ? 'text-white' : 'text-gray-600'}`}>รอจัดส่ง</span>
                </div>

                {/* 3. รอได้รับ */}
                <div
                  onClick={() => setActiveTab('pending_received')}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center hover:shadow-md transition-all cursor-pointer ${activeTab === 'pending_received' ? 'bg-[#256D45] border-[#256D45]' : 'bg-white border-gray-200 hover:border-[#256D45]'
                    }`}
                >
                  <span className={`text-4xl font-bold mb-2 ${activeTab === 'pending_received' ? 'text-white' : 'text-[#256D45]'}`}>
                    {orders.filter(o => o.status === 'pending_received').length}
                  </span>
                  <span className={`text-sm font-medium ${activeTab === 'pending_received' ? 'text-white' : 'text-gray-600'}`}>รอได้รับ</span>
                </div>

                {/* 4. สำเร็จ */}
                <div
                  onClick={() => setActiveTab('completed')}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center hover:shadow-md transition-all cursor-pointer ${activeTab === 'completed' ? 'bg-[#256D45] border-[#256D45]' : 'bg-white border-gray-200 hover:border-[#256D45]'
                    }`}
                >
                  <span className={`text-4xl font-bold mb-2 ${activeTab === 'completed' ? 'text-white' : 'text-[#256D45]'}`}>
                    {orders.filter(o => o.status === 'completed').length}
                  </span>
                  <span className={`text-sm font-medium ${activeTab === 'completed' ? 'text-white' : 'text-gray-600'}`}>สำเร็จ</span>
                </div>

                {/* 5. ไม่สำเร็จ */}
                <div
                  onClick={() => setActiveTab('cancelled')}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center hover:shadow-md transition-all cursor-pointer ${activeTab === 'cancelled' ? 'bg-red-500 border-red-500' : 'bg-red-50 border-red-200 hover:border-red-500'
                    }`}
                >
                  <span className={`text-4xl font-bold mb-2 ${activeTab === 'cancelled' ? 'text-white' : 'text-red-500'}`}>
                    {orders.filter(o => o.status === 'cancelled').length}
                  </span>
                  <span className={`text-sm font-medium ${activeTab === 'cancelled' ? 'text-white' : 'text-red-500'}`}>ไม่สำเร็จ</span>
                </div>

              </div>

              {/* ตารางข้อมูล - แสดงผลตาม tab ที่ถูกเลือก */}
              <div className="w-full">
                <ConfigProvider
                  theme={{
                    components: {
                      Table: {
                        colorBgContainer: 'transparent',
                        headerBg: '#FDFDF2',
                        headerColor: '#215A36',
                        colorText: '#215A36',
                        borderColor: '#215A36',
                        borderRadius: 12,
                        headerBorderRadius: 12,
                      },
                    },
                    token: {
                      fontFamily: 'Prompt, sans-serif',
                      fontWeightStrong: 700,
                    }
                  }}
                >
                  <div style={{ backgroundColor: '#FDFDF2', borderRadius: '12px', overflow: 'hidden' }}>
                    <style>
                      {`
                            .ant-table-wrapper .ant-table {
                              border: none !important;
                            }
                            .ant-table-thead > tr > th {
                              border-bottom: 2px solid #215A36 !important;
                              border-inline-end: none !important;
                              background-color: #FDFDF2 !important;
                            }
                            .ant-table-thead > tr > th.ant-table-column-sort {
                              background-color: #FDFDF2 !important;
                            }
                            .ant-table-tbody > tr > td {
                              border-bottom: 1px solid #e5e7eb !important;
                              border-inline-end: none !important;
                              padding: 12px 16px !important;
                            }
                            /* Hide hover row color to keep styling consistent */
                            .ant-table-wrapper .ant-table-tbody > tr.ant-table-row:hover > td, 
                            .ant-table-wrapper .ant-table-tbody > tr > td.ant-table-cell-row-hover {
                              background: transparent !important;
                            }
                            
                            /* Add active style for sorting header */
                            .ant-table-thead th.ant-table-column-has-sorters:hover {
                                background-color: #FFFEF2 !important;
                            }
                            /* ลบสีพื้นหลังของคอลัมน์ที่ถูกจัดเรียง (Sorting column) ให้เป็นสีครีมปกติ */
                            .ant-table-wrapper .ant-table-tbody > tr > td.ant-table-column-sort {
                                background-color: #FDFDF2 !important;
                            }

                            /* ป้องกันสีพื้นหลังของแถวที่ถูกเลือก (Selected row) ถ้ามี */
                            .ant-table-wrapper .ant-table-tbody > tr.ant-table-row-selected > td {
                                background-color: #FDFDF2 !important;
}
                        `}
                    </style>
                    <Table
                      loading={loadingOrders}
                      dataSource={getFilteredOrders()}
                      columns={tableColumns}
                      rowKey="id"
                      bordered={false}
                      pagination={false}
                      onChange={(_pagination, _filters, sorter: any) => {
                        if (sorter && sorter.order) {
                          setTableSort(sorter.order);
                        } else {
                          // Prevent cancel state by toggling to the opposite
                          setTableSort(tableSort === 'descend' ? 'ascend' : 'descend');
                        }
                      }}
                      locale={{
                        triggerAsc: 'คลิกเพื่อเรียงจากน้อยไปมาก',
                        cancelSort: 'คลิกเพื่อเรียงจากมากไปน้อย',
                        emptyText: (
                          <div className="flex flex-col items-center justify-center py-10">
                            <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg" className="text-gray-300 mb-4 text-4xl">
                              <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <ellipse fill="#f5f5f5" cx="32" cy="33" rx="32" ry="7"></ellipse>
                                <g fillRule="nonzero" stroke="#d9d9d9">
                                  <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                  <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                              </g>
                            </svg>
                            <span className="text-gray-400 font-medium">ไม่พบข้อมูลคำสั่งซื้อ</span>
                          </div>
                        )
                      }}
                    />
                  </div>
                </ConfigProvider>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;