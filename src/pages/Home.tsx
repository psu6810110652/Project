import React from 'react';

import HomeImage from '/public/images/Home.png';
import Seacrh from '../assets/svgs/search.svg';

const Home: React.FC = () => {
  return (
    <div className="mt-5 mb-10 relative overflow-hidden">

      {/* -------------------------------------------
          SECTION: HERO BANNER
      ------------------------------------------- */}
      <section className="z-0 -ml-0.5 w-full h-150 relative ">
        <img
          className="absolute top-0 left-0.5 w-full h-150"
          alt="Rectangle"
          src={HomeImage}
        />

        <div className="absolute top-1/2 -translate-y-1/2 w-full h-73 bg-[#fffef280]" />

        <div className="absolute top-1/2 -translate-y-1/2 w-full h-35 bg-[#fffef2bf]" />

        <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [text-shadow:0px_4px_20px_#00000040] text-[#256d45] text-[5rem] text-center font-semibold [-webkit-text-stroke:3.5px_#256d45] tracking-[0.05em] leading-[normal]">
            ธีรยุทธการเกษตร
        </h2>
      </section>

      {/* -------------------------------------------
          SECTION: SEARCH BAR
      ------------------------------------------- */}
      <div className="z-10 mx-auto w-180 h-16 relative mt-11.75">
        <label 
          htmlFor="search-input"
          className="absolute -top-4 -left-5 w-180 h-16 bg-[#FFFEF2] rounded-[1.25rem] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] cursor-text"
        >
          <input
            id="search-input"
            type="text"
            placeholder="ค้นหา..."
            className="absolute w-155 top-1/2 left-8 -translate-y-1/2 text-[#256D45] placeholder:text-[#bfbfbf] text-2xl font-semibold tracking-[0] leading-[normal] bg-transparent border-none outline-none"
            aria-label="Search products"
          />
          <button className="absolute top-0 right-2 w-17.5 h-16 flex items-center aspect-[1] z-10">
            <img
              className="h-16 ml-[14.29%] w-12.5 mr-[14.29%] flex-1 aspect-[1]"
              alt="Icon"
              src={Seacrh}
            />
          </button>
        </label>
      </div>
    </div>
  );
};

export default Home;