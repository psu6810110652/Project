import React from 'react';
import { Box } from '../components/banner';
import Search from '../components/search';

import HomeImage from '../assets/images/Home.png';

// จำลองข้อมูลสินค้า
const mockProducts = [
  {
    id: 1,
    title: "ชุดปุ๋ยอินทรีย์ Teerayut",
    price: 250,
    stock: 15,
    productImage: "../src/assets/images/test.png",
    isRecommend: true,
    isPromotion: false
  },
  {
    id: 2,
    title: "เมล็ดพันธุ์แครอทออร์แกนิก",
    price: 45,
    stock: 50,
    productImage: "https://via.placeholder.com/300x400/e2e8f0/256d45?text=Product+2",
    isRecommend: true,
    isPromotion: true
  },
  {
    id: 3,
    title: "บัวรดน้ำเซรามิกสีพาสเทล",
    price: 390,
    stock: 5,
    productImage: "https://via.placeholder.com/300x400/e2e8f0/256d45?text=Product+3",
    isRecommend: true,
    isPromotion: false
  },
  {
    id: 4,
    title: "สเปรย์บำรุงใบ Kanpleet",
    price: 185,
    stock: 20,
    productImage: "https://via.placeholder.com/300x400/e2e8f0/256d45?text=Product+4",
    isRecommend: true,
    isPromotion: false
  },
  {
    id: 5,
    title: "สมุนไพรไล่แมลงสูตรเข้มข้น",
    price: 120,
    stock: 12,
    productImage: "https://via.placeholder.com/300x400/e2e8f0/256d45?text=Product+5",
    isRecommend: true,
    isPromotion: true
  },
  {
    id: 6,
    title: "จอบทำสวนสแตนเลส",
    price: 450,
    stock: 8,
    productImage: "https://via.placeholder.com/300x400/e2e8f0/256d45?text=Product+6",
    isRecommend: true,
    isPromotion: false
  },
  {
    id: 7,
    title: "กระถางต้นไม้ดินเผาใบใหญ่",
    price: 590,
    stock: 3,
    productImage: "https://via.placeholder.com/300x400/e2e8f0/256d45?text=Product+7",
    isRecommend: true,
    isPromotion: false
  },
  {
    id: 8,
    title: "ถุงมือทำสวนกันหนาม",
    price: 89,
    stock: 30,
    productImage: "https://via.placeholder.com/300x400/e2e8f0/256d45?text=Product+8",
    isRecommend: true,
    isPromotion: false
  }
];

const Home: React.FC = () => {
  return (
    <div className="mt-5 mb-10 relative overflow-hidden">

      {/* -------------------------------------------
          SECTION: HERO BANNER
      ------------------------------------------- */}
      <section className="z-0 -ml-0.5 w-full h-150 relative ">
        <img
          className="absolute top-0 left-0.5 w-full h-150"
          alt="Rectangle"
          src={HomeImage}
        />

        <div className="absolute top-1/2 -translate-y-1/2 w-full h-73 bg-[#fffef280]" />

        <div className="absolute top-1/2 -translate-y-1/2 w-full h-35 bg-[#fffef2bf]" />

        <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [text-shadow:0px_4px_20px_#00000040] text-[#256d45] text-[5rem] text-center font-semibold [-webkit-text-stroke:3.5px_#256d45] tracking-[0.05em] leading-[normal]">
            ธีรยุทธการเกษตร
        </h2>
      </section>

      {/* -------------------------------------------
          SECTION: SEARCH BAR
      ------------------------------------------- */}
      <Search />

      <div className="h-5" /> 

      <Box allProducts={mockProducts} type="recommend" />

      <div className="h-20" /> 

      <Box allProducts={mockProducts} type="promotion" />
    </div>
  );
};

export default Home;