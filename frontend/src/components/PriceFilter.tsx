import React from 'react';
import { Slider, InputNumber, ConfigProvider } from 'antd';

interface PriceFilterProps {
    minPrice: number;
    maxPrice: number;
    onRangeChange: (values: [number, number]) => void;
    absoluteMax?: number;
}

const PriceFilter: React.FC<PriceFilterProps> = ({
    minPrice,
    maxPrice,
    onRangeChange,
    absoluteMax = 100000
}) => {
    const handleChange = (values: number | number[]) => {
        if (Array.isArray(values)) {
            onRangeChange(values as [number, number]);
        }
    };

    const handleMinChange = (value: number | null) => {
        onRangeChange([value || 0, maxPrice]);
    };

    const handleMaxChange = (value: number | null) => {
        onRangeChange([minPrice, value || absoluteMax]);
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#ffb7b2', // Keep for AntD component specifically
                },
                components: {
                    Slider: {
                        handleSize: 20,
                        handleSizeHover: 22,
                        handleLineWidth: 2,
                    }
                }
            }}
        >
            <div className="bg-[var(--color-bg-card)] p-8 rounded-[20px] shadow-sm border border-gray-100 font-['Prompt']">
                <h3 className="text-2xl font-semibold text-[var(--color-primary)] mb-6">ช่วงราคา</h3>

                <div className="flex items-center gap-4 mb-8">
                    <InputNumber
                        min={0}
                        max={absoluteMax}
                        value={minPrice}
                        onChange={handleMinChange}
                        className="price-input"
                        controls={false}
                        placeholder="0"
                    />
                    <span className="text-[#a0aec0] font-medium text-xl">-</span>
                    <InputNumber
                        min={0}
                        max={absoluteMax}
                        value={maxPrice}
                        onChange={handleMaxChange}
                        className="price-input"
                        controls={false}
                        placeholder={absoluteMax.toString()}
                    />
                </div>

                <div className="px-2 py-4">
                    <Slider
                        range
                        min={0}
                        max={absoluteMax}
                        value={[minPrice, maxPrice]}
                        onChange={handleChange}
                        tooltip={{ open: false }}
                    />
                </div>

                <style>{`
          .price-input {
            width: 100% !important;
            height: 48px !important;
            border-radius: 8px !important;
            border: 1px solid #e2e8f0 !important;
            overflow: hidden !important;
            display: flex !important;
          }
          .price-input .ant-input-number-input-wrap {
            height: 100% !important;
            width: 100% !important;
          }
          .price-input .ant-input-number-input {
            height: 48px !important;
            font-size: 1.25rem !important;
            color: #4a5568 !important;
            text-align: center !important;
            padding: 0 !important;
          }
          .price-input:hover, .price-input-focused {
            border-color: #ffb7b2 !important;
          }
          
          /* Force Slider styles via CSS to avoid Theme Token errors */
          .ant-slider-track {
            height: 6px !important;
            background-color: #ffb7b2 !important;
          }
          .ant-slider-rail {
            height: 6px !important;
            background-color: #f7fafc !important;
          }
          .ant-slider-handle {
            background-color: #fff !important;
            border: 2px solid #ffb7b2 !important;
            box-shadow: none !important;
          }
          .ant-slider-handle::after, .ant-slider-handle::before {
            display: none !important;
          }
          .ant-slider-handle:hover, .ant-slider-handle-active {
            box-shadow: 0 0 0 4px rgba(255, 183, 178, 0.2) !important;
          }
        `}</style>
            </div>
        </ConfigProvider>
    );
};

export default PriceFilter;
