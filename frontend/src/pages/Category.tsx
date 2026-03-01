import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Search from '../components/search.tsx';
import { Products } from '../components/products.tsx';
import { type ProductCard, type Category as CategoryType } from '../types.ts';

import Seeds from '../assets/images/seed.png';

interface PriceRange {
    label: string;
    min: number;
    max: number | null; // null = ไม่จำกัด
}

const PRICE_RANGES: PriceRange[] = [
    { label: 'ต่ำกว่า 100 บาท', min: 0, max: 100 },
    { label: '100 – 500 บาท', min: 100, max: 500 },
    { label: '500 – 1,000 บาท', min: 500, max: 1000 },
    { label: '1,000 – 5,000 บาท', min: 1000, max: 5000 },
    { label: 'มากกว่า 5,000 บาท', min: 5000, max: null },
];

const Category: React.FC = () => {

    const { category: categorySlug } = useParams<{ category: string }>();
    const navigate = useNavigate();

    const decodedSlug = categorySlug ? decodeURIComponent(categorySlug) : "";

    console.log("DEBUG -> current slug from URL:", decodedSlug);

    const [products, setProducts] = useState<ProductCard[]>([]);
    const [categoryInfo, setCategoryInfo] = useState<CategoryType | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRange, setSelectedRange] = useState<PriceRange | null>(null);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = selectedRange
            ? product.price >= selectedRange.min && (selectedRange.max === null || product.price < selectedRange.max)
            : true;
        return matchesSearch && matchesPrice;
    });

    // นับจำนวนสินค้าในแต่ละช่วงราคา
    const rangeCounts = PRICE_RANGES.map(range => ({
        range,
        count: products.filter(p =>
            p.price >= range.min && (range.max === null || p.price < range.max)
        ).length
    }));

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                setLoading(true);

                const response = await fetch(`/api/category`);
                const allCategories: CategoryType[] = await response.json();

                console.log("DEBUG -> All Categories:", allCategories);

                const targetCategory = allCategories.find(
                    (cat) =>
                        (cat.description && cat.description.toLowerCase().trim() === decodedSlug.toLowerCase().trim()) ||
                        (cat.name && cat.name.trim() === decodedSlug.trim())
                );

                if (!targetCategory) {
                    console.warn(`Category not found. Searched for: "${decodedSlug}"`);
                    navigate('/', { replace: true });
                    return;
                }

                if (targetCategory) {
                    setCategoryInfo(targetCategory);

                    const detailResponse = await fetch(`/api/category/${targetCategory.id}`);
                    const detailedData = await detailResponse.json();

                    const mappedProducts = (detailedData.products || []).map((p: any) => ({
                        ...p,
                        image: p.thumbnailUrl || p.imageUrl,
                        stock: p.stockQuantity,
                        type: p.type
                    }));
                    setProducts(mappedProducts);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (categorySlug) {
            fetchCategoryData();
        }
    }, [categorySlug]);

    if (loading) return <div>กำลังโหลดข้อมูล...</div>;

    return (
        <div className="min-h-screen bg-lime-100 font-['Prompt'] text-green-800 pb-20">

            {/* --- ส่วน Hero Banner --- */}
            <section className="z-0 w-full h-72 md:h-120 lg:h-150 relative">
                <img
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Background Image"
                    src={Seeds}
                />

                <div className="absolute top-1/2 -translate-y-1/2 w-full h-32 md:h-48 lg:h-73 bg-[#fffef280]" />

                <div className="absolute top-1/2 -translate-y-1/2 w-full h-16 md:h-24 lg:h-35 bg-[#fffef2bf]" />

                <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [text-shadow:0px_4px_20px_#00000040] text-[#256d45] text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] text-center font-semibold [-webkit-text-stroke:1px_#256d45] md:[-webkit-text-stroke:2.5px_#256d45] lg:[-webkit-text-stroke:3.5px_#256d45] tracking-[0.05em] leading-[normal] w-full px-4 break-words">
                    {categoryInfo?.name || "ไม่พบหมวดหมู่"}
                </h2>
            </section>

            <div className="w-full flex justify-center px-4 md:px-8">
                {/* ช่องค้นหาอยู่ด้านบนสุดของ Grid */}
                <div className="w-full max-w-3xl mt-4">
                    <Search onChange={(value) => setSearchTerm(value)} />
                </div>
            </div>

            {/* --- ส่วนเนื้อหาหลัก (Sidebar + Grid) --- */}
            <div className="container mt-6 md:mt-12 flex flex-col md:flex-row gap-8 w-full">

                {/* Mobile Filter — horizontal scroll chips */}
                <div className="md:hidden flex overflow-x-auto gap-4 pb-4 snap-x w-full px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-colors cursor-pointer snap-start
                            ${selectedRange === null ? 'bg-green-800 text-white border-green-800' : 'bg-white text-green-800 border-green-800'}`}
                        onClick={() => setSelectedRange(null)}
                    >
                        <span className="font-semibold whitespace-nowrap">ทั้งหมด ({products.length})</span>
                    </div>

                    {rangeCounts.map(({ range, count }) => (
                        <div
                            key={range.label}
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-colors cursor-pointer snap-start
                                ${selectedRange?.label === range.label ? 'bg-green-800 text-white border-green-800' : 'bg-white text-green-800 border-green-800'}`}
                            onClick={() => setSelectedRange(range)}
                        >
                            <span className="font-semibold whitespace-nowrap">{range.label} ({count})</span>
                        </div>
                    ))}

                    {/* Spacer */}
                    <div className="w-1 shrink-0"></div>
                </div>

                {/* 1. Sidebar (ช่วงราคา) Desktop */}
                <aside className="hidden md:block w-72 shrink-0">
                    <div className="bg-amber-50 rounded-tr-[20px] rounded-br-[20px] p-8 shadow-lg min-h-125 sticky top-24">
                        <h2 className="text-4xl font-semibold mb-6">ช่วงราคา</h2>
                        <div className="w-full h-1 bg-green-800 mb-8"></div>

                        {/* All Option */}
                        <div
                            className="flex items-center gap-4 mb-4 cursor-pointer group hover:bg-[#256D45]/10 p-2 rounded-lg transition-colors"
                            onClick={() => setSelectedRange(null)}
                        >
                            <div className={`w-6 h-6 border-4 border-green-800 rounded-md transition-colors ${selectedRange === null ? 'bg-green-800' : 'bg-white'}`}></div>
                            <span className={`text-xl font-semibold ${selectedRange === null ? 'text-green-800' : 'text-gray-600'}`}>
                                ทั้งหมด ({products.length})
                            </span>
                        </div>

                        {/* Price Range Options */}
                        {rangeCounts.map(({ range, count }) => (
                            <div
                                key={range.label}
                                className="flex items-center gap-4 mb-4 cursor-pointer group hover:bg-[#256D45]/10 p-2 rounded-lg transition-colors"
                                onClick={() => setSelectedRange(range)}
                            >
                                <div className={`w-6 h-6 border-4 border-green-800 rounded-md transition-colors ${selectedRange?.label === range.label ? 'bg-green-800' : 'bg-white'}`}></div>
                                <span className={`text-xl font-semibold ${selectedRange?.label === range.label ? 'text-green-800' : 'text-gray-600'}`}>
                                    {range.label} ({count})
                                </span>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Grid แสดงสินค้า */}
                <div className="flex-1 pl-4 md:pl-0 pr-4">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4 md:gap-6 w-full">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <Products
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    stock={product.stock}
                                    image={product.image}
                                />
                            ))
                        ) : (
                            <div className="col-span-full w-full flex items-center justify-center py-20 bg-white/50 rounded-3xl shadow-sm">
                                <span className="text-2xl text-gray-500 font-bold">ไม่มีสินค้าในหมวดหมู่นี้</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Category;