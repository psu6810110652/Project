import React, { useState, useEffect } from 'react';
import { Box } from '../components/banner';
import Search from '../components/search';
import axios from 'axios';

import HomeImage from '../assets/images/Home.png';

const Home: React.FC = () => {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    // Fetch products that are on promotion
    axios.get('/api/product/promotions')
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
  }, []);

  return (
    <div className="mb-10 relative overflow-hidden">

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

      <div className="h-6" />

      {/* Display promotional products */}
      <Box allProducts={promotions} type="promotion" />
    </div>
  );
};

export default Home;