import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ExistingReview } from '../types';
import api from '../services/api';
import { Star } from 'lucide-react';

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [existingReviews, setExistingReviews] = useState<ExistingReview[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [backendRating, setBackendRating] = useState(0);
  const [backendReviewCount, setBackendReviewCount] = useState(0);

  useEffect(() => {
    const loadReviewData = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch product data - this includes the real-time average rating from backend
        const response = await api.get(`/product/${productId}`);
        const productData = response.data;
        setProductName(productData.name || 'ชื่อสินค้า');
        setBackendRating(Number(productData.rating) || 0);
        setBackendReviewCount(Number(productData.reviewCount) || 0);
      } catch (error) {
        console.error('Error loading product data:', error);
        setProductName('ชื่อสินค้า');
      }

      try {
        const reviewsResponse = await api.get(`/product/${productId}/reviews`);
        setExistingReviews(reviewsResponse.data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setExistingReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviewData();
  }, [productId]);

  // Use backend rating as primary source of truth
  const averageRating = backendRating;
  const totalReviewsCount = backendReviewCount || existingReviews.length;

  // Show all reviews including our own on this page
  const allReviews = existingReviews;

  const filteredReviews = selectedRating === null
    ? allReviews
    : allReviews.filter(r => Math.floor(r.rating) === selectedRating);

  const renderStarsUI = (rating: number, size = 16) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFull = starValue <= Math.floor(rating);
      const isHalf = !isFull && starValue <= Math.ceil(rating) && (rating % 1 >= 0.5);
      
      return (
        <div key={i} className="relative inline-block">
          <Star
            size={size}
            className={isFull ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
          {isHalf && (
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star
                size={size}
                className="fill-yellow-400 text-yellow-400"
              />
            </div>
          )}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#dcedc2] flex items-center justify-center">
        <p className="text-xl text-[#1f653a]">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DCEDC1] text-[#1f653a] flex flex-col">

      {/* Main Content */}
      <main className="flex-1 pt-4 pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-left flex justify-start mb-8">
            <button
              onClick={() => navigate(-1)}
              className="bg-[#fdfcf6] text-[#2a6b3b] font-bold py-2! px-6! rounded-xl shadow-sm hover:bg-gray-50"
            >
              กลับ
            </button>
          </div>

          <div className="flex justify-between items-end border-b-3 border-[#1f653a] pb-2.5 mb-5">
            <h1 className="text-5xl font-bold">รีวิว</h1>
            <h2 className="text-2xl font-semibold">{productName}</h2>
          </div>

          {/* Average Rating and Filter */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-8 w-full">
              <div className="text-center min-w-32">
                <div className="text-5xl font-bold text-[#1f653a]">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center my-1">
                  {renderStarsUI(averageRating, 24)}
                </div>
                <div className="text-gray-500 text-sm">{totalReviewsCount} รีวิว</div>
              </div>

              <div className="h-16 w-px bg-gray-200 hidden md:block"></div>

              <div className="flex flex-wrap gap-3 justify-start flex-1 ml-0 md:ml-4">
                <button
                  onClick={() => setSelectedRating(null)}
                  className={`px-5! py-3! rounded-2xl border-2 transition-all font-semibold flex items-center gap-3 ${selectedRating === null
                    ? 'bg-[#1f653a] border-[#1f653a] text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#1f653a] hover:text-[#1f653a]'
                    }`}
                >
                  ทั้งหมด ({allReviews.length})
                </button>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = allReviews.filter((r: any) => Math.floor(r.rating) === star).length;
                  return (
                    <button
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      className={`px-5! py-3! rounded-2xl border-2 transition-all flex items-center gap-3 font-semibold ${selectedRating === star
                        ? 'bg-[#1f653a] border-[#1f653a] text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#1f653a] hover:text-[#1f653a]'
                        }`}
                    >
                      {star} <Star size={16} className={selectedRating === star ? 'fill-white' : 'fill-yellow-400 text-yellow-400'} />
                      <span className="text-sm opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews from other users */}
          <div className="mt-4">
            {filteredReviews.length > 0 ? (
              <div className="space-y-4">
                {filteredReviews.map((review: any) => (
                  <div key={review.id} className="bg-[#fdfef9] rounded-lg shadow-lg p-6">
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-full">
                        <div className="flex justify-between items-start">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (review.userId) navigate(`/user/${review.userId}`);
                            }}
                            className="text-lg font-semibold text-[#1f653a] text-left hover:underline no-underline block"
                          >
                            {review.userName || review.customerName || 'ผู้ใช้ทั่วไป'}
                          </a>
                          <div className="text-sm text-gray-500 flex flex-col items-end">
                            {review.orderDate && (
                              <div className="font-medium">
                                สั่งซื้อเมื่อ: {new Date(review.orderDate).toLocaleString('th-TH', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
                            {review.orderID && <div className="text-xs opacity-75">เลขที่ออเดอร์: #{review.orderID}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1 mb-2">
                          {renderStarsUI(review.rating)}
                          <span className="text-sm text-gray-600 ml-1">({review.rating})</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-left mt-2 border-t pt-2">
                          {review.reviewContent || <span className="text-gray-400 italic">ไม่มีข้อความรีวิว</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#fdfef9] rounded-lg shadow-lg p-12 text-center">
                <Star size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg font-medium">ไม่พบรีวิวที่ตรงตามเงื่อนไข</p>
                <button
                  onClick={() => setSelectedRating(null)}
                  className="mt-4 text-[#1f653a] font-semibold hover:underline"
                >
                  ดูรีวิวทั้งหมด
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewPage;
