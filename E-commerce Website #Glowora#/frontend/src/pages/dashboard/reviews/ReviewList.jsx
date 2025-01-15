import React, { useState, useEffect } from 'react';
import { 
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TrashIcon,
    StarIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import TableScrollbar from '../../../components/TableScrollbar';
import LoadingScreen from '../../../components/LoadingScreen';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, reviewData }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

                <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">
                                    Delete Review
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to delete this review? This action cannot be undone.
                                    </p>
                                    {reviewData && (
                                        <div className="mt-3 bg-gray-50 p-3 rounded-md">
                                            <p className="text-sm font-medium text-gray-700">Review Details:</p>
                                            <p className="text-sm text-gray-600">Product: {reviewData.product.name}</p>
                                            <p className="text-sm text-gray-600">
                                                Customer: {reviewData.user.first_name} {reviewData.user.last_name}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                <span className="text-sm text-gray-600 mr-2">Rating:</span>
                                                <StarRating rating={reviewData.rating} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Delete
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

const ReviewList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [allReviews, setAllReviews] = useState([]);
    const [displayedReviews, setDisplayedReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, reviewData: null });

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            toast.error('Access denied. Admin privileges required.');
            navigate('/login');
            return;
        }
        fetchReviews();
    }, [user, navigate]);

    useEffect(() => {
        filterAndSortReviews();
    }, [searchTerm, ratingFilter, sortBy, sortOrder, allReviews]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.status === 403) {
                navigate('/login');
                return;
            }

            const data = await response.json();

            if (data.success) {
                setAllReviews(data.reviews.data);
                filterAndSortReviews(data.reviews.data);
            } else {
                toast.error(data.message || 'Error loading reviews');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Error loading reviews');
            setLoading(false);
        }
    };

    const filterAndSortReviews = (reviews = allReviews) => {
        let filtered = [...reviews];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(review => 
                review.product.name.toLowerCase().includes(searchLower)
            );
        }

        if (ratingFilter) {
            filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
                case 'created_at':
                default:
                    return sortOrder === 'asc' 
                        ? new Date(a.created_at) - new Date(b.created_at)
                        : new Date(b.created_at) - new Date(a.created_at);
            }
        });

        setDisplayedReviews(filtered);
        setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
    };

    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return displayedReviews.slice(startIndex, endIndex);
    };

    const handleDelete = async (id) => {
        if (!user || user.role !== 'admin') {
            toast.error('Access denied. Admin privileges required.');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.status === 403) {
                toast.error('Access denied. Admin privileges required.');
                return;
            }

            const data = await response.json();
            if (data.success) {
                toast.success('Review deleted successfully');
                fetchReviews();
            } else {
                toast.error(data.message || 'Error deleting review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Error deleting review');
        }
        setDeleteModal({ isOpen: false, reviewData: null });
    };

    const openDeleteModal = (review) => {
        setDeleteModal({ isOpen: true, reviewData: review });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, reviewData: null });
    };

    if (loading) {
        return <LoadingScreen text="Loading Reviews..." />;
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="container mx-auto px-4">
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={() => handleDelete(deleteModal.reviewData?.id)}
                reviewData={deleteModal.reviewData}
            />
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reviews</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by product name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-iris focus:border-iris dark:focus:ring-iris dark:focus:border-iris transition-colors duration-200"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
                    </div>

                    <div>
                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        >
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [newSortBy, newSortOrder] = e.target.value.split('-');
                                setSortBy(newSortBy);
                                setSortOrder(newSortOrder);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        >
                            <option value="created_at-desc">Newest First</option>
                            <option value="created_at-asc">Oldest First</option>
                            <option value="rating-desc">Highest Rating</option>
                            <option value="rating-asc">Lowest Rating</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <TableScrollbar>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Rating
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Comment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {getCurrentPageItems().map((review) => (
                                <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {review.product.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {review.user.first_name} {review.user.last_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StarRating rating={review.rating} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                            {review.comment || 'No comment provided'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {user && user.role === 'admin' && (
                                            <button
                                                onClick={() => openDeleteModal(review)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableScrollbar>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Showing page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-iris rounded-md disabled:opacity-50 text-iris hover:bg-iris hover:text-white dark:text-iris dark:hover:text-white transition-colors duration-200"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-iris rounded-md disabled:opacity-50 text-iris hover:bg-iris hover:text-white dark:text-iris dark:hover:text-white transition-colors duration-200"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewList; 