import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl?: string;
  type?: string;
  description?: string;
  price: number;
  stockQuantity: number;
  isPromotion: boolean;
  promotionPrice?: number;
  isFeatured?: boolean;
  createdAt?: Date;
  category?: any;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
}


export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'pricing'>('description');

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setMessage('ไม่พบ ID สินค้า');
        setProductLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/product/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setMessage(`ไม่สามารถโหลดข้อมูลสินค้าได้: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setProductLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!id || !product) {
      setMessage('ไม่พบข้อมูลสินค้า');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Check if product already exists in cart
      const existingItemIndex = existingCart.findIndex((item: any) => item.id === id);
      
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
        isPromotion: product.isPromotion,
        promotionPrice: product.promotionPrice
      };

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        existingCart.push(cartItem);
      }

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      // Trigger storage event for other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(existingCart)
      }));

      setMessage('เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถเพิ่มสินค้าได้'}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };


  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && product && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };


  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const currentImages = product?.imageUrl ? [product.imageUrl] : [];
  // If no images exist, create array with first image repeated 4 times
  const displayImages = currentImages.length === 0 ? [
    '/api/placeholder/320/320',
    '/api/placeholder/320/320',
    '/api/placeholder/320/320',
    '/api/placeholder/320/320'
  ] : currentImages.length === 1 ? [
    product?.imageUrl,
    product?.imageUrl,
    product?.imageUrl,
    product?.imageUrl
  ] : currentImages;
  const currentImage = displayImages[selectedImageIndex] || product?.imageUrl || '/api/placeholder/320/320';

  return (
    <div className="min-h-screen bg-[#DCEDC1] font-['Prompt']">
      {/* Fixed Back Button */}
      <div className="fixed top-24 left-4 z-40">
        <button 
          onClick={() => navigate(-1)}
          className="bg-white text-[#2a6b3b] font-bold !py-2 !px-6 rounded-xl shadow-sm hover:bg-gray-50"
        >
            กลับ
        </button>
      </div>
      
      {/* Message Display */}
      {message && (
        <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          message.includes('เรียบร้อย') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {message}
        </div>
      )}
      
      {/* Loading State */}
      {productLoading && (
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">กำลังโหลดข้อมูลสินค้า...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Product Content */}
      {!productLoading && product && (
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4 max-w-6xl">

            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                
                <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-3">
                                {displayImages.map((image, index) => (
                                    <div 
                                        key={index} 
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`w-20 h-20 border-2 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer ${
                                            index === selectedImageIndex ? 'border-[#2a6b3b]' : 'border-gray-300'
                                        }`}
                                    >
                                        {image && image.includes('/api/placeholder/') ? (
                                            <div className="text-gray-400 text-center">
                                                <span className="text-2xl">�</span>
                                            </div>
                                        ) : (
                                            <img src={image || ''} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="w-80 h-80 border-2 border-gray-200 rounded-xl flex items-center justify-center bg-gray-50">
                                {currentImage ? (
                                    <img src={currentImage} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="text-gray-400 text-center">
                                        <span className="text-4xl mb-2 block">📦</span>
                                        <span>ไม่มีรูปภาพ</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-[#1f502c] mb-2">{product.name}</h1>
                        
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex">
                                {renderStars(product.rating || 5.0)}
                            </div>
                            <span className="text-sm text-gray-600">{product.rating || 5.0} ({product.reviewCount || 0} รีวิว) ขายแล้ว {product.soldCount || 1}</span>
                        </div>

                        <div className="mb-6">
                            <span className="text-lg text-[#2a6b3b] font-medium">ราคา</span>
                            <div className="bg-[#dcf0c3] rounded-lg p-4 mt-2">
                                <span className="text-2xl font-bold text-[#1f502c]">
                                    ฿{product.isPromotion && product.promotionPrice ? product.promotionPrice : product.price}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="font-bold text-[#1f502c]">จำนวน</span>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    disabled={quantity <= 1}
                                    className="w-10 h-10 rounded-full bg-green-100 border-2 border-[#2a6b3b] flex items-center justify-center hover:bg-[#2a6b3b] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-lg font-bold">−</span>
                                </button>
                                <input
                                    type="text"
                                    min="1"
                                    max={product?.stockQuantity || 999}
                                    value={quantity}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        // Allow empty input or valid numbers
                                        if (inputValue === '' || /^\d+$/.test(inputValue)) {
                                            setQuantity(inputValue === '' ? 0 : parseInt(inputValue));
                                        }
                                    }}
                                    onBlur={(e) => {
                                        // Ensure valid value on blur
                                        const value = parseInt(e.target.value) || 1;
                                        const finalQuantity = Math.max(1, Math.min(value, product?.stockQuantity || 999));
                                        setQuantity(finalQuantity);
                                    }}
                                    onFocus={(e) => {
                                        e.target.select(); // Select all text on focus for easy replacement
                                    }}
                                    className="w-20 h-10 text-center border-2 border-[#2a6b3b] font-bold text-lg focus:outline-none focus:border-green-600 rounded"
                                />
                                <button 
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    disabled={product && quantity >= product.stockQuantity}
                                    className="w-10 h-10 rounded-full bg-green-200 border-2 border-[#2a6b3b] flex items-center justify-center hover:bg-[#2a6b3b] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-lg font-bold">+</span>
                                </button>
                            </div>
                            <button 
                                onClick={() => navigate(`/review/${id}`)}
                                className="px-4 py-2 border border-[#2a6b3b] text-[#2a6b3b] rounded-lg hover:bg-[#2a6b3b] hover:text-white transition-colors"
                            >
                                รีวิว
                            </button>
                        </div>

                        <button 
                            onClick={handleAddToCart}
                            disabled={isLoading}
                            className="w-full bg-[#dcf0c3] text-[#1f502c] font-bold text-lg py-4 rounded-xl hover:bg-[#cbe6a8] transition flex justify-center items-center gap-2 shadow-sm"
                        >
                            🛒 {isLoading ? 'กำลังเพิ่ม...' : 'เพิ่มไปยังรถเข็น'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white rounded-2xl shadow-sm">
                <div className="flex gap-1 p-2">
                    <button 
                        onClick={() => setActiveTab('description')}
                        className={`font-bold !py-3 !px-8 rounded-t-xl transition-colors ${
                            activeTab === 'description' 
                                ? 'bg-[#3a7c50] text-white' 
                                : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                        รายละเอียดสินค้า
                    </button>
                    <button 
                        onClick={() => setActiveTab('pricing')}
                        className={`font-bold py-3 !px-8 rounded-t-xl transition-colors ${
                            activeTab === 'pricing' 
                                ? 'bg-[#3a7c50] text-white' 
                                : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                        เงื่อนไขราคาส่ง
                    </button>
                </div>
                <div className="bg-[#fdfcf6] border-t-4 border-[#3a7c50] min-h-64 rounded-b-xl shadow-sm p-6">
                    {activeTab === 'description' ? (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">รายละเอียดสินค้า</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {product.description || 'ไม่มีคำอธิบายสินค้า'}
                            </p>
                            {product.description && (
                                <p className="text-sm text-gray-600 mt-2">
                                    <span className="font-medium">รหัสสินค้า:</span> {product.id}
                                </p>
                            )}
                            {product.type && (
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">ประเภท:</span> {product.type}
                                </p>
                            )}
                            {product.category && (
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">หมวดหมู่:</span> {product.category.name}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">เงื่อนไขราคาส่ง</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">ราคาต่อหน่วย:</span>
                                    <span className="font-semibold">฿{product.price}</span>
                                </div>
                                {product.isPromotion && product.promotionPrice && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">ราคาพิเศษ:</span>
                                        <span className="font-semibold text-red-600">฿{product.promotionPrice}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">จำนวนที่เลือก:</span>
                                    <span className="font-semibold">{quantity} ชิ้น</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">รวม:</span>
                                        <span className="text-xl font-bold text-green-600">
                                            ฿{((product.isPromotion && product.promotionPrice) ? product.promotionPrice : product.price) * quantity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
