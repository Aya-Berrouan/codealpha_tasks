import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const { user, token } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkIfCanReview();
    }, [productId, user]);

    const checkIfCanReview = async () => {
        if (!user || !token) {
            setCanReview(false);
            setLoading(false);
            return;
        }

        try {
            // Get user's orders to check if they purchased this product
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const orders = data.orders || [];

                // Check if user has purchased this product
                const hasPurchased = orders.some(order => 
                    order.order_items.some(item => item.product_id === parseInt(productId))
                );

                // If they've purchased, check if they've already reviewed
                if (hasPurchased) {
                    const reviewResponse = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/reviews?product_id=${productId}&user_id=${user.id}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );

                    if (reviewResponse.ok) {
                        const reviewData = await reviewResponse.json();
                        const hasReviewed = reviewData.reviews.data.length > 0;
                        setCanReview(!hasReviewed);
                    }
                } else {
                    setCanReview(false);
                }
            }
        } catch (error) {
            console.error('Error checking review eligibility:', error);
            setCanReview(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !token) {
            toast.error('Please log in to submit a review');
            return;
        }

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);

            // Get the order ID for this product
            const ordersResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!ordersResponse.ok) {
                throw new Error('Failed to fetch orders');
            }

            const ordersData = await ordersResponse.json();
            const orders = ordersData.orders || [];

            // Find the most recent order containing this product
            const order = orders.find(order => 
                order.order_items.some(item => item.product_id === parseInt(productId))
            );

            if (!order) {
                toast.error('You must purchase this product to review it');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    order_id: order.id,
                    rating,
                    comment: comment.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Review submitted successfully');
                setRating(0);
                setComment('');
                setCanReview(false);
                if (onReviewSubmitted) {
                    onReviewSubmitted();
                }
            } else {
                toast.error(data.message || 'Error submitting review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Error submitting review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-600">Please log in to write a review</p>
            </div>
        );
    }

    if (!canReview) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-600">
                    You can only review products you've purchased, and you can only review each product once.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Write a Review</h3>
            
            {/* Rating Selection */}
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1"
                    >
                        {star <= (hoverRating || rating) ? (
                            <StarIconSolid className="h-6 w-6 text-yellow-400" />
                        ) : (
                            <StarIcon className="h-6 w-6 text-gray-300" />
                        )}
                    </button>
                ))}
            </div>

            {/* Comment Input */}
            <div>
                <label htmlFor="comment" className="sr-only">
                    Review Comment
                </label>
                <textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your review here..."
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={submitting || rating === 0}
                className={`px-4 py-2 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm;
