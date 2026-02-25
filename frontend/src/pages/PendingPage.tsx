import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Typography, ConfigProvider } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderDate: string;
  status: 'pending_confirm' | 'pending_delivery' | 'pending_received' | 'completed' | 'failed';
  address?: string;
  phone?: string;
}

const PendingPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get page title and API endpoint based on type
  const getPageConfig = () => {
    switch (type) {
      case 'confirm':
        return {
          title: 'รอยืนยัน',
          apiEndpoint: '/api/admin/orders/pending-confirm',
          status: 'pending_confirm' as const,
          description: 'รายการที่ลูกค้าสั่งซื้อแล้วแต่ยังไม่ได้ยืนยัน'
        };
      case 'delivery':
        return {
          title: 'รอจัดส่ง',
          apiEndpoint: '/api/admin/orders/pending-delivery',
          status: 'pending_delivery' as const,
          description: 'รายการที่ยืนยันแล้วและรอการจัดส่ง'
        };
      case 'received':
        return {
          title: 'จัดส่งแล้ว',
          apiEndpoint: '/api/admin/orders/pending-received',
          status: 'pending_received' as const,
          description: 'รายการที่จัดส่งแล้วและรอให้ลูกค้ารับสินค้า'
        };
      case 'completed':
        return {
          title: 'สำเร็จ',
          apiEndpoint: '/api/admin/orders/completed',
          status: 'completed' as const,
          description: 'รายการที่ดำเนินการเสร็จสิ้นแล้ว'
        };
      case 'failed':
        return {
          title: 'ไม่สำเร็จ',
          apiEndpoint: '/api/admin/orders/failed',
          status: 'failed' as const,
          description: 'รายการที่ไม่สามารถดำเนินการได้'
        };
      default:
        return {
          title: 'รายการที่รอดำเนินการ',
          apiEndpoint: '/api/admin/orders/all-pending',
          status: 'pending_confirm' as const,
          description: 'รายการทั้งหมดที่รอดำเนินการ'
        };
    }
  };

  const pageConfig = getPageConfig();

  useEffect(() => {
    fetchOrders();
  }, [type]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(pageConfig.apiEndpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('ไม่สามารถโหลดข้อมูลรายการได้ กรุณาลองใหม่');
      setOrders([]); // Clear orders on error
    } finally {
      setLoading(false);
    }
  };

  // Transform data for Ant Design table
  const dataSource = orders.map((order) => ({
    key: order.id,
    orderId: `#${order.orderNumber}`,
    productName: order.products.map(p => p.name).join(', '),
    quantity: order.products.reduce((sum, p) => sum + p.quantity, 0),
    customerName: order.customerName,
    address: order.address,
    phone: order.phone,
    orderDate: order.orderDate,
    status: order.status,
  }));

  // Table columns configuration based on page type
  const getColumns = () => {
    const baseColumns = [
      {
        title: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>รหัสคำสั่งซื้อ</span>
            <DownOutlined style={{ fontSize: '12px', strokeWidth: 2 }} />
          </div>
        ),
        dataIndex: 'orderId',
        key: 'orderId',
        width: '25%',
        align: 'left' as const,
        render: (text: string) => <span style={{ color: '#215A36', fontWeight: 600 }}>{text}</span>,
      },
      {
        title: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ชื่อสินค้า</span>
            <DownOutlined style={{ fontSize: '12px' }} />
          </div>
        ),
        dataIndex: 'productName',
        key: 'productName',
        width: '45%',
        align: 'left' as const,
        render: (text: string) => <span style={{ color: '#215A36', fontWeight: 600 }}>{text}</span>,
      },
      {
        title: 'จำนวน',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'center' as const,
        width: '30%',
        render: (qty: number) => <span style={{ color: '#215A36', fontWeight: 600 }}>{qty.toLocaleString()}</span>,
      },
    ];

    // Add specific columns based on page type
    switch (type) {
      case 'confirm':
        return [
          ...baseColumns,
          {
            title: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>ลูกค้า</span>
                <DownOutlined style={{ fontSize: '12px' }} />
              </div>
            ),
            dataIndex: 'customerName',
            key: 'customerName',
            width: '20%',
            align: 'left' as const,
            render: (text: string) => <span style={{ color: '#215A36', fontWeight: 600 }}>{text}</span>,
          },
          {
            title: 'สถานะ',
            key: 'status',
            align: 'center' as const,
            width: '15%',
            render: () => (
              <span 
                style={{ 
                  backgroundColor: '#52c41a', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                รอยืนยัน
              </span>
            ),
          },
        ];
      case 'delivery':
        return [
          ...baseColumns,
          {
            title: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>ที่อยู่จัดส่ง</span>
                <DownOutlined style={{ fontSize: '12px' }} />
              </div>
            ),
            dataIndex: 'address',
            key: 'address',
            width: '25%',
            align: 'left' as const,
            render: (text: string) => <span style={{ color: '#215A36', fontWeight: 600, fontSize: '12px' }}>{text}</span>,
          },
          {
            title: 'สถานะ',
            key: 'status',
            align: 'center' as const,
            width: '15%',
            render: () => (
              <span 
                style={{ 
                  backgroundColor: '#1890ff', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                รอจัดส่ง
              </span>
            ),
          },
        ];
      case 'received':
        return [
          ...baseColumns,
          {
            title: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>เบอร์โทร</span>
                <DownOutlined style={{ fontSize: '12px' }} />
              </div>
            ),
            dataIndex: 'phone',
            key: 'phone',
            width: '20%',
            align: 'center' as const,
            render: (text: string) => <span style={{ color: '#215A36', fontWeight: 600 }}>{text}</span>,
          },
          {
            title: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>วันที่สั่งซื้อ</span>
                <DownOutlined style={{ fontSize: '12px' }} />
              </div>
            ),
            dataIndex: 'orderDate',
            key: 'orderDate',
            width: '15%',
            align: 'center' as const,
            render: (date: string) => <span style={{ color: '#215A36', fontWeight: 600 }}>{new Date(date).toLocaleDateString('th-TH')}</span>,
          },
          {
            title: 'สถานะ',
            key: 'status',
            align: 'center' as const,
            width: '15%',
            render: () => (
              <span 
                style={{ 
                  backgroundColor: '#52c41a', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                จัดส่งแล้ว
              </span>
            ),
          },
        ];
      case 'completed':
        return [
          ...baseColumns,
          {
            title: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>วันที่สำเร็จ</span>
                <DownOutlined style={{ fontSize: '12px' }} />
              </div>
            ),
            dataIndex: 'orderDate',
            key: 'completedDate',
            width: '20%',
            align: 'center' as const,
            render: (date: string) => <span style={{ color: '#215A36', fontWeight: 600 }}>{new Date(date).toLocaleDateString('th-TH')}</span>,
          },
          {
            title: 'สถานะ',
            key: 'status',
            align: 'center' as const,
            width: '15%',
            render: () => (
              <span 
                style={{ 
                  backgroundColor: '#52c41a', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                สำเร็จ
              </span>
            ),
          },
        ];
      case 'failed':
        return [
          ...baseColumns,
          {
            title: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>วันที่ไม่สำเร็จ</span>
                <DownOutlined style={{ fontSize: '12px' }} />
              </div>
            ),
            dataIndex: 'orderDate',
            key: 'failedDate',
            width: '20%',
            align: 'center' as const,
            render: (date: string) => <span style={{ color: '#215A36', fontWeight: 600 }}>{new Date(date).toLocaleDateString('th-TH')}</span>,
          },
          {
            title: 'สถานะ',
            key: 'status',
            align: 'center' as const,
            width: '15%',
            render: () => (
              <span 
                style={{ 
                  backgroundColor: '#ff4d4f', 
                  color: 'white', 
                  padding: '4px 12px', 
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                ไม่สำเร็จ
              </span>
            ),
          },
        ];
      default:
        return baseColumns;
    }
  };

  const columns = getColumns();

  // Color theme
  const colorPrimaryDark = '#215A36'; // Dark green
  const colorBgCream = '#FDFDF2'; // Cream background
  const colorBgPage = '#D6E8C3'; // Light green page background

  if (loading) {
    return (
      <div style={{ backgroundColor: colorBgPage, minHeight: '100vh', padding: '40px 60px', fontFamily: 'Kanit, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#215A36] mx-auto mb-4"></div>
          <p className="text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: colorBgPage, minHeight: '100vh', padding: '40px 60px', fontFamily: 'Kanit, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <Button
            shape="round"
            size="large"
            style={{
              backgroundColor: colorBgCream,
              color: colorPrimaryDark,
              fontWeight: 'bold',
              border: 'none',
              padding: '0 30px',
            }}
            onClick={() => navigate(-1)}
          >
            กลับ
          </Button>
          <Title level={1} style={{ color: colorPrimaryDark, margin: 0 }}>
            เกิดข้อผิดพลาด
          </Title>
        </div>
        <div style={{ backgroundColor: colorBgCream, padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
          <Button
            type="primary"
            onClick={fetchOrders}
            style={{ backgroundColor: colorPrimaryDark, borderColor: colorPrimaryDark }}
          >
            ลองใหม่
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colorBgPage, minHeight: '100vh', padding: '40px 60px', fontFamily: 'Kanit, sans-serif' }}>

      {/* Top Header Layout: Back button over the title, left-aligned */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '16px' }}>
        <Button
          shape="round"
          size="large"
          style={{
            backgroundColor: colorBgCream,
            color: colorPrimaryDark,
            fontWeight: 'bold',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '0 30px',
            marginBottom: '16px'
          }}
          onClick={() => navigate(-1)}
        >
          กลับ
        </Button>
        <Title
          level={1}
          style={{
            color: colorPrimaryDark,
            fontWeight: '900',
            margin: 0,
            fontSize: '48px',
            lineHeight: '1.2',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {pageConfig.title}
        </Title>
      </div>

      {/* Divider Line */}
      <div style={{ height: '4px', backgroundColor: colorPrimaryDark, marginBottom: '20px', borderRadius: '2px' }}></div>

      {/* ตั้งค่า Theme สำหรับ Table โดยเฉพาะ */}
      <ConfigProvider
        theme={{
          components: {
            Table: {
              colorBgContainer: 'transparent', // พื้นหลังตารางแบบโปร่งให้เห็นกรอบหรือพื้นหลังกล่อง
              headerBg: colorBgCream, // พื้นหลังหัวตาราง
              headerColor: colorPrimaryDark, // สีข้อความหัวตาราง
              colorText: colorPrimaryDark, // สีข้อความในตาราง
              borderColor: colorPrimaryDark, // สีเส้นขอบ
              borderRadius: 12, // ความโค้งมนของขอบตาราง
              headerBorderRadius: 12,
            },
          },
          token: {
            fontFamily: 'Kanit, sans-serif',
            fontWeightStrong: 700,
          }
        }}
      >
        <div style={{ backgroundColor: colorBgCream, borderRadius: '12px', overflow: 'hidden', padding: '0px' }}>
          <style>
            {`
                .ant-table-wrapper .ant-table {
                  border: 2px solid ${colorPrimaryDark} !important;
                }
                .ant-table-thead > tr > th {
                  border-bottom: 2px solid ${colorPrimaryDark} !important;
                  border-inline-end: 2px solid ${colorPrimaryDark} !important;
                }
                .ant-table-thead > tr > th:last-child {
                  border-inline-end: 0px !important;
                }
                .ant-table-tbody > tr > td {
                  border-bottom: 2px solid ${colorPrimaryDark} !important;
                  border-inline-end: 2px solid ${colorPrimaryDark} !important;
                  padding: 12px 16px !important;
                }
                .ant-table-tbody > tr > td:last-child {
                  border-inline-end: 0px !important;
                }
                /* Hide hover row color to keep styling consistent with image */
                .ant-table-wrapper .ant-table-tbody > tr.ant-table-row:hover > td, 
                .ant-table-wrapper .ant-table-tbody > tr > td.ant-table-cell-row-hover {
                  background: transparent !important;
                }
             `}
          </style>
          <Table
            dataSource={dataSource}
            columns={columns}
            bordered={false}
            pagination={false}
            scroll={{ y: 500 }}
            className="custom-grid-table"
          />
        </div>
      </ConfigProvider>

    </div>
  );
};

export default PendingPage;
