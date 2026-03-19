import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Edit, User } from 'lucide-react';
import { Table, ConfigProvider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import api from '../services/api';
import Swal from 'sweetalert2';

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
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      // Check if user is authenticated
      console.log('Profile page - checking auth:', { userStr: !!userStr, token: !!token });
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      // ✅ เช็ค localStorage ว่า parse ได้จริงไหม
      let localUser;
      try {
        localUser = userStr ? JSON.parse(userStr) : null;
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        return;
      }

      // ✅ เช็คว่ามี id จริงไหม
      if (!localUser?.id) {
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
      try {
        // Use axios instance to ensure correct baseURL and Authorization header
        const userRes = await api.get(`/users/${localUser.id}`);

        if (userRes && userRes.data) {
          const apiData = userRes.data;
          // นำข้อมูลจาก API มาอัปเดตทับ
          currentEmail = apiData.email || currentEmail;
          currentUsername = apiData.username || localUser.name;

          // ถ้าใน API มีชื่อ-นามสกุล หรือเบอร์โทรด้วย จะให้มันเอาจาก API ก็ได้
          if (apiData.name) currentName = apiData.name;
          if (apiData.phone) currentPhone = apiData.phone;
        }

        // ดึงคำสั่งซื้อของ user คนนี้
        const ordersRes = await api.get(`/api/admin/orders/my-orders`);
        console.log('📦 My Orders Response:', ordersRes.data);
        if (ordersRes.data && Array.isArray(ordersRes.data)) {
          setOrders(ordersRes.data);
        } else {
          setOrders([]);
        }

        // 3. อัปเดต State ทีเดียว
        setUserData({
          displayUsername: currentUsername,
          name: currentName,
          phone: currentPhone,
          email: currentEmail,
          address: currentAddress
        });
      } catch (error: any) {
        // ✅ 401 — token หมดอายุ
        if (error.response?.status === 401) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
          return;
        }

        // ✅ 403 — เข้าถึงข้อมูลคนอื่น
        if (error.response?.status === 403) {
          Swal.fire({
            title: 'ไม่มีสิทธิ์เข้าถึง',
            text: 'คุณไม่มีสิทธิ์ดูข้อมูลนี้',
            icon: 'error',
            confirmButtonColor: '#256D45',
            confirmButtonText: 'ตกลง',
          });
          navigate('/', { replace: true });
          return;
        }

        // ✅ 500 — server error
        if (error.response?.status === 500) {
          Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonColor: '#256D45',
            confirmButtonText: 'ตกลง',
          });
        }
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserData();
  }, []);

  const handleBuyAgain = (order: any) => {
    try {
      // 1. Get current cart
      const savedCart = localStorage.getItem('cart');
      let cartItems = savedCart ? JSON.parse(savedCart) : [];

      // 2. Add products from order to cart
      const orderProducts = order.products || [];

      orderProducts.forEach((product: any) => {
        const productId = product.productId || product.id;
        const existingItemIndex = cartItems.findIndex((item: any) => item.id === productId);

        if (existingItemIndex > -1) {
          // Increase quantity if already in cart
          cartItems[existingItemIndex].quantity += (product.quantity || 1);
        } else {
          // Add new item
          cartItems.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: product.quantity || 1,
            imageUrl: product.imageUrl || '',
            isPromotion: product.isPromotion || false,
            promotionPrice: product.promotionPrice || null,
            stockQuantity: product.stockQuantity || 100 // Fallback
          });
        }
      });

      // 3. Save back to localStorage
      localStorage.setItem('cart', JSON.stringify(cartItems));

      // 4. Trigger storage event for other components (like Navbar/Cart)
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(cartItems)
      }));

      // 5. Navigate to cart
      navigate('/cart');
    } catch (error) {
      console.error('Error in handleBuyAgain:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเพิ่มสินค้าลงในรถเข็นได้',
        icon: 'error',
        confirmButtonColor: '#256D45',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: 'ยืนยันการยกเลิก?',
      text: 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#256D45',
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่'
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/api/admin/orders/${orderId}/cancel`);

        // อัปเดต state ทันที
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: 'cancelled', cancelReason: 'ยกเลิกเอง' } : order
          )
        );

        Swal.fire({
          title: 'ยกเลิกสำเร็จ!',
          text: 'คำสั่งซื้อของคุณถูกยกเลิกเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#256D45',
        });

        // ย้ายไป tab ยกเลิก
        setActiveTab('cancelled');

      } catch (error: any) {
        console.error('Error cancelling order:', error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถยกเลิกคำสั่งซื้อได้ในขณะนี้',
          icon: 'error',
          confirmButtonColor: '#256D45',
        });
      }
    }
  };

  const handleConfirmReceived = async (orderId: string) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/received`);

      // อัปเดต state ทันที
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: 'completed' } : order
        )
      );

      Swal.fire({
        title: 'ยืนยันสำเร็จ!',
        text: 'ขอบคุณที่ใช้บริการครับ',
        icon: 'success',
        confirmButtonColor: '#256D45',
      });

      // ย้ายไป tab สำเร็จ
      setActiveTab('completed');

    } catch (error: any) {
      console.error('Error confirming received:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'ไม่สามารถดำเนินการได้ในขณะนี้',
        icon: 'error',
        confirmButtonColor: '#256D45',
      });
    }
  };

  const { filteredOrders, tableColumns, counts } = useMemo(() => {
    // 1. Calculate counts for each status
    const pendingConfirmCount = orders.filter(o => o.status === 'pending_confirm' || !o.status).length;
    const pendingDeliveryCount = orders.filter(o => o.status === 'pending_delivery').length;
    const pendingReceivedCount = orders.filter(o => o.status === 'pending_received').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

    // 2. Filter orders based on activeTab
    let filtered;
    if (activeTab === 'pending_confirm') filtered = orders.filter(o => o.status === 'pending_confirm' || !o.status);
    else if (activeTab === 'pending_delivery') filtered = orders.filter(o => o.status === 'pending_delivery');
    else if (activeTab === 'pending_received') filtered = orders.filter(o => o.status === 'pending_received');
    else if (activeTab === 'completed') filtered = orders.filter(o => o.status === 'completed');
    else if (activeTab === 'cancelled') filtered = orders.filter(o => o.status === 'cancelled');
    else filtered = [];

    // 3. Define columns
    const baseColumns: ColumnsType<any> = [
      {
        title: 'รหัสคำสั่งซื้อ',
        dataIndex: 'orderNumber',
        key: 'orderNumber',
        width: '18%',
        align: 'left',
        sorter: (a, b) => {
          const dateAStr = a.createdAt || a.orderDate || a.created_at || a.id;
          const dateBStr = b.createdAt || b.orderDate || b.created_at || b.id;

          let dateA = new Date();
          let dateB = new Date();

          if (dateAStr && !isNaN(Date.parse(dateAStr))) dateA = new Date(dateAStr);
          if (dateBStr && !isNaN(Date.parse(dateBStr))) dateB = new Date(dateBStr);

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
          return <span style={{ color: '#215A36', fontWeight: 600, backgroundColor: 'transparent' }} className="whitespace-nowrap">#{record.orderNumber || 'ไม่มีรหัส'}</span>;
        },
      },
      {
        title: 'ชื่อสินค้า',
        key: 'products',
        width: '25%',
        align: 'left',
        render: (_, record) => (
          <div className="flex flex-col gap-1.5 py-1">
            {record.products?.map((p: any, idx: number) => (
              <div key={idx} className="text-[#215A36] font-semibold text-xs md:text-sm leading-tight">
                <span className="opacity-70 mr-1">•</span>
                {p.name}
                <span className="text-gray-400 font-normal ml-2">x{p.quantity}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: 'จำนวน',
        key: 'quantity',
        width: '9%',
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
        width: '13%',
        align: 'center',
        render: (text) => <span style={{ color: '#215A36', fontWeight: 600 }} className="whitespace-nowrap">฿ {text}</span>,
      },
    ];

    let cols = baseColumns;
    if (activeTab === 'pending_confirm') {
      cols = [
        ...baseColumns,
        {
          title: 'จัดการ',
          key: 'action',
          width: '20%',
          align: 'center',
          render: (_, record) => (
            <button
              onClick={() => handleCancelOrder(record.id)}
              className="border-2 border-red-500 text-red-500 px-4! py-1! rounded-full text-sm font-bold hover:bg-red-500 hover:text-white shadow-sm transition-all whitespace-nowrap"
            >
              ยกเลิก
            </button>
          )
        }
      ];
    } else if (activeTab === 'pending_received') {
      cols = [
        ...baseColumns,
        {
          title: 'หมายเลขพัสดุ',
          dataIndex: 'trackingNumber',
          key: 'trackingNumber',
          width: '17%',
          align: 'center',
          render: (text, record) => text ? (
            <a
              href={`https://www.aftership.com/track/${record.courierSlug}/${text}`}
              target="_blank"
              rel="noopener noreferrer"
              title="เช็คพัสดุ"
              className="text-[#256D45] font-bold underline hover:text-[#1a5434] bg-[#E8F3EE] px-3 py-1 rounded-lg border border-[#256D45]/20 inline-block whitespace-nowrap"
            >
              {text}
            </a>
          ) : <span style={{ color: '#215A36', fontWeight: 600 }}>-</span>,
        },
        {
          title: 'จัดการ',
          key: 'action',
          width: '18%',
          align: 'center',
          render: (_, record) => (
            <button
              onClick={() => handleConfirmReceived(record.id)}
              className="border-2 border-[#256D45] text-[#256D45] px-6! py-1! rounded-full text-sm font-bold hover:bg-[#256D45] hover:text-white shadow-sm transition-colors whitespace-nowrap"
            >
              ยืนยันได้รับสินค้า
            </button>
          )
        }
      ];
    } else if (activeTab === 'completed') {
      cols = [
        ...baseColumns,
        {
          title: 'จัดการ',
          key: 'action',
          width: '35%',
          align: 'center',
          render: (_, record) => {
            return (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => navigate(`/profile/review/${record.orderNumber || record.id}`)}
                  className="border-2 border-[#256D45] text-[#256D45] px-6! py-1! rounded-full text-sm font-bold hover:bg-[#256D45] hover:text-white shadow-sm transition-colors whitespace-nowrap"
                >
                  รีวิว
                </button>
                <button
                  onClick={() => handleBuyAgain(record)}
                  className="border-2 border-[#256D45] text-[#256D45] px-6! py-1! rounded-full text-sm font-bold hover:bg-[#256D45] hover:text-white shadow-sm transition-colors whitespace-nowrap"
                >
                  สั่งซื้ออีกครั้ง
                </button>
              </div>
            );
          }
        }
      ];
    } else if (activeTab === 'cancelled') {
      cols = [
        ...baseColumns,
        {
          title: 'สาเหตุ',
          dataIndex: 'cancelReason',
          key: 'cancelReason',
          width: '15%',
          align: 'center',
          render: (text) => <span className="text-red-500 font-bold text-sm">{text || 'ยกเลิกโดยระบบ'}</span>,
        },
        {
          title: 'จัดการ',
          key: 'action',
          width: '20%',
          align: 'center',
          render: (_, record) => (
            <button
              onClick={() => handleBuyAgain(record)}
              className="border-2 border-[#256D45] text-[#256D45] px-6! py-1! rounded-full text-sm font-bold hover:bg-[#256D45] hover:text-white shadow-sm transition-colors whitespace-nowrap"
            >
              สั่งซื้ออีกครั้ง
            </button>
          )
        }
      ];
    }

    return {
      filteredOrders: filtered,
      tableColumns: cols,
      counts: {
        pendingConfirm: pendingConfirmCount,
        pendingDelivery: pendingDeliveryCount,
        pendingReceived: pendingReceivedCount,
        completed: completedCount,
        cancelled: cancelledCount,
      }
    };
  }, [orders, activeTab, tableSort, navigate]);

  return (
    <div className="bg-[#DCEDC1] text-[#256D45] px-6! py-15! md:px-6 md:py-10">
      <div className="max-w-6xl mx-auto w-full">

        {/* 🌟 ย้ายหัวข้อมาตรงกลางด้านบนสุด */}
        <h1 className="text-4xl font-semibold text-[#256D45] text-center mb-10 mt-4 tracking-wide">โปรไฟล์ลูกค้า</h1>

        <div className="flex flex-col md:flex-row gap-8">

          {/* === คอลัมน์ซ้าย: รูปโปรไฟล์และเมนู === */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4 md:sticky md:top-24 h-fit">
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
                    {counts.pendingConfirm}
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
                    {counts.pendingDelivery}
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
                    {counts.pendingReceived}
                  </span>
                  <span className={`text-sm font-medium ${activeTab === 'pending_received' ? 'text-white' : 'text-gray-600'}`}>รอได้รับสินค้า</span>
                </div>

                {/* 4. สำเร็จ */}
                <div
                  onClick={() => setActiveTab('completed')}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center hover:shadow-md transition-all cursor-pointer ${activeTab === 'completed' ? 'bg-[#256D45] border-[#256D45]' : 'bg-white border-gray-200 hover:border-[#256D45]'
                    }`}
                >
                  <span className={`text-4xl font-bold mb-2 ${activeTab === 'completed' ? 'text-white' : 'text-[#256D45]'}`}>
                    {counts.completed}
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
                    {counts.cancelled}
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
                      dataSource={filteredOrders}
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