import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Save, ImagePlus, X, Package, Hash, Coins, Database, FileText, Tag, FolderTree } from 'lucide-react';
import { message } from 'antd';

const ManagerProduct: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const { categoryId, code: productId } = useParams();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const user = auth?.user;
    const isAdmin = user?.role === 'Admin';
    const isEditMode = !!productId && productId !== 'new';
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        price: 0,
        isPromotion: false,
        promotionPrice: 0,
        isFeatured: false,
        stock: 0,
        description: '',
        imageUrl: '',
        thumbnailUrl: '',
        type: ''
    });

    const [existingTypes, setExistingTypes] = useState<{ value: string }[]>([]);

    useEffect(() => {
        // redirect non-admin users away
        if (!isAdmin) {
            messageApi.error('คุณไม่มีสิทธิ์แก้ไขข้อมูลสินค้า');
            navigate('/');
            return;
        }

        if (categoryId) {
            api.get(`/product/category/${categoryId}`)
                .then(res => {
                    const uniqueTypes = [...new Set(res.data.map((p: any) => p.type).filter((t: any) => t))];
                    setExistingTypes(uniqueTypes.map((t: any) => ({ value: t })));
                })
                .catch(err => console.error("Error fetching types:", err));
        }

        if (isEditMode) {
            api.get(`/product/${productId}`).then(res => {
                setFormData({
                    ...res.data,
                    code: res.data.id || '',
                    stock: res.data.stockQuantity || 0,
                    isPromotion: res.data.isPromotion || false,
                    promotionPrice: res.data.promotionPrice || 0,
                    isFeatured: res.data.isFeatured || false,
                    imageUrl: res.data.imageUrl || '',
                    thumbnailUrl: res.data.thumbnailUrl || '',
                    type: res.data.type || ''
                });
            }).catch(() => messageApi.error("ดึงข้อมูลสินค้าไม่สำเร็จ"));
        }
    }, [productId, isEditMode, categoryId, isAdmin]);

    const handleSave = async () => {
        setLoading(true);
        console.log('handleSave called', { isAdmin, categoryId, productId, formData });
        try {
            if (!isAdmin) {
                throw new Error('Unauthorized');
            }
            const payload = {
                name: formData.name,
                id: formData.code,
                price: formData.price,
                isPromotion: formData.isPromotion,
                promotionPrice: formData.isPromotion ? formData.promotionPrice : null,
                isFeatured: formData.isFeatured,
                stockQuantity: formData.stock,
                description: formData.description,
                imageUrl: formData.imageUrl,
                thumbnailUrl: formData.thumbnailUrl,
                type: formData.type,
                category: { id: Number(categoryId) }
            };

            if (isEditMode) {
                await api.patch(`/product/${productId}`, payload);
                messageApi.success("แก้ไขสินค้าเรียบร้อย");
            } else {
                await api.post(`/product`, payload);
                messageApi.success("เพิ่มสินค้าใหม่เรียบร้อย");
            }
            navigate(-1);
        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response?.status === 413) {
                messageApi.error("ไฟล์ภาพมีขนาดใหญ่เกินไป กรุณาลดขนาดไฟล์");
            } else if (err.message === 'Unauthorized' || (axios.isAxiosError(err) && [401, 403].includes(err.response?.status || 0))) {
                messageApi.error('คุณไม่มีสิทธิ์ดำเนินการ โปรดเข้าสู่ระบบใหม่');
            } else {
                const detail = axios.isAxiosError(err) ? err.response?.data?.message || JSON.stringify(err.response?.data) : err.message;
                messageApi.error(`ไม่สามารถบันทึกข้อมูลได้: ${detail}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Helper to resize image
                    const resizeImage = (maxWidth: number) => {
                        let width = img.width;
                        let height = img.height;

                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }

                        canvas.width = width;
                        canvas.height = height;
                        ctx?.drawImage(img, 0, 0, width, height);
                        return canvas.toDataURL('image/jpeg', 0.8);
                    };

                    const mainImage = resizeImage(800);
                    const thumbnail = resizeImage(300);

                    setFormData(prev => ({
                        ...prev,
                        imageUrl: mainImage,
                        thumbnailUrl: thumbnail
                    }));
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-8 min-h-screen">
            {contextHolder}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-24 h-10 bg-white border-2 border-[#256D45] text-[#256D45] rounded-[20px] hover:bg-[#256D45] hover:text-white transition-all shadow-md"
                    >
                        กลับ
                    </button>

                    <h1 className="text-4xl font-black text-[#256D45]">
                        {isEditMode ? 'แก้ไขรายละเอียดสินค้า' : 'เพิ่มสินค้าใหม่'}
                    </h1>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#256D45] text-white px-10! py-3! rounded-full font-bold text-xl shadow-lg hover:bg-[#1a4d31] transition-all disabled:bg-gray-400"
                >
                    <Save size={24} />
                    {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
            </div>

            {/* Main Content: Single Column for Forms, Image at Bottom */}
            <div className="flex flex-col gap-10">

                {/* FIELDS SECTION */}
                <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-[#256D45]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputBox label="ชื่อสินค้า" icon={<Package size={20} />}>
                            <input
                                className="input-style"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </InputBox>
                        <InputBox label="รหัสสินค้า" icon={<Hash size={20} />}>
                            <input
                                className="input-style"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                            />
                        </InputBox>

                        {/* Type Field: Now Col Span 1 */}
                        <InputBox label="ประเภทสินค้า" icon={<FolderTree size={20} />}>
                            {/* ใช้ input เดิมของคุณ และเพิ่มคำสั่ง list="type-options" */}
                            <input
                                className="input-style"
                                placeholder="ระบุหรือเลือกประเภทสินค้า"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                list="type-options" // 🌟 ผูกกับ datalist ด้านล่าง
                            />

                            {/* สร้าง datalist เพื่อเป็นตัวเลือก Dropdown */}
                            <datalist id="type-options">
                                {existingTypes.map((item, index) => (
                                    <option key={index} value={item.value} />
                                ))}
                            </datalist>
                        </InputBox>

                        {/* Price: Moved next to Type */}
                        <InputBox label="ราคาสินค้าปกติ (บาท)" icon={<Coins size={20} />}>
                            <input
                                type="number"
                                className="input-style"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                            />
                        </InputBox>

                        <InputBox label="จำนวนสินค้าในคลัง" icon={<Database size={20} />}>
                            <input
                                type="number"
                                className="input-style"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                            />
                        </InputBox>

                        <div className="flex flex-col gap-4 p-4 bg-[#F0F7F0]/50 rounded-2xl border-2 border-[#256D45]/10">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-6 h-6 accent-[#256D45] cursor-pointer"
                                    checked={formData.isPromotion}
                                    onChange={e => setFormData({ ...formData, isPromotion: e.target.checked })}
                                />
                                <span className="text-xl font-bold text-[#256D45] group-hover:underline">
                                    สินค้านี้จัดโปรโมชั่นหรือไม่?
                                </span>
                            </label>

                            {formData.isPromotion && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <InputBox label="ราคาโปรโมชั่น (บาท)" icon={<Tag size={20} className="text-red-500" />}>
                                        <input
                                            type="number"
                                            className="input-style border-red-200! focus:border-red-500! bg-white"
                                            placeholder="ใส่ราคาที่ลดแล้ว"
                                            value={formData.promotionPrice}
                                            onChange={e => setFormData({ ...formData, promotionPrice: Number(e.target.value) })}
                                        />
                                    </InputBox>
                                </div>
                            )}

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-6 h-6 accent-[#256D45] cursor-pointer"
                                    checked={formData.isFeatured}
                                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                                />
                                <span className="text-xl font-bold text-[#256D45] group-hover:underline">
                                    เพิ่มในสินค้าแนะนำ
                                </span>
                            </label>
                        </div>

                        {/* Description: Col Span 2 (Full Width) */}
                        <div className="col-span-1 md:col-span-2">
                            <InputBox label="รายละเอียดสินค้า" icon={<FileText size={20} />}>
                                <textarea
                                    rows={6}
                                    className="input-style"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </InputBox>
                        </div>
                    </div>
                </div>

                {/* IMAGE UPLOAD SECTION: Moved to Bottom */}
                <div className="bg-white p-8 rounded-[40px] border-4 border-[#256D45] shadow-xl flex flex-col items-center justify-center relative group min-h-80">
                    <h2 className="text-2xl font-bold text-[#256D45] mb-6 flex items-center gap-2">
                        <ImagePlus /> รูปภาพสินค้า
                    </h2>

                    {formData.imageUrl ? (
                        <div className="relative w-full max-w-lg">
                            <img src={formData.imageUrl} className="w-full h-auto object-contain rounded-3xl border-2 border-[#E8E8E8]" />
                            <button
                                onClick={() => setFormData({ ...formData, imageUrl: '', thumbnailUrl: '' })}
                                className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center gap-4 cursor-pointer text-[#256D45] w-full h-60 justify-center border-2 border-dashed border-[#256D45]/30 rounded-3xl hover:bg-[#F0F7F0] transition-all">
                            <div className="p-6 bg-[#F0F7F0] rounded-full group-hover:bg-[#256D45] group-hover:text-white transition-all">
                                <ImagePlus size={64} />
                            </div>
                            <span className="text-xl font-bold">อัปโหลดรูปสินค้า</span>
                            <span className="text-sm text-gray-500">รองรับไฟล์ JPG, PNG (แนะนำขนาด 800x800px)</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </label>
                    )}
                </div>
            </div>

            <style>{`
                .input-style {
                    width: 100%;
                    padding: 12px 20px;
                    background-color: #F8F8F8;
                    border: 2px solid #E8E8E8;
                    border-radius: 15px;
                    font-size: 1.1rem;
                    outline: none;
                    transition: all 0.3s;
                }
                .input-style:focus {
                    border-color: #256D45;
                    background-color: white;
                    box-shadow: 0 0 10px rgba(37, 109, 69, 0.1);
                }
            `}</style>
        </div>
    );
};

// Sub-component เพื่อความสะอาดของโค้ด
const InputBox = ({ label, icon, children }: any) => (
    <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-[#256D45] font-bold text-lg">
            {icon} {label}
        </label>
        {children}
    </div>
);

export default ManagerProduct;