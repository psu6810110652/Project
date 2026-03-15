import { useRef, useState, useEffect, type JSX } from 'react';
import { Products } from './products';
import { type ProductCard } from '../types';

import Arrowleft from '../assets/svgs/arrow-left.svg';
import Arrowright from '../assets/svgs/arrow-right.svg';

interface BoxProps {
  allProducts: (ProductCard & {
    isRecommend: boolean;
    isPromotion: boolean;
  })[];
  type: 'recommend' | 'promotion' | 'all';
}

const NavButton = ({ direction, onClick }: { direction: 'left' | 'right', onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`absolute top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-16 md:h-16 bg-white/80 shadow-md flex items-center justify-center transition-transform rounded-full hover:scale-105 active:scale-95 ${direction === 'left' ? '-left-4 md:-left-8' : '-right-4 md:-right-8'
      }`}
  >
    <img
      src={direction === 'left' ? Arrowright : Arrowleft}
      alt={`nav-${direction}`}
    />
  </button>
);

export const Box = ({ allProducts, type }: BoxProps): JSX.Element | null => {
  const isRecommend = type === 'recommend';
  const title = isRecommend ? "สินค้าแนะนำ" : type === 'promotion' ? "สินค้าโปรโมชั่น" : "สินค้าทั้งหมด";

  // 1. กรองข้อมูล
  let products = allProducts.filter(product => {
    if (type === 'all') return true;
    return isRecommend ? product.isRecommend : product.isPromotion;
  });

  // 2. ตัดจำนวนเฉพาะสินค้าแนะนำ
  if (isRecommend) {
    products = products.slice(0, 8);
  }

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300; // ปรับระยะเลื่อนให้พอดีขึ้น
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftBtn(scrollLeft > 0);
      setShowRightBtn(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  // ✅ ย้าย useEffect มาไว้หลัง handleScroll และปรับให้เช็คขนาดหน้าจอด้วย
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      handleScroll(); // เช็คตอนโหลดครั้งแรก
      scrollContainer.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll); // เช็คตอนย่อขยายจอ

      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [products]);

  if (products.length === 0) return null;

  return (
    // ✅ เอา h-160 ออก เปลี่ยนเป็น py-10 ธรรมดา เพื่อให้ความสูงยืดหยุ่นตามของข้างใน
    <section className="w-full py-10 bg-[#fffef2] mb-12 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-10">

        {/* Header */}
        <header className="flex flex-col items-center mt-1 mb-8">
          <h2 className="text-3xl md:text-[3rem] font-semibold text-[#256d45] text-center tracking-wider leading-tight">
            {title}
          </h2>
          <div className="w-[80%] max-w-md h-1 bg-[#256d45] mt-4 rounded-full" />
        </header>

        {/* Content Area */}
        {type === 'all' ? (
          /* ✅ Grid Layout: ปรับให้ Responsive ชัดเจน ไม่ใช้ auto-fill ที่ 340px แข็งๆ */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8 justify-center">
            {products.map((product) => (
              <div key={product.id} className="transition-transform hover:scale-105 duration-300">
                <Products
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  stock={product.stock}
                  image={product.image}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  favoriteCount={product.favoriteCount}
                  soldCount={product.soldCount}
                  thumbnailUrls={product.thumbnailUrls}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Slider Layout */
          <div className="relative group px-4 md:px-8">
            {showLeftBtn && <NavButton direction="left" onClick={() => scroll('left')} />}
            {showRightBtn && <NavButton direction="right" onClick={() => scroll('right')} />}

            <div
              ref={scrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-6 w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // ซ่อน Scrollbar เผื่อคลาส no-scrollbar ไม่ทำงาน
            >
              {products.map((product) => (
                <div key={product.id} className="shrink-0 transition-transform hover:scale-105 duration-300">
                  <Products
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    stock={product.stock}
                    image={product.image}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    favoriteCount={product.favoriteCount}
                    soldCount={product.soldCount}
                    thumbnailUrls={product.thumbnailUrls}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};