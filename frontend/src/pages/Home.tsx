import React, { useState, useEffect } from 'react';
import { Box } from '../components/banner';
import Search from '../components/search';
import api from '../services/api';

import HomeImage from '../assets/images/Home.png';

const Home: React.FC = () => {
  const [promotions, setPromotions] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    // Fetch products that are on promotion
    api.get('/product/promotions')
      .then(res => {
        const mappedProducts = res.data.map((p: any) => ({
          ...p,
          image: p.thumbnailUrl || p.imageUrl,
          stock: p.stockQuantity,
          isRecommend: p.isFeatured
        }));
        setPromotions(mappedProducts);
      })
      .catch(err => {
        console.error("Error fetching promotions:", err);
      });

    // Fetch products that are featured (สินค้าแนะนำ)
    api.get('/product/featured')
      .then(res => {
        const mappedProducts = res.data.map((p: any) => ({
          ...p,
          image: p.thumbnailUrl || p.imageUrl,
          stock: p.stockQuantity,
          isRecommend: true
        }));
        setFeatured(mappedProducts);
      })
      .catch(err => {
        console.error("Error fetching featured products:", err);
      });

    // Fetch all products
    api.get('/product')
      .then(res => {
        const mappedProducts = res.data.map((p: any) => ({
          ...p,
          image: p.thumbnailUrl || p.imageUrl,
          stock: p.stockQuantity ?? p.stock ?? 0,
        }));
        setAllProducts(mappedProducts);
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

        <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [text-shadow:0px_4px_20px_#00000040] text-[#256d45] text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] text-center font-semibold [-webkit-text-stroke:1px_#256d45] md:[-webkit-text-stroke:2.5px_#256d45] lg:[-webkit-text-stroke:3.5px_#256d45] tracking-[0.05em] leading-[normal] w-full px-4 wrap-break-words">
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