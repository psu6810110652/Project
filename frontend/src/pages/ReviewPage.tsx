import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ReviewData {
  productName: string;
  userName: string;
  rating: number;
  orderDate: string;
  reviewContent: string;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl?: string;
  type?: string;
  description?: string;
  price: number;
  stockQuantity: number;
  isPromotion: boolean;
  promotionPrice?: number;
  isFeatured?: boolean;
  createdAt?: Date;
  category?: any;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
}

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
  
  const [reviewData, setReviewData] = useState<ReviewData>({
    productName: '',
    userName: '',
    rating: 5.0,
    orderDate: new Date().toLocaleString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
    reviewContent: ''
  });
  
  const [product, setProduct] = useState<Product | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [existingReviews, setExistingReviews] = useState<ExistingReview[]>([]);

  useEffect(() => {
    const loadReviewData = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch product data
        const response = await fetch(`/api/product/${productId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const productData = await response.json();
        setProduct(productData);
        
        // Get user data from AuthContext
        const currentUser = auth?.user;
        const currentUserId = currentUser?.id || 'guest';
        const currentUserName = currentUser?.name || currentUser?.username || 'ผู้ใช้ทั่วไป';
        
        setUserId(currentUserId);
        
        setReviewData(prev => ({
          ...prev,
          productName: productData.name || 'ชื่อสินค้า',
          userName: currentUserName,
          orderDate: new Date().toLocaleString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        }));

        // Fetch existing reviews for this product
        try {
          const reviewsResponse = await fetch(`/api/product/${productId}/reviews`);
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setExistingReviews(reviewsData);
          } else {
            console.log('Reviews API not available, no reviews to display');
            setExistingReviews([]);
          }
        } catch (error) {
          console.error('Error fetching reviews:', error);
          setExistingReviews([]);
        }
      } catch (error) {
        console.error('Error loading review data:', error);
        
        // Fallback to user data from AuthContext even on error
        const currentUser = auth?.user;
        const currentUserId = currentUser?.id || 'guest';
        const currentUserName = currentUser?.name || currentUser?.username || 'ผู้ใช้ทั่วไป';
        
        setUserId(currentUserId);
        
        setReviewData(prev => ({
          ...prev,
          productName: 'ชื่อสินค้า',
          userName: currentUserName,
          orderDate: new Date().toLocaleString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        }));
        
        // Fetch existing reviews for this product
        try {
          const reviewsResponse = await fetch(`/api/product/${productId}/reviews`);
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setExistingReviews(reviewsData);
          } else {
            console.log('Reviews API not available, no reviews to display');
            setExistingReviews([]);
          }
        } catch (error) {
          console.error('Error fetching reviews:', error);
          setExistingReviews([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadReviewData();
  }, [productId]);

  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-[#1f653a]">
        {i < Math.floor(rating) ? '★' : '☆'}
      </span>
    ));
  };

  const handleRatingChange = (newRating: number) => {
    setReviewData(prev => ({ ...prev, rating: newRating }));
  };

  const handleSubmitReview = async () => {
    if (!reviewData.reviewContent.trim()) {
      setMessage('กรุณาเขียนรีวิวก่อนส่ง');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // Send review to API
      const reviewPayload = {
        productId: productId,
        userId: auth?.user?.id || 'guest',
        userName: reviewData.userName,
        rating: reviewData.rating,
        reviewContent: reviewData.reviewContent,
        orderDate: reviewData.orderDate
      };

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewPayload)
      });

      if (response.ok) {
        const newReview = await response.json();
        // Add the new review to the existing reviews
        setExistingReviews(prev => [newReview, ...prev]);
        
        // Clear the form
        setReviewData(prev => ({ ...prev, reviewContent: '', rating: 5.0 }));
        
        setMessage('ส่งรีวิวเรียบร้อยแล้ว');
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        throw new Error('Failed to submit review');
      }
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* Message Display */}
        {message && (
          <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            message.includes('เรียบร้อย') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {message}
          </div>
        )}

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
        </div>
        
        <div className="flex justify-between items-end border-b-3 border-[#1f653a] pb-2.5 mb-5">
          <h1 className="text-5xl font-bold">รีวิว</h1>
          <h2 className="text-2xl font-semibold">{reviewData.productName}</h2>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/profile');
            }}
            className="text-xl font-semibold text-[#1f653a] hover:underline no-underline"
          >
            {reviewData.userName}
          </a>
          <div className="text-sm font-medium">
            {reviewData.rating} <span className="text-[#1f653a]">{renderStars(reviewData.rating)}</span>
          </div>
          <div className="w-0.5 h-4 bg-[#1f653a]"></div>
          <div className="text-sm font-medium">
            วันที่และเวลาที่สั่งซื้อ {reviewData.orderDate}
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-[#fdfef9] rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-left">เขียนรีวิวของคุณ</h3>
          
          {/* Rating Selector */}
          <div className="mb-4 text-left">
            <p className="text-lg font-medium mb-3">คะแนนของคุณ:</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingChange(star)}
                  className="transition-transform hover:scale-110"
                >
                  <span className="text-3xl">
                    {star <= reviewData.rating ? '★' : '☆'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Review Content */}
          <div className="mb-6 text-left">
            <label className="block text-lg font-medium mb-3">
              เขียนรีวิวของคุณ:
            </label>
            <textarea
              value={reviewData.reviewContent}
              onChange={(e) => setReviewData(prev => ({ ...prev, reviewContent: e.target.value }))}
              placeholder="แชร์ประสบการณ์การใช้งานสินค้านี้..."
              className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#1f653a] resize-none text-gray-700"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className="bg-[#1f653a] hover:bg-[#1a4d2e] text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
            </button>
          </div>
        </div>

        {/* Existing Reviews Section */}
        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-6">รีวิวจากผู้ใช้งานท่านอื่น</h3>
          {existingReviews.length > 0 ? (
            <div className="space-y-4">
              {existingReviews.map((review) => (
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
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className="text-[#1f653a] text-sm">
                            {i < Math.floor(review.rating) ? '★' : '☆'}
                          </span>
                        ))}
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
              <p className="text-gray-600">ยังไม่มีรีวิวสำหรับสินค้านี้ เป็นคนแรกที่รีวิวสินค้านี้!</p>
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default ReviewPage;
