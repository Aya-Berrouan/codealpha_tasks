import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import LoadingScreen from '../../../components/LoadingScreen';

const CategoryList = () => {
    const [allCategories, setAllCategories] = useState([]);
    const [displayedCategories, setDisplayedCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const { token } = useAuth();
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        categoryId: null,
        categoryName: ''
    });
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        if (token) {
            fetchCategories();
        }
    }, [token]);

    useEffect(() => {
        filterAndSortCategories();
    }, [searchTerm, sortBy, sortOrder, allCategories]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/categories`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setAllCategories(response.data.data);
                filterAndSortCategories(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error(error.response?.data?.message || 'Error loading categories');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortCategories = (categories = allCategories) => {
        let filtered = [...categories];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(category => 
                category.name.toLowerCase().includes(searchLower) ||
                (category.description && category.description.toLowerCase().includes(searchLower))
            );
        }

        filtered.sort((a, b) => {
            if (sortBy === 'name') {
                return sortOrder === 'asc' 
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            }
            return sortOrder === 'asc'
                ? new Date(a.created_at) - new Date(b.created_at)
                : new Date(b.created_at) - new Date(a.created_at);
        });

        setDisplayedCategories(filtered);
        setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
    };

    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return displayedCategories.slice(startIndex, endIndex);
    };

    const handleDeleteClick = (category) => {
        setDeleteModal({
            isOpen: true,
            categoryId: category.id,
            categoryName: category.name
        });
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/categories/${deleteModal.categoryId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (response.data.success) {
                toast.success('Category deleted successfully');
                fetchCategories();
            } else {
                toast.error(response.data.message || 'Error deleting category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error(error.response?.data?.message || 'Error deleting category');
        } finally {
            setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' });
    };

    if (loading) {
        return <LoadingScreen text="Loading Categories..." />;
    }

    return (
        <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Categories</h1>
                <button
                    onClick={() => navigate('/admin/categories/create')}
                    className="px-4 py-2 bg-iris text-white rounded-md hover:bg-iris-600 transition-colors duration-200 flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Category
                </button>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-iris focus:border-iris dark:focus:ring-iris dark:focus:border-iris transition-colors duration-200"
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCurrentPageItems().map((category) => (
                    <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200">
                        <div className="relative">
                            {category.image_url && (
                                <img
                                    src={category.image_url}
                                    alt={category.name}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex items-center space-x-2">
                                {category.icon_url && (
                                    <img 
                                        src={category.icon_url} 
                                        alt={`${category.name} icon`} 
                                        className="w-6 h-6 object-contain"
                                    />
                                )}
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {category.name}
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                                {category.description}
                            </p>
                            <div className="mt-4 flex justify-end space-x-2">
                                <Link
                                    to={`/admin/categories/edit/${category.id}`}
                                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={() => handleDeleteClick(category)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
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

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteModal.categoryName}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default CategoryList; 