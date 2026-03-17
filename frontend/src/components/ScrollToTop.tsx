import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { pathname } = useLocation();

    // 1. เลื่อนไปบนสุดทุกครั้งที่เปลื่ยนหน้า
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    // 2. เช็คการเลื่อนหน้าจอเพื่อแสดง/ซ่อนปุ่ม
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 p-3! bg-[#256d45] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-[#1e5631] animate-in fade-in slide-in-from-bottom-4"
                    aria-label="เลื่อนขึ้นบนสุด"
                >
                    <ArrowUp size={24} />
                </button>
            )}
        </>
    );
};

export default ScrollToTop;
