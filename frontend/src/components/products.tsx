import { type ProductCard } from "../types";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FavoritesService } from '../services/favoritesService';

type ExtendedProductCard = ProductCard & { 
    imageUrls?: string[] | string; 
    imageUrl?: string; 
};

export const Products = (props: ExtendedProductCard) => {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (props.id) {
            setIsFavorite(FavoritesService.isFavorite(props.id));
        }
    }, [props.id]);

    const handleProductClick = () => {
        if (props.id) {
            navigate(`/product/${props.id}`);
        }
    };

    const toggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!props.id) return;
        const newFavoriteStatus = FavoritesService.toggleFavorite(props.id);
        setIsFavorite(newFavoriteStatus);
    };

    // 🌟 ฟังก์ชันจัดการรูปภาพแบบฉลาดสุดๆ (อัปเดตใหม่)
    const getDisplayImage = () => {
        let finalImage = '';

        // 1. ลองดึงจาก imageUrls ก่อน
        if (props.imageUrls) {
        if (Array.isArray(props.imageUrls) && props.imageUrls.length > 0) {
            finalImage = props.imageUrls[0]; // <--- ตรงนี้แหละครับที่มันหยิบรูปแรกมาใช้!
        } else if (typeof props.imageUrls === 'string') {
                try {
                    const parsed = JSON.parse(props.imageUrls);
                    if (Array.isArray(parsed) && parsed.length > 0) finalImage = parsed[0];
                } catch (e) {
                    finalImage = props.imageUrls;
                }
            }
        }

        // 2. ถ้ายังไม่มี ให้ลองใช้ imageUrl หรือ image
        if (!finalImage) {
            finalImage = props.imageUrl || props.image || '';
        }

        // 3. ถ้าไม่มีรูปภาพเลย ให้แสดงรูป placeholder
        if (!finalImage) {
            return 'https://placehold.co/290x290/f1f5f9/94a3b8?text=No+Image';
        }

        // 4. ถ้าเป็นข้อมูล Mock (มีคำว่า api/placeholder) ให้ดึงจากเว็บ Placehold แทน จะได้ไม่ติด 404
        if (finalImage.includes('api/placeholder')) {
            return 'https://placehold.co/290x290/e2e8f0/64748b?text=Mock+Product';
        }

        // 5. ตรวจสอบว่าต้องเติม Base URL ไหม (รูปที่อัปโหลดจริง)
        // ⚠️ สำคัญ: ถ้า Backend รันพอร์ตอื่น (เช่น 8000) ให้แก้เลข 3000 ด้านล่างนี้นะครับ
        if (finalImage.startsWith('/uploads') || finalImage.startsWith('/images') || finalImage.startsWith('/api')) {
            const API_BASE_URL = 'http://localhost:3000'; 
            return `${API_BASE_URL}${finalImage}`;
        }

        // 6. ถ้าเป็น URL เต็มๆ อยู่แล้ว ก็ใช้ได้เลย
        return finalImage;
    };

    const displayImage = getDisplayImage();

    return (
        <div
            className="relative w-[340px] h-[480px] shrink-0 cursor-pointer group/card"
            onClick={handleProductClick}
        >
            <div className="relative w-full h-[95%] bg-[#fffef2] rounded-[20px] shadow-[0px_4px_20px_#00000040] hover:shadow-[0px_8px_30px_#00000050] transition-all duration-300">
                <div
                    className="absolute w-[290px] h-[290px] top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-[20px] overflow-hidden border-2 border-solid border-[#256d45] shadow-[0px_4px_10px_#00000030] group-hover/card:border-[var(--color-primary-hover)] transition-colors"
                >
                    <img
                        className="absolute w-full h-full p-4 left-1/2 transform -translate-x-1/2 object-contain"
                        alt={props.name || "Product"}
                        src={displayImage}
                        // ถ้ารูปโหลดพัง (เช่น ลิงก์เสีย) ให้สลับไปใช้รูป Placeholder
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/290x290/fee2e2/ef4444?text=Error';
                        }}
                    />
                    
                    <button
                        onClick={toggleFavorite}
                        className="w-10 h-10 object-contain absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors z-10"
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
                </div>

                <div className="absolute w-[290px] top-[325px] left-1/2 -translate-x-1/2 font-medium text-[#256d45]">
                    <div className="flex items-baseline mb-1">
                        <div className=" text-2xl text-left font-semibold tracking-[0.05em] leading-[normal] truncate">{props.name}</div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <div className="flex text-[#fbbf24] shrink-0">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className="text-base">
                                        {star <= Math.round(props.rating || 0) ? "★" : "☆"}
                                    </span>
                                ))}
                            </div>
                            <span className="text-sm font-semibold whitespace-nowrap">{(props.rating || 0).toFixed(1)}/5.0</span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">({props.reviewCount || 0} รีวิว)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 shrink-0">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-normal">{props.favoriteCount || 0}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-1.5">
                        <div className="font-normal opacity-75">มีจำนวน {props.stock} ชิ้น</div>
                        <div className="font-normal bg-gray-100 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-tighter">ขายแล้ว {props.soldCount || 0}</div>
                    </div>
                    <div className="flex justify-end items-center">
                        <div className="text-xl font-bold text-right whitespace-nowrap">{typeof props.price === 'number' ? props.price.toFixed(2) : props.price} บาท</div>
                    </div>
                </div>
            </div>
        </div>
    );
};