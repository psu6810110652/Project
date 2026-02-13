import React from 'react';
import SearchIcon from '../assets/svgs/search.svg';

const Search: React.FC = () => {
    return (
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
                    src={SearchIcon}
                />
            </button>
            </label>
        </div>
    );
};

export default Search;