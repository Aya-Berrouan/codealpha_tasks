import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

const ReviewList = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1

    useEffect(() => {
        fetchReviews();
    }, [productId, currentPage, filter]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            let url = `${import.meta.env.VITE_API_URL}/api/reviews?product_id=${productId}&page=${currentPage}`;
            
            // Add rating filter if not 'all'
            if (filter !== 'all') {
                url += `&rating=${filter}`;
            }
            
            console.log('Fetching reviews from:', url);
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Reviews response:', data);
            
            if (response.ok) {
                if (data.reviews && data.reviews.data) {
                    setReviews(data.reviews.data);
                    setTotalPages(Math.ceil(data.reviews.total / data.reviews.per_page));
                } else {
                    console.error('Unexpected response structure:', data);
                    setError('Invalid response format from server');
                }
            } else {
                console.error('Error response:', data);
                setError(data.message || 'Error fetching reviews');
            }
        } catch (error) {
            console.error('Error in fetchReviews:', error);
            setError('Error fetching reviews: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const FilterButtons = () => (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                    filter === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
                All Reviews
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
                <button
                    key={rating}
                    onClick={() => handleFilterChange(rating.toString())}
                    className={`px-3 py-1 rounded-full text-sm ${
                        filter === rating.toString()
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {rating} Star
                </button>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-8">
                <FilterButtons />
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8">
                <FilterButtons />
                <div className="text-red-600 text-center py-4">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <FilterButtons />
            
            {reviews.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                    No reviews yet.
                </div>
            ) : (
                <>
                    {/* Reviews List */}
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-200 pb-6">
                                <div className="flex items-center mb-2">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, index) => (
                                            <StarIcon
                                                key={index}
                                                className={`h-5 w-5 ${
                                                    index < review.rating ? 'text-yellow-400' : 'text-gray-200'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-500">
                                        {format(new Date(review.created_at), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">{review.comment}</p>
                                <div className="mt-2 text-sm text-gray-500">
                                    By {review.user.first_name} {review.user.last_name}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center space-x-2 mt-6">
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-3 py-1 rounded ${
                                        currentPage === index + 1
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReviewList;
