

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Typography, ConfigProvider } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  stockQuantity?: number;
  Category?: string;
  Type?: string;
  description?: string;
}

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      
      // Get favorite product IDs from localStorage
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Fetch product details for each favorite ID
      const productPromises = favoriteIds.map(async (id: string) => {
        try {
          const response = await fetch(`/api/product/${id}`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        } catch (error) {
          console.error(`Error fetching product ${id}:`, error);
          return null;
        }
      });

      const products = await Promise.all(productPromises);
      const validProducts = products.filter(product => product !== null);
      
      setFavorites(validProducts);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform data for Ant Design table
  const dataSource = favorites.map((product, index) => ({
    key: product.id,
    productId: `#${product.id}`,
    productName: product.name,
    price: `฿${product.price.toLocaleString()}`,
    action: 'ไป',
  }));

  // Table columns configuration
  const columns = [
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>รหัสสินค้า</span>
          <DownOutlined style={{ fontSize: '12px', strokeWidth: 2 }} />
        </div>
      ),
      dataIndex: 'productId',
      key: 'productId',
      width: '25%',
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
      width: '50%',
      render: (text: string, record: any) => (
        <span 
          style={{ color: '#215A36', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => navigate(`/product/${record.key}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>ราคา</span>
          <DownOutlined style={{ fontSize: '12px' }} />
        </div>
      ),
      dataIndex: 'price',
      key: 'price',
      width: '15%',
      align: 'center' as const,
      render: (text: string) => <span style={{ color: '#215A36', fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'ไป',
      dataIndex: 'action',
      key: 'action',
      align: 'center' as const,
      width: '10%',
      render: (_: any, record: any) => (
        <Button 
          type="primary"
          size="small"
          style={{ 
            backgroundColor: '#215A36', 
            borderColor: '#215A36',
            fontWeight: 'bold'
          }}
          onClick={() => navigate(`/product/${record.key}`)}
        >
          ไป
        </Button>
      ),
    },
  ];

  // โทนสีหลักจากภาพ
  const colorPrimaryDark = '#215A36'; // สีเขียวเข้ม (ตัวหนังสือ/เส้นขอบ)
  const colorBgCream = '#FDFDF2'; // สีครีม (พื้นหลังตาราง/ปุ่ม)
  const colorBgMain = '#DCEAC8'; // สีเขียวอ่อน (พื้นหลังหน้าเว็บ)

  if (loading) {
    return (
      <div style={{ backgroundColor: colorBgMain, minHeight: '100vh', padding: '40px 60px', fontFamily: 'Kanit, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#215A36] mx-auto mb-4"></div>
          <p className="text-lg">กำลังโหลดรายการโปรด...</p>
        </div>
      </div>
    );
  }

  return (
    // พื้นหลังหลักของหน้าเว็บ
    <div style={{ backgroundColor: colorBgMain, minHeight: '100vh', padding: '40px 60px', fontFamily: 'Kanit, sans-serif' }}>
      
      {/* Top Header Layout: Back button over the title, left-aligned */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '16px' }}>
        <Button 
          shape="round" 
          size="large"
          onClick={() => navigate('/profile')}
          style={{ 
            backgroundColor: colorBgCream, 
            color: colorPrimaryDark, 
            fontWeight: 'bold',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '16px',
            padding: '0 30px'
          }}
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
          รายการโปรด
        </Title>
      </div>

      {/* Divider Line */}
      <div style={{ height: '4px', backgroundColor: colorPrimaryDark, marginBottom: '20px', borderRadius: '2px' }}></div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div style={{ backgroundColor: colorBgCream, padding: '60px', borderRadius: '12px', textAlign: 'center' }}>
          <h2 style={{ color: colorPrimaryDark, fontSize: '24px', marginBottom: '16px' }}>ยังไม่มีรายการโปรด</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>สินค้าที่คุณเพิ่มเป็นรายการโปรดจะแสดงที่นี่</p>
          <Button 
            type="primary"
            onClick={() => navigate('/')}
            style={{ backgroundColor: colorPrimaryDark, borderColor: colorPrimaryDark }}
          >
            ไปยังหน้าหลัก
          </Button>
        </div>
      ) : (
        /* ตั้งค่า Theme สำหรับ Table โดยเฉพาะ */
        <ConfigProvider
          theme={{
            components: {
              Table: {
                colorBgContainer: colorBgCream, // พื้นหลังตาราง
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
          <Table
            dataSource={dataSource}
            columns={columns}
            bordered // เปิดใช้เส้นขอบตารางแบบ grid
            pagination={false} // ปิดหน้า pagination เนื่องจากในภาพเป็นตารางยาว
            scroll={{ y: 400 }} // จำลองพื้นที่ว่างด้านล่างของตารางให้มี scrollbar
            style={{ 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
              borderRadius: '12px',
              overflow: 'hidden' 
            }}
          />
        </ConfigProvider>
      )}
      
    </div>
  );
};

export default FavoritesPage;
