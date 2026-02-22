import React, { useState } from 'react';
import SearchIcon from '../assets/svgs/search.svg';
import type { SearchProps } from '../types';

const Search: React.FC<SearchProps> = ({
    onSearch,
    onChange,
    placeholder = "ค้นหา...",
    className
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        if (onChange) {
            onChange(value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (onSearch) {
                onSearch(inputValue);
            }
        }
    };

    const handleSearchClick = () => {
        if (onSearch) {
            onSearch(inputValue);
        }
    };

    return (
        <div className={`w-full max-w-3xl mx-auto px-4 mt-8 z-10 relative ${className || ''}`}>
            <div className="flex items-center w-full bg-[#FFFEF2] rounded-full shadow-lg h-14 md:h-16 px-6">
                <input
                    id="search-input"
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 w-full outline-none text-[#256D45] placeholder:text-[#bfbfbf] text-lg md:text-2xl font-semibold bg-transparent border-none"
                    aria-label="Search products"
                />
                <button
                    onClick={handleSearchClick}
                    className="flex-shrink-0 ml-4 hover:opacity-80 transition-opacity flex items-center justify-center h-full"
                >
                    <img
                        className="w-6 h-6 md:w-8 md:h-8 object-contain"
                        alt="Search Icon"
                        src={SearchIcon}
                    />
                </button>
            </div>
        </div>
    );
};

export default Search;