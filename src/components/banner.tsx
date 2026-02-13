// import React from 'react';

// import { Products } from './products';

// const recommendproducts = [
// ];

// const promotionalproducts = [
// ];

// export const FeaturedProductsSection = (): JSX.Element => {
//   return (
//     <section
//       className="z-[4] h-[744px] relative mt-[47px] bg-[#fffef2]"
//       aria-labelledby="featured-products-heading"
//     >
//       <header className="absolute top-[33px] left-40 w-[1602px] h-[148px] flex flex-col gap-[27px]">
//         <h2
//           id="featured-products-heading"
//           className="ml-[601px] w-[398px] h-[121px] [text-shadow:0px_4px_20px_#00000040] text-[#256d45] text-[80px] text-center [font-family:'Prompt-SemiBold',Helvetica] font-semibold tracking-[0] leading-[normal]"
//         >
//           สนคาแนะน
//         </h2>
//         <img
//           className="w-[1600px] h-[5px]"
//           alt=""
//           src={image}
//           role="presentation"
//         />
//       </header>

//       <div className="absolute top-[246px] right-[100px] w-[1720px] h-[442px] overflow-hidden overflow-x-scroll">
//         {productsData.map((product) => (
//           <article
//             key={product.id}
//             className={`${product.containerStyles} absolute w-[333px] h-[416px] aspect-[0.8]`}
//             aria-label={`Product ${product.id}`}
//           >
//             <div className="absolute w-full h-full top-0 left-0 bg-[#fffef2] rounded-[18.77px] shadow-[0px_3.75px_18.77px_#00000040]">
//               <div className="absolute w-[87.50%] h-[70.00%] top-[5.00%] left-[6.25%] bg-white rounded-[18.77px] border-[1.88px] border-solid border-[#256d45] shadow-[0px_3.75px_18.77px_#00000040]" />
//               <img
//                 className="absolute w-[86.87%] h-[6.14%] top-[80.35%] left-[6.49%]"
//                 alt="Rating"
//                 src={product.ratingImage}
//               />
//             </div>

//             <button
//               className="absolute w-[7.42%] h-[6.20%] top-[89.80%] left-[86.25%] border-variable-collection-color"
//               aria-label="Add to favorites"
//               type="button"
//             >
//               <img
//                 className="absolute w-[87.10%] h-[75.97%] top-[12.49%] left-[6.45%]"
//                 alt=""
//                 src={product.iconImage}
//               />
//             </button>

//             <div className="absolute w-[45.40%] h-[8.18%] top-[88.80%] left-[6.25%] [font-family:'Prompt-SemiBold',Helvetica] font-semibold text-[#256d45] text-[22.5px] tracking-[0] leading-[normal]">
//               {product.quantity}
//             </div>
//           </article>
//         ))}

//         <div
//           className="absolute -top-2 left-[87px] w-[1675px] h-[313px] flex"
//           aria-hidden="true"
//         >
//           {productsData.map((product) => (
//             <img
//               key={`img-${product.id}`}
//               className={product.imageStyles}
//               alt=""
//               src={product.productImage}
//             />
//           ))}
//         </div>
//       </div>

//       <nav
//         className="absolute top-[425px] left-[50px] w-[1820px] h-[83px] flex gap-[1618px]"
//         aria-label="Product carousel navigation"
//       >
//         <button aria-label="Previous products" type="button">
//           <Icon2 className="!-mt-3.5 !w-[121px] !h-[121px] !-ml-5" />
//         </button>
//         <button aria-label="Next products" type="button">
//           <Icon1 className="!-mt-4 !w-[121px] !h-[121px]" />
//         </button>
//       </nav>
//     </section>
//   );
// };
