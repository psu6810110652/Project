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
        <div className={`z-10 mx-auto w-180 h-16 relative mt-11.75 ${className || ''}`}>
            <label
                htmlFor="search-input"
                className="absolute -top-4 -left-5 w-180 h-16 bg-[#FFFEF2] rounded-[1.25rem] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] cursor-text"
            >
                <input
                    id="search-input"
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="absolute w-155 top-1/2 left-8 -translate-y-1/2 text-[#256D45] placeholder:text-[#bfbfbf] text-2xl font-semibold tracking-[0] leading-[normal] bg-transparent border-none outline-none"
                    aria-label="Search products"
                />
                <button
                    onClick={handleSearchClick}
                    className="absolute top-0 right-2 w-17.5 h-16 flex items-center justify-center z-10 hover:opacity-80 transition-opacity"
                >
                    <img
                        className="w-10 h-10 object-contain"
                        alt="Search Icon"
                        src={SearchIcon}
                    />
                </button>
            </label>
        </div>
    );
};

export default Search;