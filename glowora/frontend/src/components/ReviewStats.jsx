import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const ReviewStats = ({ productId }) => {
    const [stats, setStats] = useState({
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, [productId]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const url = `${import.meta.env.VITE_API_URL}/api/reviews/statistics?product_id=${productId}`;
            console.log('Fetching review stats from:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Review stats response:', data);
            
            if (response.ok) {
                if (data.statistics) {
                    setStats(data.statistics);
                } else {
                    console.error('Unexpected response structure:', data);
                    setError('Invalid response format from server');
                }
            } else {
                console.error('Error response:', data);
                setError(data.message || 'Error fetching review statistics');
            }
        } catch (error) {
            console.error('Error in fetchStats:', error);
            setError('Error fetching review statistics: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 text-sm">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Average Rating */}
            <div className="flex items-center">
                <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                        <StarIcon
                            key={index}
                            className={`h-5 w-5 ${
                                index < Math.round(stats.average_rating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-200'
                            }`}
                        />
                    ))}
                </div>
                <span className="ml-2 text-sm text-gray-700">
                    {stats.average_rating.toFixed(1)} out of 5
                </span>
                <span className="ml-2 text-sm text-gray-500">
                    ({stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'})
                </span>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.rating_distribution[rating] || 0;
                    const percentage = stats.total_reviews > 0
                        ? (count / stats.total_reviews) * 100
                        : 0;

                    return (
                        <div key={rating} className="flex items-center text-sm">
                            <span className="w-12">{rating} star</span>
                            <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="w-12 text-right text-gray-500">
                                {Math.round(percentage)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReviewStats;
