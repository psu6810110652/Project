// import { type JSX } from 'react';

// import { type } from './products';

// interface BoxProps {
//     allProducts: (ProductCard & {
//         isRecommend: boolean, isPromotion: boolean 
//     })[];
// }

// export const Box = ({ allProducts }: BoxProps): JSX.Element => {
//   const recommendproducts = [
//   ];

//   const promotionalproducts = [
//   ];
  

//   return (
//     <section className="relative w-full h-[744px]">
//       <div className="fixed top-[1031px] left-0 w-full h-[744px] bg-[#fffef2]">
//         <header className="absolute top-[33px] left-40 w-[1602px] h-[148px] flex flex-col gap-[27px]">
//           <h2 className="ml-[601px] w-[398px] h-[121px] [text-shadow:0px_4px_20px_#00000040] [font-family:'Prompt-SemiBold',Helvetica] font-semibold text-[#256d45] text-[80px] text-center tracking-[0] leading-[normal]">
//             สินค้าแนะนำ
//           </h2>

//           <img className="w-full h-[5px]" alt="Line" src={line1} />
//         </header>

//         <div className="absolute top-[246px] right-[100px] w-full h-[442px] overflow-hidden overflow-x-scroll">
//           {productCards.map((card) => (
//             <article
//               key={card.id}
//               className="absolute w-[333px] h-[416px] aspect-[0.8]"
//               style={{ top: card.topPosition, left: card.leftPosition }}
//             >
//               <div className="absolute w-full h-full top-0 left-0 bg-[#fffef2] rounded-[18.77px] shadow-[0px_3.75px_18.77px_#00000040]">
//                 <div className="absolute w-[87.50%] h-[70.00%] top-[5.00%] left-[6.25%] bg-white rounded-[18.77px] border-[1.88px] border-solid border-[#256d45] shadow-[0px_3.75px_18.77px_#00000040]" />

//                 <img
//                   className="absolute w-[86.87%] h-[6.14%] top-[80.35%] left-[6.49%]"
//                   alt="Rating"
//                   src={card.ratingImage}
//                 />
//               </div>

//               <button
//                 className="absolute w-[7.42%] h-[6.20%] top-[89.80%] left-[86.25%] border-variable-collection-color"
//                 aria-label="Add to cart"
//               >
//                 <img
//                   className="absolute w-[87.10%] h-[75.97%] top-[12.49%] left-[6.45%]"
//                   alt="Cart icon"
//                   src={card.iconImage}
//                 />
//               </button>

//               <p className="absolute w-[45.40%] h-[8.18%] top-[88.80%] left-[6.25%] [font-family:'Prompt-SemiBold',Helvetica] font-semibold text-[#256d45] text-[22.5px] tracking-[0] leading-[normal]">
//                 {card.title}
//               </p>
//             </article>
//           ))}

//           <div className="absolute -top-2 left-[87px] w-[1675px] h-[313px] flex">
//             {productImages.map((img, index) => (
//               <img
//                 key={index}
//                 className={`${img.className} ${img.marginTop} ${img.marginLeft}`}
//                 alt={`Product ${index + 1}`}
//                 src={img.src}
//               />
//             ))}
//           </div>
//         </div>

//         <nav className="absolute top-[425px] left-[50px] w-[1820px] h-[83px] flex gap-[1618px]">
//           <button aria-label="Previous products">
//             <IconComponentNode className="!-mt-3.5 !-ml-5 !w-[121px] !h-[121px]" />
//           </button>
//           <button aria-label="Next products">
//             <Icon className="!-mt-4 !w-[121px] !h-[121px]" />
//           </button>
//         </nav>
//       </div>
//     </section>
//   );
// };
