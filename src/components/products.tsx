import { type ProductCard } from "../types";

import Heart from "../assets/svgs/heart.svg";

export const Products = (props: ProductCard) => {
    return (
        <div className="relative w-95 h-125">
            <div className="absolute w-full h-[90%] top-0 left-0 bg-[#fffef2] rounded-[20px] shadow-[0px_4px_20px_#00000040]">
                <div className="absolute w-80 h-80 top-7.5 left-1/2 transform -translate-x-1/2 bg-white rounded-[20px] overflow-hidden border-2 border-solid border-[#256d45] shadow-[0px_4px_20px_#00000040]">
                    <img
                        className="absolute w-80 h-80 py-5 left-1/2 transform -translate-x-1/2 object-contain"
                        alt="Icon"
                        src={props.productImage}
                    />
                    <img
                        className="w-10 h-10 object-contain absolute top-2 right-2"
                        alt="Heart Icon"
                        src={Heart}
                    />
                </div>

                <div className="absolute w-80 top-90 left-7.5 font-semibold text-[#256d45]">
                    
                    {/* บรรทัดบน: ชื่อสินค้า และ ราคา */}
                    <div className="flex items-baseline mb-1">
                        <div className=" text-2xl text-left font-semibold [-webkit-text-stroke:0.75px_#256d45] tracking-[0.05em] leading-[normal]">{props.title}</div>
                    </div>

                    {/* บรรทัดล่าง: มีจำนวน และ หัวใจ (ชิดขวา) */}
                    <div className="flex justify-between items-center">
                        <div className="text-xl font-normal">มีจำนวน {props.stock} ชิ้น</div>
                        <div className="text-xl text-right whitespace-nowrap">{props.price} บาท</div>
                    </div>
                </div> 
            </div>
        </div>
    );
};
