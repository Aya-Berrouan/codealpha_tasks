import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import TableScrollbar from '../../../components/TableScrollbar';
import LoadingScreen from '../../../components/LoadingScreen';

const ProductList = () => {
    const [allProducts, setAllProducts] = useState([]); // Store all products
    const [displayedProducts, setDisplayedProducts] = useState([]); // Store paginated products
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteModal, setDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    // Apply filters and pagination
    useEffect(() => {
        let filtered = [...allProducts];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(product => product.category.id === parseInt(selectedCategory));
        }

        // Apply price range filter
        if (priceRange.min) {
            filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
        }
        if (priceRange.max) {
            filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
        }

        // Apply sorting
        filtered.sort((a, b) => {
            if (sortBy === 'price') {
                return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
            }
            // Add other sort conditions as needed
            return sortOrder === 'asc' ? 
                new Date(a.created_at) - new Date(b.created_at) : 
                new Date(b.created_at) - new Date(a.created_at);
        });

        // Calculate total pages
        setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));

        // Get current page items
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setDisplayedProducts(filtered.slice(startIndex, endIndex));

    }, [allProducts, currentPage, searchTerm, selectedCategory, priceRange, sortBy, sortOrder]);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            setCategories(data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error loading categories');
            setCategories([]);
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.data) {
                setAllProducts(data.data);
            } else {
                setAllProducts([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Error loading products');
            setAllProducts([]);
            setLoading(false);
        }
    };

    const initiateDelete = (product) => {
        setProductToDelete(product);
        setDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/products/${productToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                toast.success('Product deleted successfully');
                fetchProducts();
            } else {
                toast.error('Error deleting product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Error deleting product');
        } finally {
            setDeleteModal(false);
            setProductToDelete(null);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleCategoryFilter = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1);
    };

    const handlePriceRangeChange = (e) => {
        setPriceRange({
            ...priceRange,
            [e.target.name]: e.target.value
        });
        setCurrentPage(1);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    if (loading) {
        return <LoadingScreen text="Loading Products..." />;
    }

    return (
        <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Products</h1>
                <Link
                    to="/admin/products/create"
                    className="bg-iris text-white px-4 py-2 rounded-md hover:bg-iris-600 flex items-center transition-colors duration-200"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Product
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 transition-colors duration-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-iris focus:border-iris dark:focus:ring-iris dark:focus:border-iris transition-colors duration-200"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
                    </div>

                    {/* Category Filter */}
                    <div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-iris focus:border-iris dark:focus:ring-iris dark:focus:border-iris transition-colors duration-200"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="flex space-x-2">
                        <input
                            type="number"
                            name="min"
                            placeholder="Min Price"
                            value={priceRange.min}
                            onChange={(e) => {
                                setPriceRange(prev => ({ ...prev, min: e.target.value }));
                                setCurrentPage(1);
                            }}
                            className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-iris focus:border-iris dark:focus:ring-iris dark:focus:border-iris transition-colors duration-200"
                        />
                        <input
                            type="number"
                            name="max"
                            placeholder="Max Price"
                            value={priceRange.max}
                            onChange={(e) => {
                                setPriceRange(prev => ({ ...prev, max: e.target.value }));
                                setCurrentPage(1);
                            }}
                            className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-iris focus:border-iris dark:focus:ring-iris dark:focus:border-iris transition-colors duration-200"
                        />
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-colors duration-200">
                <TableScrollbar>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Image
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {displayedProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img
                                            src={product.images && product.images.length > 0 ? product.images.find(img => img.is_primary)?.image_url || product.images[0].image_url : ''}
                                            alt={product.name}
                                            className="h-12 w-12 rounded-lg object-cover"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {product.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-gray-300">
                                            {product.category?.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            ${product.price}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-gray-300">
                                            {product.stock_quantity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex space-x-3">
                                            <Link
                                                to={`/admin/products/edit/${product.id}`}
                                                className="text-iris hover:text-iris-600 transition-colors duration-200"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                            <button
                                                onClick={() => initiateDelete(product)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableScrollbar>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
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

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                            Delete Product
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeleteModal(false);
                                        setProductToDelete(null);
                                    }}
                                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-iris focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList; 