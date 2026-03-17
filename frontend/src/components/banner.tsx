import { useRef, useState, useEffect, useMemo, type JSX } from 'react';
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

  // 1. กรองข้อมูล และสร้างชุดข้อมูลวนซ้ำสำหรับสินค้าแนะนำ (Infinite Loop)
  const products = useMemo(() => {
    let list = allProducts.filter(product => {
      if (type === 'all' || type === 'related') return true;
      return isRecommend ? product.isRecommend : product.isPromotion;
    });

    if (isRecommend && list.length > 12) {
      list = list.slice(0, 12);
    }
    return list;
  }, [allProducts, type, isRecommend]);

  // สร้างชุดข้อมูล 3 ชุดเพื่อให้เลื่อนได้เนียนๆ (Infinite Loop)
  const displayProducts = useMemo(() => {
    if (!isRecommend || products.length === 0) return products;

    let base = [...products];
    // ถ้าสินค้าน้อยเกินไป ให้เติมให้มองเห็นล้นจอ
    while (base.length < 5) {
      base = [...base, ...products];
    }
    return [...base, ...base, ...base];
  }, [products, isRecommend]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const lastUpdateRef = useRef(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const totalScroll = scrollWidth - clientWidth;

      if (isRecommend) {
        if (scrollLeft >= (scrollWidth * 2 / 3)) {
          scrollRef.current.scrollLeft = scrollLeft - (scrollWidth / 3);
        }
        else if (scrollLeft <= 10) {
          scrollRef.current.scrollLeft = scrollLeft + (scrollWidth / 3);
        }
      }

      const now = performance.now();
      if (now - lastUpdateRef.current > 16) {
        lastUpdateRef.current = now;

        requestAnimationFrame(() => {
          setIsScrollable(totalScroll > 10);
          if (totalScroll > 0) {
            if (isRecommend) {
              const setWidth = scrollWidth / 3;
              const relativeScroll = (scrollLeft % setWidth);
              setScrollProgress((relativeScroll / setWidth) * 100);
            } else {
              setScrollProgress((scrollLeft / totalScroll) * 100);
            }
          }
        });
      }
    }
  };

  useEffect(() => {
    if (type !== 'recommend' || products.length === 0 || isHovered || isTouched) return;

    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (container) {
        const { scrollLeft, scrollWidth } = container;
        const firstItem = container.firstElementChild as HTMLElement;
        const gap = window.innerWidth >= 768 ? 24 : 16;
        const scrollAmount = (firstItem?.offsetWidth || 280) + gap;

        if (scrollLeft >= (scrollWidth * 1.95 / 3)) {
          container.scrollTo({ left: scrollWidth / 3, behavior: 'auto' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [type, products.length, isHovered, isTouched]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      if (isRecommend) {
        const initScroll = () => {
          if (scrollContainer.scrollWidth > 0) {
            scrollContainer.scrollLeft = scrollContainer.scrollWidth / 3;
          }
        };
        setTimeout(initScroll, 150);
      }

      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll);
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [products.length, type]);

  if (products.length === 0) return null;

  const isAll = type === 'all';
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
                <Products {...product} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="relative group px-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsTouched(true)}
            onTouchEnd={() => setIsTouched(false)}
          >
            <div
              ref={scrollRef}
              className={`flex gap-4 md:gap-6 no-scrollbar py-10 w-full 
                ${!isRecommend ? 'px-6 md:px-10 lg:px-20' : 'px-4'}
                ${(isRecommend || (isRelated && products.length > 1) || (!isRelated && products.length > 4))
                  ? 'snap-x snap-proximity overflow-x-auto'
                  : 'justify-center overflow-x-hidden'}`}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {displayProducts.map((product, idx) => (
                <div
                  key={`${product.id}-${idx}`}
                  className="w-[220px] md:w-[280px] shrink-0 transition-transform duration-500 snap-start hover:scale-110 active:scale-105"
                >
                  <Products {...product} />
                </div>
              ))}
            </div>

            {/* Scroll Indicator & Progress Bar */}
            {(isRecommend ? isScrollable : (isScrollable && products.length > 4)) && (
              <div className="flex flex-col items-center mt-4">
                <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-[#256d45] transition-all duration-300 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>

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

        {/* Load More Button */}
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