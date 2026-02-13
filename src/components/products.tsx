import Heart from "../assets/svgs/heart.svg";

export const Products = () => {
    return (
        <div className="relative w-80 h-110">
            <div className="absolute w-full h-[90%] top-0 left-0 bg-[#fffef2] rounded-[20px] shadow-[0px_4px_20px_#00000040]">
                <div className="absolute w-[87.50%] h-[70.00%] top-[5.00%] left-[6.25%] bg-white rounded-[20px] overflow-hidden border-2 border-solid border-[#256d45] shadow-[0px_4px_20px_#00000040]">
                    <img
                        className="absolute w-[75.00%] h-[75.00%] top-[12.50%] left-[12.50%]"
                        alt="Icon"
                        src={Heart}
                    />
                </div>

                <div className="absolute w-[87.50%] top-[79.00%] left-[6.25%] font-semibold text-[#256d45]">
                    
                    {/* บรรทัดบน: ชื่อสินค้า และ ราคา */}
                    <div className="flex justify-between items-baseline mb-1">
                        <div className="text-2xl">ชื่อสินค้า</div>
                        <div className="text-2xl">100 บาท</div>
                    </div>

                    {/* บรรทัดล่าง: มีจำนวน และ หัวใจ (ชิดขวา) */}
                    <div className="flex justify-between items-center">
                        <div className="text-lg font-normal">มีจำนวน xx ชิ้น</div>
                        <img
                            className="w-6 h-6 object-contain"
                            alt="Heart Icon"
                            src={Heart}
                        />
                    </div>
                </div> 
            </div>
        </div>
    );
};
