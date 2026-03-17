import { type ProductCard } from "../types";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FavoritesService } from '../services/favoritesService';
import { optimizeImage } from '../utils/imageUtils';

type ExtendedProductCard = ProductCard & {
    imageUrls?: string[] | string;
    imageUrl?: string;
};

export const Products = (props: ExtendedProductCard) => {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
    const [productData, setProductData] = useState({
        rating: Number(props.rating) || 0,
        reviewCount: Number(props.reviewCount) || 0,
        favoriteCount: Number(props.favoriteCount) || 0,
        soldCount: Number(props.soldCount) || 0,
        stock: Number(props.stock) || 0
    });

    useEffect(() => {
        if (props.id) {
            setIsFavorite(FavoritesService.isFavorite(props.id));

            // ใช้ข้อมูลจาก props ที่ Home.tsx ส่งมาโดยตรง (จาก Supabase)
            // ไม่ต้องดึงข้อมูลใหม่ เพราะ Home.tsx ดึงจาก Supabse มาแล้ว
            setProductData({
                rating: Number(props.rating) || 0,
                reviewCount: Number(props.reviewCount) || 0,
                favoriteCount: Number(props.favoriteCount) || 0,
                soldCount: Number(props.soldCount) || 0,
                stock: Number(props.stock) || 0
            });
        }
    }, [props.id, props.rating, props.reviewCount, props.favoriteCount, props.soldCount, props.stock]);

    const handleProductClick = () => {
        if (props.id) {
            navigate(`/product/${props.id}`);
        }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!props.id) return;

        // Optimistic update
        const previousStatus = isFavorite;
        const newFavoriteStatus = !previousStatus;
        setIsFavorite(newFavoriteStatus);
        
        // Update local favorite count for immediate feedback
        setProductData(prev => ({
            ...prev,
            favoriteCount: newFavoriteStatus ? (prev.favoriteCount + 1) : Math.max(0, prev.favoriteCount - 1)
        }));

        try {
            // Call the async service (handles backend add/remove + increment/decrement)
            await FavoritesService.toggleFavorite(props.id);
            console.log(`Toggled favorite for product ${props.id} successfully`);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Revert state on error
            setIsFavorite(previousStatus);
            setProductData(prev => ({
                ...prev,
                favoriteCount: Number(props.favoriteCount) || 0
            }));
        }
    };

    // ฟังก์ชันจัดการรูปภาพแบบฉลาดสุดๆ (พร้อม Image Transformation และ Thumbnail)
    const getDisplayImage = () => {
        let finalImage = '';

        // 1. ลองใช้ Thumbnail ก่อน (ประหยัดสุด)
        const thumbnails = props.thumbnailUrls;
        if (thumbnails) {
            if (Array.isArray(thumbnails) && thumbnails.length > 0) {
                finalImage = thumbnails[0];
            } else if (typeof thumbnails === 'string' && thumbnails.startsWith('[')) {
                try {
                    const parsed = JSON.parse(thumbnails);
                    if (Array.isArray(parsed) && parsed.length > 0) finalImage = parsed[0];
                } catch (e) { }
            } else if (typeof thumbnails === 'string') {
                finalImage = thumbnails;
            }
        }

        // 2. ถ้าไม่มี Thumbnail ค่อยใช้รูปเต็ม (ถ้ามี)
        if (!finalImage && props.imageUrls) {
            if (Array.isArray(props.imageUrls) && props.imageUrls.length > 0) {
                finalImage = props.imageUrls[0];
            } else if (typeof props.imageUrls === 'string' && props.imageUrls.startsWith('[')) {
                try {
                    const parsed = JSON.parse(props.imageUrls);
                    if (Array.isArray(parsed) && parsed.length > 0) finalImage = parsed[0];
                } catch (e) { }
            }
        }

        if (!finalImage) finalImage = props.imageUrl || props.image || '';
        if (!finalImage) return 'https://placehold.co/290x290/f1f5f9/94a3b8?text=No+Image';

        // ใช้ Image Transformation เพื่อลด Egress (Resize เป็น 400px สำหรับ Thumbnail)
        return optimizeImage(finalImage, { width: 400, quality: 80 });
    };

    const displayImage = getDisplayImage();

    return (
        // ✅ 1. เอา max-w-[320px] ออก เปลี่ยนเป็น w-full h-full ยืดหยุ่นตามกล่องที่ครอบ
        <div
            className="w-full h-full cursor-pointer group/card flex flex-col"
            onClick={handleProductClick}
        >
            <div className="w-full h-full bg-[#fffef2] flex flex-col rounded-[18px] p-4 shadow-[0px_3px_14px_#00000025] hover:shadow-[0px_7px_20px_#00000040] transition-all duration-300">

                {/* ✅ 2. กรอบรูปภาพ: ลบ absolute ออก ใช้ flex ยืดหยุ่น */}
                <div className="relative w-full aspect-square bg-white rounded-[14px] overflow-hidden border-2 border-solid border-[#256d45] shadow-[0px_3px_6px_#00000020] group-hover/card:border-[var(--color-primary-hover)] transition-colors mb-4">
                    <img
                        className="w-full h-full p-2 object-contain"
                        alt={props.name || "Product"}
                        src={displayImage}
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/290x290/fee2e2/ef4444?text=Error';
                        }}
                    />

                    <button
                        onClick={toggleFavorite}
                        className="w-8 h-8 md:w-10 md:h-10 object-contain absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors z-10 flex items-center justify-center shadow-sm"
                        title={isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มไปยังรายการโปรด"}
                    >
                        <svg
                            className={`w-6 h-6 md:w-8 md:h-8 transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
                            fill={isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* ✅ 3. ส่วนข้อความด้านล่าง: ลบ absolute ออก ให้มันไหลต่อจากรูปภาพตามธรรมชาติ */}
                <div className="flex flex-col flex-1 text-[#256d45]">

                    {/* ชื่อสินค้า */}
                    <div className="text-lg md:text-xl text-left font-semibold tracking-wide leading-tight line-clamp-2 mb-2">
                        {props.name}
                    </div>

                    {/* ดาว และ ยอดไลค์ */}
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-1">
                            <div className="flex text-[#fbbf24] text-base">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const rating = Number(productData.rating || 0);
                                    const isFull = star <= Math.floor(rating);
                                    const isHalf = !isFull && star <= Math.ceil(rating) && (rating % 1 >= 0.5);

                                    return (
                                        <div key={star} className="relative inline-block leading-none">
                                            <span className="text-base text-gray-300">★</span>
                                            {isFull && (
                                                <span className="absolute top-0 left-0 text-base text-[#fbbf24]">★</span>
                                            )}
                                            {isHalf && (
                                                <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
                                                    <span className="text-base text-[#fbbf24]">★</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <span className="text-sm font-semibold whitespace-nowrap">{Number(productData.rating || 0).toFixed(1)}/5.0</span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">({productData.reviewCount || 0} รีวิว)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 shrink-0">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-normal">{productData.favoriteCount || 0}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-1.5">
                        <div className="font-normal opacity-75">มีจำนวน {productData.stock} ชิ้น</div>
                        <div className="font-normal bg-gray-100 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-tighter">ขายแล้ว {productData.soldCount || 0}</div>
                    </div>

                    {/* ราคา (ดันให้อยู่ล่างสุดเสมอด้วย mt-auto) */}
                    <div className="text-lg md:text-xl font-bold text-right mt-4 text-[#256d45]">
                        {typeof props.price === 'number' ? props.price.toFixed(2) : props.price} บาท
                    </div>
                </div>

            </div>
        </div>
    );
};