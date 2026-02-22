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
  status: 'pending_confirm' | 'pending_delivery' | 'pending_received';
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
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('ไม่สามารถโหลดข้อมูลรายการได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh orders list
        fetchOrders();
        alert('อัพเดทสถานะเรียบร้อยแล้ว');
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('ไม่สามารถอัพเดทสถานะได้ กรุณาลองใหม่');
    }
  };

  // Transform data for Ant Design table
  const dataSource = orders.map((order, index) => ({
    key: order.id,
    orderId: order.orderNumber,
    productName: order.products.map(p => `${p.name} x${p.quantity}`).join(', '),
    quantity: order.products.reduce((sum, p) => sum + p.quantity, 0),
    customerName: order.customerName,
    totalAmount: order.totalAmount,
    orderDate: order.orderDate,
    status: order.status,
    address: order.address,
    phone: order.phone,
  }));

  // Table columns configuration
  const columns = [
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>รหัสคำสั่งซื้อ</span>
          <DownOutlined style={{ fontSize: '12px', strokeWidth: 2 }} />
        </div>
      ),
      dataIndex: 'orderId',
      key: 'orderId',
      width: '15%',
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
      width: '30%',
    },
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>จำนวน</span>
          <DownOutlined style={{ fontSize: '12px' }} />
        </div>
      ),
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      width: '10%',
    },
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>ลูกค้า</span>
          <DownOutlined style={{ fontSize: '12px' }} />
        </div>
      ),
      dataIndex: 'customerName',
      key: 'customerName',
      width: '15%',
    },
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>ยอดรวม</span>
          <DownOutlined style={{ fontSize: '12px' }} />
        </div>
      ),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'center' as const,
      width: '10%',
      render: (amount: number) => `฿${amount.toLocaleString()}`,
    },
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>วันที่</span>
          <DownOutlined style={{ fontSize: '12px' }} />
        </div>
      ),
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: '10%',
      render: (date: string) => new Date(date).toLocaleDateString('th-TH'),
    },
    {
      title: 'จัดการ',
      key: 'actions',
      align: 'center' as const,
      width: '10%',
      render: (_: any, record: any) => (
        <div className="flex gap-2 justify-center">
          {record.status === 'pending_confirm' && (
            <>
              <Button 
                size="small"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
                onClick={() => handleStatusUpdate(record.key, 'confirmed')}
              >
                ยืนยัน
              </Button>
              <Button 
                size="small"
                danger
                onClick={() => handleStatusUpdate(record.key, 'cancelled')}
              >
                ยกเลิก
              </Button>
            </>
          )}
          {record.status === 'pending_delivery' && (
            <Button 
              size="small"
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
              onClick={() => handleStatusUpdate(record.key, 'shipped')}
            >
              จัดส่ง
            </Button>
          )}
          {record.status === 'pending_received' && (
            <Button 
              size="small"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
              onClick={() => handleStatusUpdate(record.key, 'delivered')}
            >
              ได้รับแล้ว
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Color theme from your design
  const colorPrimaryDark = '#215A36'; // Dark green
  const colorBgCream = '#FDFDF2'; // Cream background

  if (loading) {
    return (
      <div style={{ backgroundColor: '#D6E8C3', minHeight: '100vh', padding: '40px 60px', fontFamily: 'Kanit, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#215A36] mx-auto mb-4"></div>
          <p className="text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#D6E8C3', minHeight: '100vh', padding: '40px 60px', fontFamily: 'Kanit, sans-serif' }}>
        <Button 
          shape="round" 
          size="large"
          style={{ 
            backgroundColor: colorBgCream, 
            color: colorPrimaryDark, 
            fontWeight: 'bold',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            padding: '0 30px'
          }}
          onClick={() => navigate(-1)}
        >
          กลับ
        </Button>
        <div style={{ backgroundColor: colorBgCream, padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
          <h2 style={{ color: '#ff4d4f', fontSize: '24px', marginBottom: '16px' }}>เกิดข้อผิดพลาด</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
          <Button 
            type="primary"
            onClick={fetchOrders}
            style={{ backgroundColor: '#215A36', borderColor: '#215A36' }}
          >
            ลองใหม่
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#D6E8C3', minHeight: '100vh', padding: '40px 60px', fontFamily: 'Kanit, sans-serif' }}>
      
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <Button 
          shape="round" 
          size="large"
          style={{ 
            backgroundColor: type === 'confirm' ? colorPrimaryDark : colorBgCream, 
            color: type === 'confirm' ? 'white' : colorPrimaryDark, 
            fontWeight: 'bold',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          onClick={() => navigate('/pending/confirm')}
        >
          รอยืนยัน
        </Button>
        <Button 
          shape="round" 
          size="large"
          style={{ 
            backgroundColor: type === 'delivery' ? colorPrimaryDark : colorBgCream, 
            color: type === 'delivery' ? 'white' : colorPrimaryDark, 
            fontWeight: 'bold',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          onClick={() => navigate('/pending/delivery')}
        >
          รอจัดส่ง
        </Button>
        <Button 
          shape="round" 
          size="large"
          style={{ 
            backgroundColor: type === 'received' ? colorPrimaryDark : colorBgCream, 
            color: type === 'received' ? 'white' : colorPrimaryDark, 
            fontWeight: 'bold',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          onClick={() => navigate('/pending/received')}
        >
          จัดส่งแล้ว
        </Button>
      </div>

      {/* Back Button */}
      <Button 
        shape="round" 
        size="large"
        style={{ 
          backgroundColor: colorBgCream, 
          color: colorPrimaryDark, 
          fontWeight: 'bold',
          border: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          padding: '0 30px'
        }}
        onClick={() => navigate(-1)}
      >
        กลับ
      </Button>

      {/* Page Title */}
      <Title 
        level={1} 
        style={{ 
          color: colorPrimaryDark, 
          fontWeight: '900', 
          marginTop: 0,
          marginBottom: '10px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        {pageConfig.title}
      </Title>

      {/* Divider Line */}
      <div style={{ height: '3px', backgroundColor: colorPrimaryDark, marginBottom: '20px' }}></div>

      {/* Ant Design Table */}
      <ConfigProvider
        theme={{
          components: {
            Table: {
              colorBgContainer: colorBgCream,
              headerBg: colorBgCream,
              headerColor: colorPrimaryDark,
              colorText: colorPrimaryDark,
              borderColor: colorPrimaryDark,
              borderRadius: 12,
              headerBorderRadius: 12,
            },
            Button: {
              borderRadius: 8,
            },
          },
          token: {
            fontFamily: 'Kanit, sans-serif',
            fontWeightStrong: 700,
          }
        }}
      >
        <Table
          dataSource={dataSource}
          columns={columns}
          bordered
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `แสดง ${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          scroll={{ x: 1200, y: 500 }}
          style={{ 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
            borderRadius: '12px',
            overflow: 'hidden' 
          }}
        />
      </ConfigProvider>
      
    </div>
  );
};

export default PendingPage;
