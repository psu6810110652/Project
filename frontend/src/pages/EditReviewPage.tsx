import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Rate } from 'antd';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { type ReviewItem, type OrderInfo } from '../types';

const EditReviewPage: React.FC = () => {
    const navigate = useNavigate();
    const { orderId } = useParams<{ orderId: string }>();
    const auth = useContext(AuthContext);

    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
    const [userName, setUserName] = useState('ผู้ใช้ทั่วไป');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadData = async () => {
            if (!orderId) {
                setIsLoading(false);
                return;
            }

            const currentUser = auth?.user;

            try {
                // 1. Fetch my orders to find the one matching the formatted orderId
                const ordersRes = await api.get('/api/admin/orders/my-orders');
                const allOrders = ordersRes.data || [];

                const getFormattedId = (record: any) => {
                    return record.orderNumber || record.id;
                };

                const targetOrder = allOrders.find((o: any) => getFormattedId(o) === orderId);

                if (!targetOrder) {
                    console.error('Order not found for ID:', orderId);
                    setIsLoading(false);
                    return;
                }

                setOrderInfo({
                    id: targetOrder.id || targetOrder._id,
                    orderNumber: orderId,
                    orderDate: targetOrder.createdAt || targetOrder.orderDate || targetOrder.created_at,
                    products: targetOrder.products || []
                });

                setUserName(currentUser?.username || currentUser?.name || 'ผู้ใช้ทั่วไป');

                // 2. Fetch all my reviews for this specific order at once (Optimization)
                let orderReviews: any[] = [];
                if (currentUser && targetOrder.id) {
                    try {
                        const reviewsRes = await api.get(`/order/${targetOrder.id}/my-reviews`);
                        orderReviews = reviewsRes.data || [];
                        console.log(`[EditReviewPage] Loaded ${orderReviews.length} existing reviews for order ${targetOrder.id}`);
                    } catch (err) {
                        console.error('Error fetching order reviews:', err);
                    }
                }

                // 3. Prepare reviews array for each product
                const initialReviews: ReviewItem[] = (targetOrder.products || []).map((p: any) => {
                    const pid = p.productId || p.id || p._id;

                    // Match existing review from the pre-fetched orderReviews list
                    const existingReview = orderReviews.find((r: any) => {
                        const rProductId = r.productId?.toString();
                        const pIdStr = pid.toString();
                        return rProductId === pIdStr;
                    });

                    return {
                        productId: pid,
                        productName: p.name || 'ชื่อสินค้า',
                        productImage: p.imageUrl,
                        rating: existingReview ? existingReview.rating : 5.0,
                        reviewContent: existingReview ? existingReview.reviewContent : '',
                        existingReviewId: existingReview ? existingReview.id : null
                    };
                });

                setReviews(initialReviews);
            } catch (error) {
                console.error('Error loading order data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [orderId, auth?.user]);

    const handleRatingChange = (index: number, newRating: number) => {
        const newReviews = [...reviews];
        newReviews[index].rating = newRating;
        setReviews(newReviews);
    };

    const handleContentChange = (index: number, content: string) => {
        const newReviews = [...reviews];
        newReviews[index].reviewContent = content;
        setReviews(newReviews);
    };

    const handleSubmitReview = async () => {
        // Star rating is required, but description is now optional.
        const invalidRating = reviews.find(r => r.rating <= 0);
        if (invalidRating) {
            setMessage(`กรุณาให้คะแนนสินค้า "${invalidRating.productName}"`);
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        try {
            await Promise.all(reviews.map(async (review) => {
                // Prepare base payload
                const reviewPayload: any = {
                    productId: review.productId,
                    rating: review.rating,
                    reviewContent: review.reviewContent,
                    orderID: orderInfo?.id,
                    orderDate: orderInfo?.orderDate
                };

                // Add userId ONLY for new reviews (the controller will override anyway, but for clarity)
                if (!review.existingReviewId && auth?.user?.id && auth.user.id !== 'guest') {
                    reviewPayload.userId = auth.user.id;
                }

                const url = review.existingReviewId ? `/reviews/${review.existingReviewId}` : '/reviews';
                const method = review.existingReviewId ? 'patch' : 'post';

                console.log(`[EditReviewPage] Submitting ${method.toUpperCase()} for ${review.productName}`);
                await api[method](url, reviewPayload);
            }));

            setMessage('ส่งรีวิวทั้งหมดเรียบร้อยแล้ว');
            setTimeout(() => {
                setMessage('');
                navigate(`/profile`);
            }, 2000);
        } catch (error) {
            console.error('Error submitting reviews:', error);
            setMessage('เกิดข้อผิดพลาดในการส่งรีวิวบางส่วน');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#DCEDC1] flex items-center justify-center">
                <p className="text-xl text-[#1f653a]">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#DCEDC1] text-[#1f653a] flex flex-col">

            {/* Main Content */}
            <main className="flex-1 pt-4 pb-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Message Display */}
                    {message && (
                        <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${message.includes('เรียบร้อย') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                            {message}
                        </div>
                    )}

                    <div className="text-left flex justify-start mb-8">
                        <button
                            onClick={() => navigate('/profile')}
                            className="bg-[#fdfcf6] text-[#2a6b3b] font-bold py-2! px-6! rounded-xl shadow-sm hover:bg-gray-50"
                        >
                            กลับ
                        </button>
                    </div>

                    <div className="flex justify-between items-end border-b-3 border-[#1f653a] pb-2.5 mb-5">
                        <h1 className="text-5xl font-bold">เขียนรีวิวของคุณ</h1>
                        <h2 className="text-2xl font-semibold">#{orderId}</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <span className="text-xl font-semibold text-[#1f653a]">
                            {userName}
                        </span>
                        <div className="w-0.5 h-4 bg-[#1f653a]"></div>
                        <div className="text-sm font-medium">
                            วันที่และเวลาที่สั่งซื้อ {orderInfo?.orderDate ? new Date(orderInfo.orderDate).toLocaleString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : ''}
                        </div>
                    </div>

                    {/* Review Forms for All Products */}
                    <div className="flex flex-col gap-8">
                        {reviews.map((review, index) => (
                            <div key={review.productId} className="bg-[#fdfef9] rounded-lg shadow-lg p-6">
                                <div className="flex flex-col md:flex-row gap-6 mb-6">
                                    {review.productImage && (
                                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={review.productImage}
                                                alt={review.productName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-bold flex items-center text-[#1f653a]">{review.productName}</h3>
                                </div>

                                {/* Rating Selector */}
                                <div className="mb-4 text-left">
                                    <p className="text-lg font-medium mb-3">คะแนนของคุณ:</p>
                                    <div className="flex gap-2">
                                        <Rate
                                            allowHalf
                                            value={review.rating}
                                            onChange={(val) => handleRatingChange(index, val)}
                                            style={{ color: '#1f653a', fontSize: '2rem' }}
                                        />
                                    </div>
                                </div>

                                {/* Review Content */}
                                <div className="mb-2 text-left">
                                    <label className="block text-lg font-medium mb-3">
                                        เขียนรีวิวของคุณ:
                                    </label>
                                    <textarea
                                        value={review.reviewContent}
                                        onChange={(e) => handleContentChange(index, e.target.value)}
                                        placeholder={`แชร์ประสบการณ์การใช้งาน ${review.productName}...`}
                                        className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#1f653a] resize-none text-gray-700"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end mt-8">
                        <button
                            onClick={handleSubmitReview}
                            disabled={isSubmitting}
                            className="bg-[#fdfcf6] text-[#2a6b3b] font-bold py-2! px-6! rounded-xl shadow-sm hover:bg-[#2a6b3b] hover:text-[#fdfcf6]"
                        >
                            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งรีวิวทั้งหมด'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditReviewPage;
