import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            fetchCategories();
        } else {
            setError('Authentication token is missing');
            toast.error('Please log in to view categories');
        }
    }, [token]);

    const fetchCategories = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            
            if (!token) {
                throw new Error('Authentication token is missing');
            }
            
            console.log('Fetching categories with token:', token); // Debug log
            
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories?page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            console.log('Raw API Response:', response); // Debug full response
            console.log('Categories response data:', response.data); // Debug response data

            if (response.data.success) {
                console.log('Setting categories:', response.data.data); // Debug what we're setting
                setCategories(response.data.data || []);
                setCurrentPage(response.data.meta?.current_page || 1);
                setTotalPages(response.data.meta?.last_page || 1);
            } else {
                throw new Error(response.data.message || 'Failed to fetch categories');
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            console.error('Error response:', err.response); // Debug error response
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch categories';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchCategories(page);
    };

    const handleAddCategory = () => {
        navigate('/admin/categories/new');
    };

    const handleEditCategory = (categoryId) => {
        navigate(`/admin/categories/edit/${categoryId}`);
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/categories/${categoryId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data.message) {
                toast.success(response.data.message);
                fetchCategories(currentPage); // Refresh the list
            }
        } catch (err) {
            console.error('Error deleting category:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete category';
            toast.error(errorMessage);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                    onClick={() => fetchCategories(currentPage)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Categories</h1>
                <button 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={handleAddCategory}
                >
                    Add New Category
                </button>
            </div>

            {categories.length === 0 ? (
                <p className="text-center text-gray-500">No categories found.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <div key={category.id} className="bg-white rounded-lg shadow-md p-4">
                                {category.image_url && (
                                    <img 
                                        src={category.image_url} 
                                        alt={category.name}
                                        className="w-full h-48 object-cover rounded-t-lg mb-4"
                                    />
                                )}
                                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                                <p className="text-gray-600 mb-4">{category.description}</p>
                                <div className="flex justify-end space-x-2">
                                    <button 
                                        className="text-blue-500 hover:text-blue-700"
                                        onClick={() => handleEditCategory(category.id)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDeleteCategory(category.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6 space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded ${
                                    currentPage === 1 
                                        ? 'bg-gray-300 cursor-not-allowed' 
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded ${
                                    currentPage === totalPages 
                                        ? 'bg-gray-300 cursor-not-allowed' 
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Categories; 