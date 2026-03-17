import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Share2, ChevronLeft, ChevronRight, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import { FavoritesService } from '../services/favoritesService';

// 🌟 1. นำเอา Comment ออก เพื่อเรียกใช้งานระบบตะกร้า
import { useCart } from '../context/CartContext';
import { Box } from '../components/banner';

export const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // 🌟 2. นำเอา Comment ออก เพื่อใช้งานฟังก์ชัน addToCart
    const { addToCart } = useCart();

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [product, setProduct] = useState<any | null>(null);
    const [productLoading, setProductLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // State สำหรับสลับ Tab และการแสดงผลเพิ่มเติม
    const [activeTab, setActiveTab] = useState<'description' | 'howToUse'>('description');
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showFullHowToUse, setShowFullHowToUse] = useState(false);

    // Stats & Favorites
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    // Related Products & Modals
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [showAllImagesModal, setShowAllImagesModal] = useState(false);

    const carouselRef = useRef<HTMLDivElement>(null);

    // ฟังก์ชันแปลงรูปภาพ
    const getParsedImages = (urls: any): string[] => {
        if (!urls) return [];
        if (Array.isArray(urls)) return urls;
        if (typeof urls === 'string') {
            try {
                const parsed = JSON.parse(urls);
                return Array.isArray(parsed) && parsed.length > 0 ? parsed : [urls];
            } catch (e) {
                return [urls];
            }
        }
        return [];
    };

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) {
                setMessage('ไม่พบ ID สินค้า');
                setProductLoading(false);
                return;
            }

            try {
                setProductLoading(true);
                const response = await api.get(`/product/${id}`);
                const data = response.data;
                setProduct(data);

                // Use FavoritesService
                setIsFavorite(FavoritesService.isFavorite(id));

                setAverageRating(Number(data.rating) || 0);
                setTotalReviews(Number(data.reviewCount) || 0);

            } catch (error: any) {
                console.error('Error fetching product:', error);
                setMessage(`ไม่สามารถโหลดข้อมูลสินค้าได้: ${error.message || 'Unknown error'}`);
            } finally {
                setProductLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            const categoryId = product?.category?.id;
            if (!categoryId || !id) return;

            setRelatedLoading(true);
            try {
                const response = await api.get(`/product/category/${categoryId}?limit=6`);
                const items = response.data.items || response.data;

                if (Array.isArray(items)) {
                    const related = items.filter((p: any) => p.id !== id).slice(0, 4);
                    setRelatedProducts(related);
                }
            } catch (error) {
                console.error('Error fetching related products:', error);
                setRelatedProducts([]);
            } finally {
                setRelatedLoading(false);
            }
        };

        fetchRelatedProducts();
    }, [product?.category?.id, id]);

    const parsedImageUrls = getParsedImages(product?.imageUrls);
    const parsedThumbnailUrls = getParsedImages(product?.thumbnailUrls);

    const currentImages = parsedImageUrls.length > 0
        ? parsedImageUrls
        : (parsedThumbnailUrls.length > 0
            ? parsedThumbnailUrls
            : (product?.imageUrl ? [product.imageUrl] : []));

    const displayImages = currentImages.length === 0 ? [
        'https://placehold.co/400x400/f1f5f9/94a3b8?text=No+Image',
    ] : currentImages;

    useEffect(() => {
        if (carouselRef.current) {
            const scrollX = selectedImageIndex * carouselRef.current.offsetWidth;
            carouselRef.current.scrollTo({ left: scrollX, behavior: 'smooth' });
        }
    }, [selectedImageIndex]);

    const handleImageNavigation = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            setSelectedImageIndex(prev => (prev === 0 ? displayImages.length - 1 : prev - 1));
        } else {
            setSelectedImageIndex(prev => (prev === displayImages.length - 1 ? 0 : prev + 1));
        }
    };

    // 🌟 3. ปรับโค้ดให้สั้นและสะอาดขึ้น โดยส่งข้อมูลไปให้ Context จัดการทั้งหมด
    const handleAddToCart = async () => {
        if (!id || !product) {
            setMessage('ไม่พบข้อมูลสินค้า');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const cartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                imageUrl: displayImages[0] !== 'https://placehold.co/400x400/f1f5f9/94a3b8?text=No+Image' ? displayImages[0] : '',
                stockQuantity: product.stockQuantity ?? product.stock ?? 0,
                isPromotion: product.isPromotion,
                promotionPrice: product.promotionPrice
            };

            // เรียกใช้งาน Context!
            addToCart(cartItem);

            setMessage('เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว');
            setTimeout(() => setMessage(''), 3000);

        } catch (error: any) {
            console.error('Error adding to cart:', error);
            setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        const stockLimit = product?.stockQuantity ?? product?.stock ?? 0;
        if (newQuantity >= 1 && newQuantity <= stockLimit) {
            setQuantity(newQuantity);
        }
    };

    const toggleFavorite = async () => {
        if (!id || !product) return;
        
        const previousStatus = isFavorite;
        const newStatus = !previousStatus;
        
        // Optimistic update status
        setIsFavorite(newStatus);
        
        // Update product count locally for immediate feedback
        setProduct((prev: any) => ({
            ...prev,
            favoriteCount: newStatus ? (Number(prev?.favoriteCount || 0) + 1) : Math.max(0, Number(prev?.favoriteCount || 0) - 1)
        }));

        try {
            await FavoritesService.toggleFavorite(id);
            setMessage(newStatus ? 'เพิ่มไปยังรายการโปรดแล้ว' : 'ลบออกจากรายการโปรดแล้ว');
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Revert on error
            setIsFavorite(previousStatus);
            setProduct((prev: any) => ({
                ...prev,
                favoriteCount: Number(product.favoriteCount) || 0
            }));
            setMessage('เกิดข้อผิดพลาดในการเปลี่ยนสถานะรายการโปรด');
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
            } catch (error: any) {
                if (error.name !== 'AbortError') console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            setMessage('คัดลอกลิงก์แล้วเป๊ะ!');
            setTimeout(() => setMessage(''), 2000);
        }
    };

    const renderStars = (rating: number = 0) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={16} className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
        ));
    };

    // จัดการระบบ "แสดงเพิ่มเติม" สำหรับรายละเอียด
    const descriptionText = product?.description || product?.detail?.description || 'ไม่มีคำอธิบายสินค้า';
    const descriptionLines = descriptionText.split('\n');
    const isLongDescription = descriptionLines.length > 10;
    const displayedDescription = isLongDescription && !showFullDescription
        ? descriptionLines.slice(0, 10).join('\n')
        : descriptionText;

    // จัดการระบบ "แสดงเพิ่มเติม" สำหรับวิธีใช้งาน
    const howToUseText = product?.howToUse || product?.detail?.howToUse || 'ไม่มีข้อมูลวิธีใช้งาน';
    const howToUseLines = howToUseText.split('\n');
    const isLongHowToUse = howToUseLines.length > 10;
    const displayedHowToUse = isLongHowToUse && !showFullHowToUse
        ? howToUseLines.slice(0, 10).join('\n')
        : howToUseText;

    return (
        <div className="min-h-screen bg-[#DCEDC1]">
            {message && (
                <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${message.includes('เรียบร้อย') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                    {message}
                </div>
            )}

            {productLoading ? (
                <div className="pt-24 pb-8 flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2a6b3b]"></div>
                </div>
            ) : product && (
                <div className="pt-4 pb-8 flex flex-col gap-6">
                    <div className="container mx-auto px-4 max-w-6xl text-left flex justify-start">
                        <button onClick={() => navigate(-1)} className="bg-[#fdfcf6] text-[#2a6b3b] font-bold !py-2 !px-6 rounded-xl shadow-sm hover:bg-gray-50">
                            กลับ
                        </button>
                    </div>

                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-left">
                            <div className="flex flex-col md:flex-row gap-8 md:gap-12">

                                {/* ---------------- ส่วนรูปภาพ ---------------- */}
                                <div className="flex flex-col w-full md:w-[400px] lg:w-[400px] flex-shrink-0">
                                    <div className="relative w-full aspect-square border-2 border-gray-200 rounded-xl bg-gray-50 overflow-hidden group">
                                        <div className="w-full h-full p-4 flex items-center justify-center cursor-pointer" onClick={() => setShowAllImagesModal(true)}>
                                            <img src={displayImages[selectedImageIndex]} alt={product.name} className="max-w-full max-h-full object-contain" />
                                        </div>
                                        {displayImages.length > 1 && (
                                            <>
                                                <button onClick={(e) => { e.stopPropagation(); handleImageNavigation('prev'); }} className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md z-10 ${selectedImageIndex === 0 ? 'invisible' : 'visible'}`}>
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleImageNavigation('next'); }} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md z-10 ${selectedImageIndex === displayImages.length - 1 ? 'invisible' : 'visible'}`}>
                                                    <ChevronRight size={24} />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-5 gap-2 mt-4">
                                        {displayImages.slice(0, 5).map((image, index) => {
                                            const isLastAndMore = index === 4 && displayImages.length > 5;
                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => isLastAndMore ? setShowAllImagesModal(true) : setSelectedImageIndex(index)}
                                                    className={`relative aspect-square border-2 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden ${index === selectedImageIndex && !isLastAndMore ? 'border-[#2a6b3b]' : 'border-transparent hover:border-gray-300'}`}
                                                >
                                                    <img src={image} alt={`Thumbnail`} className="w-full h-full object-cover" />
                                                    {isLastAndMore && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white backdrop-blur-[1px]">
                                                            <span className="text-xl font-bold">+{displayImages.length - 5}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ---------------- ข้อมูลสินค้า ---------------- */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h1 className="text-3xl font-bold text-[#1f502c]">{product.name}</h1>
                                        <div className="flex gap-2 items-center">
                                            <div className="flex flex-col items-center">
                                                <button onClick={toggleFavorite} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
                                                    <Heart size={32} className={`transition-colors duration-300 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-[#2a6b3b]'}`} />
                                                </button>
                                                <span className="text-xs text-gray-500 mt-[-8px]">{product.favoriteCount || 0}</span>
                                            </div>
                                            <button onClick={handleShare} className="p-3 rounded-full hover:bg-gray-100 text-[#2a6b3b]">
                                                <Share2 size={28} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex items-center gap-1">{renderStars(averageRating)}</div>
                                        <span className="text-lg font-semibold text-[#1f502c]">{averageRating.toFixed(1)}/5.0</span>
                                        <Link to={`/review/${id}`} className="text-gray-600 underline hover:text-[#1f502c]">
                                            ({totalReviews} รีวิว)
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="font-bold text-[#1f502c]">จำนวน</span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1} className="w-10 h-10 rounded-full bg-green-100 border-2 border-[#2a6b3b] font-bold text-lg disabled:opacity-50">−</button>
                                            <input type="text" value={quantity} readOnly className="w-20 h-10 text-center border-2 border-[#2a6b3b] font-bold text-lg rounded bg-white" />
                                            <button onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= (product.stockQuantity ?? product.stock ?? 0)} className="w-10 h-10 rounded-full bg-green-200 border-2 border-[#2a6b3b] font-bold text-lg disabled:opacity-50">+</button>
                                        </div>
                                        <span className="text-base font-medium text-gray-700 ml-4">
                                            มีสินค้า {product?.stockQuantity ?? product?.stock ?? 0} ชิ้น
                                        </span>
                                    </div>

                                    <div className="bg-[#f8fcf3] border border-[#dcf0c3] p-5 rounded-xl mb-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-[#1f502c] mb-3">สรุปราคาสั่งซื้อ</h3>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">ราคาต่อหน่วย:</span>
                                            <span className="font-medium text-gray-800">฿{product.price}</span>
                                        </div>
                                        {product.isPromotion && product.promotionPrice && (
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">ราคาพิเศษ:</span>
                                                <span className="font-bold text-red-500">฿{product.promotionPrice}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-gray-600">จำนวนที่เลือก:</span>
                                            <span className="font-medium text-gray-800">{quantity} ชิ้น</span>
                                        </div>
                                        <div className="border-t border-[#dcf0c3] pt-3 mt-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-[#1f502c]">รวมทั้งสิ้น:</span>
                                                <span className="text-2xl font-black text-[#2a6b3b]">
                                                    ฿{((product.isPromotion && product.promotionPrice) ? product.promotionPrice : product.price) * quantity}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={handleAddToCart} disabled={isLoading} className="w-full bg-[#dcf0c3] text-[#1f502c] font-bold text-lg py-3! rounded-xl hover:bg-[#cbe6a8] transition shadow-sm">
                                        🛒 {isLoading ? 'กำลังเพิ่ม...' : 'เพิ่มไปยังรถเข็น'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ---------------- 🌟 แถบรายละเอียดและวิธีใช้ (แบบ Tabs) ---------------- */}
                        <div>
                            {/* หัวข้อ Tabs */}
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`font-bold !py-3 !px-8 rounded-t-xl transition-colors ${activeTab === 'description' ? 'bg-[#3a7c50] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}
                                >
                                    รายละเอียดสินค้า
                                </button>
                                <button
                                    onClick={() => setActiveTab('howToUse')}
                                    className={`font-bold py-3 !px-8 rounded-t-xl transition-colors ${activeTab === 'howToUse' ? 'bg-[#3a7c50] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}
                                >
                                    วิธีใช้งาน
                                </button>
                            </div>

                            {/* เนื้อหา Tabs */}
                            <div className="bg-[#fdfcf6] border-t-4 border-[#3a7c50] rounded-b-xl shadow-sm p-6 text-left min-h-[150px]">
                                {/* เนื้อหา: รายละเอียดสินค้า */}
                                {activeTab === 'description' && (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-600 leading-relaxed whitespace-pre-line transition-all duration-300">
                                                {displayedDescription}
                                                {isLongDescription && !showFullDescription && <span className="text-gray-400">...</span>}
                                            </p>

                                            {isLongDescription && (
                                                <button
                                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                                    className="mt-3 flex items-center gap-1 text-[#2a6b3b] font-semibold hover:text-[#1f502c] transition-colors"
                                                >
                                                    {showFullDescription ? (
                                                        <><ChevronUp size={18} /> แสดงน้อยลง</>
                                                    ) : (
                                                        <><ChevronDown size={18} /> แสดงรายละเอียดเพิ่มเติม</>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* 🌟 ส่วนแสดง รหัสสินค้า, หมวดหมู่ และ คุณสมบัติ (Specifications) */}
                                        <div className="pt-4 mt-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-600"><span className="font-medium">รหัสสินค้า:</span> {product.id}</p>

                                            {(product.type || product.detail?.type) && (
                                                <p className="text-sm text-gray-600 mt-1"><span className="font-medium">ประเภท:</span> {product.type || product.detail?.type}</p>
                                            )}

                                            {product.category && (
                                                <p className="text-sm text-gray-600 mt-1"><span className="font-medium">หมวดหมู่:</span> {product.category.name}</p>
                                            )}

                                            {/* โค้ดสำหรับดึง Specifications มาแสดงผล */}
                                            {(() => {
                                                const specs = product.specifications || product.detail?.specifications;
                                                if (!specs) return null;

                                                // กรณีเก็บเป็น JSON Object
                                                if (typeof specs === 'object' && !Array.isArray(specs)) {
                                                    return Object.entries(specs).map(([key, value]) => (
                                                        <p key={key} className="text-sm text-gray-600 mt-1">
                                                            <span className="font-medium">{key}:</span> {String(value)}
                                                        </p>
                                                    ));
                                                }
                                                // กรณีเก็บเป็นข้อความ (String)
                                                if (typeof specs === 'string') {
                                                    return (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            <span className="font-medium">คุณสมบัติ:</span> {specs}
                                                        </p>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* เนื้อหา: วิธีใช้งาน */}
                                {activeTab === 'howToUse' && (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-600 leading-relaxed whitespace-pre-line transition-all duration-300">
                                                {displayedHowToUse}
                                                {isLongHowToUse && !showFullHowToUse && <span className="text-gray-400">...</span>}
                                            </p>

                                            {isLongHowToUse && (
                                                <button
                                                    onClick={() => setShowFullHowToUse(!showFullHowToUse)}
                                                    className="mt-3 flex items-center gap-1 text-[#2a6b3b] font-semibold hover:text-[#1f502c] transition-colors"
                                                >
                                                    {showFullHowToUse ? (
                                                        <><ChevronUp size={18} /> แสดงน้อยลง</>
                                                    ) : (
                                                        <><ChevronDown size={18} /> แสดงรายละเอียดเพิ่มเติม</>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* ---------------- สินค้าแนะนำ (แบบเดียวกับหน้า Home) - ย้ายออกมานอก Container เพื่อให้เต็มจอ ---------------- */}
                    {!relatedLoading && relatedProducts.length > 0 && (
                        <div className="mt-12 w-full">
                            <Box
                                allProducts={relatedProducts.map(p => ({
                                    ...p,
                                    isRecommend: p.isRecommend || false,
                                    isPromotion: p.isPromotion || false
                                }))}
                                type="related"
                                title="สินค้าที่คล้ายกัน"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Modal ดูรูปทั้งหมด */}
            {showAllImagesModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between bg-white">
                            <h3 className="text-xl font-bold text-[#1f502c]">รูปภาพทั้งหมด ({displayImages.length})</h3>
                            <button onClick={() => setShowAllImagesModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full">✕</button>
                        </div>
                        <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {displayImages.map((image, idx) => (
                                <div key={idx} onClick={() => { setSelectedImageIndex(idx); setShowAllImagesModal(false); }} className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer ${idx === selectedImageIndex ? 'border-[#2a6b3b]' : 'border-transparent'}`}>
                                    <img src={image} className="w-full h-full object-cover" alt="รูปขยาย" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};