import { useState, useEffect } from 'react';
import api from '../services/api';
import { type Product } from '../types';

export const useProductDetail = (id: string | undefined) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [productLoading, setProductLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) {
                setMessage('ไม่พบ ID สินค้า');
                setProductLoading(false);
                return;
            }

            setProductLoading(true);
            try {
                const response = await api.get(`/product/${id}`);
                const data = response.data;
                setProduct(data);

                // Check if product is in favorites
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                setIsFavorite(favorites.includes(id));

                // Use pre-calculated rating and count from product data
                setAverageRating(Number(data.rating) || 0);
                setTotalReviews(Number(data.reviewCount) || 0);
            } catch (error) {
                console.error('Error fetching product:', error);
                setMessage(`ไม่สามารถโหลดข้อมูลสินค้าได้: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                setProductLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Fetch related products
    useEffect(() => {
        // 🌟 1. ดึงค่า categoryId ออกมาเก็บไว้ในตัวแปรก่อน
        const categoryId = product?.category?.id;

        const fetchRelatedProducts = async () => {
            // 🌟 2. ดักเช็คจากตัวแปรนี้แทน ถ้าไม่มีให้หยุดการทำงาน
            if (!categoryId || !id) return;

            setRelatedLoading(true);
            try {
                // Fetch recommended only 5 items from the same category to save Egress
                // 🌟 3. เรียกใช้ตัวแปร categoryId ที่ถูกรับรองแล้วว่ามีค่าแน่นอน (เป็น number 100%)
                const response = await api.get(`/product/category/${categoryId}?limit=6`);
                
                // รองรับทั้งแบบ API ส่งมาเป็น Object { items: [...] } และแบบ Array ตรงๆ
                const items = response.data.items || response.data;

                // Filter out current product
                const related = items
                    .filter((p: any) => p.id !== id)
                    .slice(0, 4);

                setRelatedProducts(related);
            } catch (error) {
                console.error('Error fetching related products:', error);
                setRelatedProducts([]);
            } finally {
                setRelatedLoading(false);
            }
        };

        // เรียกใช้งานเฉพาะเมื่อมี categoryId
        if (categoryId) {
            fetchRelatedProducts();
        }
    }, [product?.category?.id, id]);
    const toggleFavorite = async () => {
        if (!id) return;

        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const newFavoriteStatus = !isFavorite;

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

        // Update favorite count on backend
        try {
            // Fetch current product data to get accurate favorite count (or use state if reliable)
            const currentFavoriteCount = Number(product?.favoriteCount) || 0;
            const newFavoriteCount = newFavoriteStatus ? currentFavoriteCount + 1 : Math.max(0, currentFavoriteCount - 1);

            // Update backend
            await api.patch(`/product/${id}/stats`, {
                favoriteCount: newFavoriteCount
            });

            // Update local state to reflect new count
            setProduct(prev => prev ? { ...prev, favoriteCount: newFavoriteCount } : prev);
        } catch (error) {
            console.error('Error updating favorite count:', error);
        }

        setTimeout(() => setMessage(''), 2000);
    };

    return {
        product,
        productLoading,
        message,
        setMessage,
        averageRating,
        totalReviews,
        isFavorite,
        toggleFavorite,
        relatedProducts,
        relatedLoading,
    };
};
