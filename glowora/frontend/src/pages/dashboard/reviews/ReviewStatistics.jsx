import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    StarIcon,
    ChatBubbleLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
            <div className={`p-3 rounded-full ${color} bg-opacity-10 mr-4`}>
                <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    </div>
);

const StarRating = ({ rating }) => {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                    {star <= rating ? (
                        <StarIconSolid className="h-5 w-5 text-yellow-400" />
                    ) : (
                        <StarIcon className="h-5 w-5 text-gray-300" />
                    )}
                </span>
            ))}
        </div>
    );
};

const ReviewStatistics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/reviews/statistics');
            const data = await response.json();
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Reviews"
                    value={stats.total_reviews}
                    icon={ChatBubbleLeftIcon}
                    color="text-blue-600"
                />
                <StatCard
                    title="Average Rating"
                    value={stats.average_rating}
                    icon={StarIcon}
                    color="text-yellow-600"
                />
                <StatCard
                    title="Approved Reviews"
                    value={stats.status_distribution.find(s => s.status === 'approved')?.count || 0}
                    icon={CheckCircleIcon}
                    color="text-green-600"
                />
                <StatCard
                    title="Pending Reviews"
                    value={stats.status_distribution.find(s => s.status === 'pending')?.count || 0}
                    icon={ClockIcon}
                    color="text-orange-600"
                />
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h2>
                <div className="space-y-4">
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.rating_distribution.find(r => r.rating === rating)?.count || 0;
                        const percentage = (count / stats.total_reviews) * 100 || 0;
                        
                        return (
                            <div key={rating} className="flex items-center">
                                <div className="w-24">
                                    <StarRating rating={rating} />
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-yellow-400 h-2.5 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="w-20 text-sm text-gray-600">
                                    {count} reviews
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Reviews</h2>
                    <Link
                        to="/admin/reviews"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                        View All
                    </Link>
                </div>
                <div className="space-y-6">
                    {stats.recent_reviews.map((review) => (
                        <div key={review.review_id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={review.product.image_url}
                                        alt={review.product.name}
                                        className="h-12 w-12 rounded-lg object-cover"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {review.product.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            by {review.user.first_name} {review.user.last_name}
                                        </p>
                                        <StarRating rating={review.rating} />
                                        <p className="text-sm text-gray-600 mt-1">
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to={`/admin/reviews/${review.review_id}`}
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewStatistics; 