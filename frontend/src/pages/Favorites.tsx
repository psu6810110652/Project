import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { Products } from '../components/products';
import { type ProductCard } from '../types';
import { FavoritesService } from '../services/favoritesService';

const { Title } = Typography;

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  imageUrls?: string[];
  thumbnailUrls?: string[];
  rating?: number;
  reviewCount?: number;
  stockQuantity?: number;
  Category?: string;
  Type?: string;
  description?: string;
  stock?: number;
  soldCount?: number;
  favoriteCount?: number;
}

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();

    // Listen for storage changes (when user navigates between tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'favorites') {
        fetchFavorites();
      }
    };

    // Listen for custom events (when user clicks favorite button in same tab)
    const handleFavoriteUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Favorites page received update event:', customEvent.detail);
      fetchFavorites();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favoritesUpdated', handleFavoriteUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesUpdated', handleFavoriteUpdate);
    };
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);

      // Use the service to get favorite products
      const favoriteProducts = await FavoritesService.getFavoriteProducts();
      setFavorites(favoriteProducts);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform products to ProductCard format
  const productCards: ProductCard[] = favorites.map(product => {
    // 💡 ดึงรูปภาพออกมาเช็คว่าเป็น Array หรือไม่ (เหมือนที่ทำในหน้า Home)
    const rawImage = product.image || product.imageUrls || product.thumbnailUrls;
    const finalImage = Array.isArray(rawImage) ? rawImage[0] : rawImage;

    // 💡 เช็คค่า Stock ให้ชัวร์ว่าไม่เป็น undefined
    const finalStock = product.stockQuantity ?? product.stock ?? 0;

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      image: finalImage, // ส่งรูปที่กรองแล้วเข้าไป
      stock: finalStock,
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      soldCount: product.soldCount || 0,
      favoriteCount: product.favoriteCount || 0,
      type: product.Type || product.Category || 'ทั่วไป',
    };
  });

  // โทนสีหลักจากภาพ
  const colorPrimaryDark = '#215A36'; // สีเขียวเข้ม (ตัวหนังสือ/เส้นขอบ)
  const colorBgCream = '#FDFDF2'; // สีครีม (พื้นหลังตาราง/ปุ่ม)
  const colorBgMain = '#DCEAC8'; // สีเขียวอ่อน (พื้นหลังหน้าเว็บ)

  if (loading) {
    return (
      <div style={{ backgroundColor: colorBgMain, minHeight: '100vh', padding: '40px 60px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#215A36] mx-auto mb-4"></div>
          <p className="text-lg">กำลังโหลดรายการโปรด...</p>
        </div>
      </div>
    );
  }

  return (
    // พื้นหลังหลักของหน้าเว็บ
    <div style={{ backgroundColor: colorBgMain, minHeight: '100vh', padding: '40px 60px' }}>

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
        /* ✅ แก้ตรงนี้: เปลี่ยนจาก flex เป็น grid เพื่อจัดการขนาดการ์ด */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 w-full">
          {productCards.map((product) => (
            <div key={product.id} className="w-full transition-transform hover:-translate-y-1 duration-300">
              <Products
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                stock={product.stock}
                rating={product.rating}
                reviewCount={product.reviewCount}
                soldCount={product.soldCount}
                favoriteCount={product.favoriteCount}
                type={product.type}
              />
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default FavoritesPage;