import React, { useState, useEffect } from 'react';
import { Box } from '../components/banner';
import Search from '../components/search';
import api from '../services/api';

import HomeImage from '../assets/images/Home.png';

const Home: React.FC = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // ฟังก์ชันช่วยจัดการรูปภาพ
    const getFirstImage = (p: any) => {
      const urls = p.thumbnailUrls || p.imageUrls || p.thumbnailUrl || p.imageUrl;
      return Array.isArray(urls) ? urls[0] : urls;
    };

    const fetchData = async () => {
      try {
        // Fetch all data in parallel to save time, with specific limits to save Egress
        const [promosRes, featuredRes, allRes] = await Promise.all([
          api.get('/product/promotions?limit=10'),
          api.get('/product/featured?limit=8'),
          api.get('/product?page=1&limit=20') // Reduce from 50 to 20 to save Egress
        ]);

        // Process Promotions
        const processedPromos = promosRes.data.map((p: any) => ({
          ...p,
          image: getFirstImage(p),
          stock: p.stockQuantity ?? p.stock ?? 0,
          isRecommend: p.isFeatured,
          isPromotion: true,
          rating: Number(p.rating) || 0,
          reviewCount: Number(p.reviewCount) || 0,
          favoriteCount: Number(p.favoriteCount) || 0,
          soldCount: Number(p.soldCount) || 0
        }));
        setPromotions(processedPromos);

        // Process Featured — ถ้าน้อยกว่า 5 ให้เติมจาก allProducts เพื่อให้ Carousel เลื่อนได้
        const processedFeatured = featuredRes.data.map((p: any) => ({
          ...p,
          image: getFirstImage(p),
          stock: p.stockQuantity ?? p.stock ?? 0,
          isRecommend: true,
          isPromotion: p.isPromotion || false,
          rating: Number(p.rating) || 0,
          reviewCount: Number(p.reviewCount) || 0,
          favoriteCount: Number(p.favoriteCount) || 0,
          soldCount: Number(p.soldCount) || 0
        }));

        // Fallback: ถ้า Featured < 5 ให้เติมจาก allProducts จนครบ 8 ชิ้น
        let finalFeatured = processedFeatured;
        if (processedFeatured.length < 5) {
          const allData = allRes.data;
          const items = Array.isArray(allData?.items)
            ? allData.items
            : (Array.isArray(allData) ? allData : []);

          const featuredIds = new Set(processedFeatured.map((p: any) => p.id));
          const fallbackProducts = items
            .filter((p: any) => !featuredIds.has(p.id))
            .slice(0, 8 - processedFeatured.length)
            .map((p: any) => ({
              ...p,
              image: getFirstImage(p),
              stock: p.stockQuantity ?? p.stock ?? 0,
              isRecommend: true,
              isPromotion: p.isPromotion || false,
              rating: Number(p.rating) || 0,
              reviewCount: Number(p.reviewCount) || 0,
              favoriteCount: Number(p.favoriteCount) || 0,
              soldCount: Number(p.soldCount) || 0
            }));
          finalFeatured = [...processedFeatured, ...fallbackProducts];
        }

        setFeatured(finalFeatured);

        // Process All Products
        const allData = allRes.data;
        const items = Array.isArray(allData?.items)
          ? allData.items
          : (Array.isArray(allData) ? allData : []);

        const processedAll = items.map((p: any) => ({
          ...p,
          image: getFirstImage(p),
          stock: p.stockQuantity ?? p.stock ?? 0,
          isRecommend: p.isFeatured || false,
          isPromotion: p.isPromotion || false,
          rating: Number(p.rating) || 0,
          reviewCount: Number(p.reviewCount) || 0,
          favoriteCount: Number(p.favoriteCount) || 0,
          soldCount: Number(p.soldCount) || 0
        }));
        setAllProducts(processedAll);

      } catch (err) {
        console.error("Error fetching homepage data:", err);
      }
    };

    fetchData();
  }, []);

  const fetchMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await api.get(`/product?page=${nextPage}&limit=20`);
      const allData = res.data;
      
      const items = Array.isArray(allData?.items) 
        ? allData.items 
        : (Array.isArray(allData) ? allData : []);

      if (items.length === 0) {
        setHasMore(false);
      } else {
        const getFirstImage = (p: any) => {
          const urls = p.thumbnailUrls || p.imageUrls || p.thumbnailUrl || p.imageUrl;
          return Array.isArray(urls) ? urls[0] : urls;
        };

        const processedNext = items.map((p: any) => ({
          ...p,
          image: getFirstImage(p),
          stock: p.stockQuantity ?? p.stock ?? 0,
          isRecommend: p.isFeatured || false,
          isPromotion: p.isPromotion || false,
          rating: Number(p.rating) || 0,
          reviewCount: Number(p.reviewCount) || 0,
          favoriteCount: Number(p.favoriteCount) || 0,
          soldCount: Number(p.soldCount) || 0
        }));

        setAllProducts(prev => [...prev, ...processedNext]);
        setCurrentPage(nextPage);
        
        if (allData.lastPage && nextPage >= allData.lastPage) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Error fetching more products:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="mb-10 relative overflow-hidden">

      {/* -------------------------------------------
          SECTION: HERO BANNER
      ------------------------------------------- */}
      <section className="z-0 w-full h-72 md:h-120 lg:h-150 relative">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          alt="Background Image"
          src={HomeImage}
        />

        <div className="absolute top-1/2 -translate-y-1/2 w-full h-32 md:h-48 lg:h-73 bg-[#fffef280]" />

        <div className="absolute top-1/2 -translate-y-1/2 w-full h-16 md:h-24 lg:h-35 bg-[#fffef2bf]" />

        <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [text-shadow:0px_4px_15px_rgba(0,0,0,0.2)] text-[#256d45] text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] text-center font-semibold tracking-widest leading-[normal] w-full px-4 wrap-break-words">
          ธีรยุทธการเกษตร
        </h2>
      </section>

      {/* -------------------------------------------
          SECTION: SEARCH BAR
      ------------------------------------------- */}
      <Search />

      <div className="h-6" />

      <div className="flex flex-col gap-y-16 mt-8">
        {/* สินค้าแนะนำ — products with isFeatured=true */}
        <Box allProducts={featured} type="recommend" />

        {/* สินค้าโปรโมชั่น — products with isPromotion=true */}
        <Box allProducts={promotions} type="promotion" />

        {/* สินค้าทั้งหมด */}
        <Box 
          allProducts={allProducts} 
          type="all" 
          onLoadMore={fetchMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
        />
      </div>
    </div>
  );
};

export default Home;