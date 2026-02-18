import React from 'react';
import { useParams } from 'react-router-dom';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-[#DCEDC1] font-['Prompt']">      
      <div className="pt-[130px] pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="flex justify-center items-center">
                <div className="w-80 h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-6xl">📦</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-[#256D45] mb-4">
                  รายละเอียดสินค้า
                </h1>
                
                <div className="mb-6">
                  <p className="text-xl text-gray-600 mb-2">
                    Product ID: {id || 'ไม่พบ ID'}
                  </p>
                  <p className="text-lg mb-2">ชื่อสินค้า: ตัวอย่างสินค้า</p>
                  <p className="text-lg mb-4">รายละเอียด: สินค้าคุณภาพะดีมีคุณสมบัติเหมาะสำหรับการเพาะปลูกและดูแลรักษาพืช</p>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-bold text-[#256D45]">฿299</p>
                  <p className="text-lg text-gray-600">มีจำนวน 50 ชิ้น</p>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 bg-[#256D45] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#1a5434] transition-colors">
                    เพิ่มลงตะกร้า
                  </button>
                  <button className="flex-1 bg-white border-2 border-[#256D45] text-[#256D45] font-semibold py-3 px-6 rounded-lg hover:bg-[#f3fbe9] transition-colors">
                    เพิ่มลงรายการโปรด
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
