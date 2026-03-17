import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Search from '../components/search.tsx';
import { Products } from '../components/products.tsx';
import PriceFilter from '../components/PriceFilter.tsx';
import RatingFilter from '../components/RatingFilter.tsx';
import api from '../services/api';
import { type ProductCard, type Category as CategoryType } from '../types.ts';

import Seeds from '../assets/images/seed.png';
import Tools from '../assets/images/tool.png';
import Chemicals from '../assets/images/Chemical.png';
import Fertilizers from '../assets/images/Fertilizer.png';
import Other from '../assets/images/other.png';
import DefaultBanner from '../assets/images/Home.png';

const Category: React.FC = () => {

    const { category: categorySlug } = useParams<{ category: string }>();
    const navigate = useNavigate();

    const decodedSlug = categorySlug ? decodeURIComponent(categorySlug) : "";

    // 🌟 ฟังก์ชันเลือกรูป banner ตามหมวดหมู่
    const getBannerImage = (categoryName?: string) => {
        if (!categoryName) return DefaultBanner;

        const name = categoryName.toLowerCase();

        if (name.includes('seed') || name.includes('เมล็ด')) return Seeds;
        if (name.includes('tool') || name.includes('อุปกรณ์')) return Tools;
        if (name.includes('chemical') || name.includes('สาร') || name.includes('ยา')) return Chemicals;
        if (name.includes('fertilizer') || name.includes('ปุ๋ย')) return Fertilizers;
        if (name.includes('other') || name.includes('อื่นๆ')) return Other;

        return DefaultBanner;
    };

    const [products, setProducts] = useState<ProductCard[]>([]);
    const [categoryInfo, setCategoryInfo] = useState<CategoryType | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
    const [maxPriceLimit, setMaxPriceLimit] = useState(0);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);

    const distinctTypes = products.reduce((acc: Record<string, number>, curr) => {
        if (curr.type) {
            acc[curr.type] = (acc[curr.type] || 0) + 1;
        }
        return acc;
    }, {});

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        const matchesType = selectedTypes.length === 0 || (product.type && selectedTypes.includes(product.type));
        const matchesRating = selectedRating === null || ((product as any).rating || 0) >= selectedRating;
        return matchesSearch && matchesPrice && matchesType && matchesRating;
    });

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                setLoading(true);

                // ฟังก์ชันช่วยจัดการรูปภาพ (เพราะ API ส่งมาเป็น Array)
                const getFirstImage = (p: any) => {
                    const urls = p.thumbnailUrls || p.imageUrls || p.thumbnailUrl || p.imageUrl;
                    return Array.isArray(urls) ? urls[0] : urls;
                };

                const response = await api.get(`/category`);
                const allCategories: CategoryType[] = response.data;

                const targetCategory = allCategories.find(
                    (cat) =>
                        (cat.description && cat.description.toLowerCase().trim() === decodedSlug.toLowerCase().trim()) ||
                        (cat.name && cat.name.trim() === decodedSlug.trim())
                );

                if (!targetCategory) {
                    navigate('/', { replace: true });
                    return;
                }

                setCategoryInfo(targetCategory);

                const detailResponse = await api.get(`/category/${targetCategory.id}`);
                const detailedData = detailResponse.data;

                // ใช้ข้อมูลจาก detailedData.products ที่ดึงมาครั้งเดียว
                // ไม่ต้องดึงรีวิวแยกรายชิ้น (ช่วยประหยัด Egress)
                const processedProducts = (detailedData.products || []).map((p: any) => ({
                    ...p,
                    image: getFirstImage(p),
                    stock: p.stockQuantity ?? p.stock ?? 0,
                    type: p.type,
                    rating: Number(p.rating) || 0,
                    favoriteCount: Number(p.favoriteCount) || 0,
                    reviewCount: Number(p.reviewCount) || 0,
                    soldCount: Number(p.soldCount) || 0
                }));

                setProducts(processedProducts);

                // Find max price to set the limit
                if (processedProducts.length > 0) {
                    const max = Math.max(...processedProducts.map((p: any) => p.price || 0));
                    setMaxPriceLimit(max);
                    setPriceRange([0, max]);
                } else {
                    setMaxPriceLimit(0);
                    setPriceRange([0, 0]);
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
    }, [categorySlug, navigate, decodedSlug]);

    if (loading) return <div>กำลังโหลดข้อมูล...</div>;

    return (
        <div className="min-h-screen bg-(--color-bg-main) text-(--color-text-main) pb-20">

            <section className="z-0 w-full h-72 md:h-120 lg:h-150 relative">
                <img className="absolute inset-0 w-full h-full object-cover" alt="Background Image" src={getBannerImage(categoryInfo?.name)} />
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-32 md:h-48 lg:h-73 bg-[#fffef280]" />
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-16 md:h-24 lg:h-35 bg-[#fffef2bf]" />
                <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [text-shadow:0px_4px_20px_#00000040] text-[#256d45] text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] text-center font-semibold [-webkit-text-stroke:1px_#256d45] md:[-webkit-text-stroke:2.5px_#256d45] lg:[-webkit-text-stroke:3.5px_#256d45] tracking-[0.05em] leading-[normal] w-full px-4 wrap-break-words">
                    {categoryInfo?.name || "ไม่พบหมวดหมู่"}
                </h2>
            </section>

            <div className="w-full flex justify-center px-4 md:px-8">
                <div className="w-full max-w-3xl mt-4">
                    <Search onChange={(value) => setSearchTerm(value)} />
                </div>
            </div>

            <div className="container mx-auto px-6 md:px-10 lg:px-24 mt-6 md:mt-12 flex flex-col md:flex-row gap-4 w-full">

                <div className="md:hidden w-full px-4 mb-4 flex-col gap-4">
                    <div className="flex gap-3 pb-2">
                        <button onClick={() => setSelectedTypes([])} className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition-all flex items-center gap-2 ${selectedTypes.length === 0 ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-white text-(--color-primary) border-(--color-primary)'}`}>
                            <span>ทั้งหมด</span><span className="opacity-60 text-xs">({products.length})</span>
                        </button>
                        {Object.entries(distinctTypes).map(([type, count]) => (
                            <button key={type} onClick={() => toggleType(type)} className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition-all flex items-center gap-2 ${selectedTypes.includes(type) ? 'bg-[#256D45] text-white border-[#256D45]' : 'bg-white text-[#256D45] border-[#256D45]'}`}>
                                <div className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center ${selectedTypes.includes(type) ? 'border-white bg-white' : 'border-[#256D45]'}`}>
                                    {selectedTypes.includes(type) && <div className="w-1.5 h-1.5 bg-[#256D45] rounded-sm" />}
                                </div>
                                <span>{type}</span><span className={`text-xs ${selectedTypes.includes(type) ? 'text-white/80' : 'text-gray-400'}`}>({count})</span>
                            </button>
                        ))}
                    </div>
                    <PriceFilter minPrice={priceRange[0]} maxPrice={priceRange[1]} onRangeChange={setPriceRange} absoluteMax={maxPriceLimit} />
                    <RatingFilter selectedRating={selectedRating} onRatingChange={setSelectedRating} />
                </div>

                <aside className="hidden md:block w-80 shrink-0">
                    <div className="top-24">
                        <div className="bg-(--color-bg-card) p-8 rounded-[20px] shadow-sm border border-gray-100 font-['Prompt']">
                            <div className="mb-8">
                                <h3 className="text-2xl font-semibold text-(--color-primary) mb-6">ประเภทสินค้า</h3>
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-3 cursor-pointer group p-1">
                                        <input type="checkbox" className="hidden" checked={selectedTypes.length === 0} onChange={() => setSelectedTypes([])} />
                                        <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all ${selectedTypes.length === 0 ? 'bg-(--color-primary) border-(--color-primary)' : 'border-gray-300 group-hover:border-(--color-primary)'}`}>
                                            {selectedTypes.length === 0 && (<svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)}
                                        </div>
                                        <span className={`text-lg font-semibold transition-all ${selectedTypes.length === 0 ? 'text-(--color-primary)' : 'text-gray-500 group-hover:text-(--color-primary)'}`}>ทั้งหมด</span>
                                        <span className="ml-auto text-sm text-gray-400">({products.length})</span>
                                    </label>
                                    {Object.entries(distinctTypes).map(([type, count]) => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer group p-1">
                                            <input type="checkbox" className="hidden" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} />
                                            <div className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all ${selectedTypes.includes(type) ? 'bg-(--color-primary) border-(--color-primary)' : 'border-gray-300 group-hover:border-(--color-primary)'}`}>
                                                {selectedTypes.includes(type) && (<svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)}
                                            </div>
                                            <span className={`text-lg font-semibold transition-all ${selectedTypes.includes(type) ? 'text-(--color-primary)' : 'text-gray-500 group-hover:text-(--color-primary)'}`}>{type}</span>
                                            <span className="ml-auto text-sm text-gray-400">({count})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="h-px bg-gray-200 mb-8"></div>
                            <div className="mb-8"><RatingFilter selectedRating={selectedRating} onRatingChange={setSelectedRating} /></div>
                            <div className="h-px bg-gray-200 mb-8"></div>
                            <div><PriceFilter minPrice={priceRange[0]} maxPrice={priceRange[1]} onRangeChange={setPriceRange} absoluteMax={maxPriceLimit} /></div>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 pl-4 md:pl-0 pr-4">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-1 md:gap-4 w-full">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <Products
                                    key={product.id}
                                    {...product}
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