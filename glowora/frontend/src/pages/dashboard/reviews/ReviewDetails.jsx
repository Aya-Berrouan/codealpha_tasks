import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

const StarRating = ({ rating }) => {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                    {star <= rating ? (
                        <StarIconSolid className="h-6 w-6 text-yellow-400" />
                    ) : (
                        <StarIcon className="h-6 w-6 text-gray-300" />
                    )}
                </span>
            ))}
        </div>
    );
};

const ReviewDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminResponse, setAdminResponse] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchReview();
    }, [id]);

    const fetchReview = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/reviews/${id}`);
            const data = await response.json();
            setReview(data);
            setStatus(data.status);
            setAdminResponse(data.admin_response || '');
            setLoading(false);
        } catch (error) {
            console.error('Error fetching review:', error);
            toast.error('Error loading review details');
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/reviews/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status,
                    admin_response: adminResponse
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Review updated successfully');
                navigate('/admin/reviews');
            } else {
                toast.error(data.message || 'Error updating review');
            }
        } catch (error) {
            console.error('Error updating review:', error);
            toast.error('Error updating review');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!review) {
        return <div>Review not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Review Details
                </h1>
                <button
                    onClick={() => navigate('/admin/reviews')}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Back to Reviews
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Review Information */}
                <div className="col-span-2">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Product Information</h2>
                            <div className="flex items-center">
                                <img
                                    src={review.product.image_url}
                                    alt={review.product.name}
                                    className="h-16 w-16 rounded-lg object-cover"
                                />
                                <div className="ml-4">
                                    <p className="text-lg font-medium text-gray-900">{review.product.name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Review</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Rating</p>
                                    <StarRating rating={review.rating} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Comment</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        {review.comment}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Admin Response
                                    </label>
                                    <textarea
                                        value={adminResponse}
                                        onChange={(e) => setAdminResponse(e.target.value)}
                                        rows="4"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Add a response to this review..."
                                    ></textarea>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                                    >
                                        Update Review
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="col-span-1">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {review.user.first_name} {review.user.last_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {review.user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewDetails; 