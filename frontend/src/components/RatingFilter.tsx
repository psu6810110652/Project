import React, { useState } from 'react';

interface RatingFilterProps {
    selectedRating: number | null;
    onRatingChange: (rating: number | null) => void;
}

const RatingFilter: React.FC<RatingFilterProps> = ({ selectedRating, onRatingChange }) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const handleStarClick = (rating: number) => {
        // If clicking the same rating, clear filter (toggle behavior)
        if (selectedRating === rating) {
            onRatingChange(null);
        } else {
            onRatingChange(rating);
        }
    };

    return (
        <div className="bg-(--color-bg-card) p-8 rounded-[20px] shadow-sm border border-gray-100 font-['Prompt']">
            <h3 className="text-2xl font-semibold text-(--color-primary) mb-4">คะแนนรีวิว</h3>
            <p className="text-(--color-text-muted) text-sm mb-6">กรองตามคะแนนเฉลี่ย (ขึ้นไป)</p>

            <div className="flex flex-col items-center justify-center p-4 bg-(--color-bg-white) rounded-2xl border-2 border-dashed border-(--color-accent)/30">
                <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => handleStarClick(star)}
                            className="text-4xl transition-all duration-200 active:scale-90"
                        >
                            <span
                                className={`${star <= (hoverRating || selectedRating || 0)
                                    ? "text-[#fbbf24] drop-shadow-[0_2px_4px_rgba(251,191,36,0.2)]"
                                    : "text-gray-200"
                                    }`}
                            >
                                {star <= (hoverRating || selectedRating || 0) ? "★" : "☆"}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="h-6">
                    {selectedRating ? (
                        <span className="text-[#e53e3e] font-bold text-lg animate-fade-in">
                            {selectedRating} ดาวขึ้นไป
                        </span>
                    ) : (
                        <span className="text-gray-400 text-lg">ทั้งหมด</span>
                    )}
                </div>

                {selectedRating && (
                    <button
                        onClick={() => onRatingChange(null)}
                        className="mt-4 text-sm text-[#ffb7b2] hover:text-[#e53e3e] underline transition-colors"
                    >
                        ล้างตัวกรอง
                    </button>
                )}
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default RatingFilter;
