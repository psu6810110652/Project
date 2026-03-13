import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Share2 } from 'lucide-react';
import type { Product } from '../types';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [product, setProduct] = useState<Product | null>(null);
    const [productLoading, setProductLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'description' | 'pricing'>('description');
    const [, setReviews] = useState<any[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) {
                setMessage('ไม่พบ ID สินค้า');
                setProductLoading(false);
                return;
            }

            try {
                const response = await api.get(`/product/${id}`);
                const data = response.data;
                setProduct(data);

                // Check if product is in favorites
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                setIsFavorite(favorites.includes(id));

                // Fetch reviews for this product to calculate average rating
                try {
                    const reviewsResponse = await api.get(`/product/${id}/reviews`);
                    const reviewsData = reviewsResponse.data;
                    setReviews(reviewsData);

                    // Calculate average rating
                    if (reviewsData && reviewsData.length > 0) {
                        const totalRating = reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0);
                        const avgRating = totalRating / reviewsData.length;
                        setAverageRating(Math.round(avgRating * 10) / 10); // Round to 1 decimal place
                        setTotalReviews(reviewsData.length);
                    } else {
                        setAverageRating(Number(data.rating) || 0);
                        setTotalReviews(Number(data.reviewCount) || 0);
                    }
                } catch (reviewError) {
                    console.error('Error fetching reviews:', reviewError);
                    // Use product's existing rating if API fails
                    setAverageRating(Number(data.rating) || 0);
                    setTotalReviews(Number(data.reviewCount) || 0);
                }
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
            // 🌟 ปรับตรงนี้ให้ดึงรูปลงตะกร้าได้ถูกต้อง
            const cartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                imageUrl: (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : product.imageUrl,
                stockQuantity: product.stockQuantity ?? product.stock ?? 0,
                isPromotion: product.isPromotion,
                promotionPrice: product.promotionPrice
            };

            // Use CartContext to add to cart
            addToCart(cartItem);

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
        const stockLimit = product?.stockQuantity ?? product?.stock ?? 0;
        if (newQuantity >= 1 && product && newQuantity <= stockLimit) {
            setQuantity(newQuantity);
        }
    };

    const toggleFavorite = () => {
        if (!id) return;

        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

        if (isFavorite) {
            // Remove from favorites
            const newFavorites = favorites.filter((favId: string) => favId !== id);
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            setIsFavorite(false);
            setMessage('ลบออกจากรายการโปรดแล้ว');
        } else {
            // Add to favorites
            favorites.push(id);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            setIsFavorite(true);
            setMessage('เพิ่มไปยังรายการโปรดแล้ว');
        }

        setTimeout(() => setMessage(''), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.name || 'ธีรยุทธการเกษตร',
                    text: product?.description || 'เช็คสินค้าเกษตรคุณภาพดีที่นี่',
                    url: window.location.href,
                });
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            setMessage('คัดลอกลิงก์แล้วเป๊ะ!');
            setTimeout(() => setMessage(''), 2000);
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

    // 🌟 ปรับเงื่อนไขการเช็คเล็กน้อยเพื่อความปลอดภัยของ TypeScript
    const currentImages = (product?.imageUrls && product.imageUrls.length > 0)
        ? product.imageUrls
        : (product?.imageUrl ? [product.imageUrl] : []);

    const displayImages = currentImages.length === 0 ? [
        '/api/placeholder/320/320',
        '/api/placeholder/320/320',
        '/api/placeholder/320/320',
        '/api/placeholder/320/320'
    ] : currentImages; 

    const currentImage = displayImages[selectedImageIndex] || '/api/placeholder/320/320';

    return (
        <div className="min-h-screen bg-[#DCEDC1]">
            {/* Message Display */}
            {message && (
                <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${message.includes('เรียบร้อย') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                    {message}
                </div>
            )}

            {/* Loading State */}
            {productLoading && (
                <div className="pt-24 pb-8">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-600">กำลังโหลดข้อมูลสินค้า...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Content */}
            {!productLoading && product && (
                <div className="pt-4 pb-8 flex flex-col gap-6">
                    <div className="container mx-auto px-4 max-w-6xl text-left flex justify-start">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-[#fdfcf6] text-[#2a6b3b] font-bold py-2 px-6 rounded-xl shadow-sm hover:bg-gray-50"
                        >
                            กลับ
                        </button>
                    </div>
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex gap-4">
                                    <div className="flex flex-col gap-3">
                                        {displayImages.map((image, index) => (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={`w-20 h-20 border-2 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer ${index === selectedImageIndex ? 'border-[#2a6b3b]' : 'border-gray-300'
                                                    }`}
                                            >
                                                {image && image.includes('/api/placeholder/') ? (
                                                    <div className="text-gray-400 text-center">
                                                        <span className="text-2xl"></span>
                                                    </div>
                                                ) : (
                                                    <img src={image || ''} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-80 h-80 border-2 border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {currentImage ? (
                                            <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-gray-400 text-center">
                                                <span className="text-4xl mb-2 block">📦</span>
                                                <span>ไม่มีรูปภาพ</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 text-left">
                                    <div className="flex justify-between items-start mb-2">
                                        <h1 className="text-3xl font-bold text-[#1f502c]">{product.name}</h1>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={toggleFavorite}
                                                className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                                                title={isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มไปยังรายการโปรด"}
                                            >
                                                <svg
                                                    className={`w-8 h-8 transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                                                    fill={isFavorite ? "currentColor" : "none"}
                                                    stroke="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={handleShare}
                                                className="p-3 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#2a6b3b]"
                                                title="แชร์สินค้านี้"
                                            >
                                                <Share2 size={24} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex items-center gap-1">
                                            {renderStars(Number(averageRating || product.rating || 5.0))}
                                        </div>
                                        <span className="text-lg font-semibold text-[#1f502c]">
                                            {Number(averageRating || product.rating || 5.0).toFixed(1)}/5.0
                                        </span>
                                        <Link to={`/review/${id}`} className="text-gray-600 underline hover:text-[#1f502c] transition-colors">
                                            ({totalReviews || product.reviewCount || 0} รีวิว)
                                        </Link>
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
                                                max={product?.stockQuantity ?? product?.stock ?? 999}
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
                                                    const stockLimit = product?.stockQuantity ?? product?.stock ?? 999;
                                                    const finalQuantity = Math.max(1, Math.min(value, stockLimit));
                                                    setQuantity(finalQuantity);
                                                }}
                                                onFocus={(e) => {
                                                    e.target.select(); // Select all text on focus for easy replacement
                                                }}
                                                className="w-20 h-10 text-center border-2 border-[#2a6b3b] font-bold text-lg focus:outline-none focus:border-green-600 rounded"
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(quantity + 1)}
                                                disabled={!product || quantity >= (product.stockQuantity ?? product.stock ?? 0)}
                                                className="w-10 h-10 rounded-full bg-green-200 border-2 border-[#2a6b3b] flex items-center justify-center hover:bg-[#2a6b3b] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="text-lg font-bold">+</span>
                                            </button>
                                        </div>
                                        <span className="text-base font-medium text-gray-700 ml-4">
                                            มีสินค้าทั้งหมด {product?.stockQuantity ?? product?.stock ?? 0} ชิ้น
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isLoading}
                                        className="w-full bg-[#dcf0c3] text-[#1f502c] font-bold text-lg py-3 rounded-xl hover:bg-[#cbe6a8] transition flex justify-center items-center gap-2 shadow-sm"
                                    >
                                        🛒 {isLoading ? 'กำลังเพิ่ม...' : 'เพิ่มไปยังรถเข็น'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Section */}
                        <div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`font-bold py-3 px-8 rounded-t-xl transition-colors ${activeTab === 'description'
                                        ? 'bg-[#3a7c50] text-white'
                                        : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    รายละเอียดสินค้า
                                </button>
                                <button
                                    onClick={() => setActiveTab('pricing')}
                                    className={`font-bold py-3 px-8 rounded-t-xl transition-colors ${activeTab === 'pricing'
                                        ? 'bg-[#3a7c50] text-white'
                                        : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    เงื่อนไขราคาส่ง
                                </button>
                            </div>
                            <div className="bg-[#fdfcf6] border-t-4 border-[#3a7c50] rounded-b-xl shadow-sm p-6 text-left">
                                {activeTab === 'description' ? (
                                    <div>
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                            {product.description || 'ไม่มีคำอธิบายสินค้า'}
                                        </p>
                                        {product.description && (
                                            <p className="text-sm text-gray-600 mt-4">
                                                <span className="font-medium">รหัสสินค้า:</span> {product.id}
                                            </p>
                                        )}
                                        {(product.Type || product.Type) && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">ประเภท:</span> {product.Type || product.Type}
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
                                            <div className="border-t border-gray-200 pt-3 mt-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-semibold text-gray-800">รวม:</span>
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