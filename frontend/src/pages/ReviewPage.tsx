import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ExistingReview {
  id: string;
  userName: string;
  rating: number;
  reviewContent: string;
  orderDate: string;
  userId: string;
}

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const auth = useContext(AuthContext);

  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [existingReviews, setExistingReviews] = useState<ExistingReview[]>([]);

  const currentUserId = auth?.user?.id || 'guest';

  useEffect(() => {
    const loadReviewData = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch product data
        const response = await fetch(`/api/product/${productId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const productData = await response.json();
        setProductName(productData.name || 'ชื่อสินค้า');
      } catch (error) {
        console.error('Error loading product data:', error);
        setProductName('ชื่อสินค้า');
      }

      // Fetch existing reviews for this product
      try {
        const reviewsResponse = await fetch(`/api/product/${productId}/reviews`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setExistingReviews(reviewsData);
        } else {
          setExistingReviews([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setExistingReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviewData();
  }, [productId]);

  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-[#1f653a] text-sm">
        {i < Math.floor(rating) ? '★' : '☆'}
      </span>
    ));
  };

  // Filter out the current user's reviews — show only other customers' reviews
  const otherReviews = existingReviews.filter(r => r.userId !== currentUserId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#dcedc2] flex items-center justify-center">
        <p className="text-xl text-[#1f653a]">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#dcedc2] text-[#1f653a] flex flex-col" style={{ fontFamily: 'Kanit, sans-serif' }}>

      {/* Main Content */}
      <main className="flex-1 px-12 py-8">

        <div className="flex justify-between items-start mb-8">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
            className="bg-white text-[#1f653a] border-none px-10 py-2.5 rounded-full text-xl font-semibold cursor-pointer shadow-md inline-block no-underline"
          >
            กลับ
          </a>
          {/* Button to go to edit/write review page */}
          <button
            onClick={() => navigate(`/review/${productId}/edit`)}
            className="bg-[#1f653a] hover:bg-[#1a4d2e] text-white font-bold px-8 py-2.5 rounded-full text-xl transition-colors shadow-md"
          >
            เขียนรีวิว
          </button>
        </div>

        <div className="flex justify-between items-end border-b-3 border-[#1f653a] pb-2.5 mb-5">
          <h1 className="text-5xl font-bold">รีวิว</h1>
          <h2 className="text-2xl font-semibold">{productName}</h2>
        </div>

        {/* Reviews from other users */}
        <div className="mt-4">
          <h3 className="text-2xl font-semibold mb-6">รีวิวจากผู้ใช้งานท่านอื่น</h3>
          {otherReviews.length > 0 ? (
            <div className="space-y-4">
              {otherReviews.map((review) => (
                <div key={review.id} className="bg-[#fdfef9] rounded-lg shadow-lg p-6">
                  <div className="flex gap-6">
                    {/* Left side - User info and rating */}
                    <div className="flex-shrink-0 w-48">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/user/${review.userId}`);
                        }}
                        className="text-lg font-semibold text-[#1f653a] hover:underline no-underline block mb-2"
                      >
                        {review.userName}
                      </a>
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600 ml-1">({review.rating})</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {review.orderDate}
                      </div>
                    </div>

                    {/* Right side - Review content */}
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">
                        {review.reviewContent}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#fdfef9] rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-600">ยังไม่มีรีวิวจากผู้ใช้ท่านอื่นสำหรับสินค้านี้</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReviewPage;
