import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Search from '../components/search.tsx';
import { Products } from '../components/products.tsx';
import { type ProductCard, type Category as CategoryType } from '../types.ts';

import Seeds from '../assets/images/seed.png';

const Category: React.FC = () => {

    const { category: categorySlug } = useParams<{ category: string }>();

    const decodedSlug = categorySlug ? decodeURIComponent(categorySlug) : "";

    console.log("DEBUG -> current slug from URL:", decodedSlug);

    const [products, setProducts] = useState<ProductCard[]>([]);
    const [categoryInfo, setCategoryInfo] = useState<CategoryType | null>(null);
    const [loading, setLoading] = useState(true);

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
                    // alert(`Debug: ไม่พบหมวดหมู่ "${decodedSlug}" ในระบบ \nรายชื่อที่มี: ${allCategories.map(c => c.name + '/' + c.description).join(", ")}`);
                }

                if (targetCategory) {
                    setCategoryInfo(targetCategory);

                    const detailResponse = await fetch(`/api/category/${targetCategory.id}`);
                    const detailedData = await detailResponse.json();

                    setProducts(detailedData.products || []);
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
    }, [categorySlug]); // Re-fetch เมื่อเปลี่ยนหมวดหมู่ใน URL

    if (loading) return <div>กำลังโหลดข้อมูล...</div>;

    return (
        <div className="min-h-screen bg-lime-100 font-['Prompt'] text-green-800 pb-20">

            {/* --- ส่วน Hero Banner (เมล็ด) --- */}
            <section className="z-0 -ml-0.5 w-full h-150 relative ">
                <img
                    className="absolute top-0 left-0.5 w-full h-150 object-cover"
                    alt="Backgorund Image"
                    src={Seeds}
                />

                <div className="absolute top-1/2 -translate-y-1/2 w-full h-73 bg-[#fffef280]" />

                <div className="absolute top-1/2 -translate-y-1/2 w-full h-35 bg-[#fffef2bf]" />

                <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [text-shadow:0px_4px_20px_#00000040] text-[#256d45] text-[5rem] text-center font-semibold [-webkit-text-stroke:3.5px_#256d45] tracking-[0.05em] leading-[normal]">
                    {categoryInfo?.name || "ไม่พบหมวดหมู่"}
                </h2>
            </section>

            {/* --- ส่วนเนื้อหาหลัก (Sidebar + Grid) --- */}
            <div className="container mx-auto px-4 mt-12 flex flex-col md:flex-row gap-8">

                {/* 1. Sidebar (หมวดหมู่) */}
                <aside className="hidden md:block w-72 shrink-0">
                    <div className="bg-amber-50 rounded-[20px] p-8 shadow-lg min-h-125">
                        <h2 className="text-4xl font-semibold mb-6">ประเภท</h2>
                        <div className="w-full h-1 bg-green-800 mb-8"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-6 bg-white border-4 border-green-800 rounded-md cursor-pointer"></div>
                            <span className="text-2xl font-semibold">{categoryInfo?.name}</span>
                        </div>
                    </div>
                </aside>

                {/* 2. ส่วนแสดงสินค้า */}
                <div className="flex-1">
                    {/* ช่องค้นหาอยู่ด้านบนสุดของ Grid */}
                    <div className="mb-8">
                        <Search />
                    </div>

                    {/* Grid แสดงสินค้า */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <Products
                                    key={product.id}
                                    name={product.name}
                                    price={product.price}
                                    stock={product.stock}
                                    image={product.image}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-xl">
                                ไม่มีสินค้าในหมวดหมู่นี้
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Category;