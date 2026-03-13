import React, { useState, useEffect } from 'react';
import { Box } from '../components/banner';
import Search from '../components/search';
import api from '../services/api';

import HomeImage from '../assets/images/Home.png';

const Home: React.FC = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    // ฟังก์ชันช่วยจัดการรูปภาพ (เพราะ API ส่งมาเป็น Array)
    const getFirstImage = (p: any) => {
      const urls = p.thumbnailUrls || p.imageUrls || p.thumbnailUrl || p.imageUrl;
      return Array.isArray(urls) ? urls[0] : urls;
    };

    // ฟังก์ชันดึงข้อมูลรีวิวเพื่อคำนวณคะแนน
    const fetchReviewsAndCalculateRating = async (productId: string) => {
      try {
        const reviewsResponse = await api.get(`/product/${productId}/reviews`);
        const reviewsData = reviewsResponse.data;
        
        if (reviewsData && reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0);
          const avgRating = Math.round((totalRating / reviewsData.length) * 10) / 10;
          return {
            rating: avgRating,
            reviewCount: reviewsData.length
          };
        }
      } catch (error) {
        console.error(`Error fetching reviews for ${productId}:`, error);
      }
      // Return 0 when no reviews exist or API fails - don't use potentially incorrect product data
      return { rating: 0, reviewCount: 0 };
    };

    // 1. Fetch products that are on promotion
    api.get('/product/promotions')
      .then(async res => {
        const productsWithRating = await Promise.all(
          res.data.map(async (p: any) => {
            const ratingData = await fetchReviewsAndCalculateRating(p.id);
            return {
              ...p,
              image: getFirstImage(p),
              stock: p.stockQuantity ?? p.stock ?? 0,
              isRecommend: p.isFeatured,
              isPromotion: true,
              // ใช้เฉพาะข้อมูลจากรีวิวจริงเท่านั้น
              rating: ratingData.rating,
              favoriteCount: Number(p.favoriteCount) || 0,
              reviewCount: ratingData.reviewCount,
              soldCount: Number(p.soldCount) || 0
            };
          })
        );
        setPromotions(productsWithRating);
      })
      .catch(err => console.error("Error fetching promotions:", err));

    // 2. Fetch products that are featured (สินค้าแนะนำ)
    api.get('/product/featured')
      .then(async res => {
        const productsWithRating = await Promise.all(
          res.data.map(async (p: any) => {
            const ratingData = await fetchReviewsAndCalculateRating(p.id);
            return {
              ...p,
              image: getFirstImage(p),
              stock: p.stockQuantity ?? p.stock ?? 0,
              isRecommend: true,
              isPromotion: p.isPromotion || false,
              // ใช้เฉพาะข้อมูลจากรีวิวจริงเท่านั้น
              rating: ratingData.rating,
              favoriteCount: Number(p.favoriteCount) || 0,
              reviewCount: ratingData.reviewCount,
              soldCount: Number(p.soldCount) || 0
            };
          })
        );
        setFeatured(productsWithRating);
      })
      .catch(err => console.error("Error fetching featured products:", err));

    // 3. Fetch all products
    api.get('/product')
      .then(async res => {
        const productsWithRating = await Promise.all(
          res.data.map(async (p: any) => {
            const ratingData = await fetchReviewsAndCalculateRating(p.id);
            return {
              ...p,
              image: getFirstImage(p),
              stock: p.stockQuantity ?? p.stock ?? 0,
              isRecommend: p.isFeatured || false,
              isPromotion: p.isPromotion || false,
              // ใช้เฉพาะข้อมูลจากรีวิวจริงเท่านั้น
              rating: ratingData.rating,
              favoriteCount: Number(p.favoriteCount) || 0,
              reviewCount: ratingData.reviewCount,
              soldCount: Number(p.soldCount) || 0
            };
          })
        );
        setAllProducts(productsWithRating);
      })
      .catch(err => console.error("Error fetching all products:", err));
  }, []);

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
        <Box allProducts={allProducts} type="all" />
      </div>
    </div>
  );
};

export default Home;