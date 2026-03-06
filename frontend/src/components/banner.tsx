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
    className={`absolute top-1/2 -translate-y-1/2 z-20 w-20 h-20 flex items-center justify-center transition-transform rounded-full active:scale-90 ${direction === 'left' ? 'left-8' : 'right-8'
      }`}
  >
    <img
      src={direction === 'left' ? Arrowright : Arrowleft}
      alt={`nav-${direction}`}
      className="w-full h-full object-contain"
    />
  </button>
);

export const Box = ({ allProducts, type }: BoxProps): JSX.Element | null => {

  // เช็คว่าเป็นโหมดแนะนำหรือไม่
  const isRecommend = type === 'recommend';

  const title = type === 'recommend' ? "สินค้าแนะนำ" : type === 'promotion' ? "สินค้าโปรโมชั่น" : "สินค้าทั้งหมด";

  // 1. กรองข้อมูลตามประเภท
  let products = allProducts.filter(product => {
    if (type === 'all') return true;
    return type === 'recommend' ? product.isRecommend : product.isPromotion;
  });

  // 2. ตัดจำนวน "เฉพาะ" สินค้าแนะนำ ให้เหลือ 8 ชิ้น
  if (isRecommend) {
    products = products.slice(0, 8);
  }
  // (ถ้าเป็น promotion จะข้ามบรรทัดบนไป ทำให้แสดงครบทุกชิ้นที่มี)

  if (products.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
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

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      handleScroll();
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [products]);

  return (
    <section className={`w-full ${type === 'all' ? 'py-10' : 'h-160 py-10 bg-[#fffef2] mb-12'} overflow-hidden`}>
      <div className="w-full mx-auto px-6 md:px-16 lg:px-32">

        {/* Header */}
        <header className="flex flex-col items-center mt-1">
          <h2 className="text-[3rem] font-semibold text-[#256d45] [text-shadow:0px_4px_20px_#00000040] text-center [-webkit-text-stroke:2px_#256d45] tracking-[0.05em] leading-[normal]">
            {title}
          </h2>
          <div className="w-[80%] h-0.75 bg-[#256d45] mt-2 rounded-full" />
        </header>

        {/* Content Area */}
        {type === 'all' ? (
          /* Grid Layout for "All Products" */
          <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-x-4 gap-y-12 mt-12 justify-items-center">
            {products.map((product) => (
              <div key={product.id} className="transition-transform hover:scale-105 duration-300">
                <Products
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  stock={product.stock}
                  image={product.image}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Slider Layout for Promotions & Recommend */
          <div className="relative group">
            {showLeftBtn && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30">
                <NavButton direction="left" onClick={() => scroll('left')} />
              </div>
            )}

            {showRightBtn && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30">
                <NavButton direction="right" onClick={() => scroll('right')} />
              </div>
            )}

            <div
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth py-6 mt-2 px-10"
            >
              {products.map((product) => (
                <div key={product.id} className="shrink-0 transition-transform hover:scale-105 duration-300">
                  <Products
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    stock={product.stock}
                    image={product.image}
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