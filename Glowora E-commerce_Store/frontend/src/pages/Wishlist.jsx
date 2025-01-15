import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HeartIcon, 
    ShoppingCartIcon, 
    TrashIcon,
    AdjustmentsHorizontalIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import QuickViewModal from '../components/products/QuickViewModal';
import axios from 'axios';

const Wishlist = () => {
    const navigate = useNavigate();
    const { wishlistItems, removeFromWishlist, clearWishlist, addToWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('default');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [showFilters, setShowFilters] = useState(false);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [recommendedPage, setRecommendedPage] = useState(1);
    const [hasMoreRecommended, setHasMoreRecommended] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const ITEMS_PER_PAGE = 4;
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchRecommendedProducts(1);
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchRecommendedProducts = async (page = 1) => {
        try {
            if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/recommended`, {
                params: {
                    page,
                    per_page: ITEMS_PER_PAGE,
                    exclude: wishlistItems.map(item => item.product.id)
                }
            });
            
            if (response.data.success) {
                const newProducts = response.data.data;
                if (page === 1) {
                    setRecommendedProducts(newProducts);
                } else {
                    setRecommendedProducts(prev => [...prev, ...newProducts]);
                }
                
                // Update page and check if there are more items
                setRecommendedPage(page);
                setHasMoreRecommended(newProducts.length >= ITEMS_PER_PAGE);
            }
        } catch (error) {
            console.error('Error fetching recommended products:', error);
        } finally {
            if (page === 1) {
                setLoading(false);
            }
            setLoadingMore(false);
        }
    };

    const handleLoadMore = async () => {
        if (!loadingMore && hasMoreRecommended) {
            await fetchRecommendedProducts(recommendedPage + 1);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    // Filter and sort functions
    const filteredItems = wishlistItems.filter(item => {
        const matchesSearch = item.product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.product.category_id === parseInt(selectedCategory);
        const matchesPrice = Number(item.product.price) >= priceRange[0] && Number(item.product.price) <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
        switch (sortOption) {
            case 'price-asc':
                return Number(a.product.price) - Number(b.product.price);
            case 'price-desc':
                return Number(b.product.price) - Number(a.product.price);
            case 'name-asc':
                return a.product.name.localeCompare(b.product.name);
            case 'name-desc':
                return b.product.name.localeCompare(a.product.name);
            default:
                return 0;
        }
    });

    // Format price helper function
    const formatPrice = (price) => {
        const numPrice = Number(price);
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    // Handle add to cart
    const handleAddToCart = (item) => {
        addToCart(item.product);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-misty-rose/20">
            {/* Header Section */}
            <section className="pt-32 pb-16">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <h1 className="text-4xl md:text-5xl font-thin text-gray-900 font-josefin">
                                Your Wishlist
                            </h1>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <HeartIconSolid className="w-8 h-8 text-iris" />
                            </motion.div>
                        </div>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            All the candles you love, saved in one place for easy access.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filter and Search Bar */}
            <section className="py-8 bg-white shadow-sm sticky top-20 z-30">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 max-w-md w-full">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your wishlist..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iris focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex gap-4 items-center">
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iris focus:border-transparent transition-all"
                            >
                                <option value="default">Sort by</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Name: A to Z</option>
                                <option value="name-desc">Name: Z to A</option>
                            </select>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowFilters(!showFilters)}
                                className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-600" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Expandable Filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 overflow-hidden"
                            >
                                <div className="py-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iris focus:border-transparent"
                                        >
                                            <option value="all">All Categories</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price Range
                                        </label>
                                        <div className="flex gap-4 items-center">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                                className="w-full"
                                            />
                                            <span className="text-sm text-gray-600">
                                                Up to ${priceRange[1]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Wishlist Items Section */}
            <section className="py-16">
                <div className="container-custom">
                    {wishlistItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16"
                        >
                            <div className="max-w-md mx-auto">
                                <HeartIcon className="w-24 h-24 mx-auto text-gray-300 mb-6" />
                                <h3 className="text-2xl font-thin text-gray-900 mb-4 font-josefin">
                                    Your wishlist is empty
                                </h3>
                                <p className="text-gray-600 mb-8">
                                    Start saving your favorite candles!
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/products')}
                                    className="px-8 py-4 bg-iris text-white rounded-full text-lg font-medium hover:bg-iris/90 transition-colors"
                                >
                                    Browse Candles
                                </motion.button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {sortedItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    className="bg-white rounded-3xl shadow-lg overflow-hidden group"
                                >
                                    <div className="relative aspect-square overflow-hidden">
                                        <img
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleAddToCart(item)}
                                                className="px-6 py-3 bg-white text-iris rounded-full text-sm font-medium hover:bg-iris hover:text-white transition-colors"
                                            >
                                                Add to Cart
                                            </motion.button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl text-gray-900 font-medium">
                                                {item.product.name}
                                            </h3>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => removeFromWishlist(item.product.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4">
                                            {item.product.description}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-medium text-gray-900">
                                                ${formatPrice(item.product.price)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {item.product.category}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Recommendations Section */}
            {wishlistItems.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="container-custom">
                        <h2 className="text-3xl font-thin text-gray-900 mb-12 text-center font-josefin">
                            You Might Also Like
                        </h2>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((item) => (
                                    <div key={item} className="animate-pulse">
                                        <div className="aspect-square bg-gray-200 rounded-t-2xl"></div>
                                        <div className="p-4">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {recommendedProducts.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                                            onClick={() => navigate(`/products/${item.id}`)}
                                        >
                                            {/* Product Image */}
                                            <div className="aspect-square overflow-hidden rounded-t-2xl">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>

                                            {/* Wishlist Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent card click when clicking wishlist button
                                                    if (isInWishlist(item.id)) {
                                                        removeFromWishlist(item.id);
                                                    } else {
                                                        addToWishlist(item);
                                                    }
                                                }}
                                                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-20"
                                            >
                                                {isInWishlist(item.id) ? (
                                                    <HeartIconSolid className="w-5 h-5 text-red-500" />
                                                ) : (
                                                    <HeartIcon className="w-5 h-5 text-gray-600" />
                                                )}
                                            </button>

                                            {/* Product Info */}
                                            <div className="p-4 relative z-20">
                                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        ${Number(item.price).toFixed(2)}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent card click when clicking add to cart button
                                                            addToCart(item);
                                                        }}
                                                        className="btn-primary text-sm relative z-20"
                                                    >
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Quick View Overlay */}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl z-10">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent card click when clicking quick view button
                                                        setSelectedProduct({
                                                            ...item,
                                                            images: item.images.map(img => ({
                                                                id: img.id,
                                                                url: img.url,
                                                                is_primary: img.is_primary
                                                            }))
                                                        });
                                                        setIsQuickViewOpen(true);
                                                    }}
                                                    className="px-6 py-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    Quick View
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {hasMoreRecommended && (
                                    <div className="flex justify-center mt-8">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleLoadMore}
                                            className="px-8 py-3 bg-white border border-gray-200 text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                                            disabled={loadingMore}
                                        >
                                            {loadingMore ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                                    Loading...
                                                </>
                                            ) : (
                                                'Load More Products'
                                            )}
                                        </motion.button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>
            )}

            {/* Footer Actions */}
            {wishlistItems.length > 0 && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 py-4 z-40"
                >
                    <div className="container-custom">
                        <div className="flex justify-between items-center">
                            <p className="text-gray-600">
                                {wishlistItems.length} items in wishlist
                            </p>
                            <div className="flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={clearWishlist}
                                    className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Clear Wishlist
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => wishlistItems.forEach(handleAddToCart)}
                                    className="px-6 py-3 bg-iris text-white rounded-xl hover:bg-iris/90 transition-colors"
                                >
                                    Add All to Cart
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <QuickViewModal
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
};

export default Wishlist; 