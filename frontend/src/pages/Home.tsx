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
    // Fetch products that are on promotion with detailed data like ProductDetail
    api.get('/product/promotions')
      .then(async (res) => {
        // For each product, fetch detailed reviews like ProductDetail does
        const productsWithDetails = await Promise.all(
          res.data.map(async (p: any) => {
            try {
              // Fetch reviews for each product to calculate real rating
              const reviewsResponse = await api.get(`/product/${p.id}/reviews`);
              const reviewsData = reviewsResponse.data;
              
              let averageRating = p.rating || 0;
              let totalReviews = p.reviewCount || 0;
              
              // Calculate average rating from reviews like ProductDetail
              if (reviewsData && reviewsData.length > 0) {
                const totalRating = reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0);
                averageRating = Math.round((totalRating / reviewsData.length) * 10) / 10;
                totalReviews = reviewsData.length;
              }
              
              return {
                ...p,
                image: p.thumbnailUrl || p.imageUrl,
                stock: p.stockQuantity ?? p.stock ?? 0,
                isRecommend: p.isFeatured,
                isPromotion: true,
                rating: averageRating,
                favoriteCount: p.favoriteCount || 0,
                reviewCount: totalReviews,
                soldCount: p.soldCount || 0
              };
            } catch (error) {
              console.error(`Error fetching reviews for product ${p.id}:`, error);
              // Fallback to basic product data
              return {
                ...p,
                image: p.thumbnailUrl || p.imageUrl,
                stock: p.stockQuantity ?? p.stock ?? 0,
                isRecommend: p.isFeatured,
                isPromotion: true,
                rating: p.rating || 0,
                favoriteCount: p.favoriteCount || 0,
                reviewCount: p.reviewCount || 0,
                soldCount: p.soldCount || 0
              };
            }
          })
        );
        setPromotions(productsWithDetails);
      })
      .catch(err => {
        console.error("Error fetching promotions:", err);
      });

    // Fetch products that are featured (สินค้าแนะนำ) with detailed data like ProductDetail
    api.get('/product/featured')
      .then(async (res) => {
        // For each product, fetch detailed reviews like ProductDetail does
        const productsWithDetails = await Promise.all(
          res.data.map(async (p: any) => {
            try {
              // Fetch reviews for each product to calculate real rating
              const reviewsResponse = await api.get(`/product/${p.id}/reviews`);
              const reviewsData = reviewsResponse.data;
              
              let averageRating = p.rating || 0;
              let totalReviews = p.reviewCount || 0;
              
              // Calculate average rating from reviews like ProductDetail
              if (reviewsData && reviewsData.length > 0) {
                const totalRating = reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0);
                averageRating = Math.round((totalRating / reviewsData.length) * 10) / 10;
                totalReviews = reviewsData.length;
              }
              
              return {
                ...p,
                image: p.thumbnailUrl || p.imageUrl,
                stock: p.stockQuantity ?? p.stock ?? 0,
                isRecommend: true,
                isPromotion: p.isPromotion || false,
                rating: averageRating,
                favoriteCount: p.favoriteCount || 0,
                reviewCount: totalReviews,
                soldCount: p.soldCount || 0
              };
            } catch (error) {
              console.error(`Error fetching reviews for product ${p.id}:`, error);
              // Fallback to basic product data
              return {
                ...p,
                image: p.thumbnailUrl || p.imageUrl,
                stock: p.stockQuantity ?? p.stock ?? 0,
                isRecommend: true,
                isPromotion: p.isPromotion || false,
                rating: p.rating || 0,
                favoriteCount: p.favoriteCount || 0,
                reviewCount: p.reviewCount || 0,
                soldCount: p.soldCount || 0
              };
            }
          })
        );
        setFeatured(productsWithDetails);
      })
      .catch(err => {
        console.error("Error fetching featured products:", err);
      });

    // Fetch all products with detailed data like ProductDetail
    api.get('/product')
      .then(async (res) => {
        // For each product, fetch detailed reviews like ProductDetail does
        const productsWithDetails = await Promise.all(
          res.data.map(async (p: any) => {
            try {
              // Fetch reviews for each product to calculate real rating
              const reviewsResponse = await api.get(`/product/${p.id}/reviews`);
              const reviewsData = reviewsResponse.data;
              
              let averageRating = p.rating || 0;
              let totalReviews = p.reviewCount || 0;
              
              // Calculate average rating from reviews like ProductDetail
              if (reviewsData && reviewsData.length > 0) {
                const totalRating = reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0);
                averageRating = Math.round((totalRating / reviewsData.length) * 10) / 10;
                totalReviews = reviewsData.length;
              }
              
              return {
                ...p,
                image: p.thumbnailUrl || p.imageUrl,
                stock: p.stockQuantity ?? p.stock ?? 0,
                isRecommend: p.isFeatured || false,
                isPromotion: p.isPromotion || false,
                rating: averageRating,
                favoriteCount: p.favoriteCount || 0,
                reviewCount: totalReviews,
                soldCount: p.soldCount || 0
              };
            } catch (error) {
              console.error(`Error fetching reviews for product ${p.id}:`, error);
              // Fallback to basic product data
              return {
                ...p,
                image: p.thumbnailUrl || p.imageUrl,
                stock: p.stockQuantity ?? p.stock ?? 0,
                isRecommend: p.isFeatured || false,
                isPromotion: p.isPromotion || false,
                rating: p.rating || 0,
                favoriteCount: p.favoriteCount || 0,
                reviewCount: p.reviewCount || 0,
                soldCount: p.soldCount || 0
              };
            }
          })
        );
        setAllProducts(productsWithDetails);
      })
      .catch(err => {
        console.error("Error fetching all products:", err);
      });
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