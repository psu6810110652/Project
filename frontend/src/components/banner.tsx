import { useRef, useState, useEffect, type JSX } from 'react';
import { Products } from './products';
import { type ProductCard } from '../types';

interface BoxProps {
  allProducts: (ProductCard & {
    isRecommend?: boolean;
    isPromotion?: boolean;
  })[];
  type: 'recommend' | 'promotion' | 'all' | 'related';
  title?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export const Box = ({ allProducts, type, title: customTitle, onLoadMore, hasMore, loadingMore }: BoxProps): JSX.Element | null => {
  const isRecommend = type === 'recommend';
  const isRelated = type === 'related';
  const isPromotion = type === 'promotion';

  const title = customTitle || (isRecommend ? "สินค้าแนะนำ" : isPromotion ? "สินค้าโปรโมชั่น" : "สินค้าทั้งหมด");

  // 1. กรองข้อมูล
  let products = allProducts.filter(product => {
    if (type === 'all' || type === 'related') return true;
    return isRecommend ? product.isRecommend : product.isPromotion;
  });

  // 2. ตัดจำนวนเฉพาะสินค้าแนะนำ (ถ้ามีเยอะเกินไป)
  if (isRecommend && products.length > 12) {
    products = products.slice(0, 12);
  }

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const totalScroll = scrollWidth - clientWidth;

      // อัปเดตสถานะว่าเลื่อนได้หรือไม่
      setIsScrollable(totalScroll > 10);

      if (totalScroll > 0) {
        setScrollProgress((scrollLeft / totalScroll) * 100);
      }
    }
  };

  // ✅ ปรับปรุงระบบ Auto-scroll: เลื่อนเฉพาะ "สินค้าแนะนำ" เท่านั้น และหยุดเมื่อเมาส์ชี้
  useEffect(() => {
    if (type !== 'recommend' || products.length === 0 || isHovered) return;

    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (container) {
        const { scrollLeft, scrollWidth, clientWidth } = container;

        const firstItem = container.firstElementChild as HTMLElement;
        const gap = window.innerWidth >= 768 ? 24 : 16; // md:gap-6 คือ 24px, gap-4 คือ 16px
        const scrollAmount = firstItem.offsetWidth + gap;

        if (scrollLeft >= (scrollWidth * 2 / 3) - clientWidth) {
          container.scrollTo({ left: 0, behavior: 'auto' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [type, products.length, isHovered]);

  // ระบบเช็ค Scroll Progress และตั้งค่าเริ่มต้นสำหรับ Infinite Loop
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      handleScroll();

      // ถ้าเป็นสินค้าแนะนำ (Infinite Loop) ให้เริ่มที่เซตตรงกลางเพื่อให้ตัวแรกอยู่กลางจอพอดี
      if (isRecommend) {
        const scrollToMiddle = () => {
          if (scrollContainer.scrollWidth > 0) {
            scrollContainer.scrollLeft = scrollContainer.scrollWidth / 3;
          }
        };
        // รอให้ DOM render เสร็จก่อนคำนวณ
        setTimeout(scrollToMiddle, 100);
      }

      scrollContainer.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [products]);

  if (products.length === 0) return null;

  const isAll = type === 'all';
  // ทั้งสินค้าแนะนำ, โปรโมชั่น และสินค้าที่คล้ายกัน ให้กว้างสุดจอ
  const containerClass = (isRecommend || isPromotion || isRelated)
    ? "w-full"
    : "w-full max-w-7xl mx-auto px-4 md:px-10";

  return (
    <section className={`w-full py-10 bg-[#fffef2] ${isRecommend ? 'mb-4' : 'mb-12'}`}>
      <div className={containerClass}>

        {/* Header */}
        <header className="flex flex-col items-center mt-1 mb-8">
          <h2 className="text-3xl md:text-[3rem] font-semibold text-[#256d45] text-center tracking-wider leading-tight">
            {title}
          </h2>
          <div className="w-[80%] max-w-md h-1 bg-[#256d45] mt-4 rounded-full" />
        </header>

        {/* Content Area */}
        {isAll ? (
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
          <div
            className="relative group px-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              ref={scrollRef}
              className={`flex gap-4 md:gap-6 no-scrollbar py-10 w-full 
                ${!isRecommend ? 'px-6 md:px-10 lg:px-20' : 'px-4'}
                ${(isRecommend || (isRelated && products.length > 1) || (!isRelated && products.length > 4))
                  ? 'snap-x snap-proximity justify-start'
                  : 'justify-center'}`}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                overflowX: isRecommend
                  ? 'scroll'
                  : (isRelated && products.length > 1) || (!isRelated && products.length > 4)
                    ? 'scroll'
                    : 'hidden',
              }}
            >
              {isRecommend ? (
                /* Infinite Scroll Loop — repeat until ≥15 items so it always overflows the screen */
                (() => {
                  let repeated = [...products];
                  while (repeated.length < 15 && products.length > 0) {
                    repeated = [...repeated, ...products];
                  }
                  return repeated.map((product, idx) => (
                    <div
                      key={`${product.id}-${idx}`}
                      className="w-[220px] md:w-[280px] shrink-0 transition-transform duration-500 snap-start hover:scale-110 active:scale-105"
                    >
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
                  ));
                })()
              ) : (
                /* Normal Slider for Promotion / Related */
                products.map((product) => (
                  <div key={product.id} className="w-[220px] md:w-[280px] shrink-0 transition-transform duration-500 snap-center hover:scale-110 active:scale-105">
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
                ))
              )}
            </div>

            {/* ✅ Scroll Indicator & Hint - แสดงเฉพาะเมื่อมีเนื้อหาที่ต้องเลื่อน และสินค้า > 4 (สำหรับแบบไม่ Loop) */}
            {(isRecommend ? isScrollable : (isScrollable && products.length > 4)) && (
              <div className="flex flex-col items-center mt-4">
                {/* แถบเส้น Progress Bar */}
                <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-[#256d45] transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>

                {/* ไอคอนใบ้การเลื่อน */}
                <div className="flex items-center gap-2 text-[#256d45] opacity-60">
                  <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="text-sm font-medium">Scroll to explore</span>
                  <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Load More Button (Only for All Products) */}
        {onLoadMore && hasMore && (
          <div className="flex justify-center mt-12 mb-4">
            <button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="group relative px-7! py-3! bg-white border-2 border-[#256D45] text-[#256D45] text-xl font-bold rounded-full shadow-[0_4px_15px_rgba(37,109,69,0.1)] hover:bg-[#256D45] hover:text-white transition-all duration-300 disabled:bg-[#256D45] disabled:text-white disabled:opacity-70 flex items-center gap-4 active:scale-95"
            >
              {loadingMore ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังโหลดข้อมูล...</span>
                </>
              ) : (
                <>
                  <span>โหลดสินค้าเพิ่มเติม</span>
                  <svg className="w-6 h-6 transform group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {!isRecommend && type === 'all' && !hasMore && products.length > 0 && (
          <div className="flex justify-center mt-12 mb-4">
            <p className="text-gray-400 font-medium text-lg italic">— คุณได้ดูสินค้าทั้งหมดแล้ว —</p>
          </div>
        )}

      </div>
    </section>
  );
};