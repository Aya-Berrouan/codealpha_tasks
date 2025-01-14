import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
    HeartIcon,
    AdjustmentsHorizontalIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import QuickViewModal from '../components/products/QuickViewModal';
import LoadingScreen from '../components/LoadingScreen';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
];

const ProductCard = ({ product, onQuickView }) => {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    const handleWishlistClick = () => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, 1);
    };

    const handleProductClick = () => {
        navigate(`/products/${product.id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Product Image */}
            <div 
                className="aspect-square overflow-hidden rounded-t-2xl cursor-pointer"
                onClick={handleProductClick}
            >
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Wishlist Button */}
            <button
                onClick={handleWishlistClick}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-20"
            >
                {isInWishlist(product.id) ? (
                    <HeartIconSolid className="w-5 h-5 text-red-500" />
                ) : (
                    <HeartIcon className="w-5 h-5 text-gray-600" />
                )}
            </button>

            {/* Product Info */}
            <div className="p-4 relative z-20">
                <h3 
                    className="text-lg font-medium text-gray-900 mb-1 cursor-pointer hover:text-primary transition-colors"
                    onClick={handleProductClick}
                >
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">${product.price}</span>
                    <button 
                        onClick={handleAddToCart}
                        className="btn-primary text-sm relative z-20"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>

            {/* Quick View Overlay */}
            {isHovered && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl z-10 pointer-events-none">
                    <button 
                        onClick={() => onQuickView(product)}
                        className="px-6 py-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors pointer-events-auto"
                    >
                        Quick View
                    </button>
                </div>
            )}
        </motion.div>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        image_url: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        description: PropTypes.string,
        size: PropTypes.string,
        burn_time: PropTypes.string,
        fragrance_notes: PropTypes.string
    }).isRequired,
    onQuickView: PropTypes.func.isRequired
};

// Export ProductCard component
export { ProductCard };

const Products = () => {
    const { categoryId } = useParams();
    const [searchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [sortBy, setSortBy] = useState('featured');
    const [showFilters, setShowFilters] = useState(false);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [displayLimit, setDisplayLimit] = useState(20);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [categories, setCategories] = useState([
        { id: 'all', name: 'All' }
    ]);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [searchParams]);

    useEffect(() => {
        if (categoryId) {
            setSelectedCategory(categoryId);
        } else {
            setSelectedCategory('all');
        }
    }, [categoryId]);

    useEffect(() => {
        filterProducts();
    }, [selectedCategory, priceRange, sortBy, products]);

    useEffect(() => {
        setDisplayedProducts(filteredProducts.slice(0, displayLimit));
    }, [filteredProducts, displayLimit]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
            if (response.data.success) {
                const backendCategories = response.data.data.map(category => ({
                    id: category.id.toString(),
                    name: category.name
                }));
                setCategories([{ id: 'all', name: 'All' }, ...backendCategories]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error loading categories');
        }
    };

    // Shuffle function to randomize array order
    const shuffleArray = (array) => {
        let currentIndex = array.length, randomIndex;
        
        // While there remain elements to shuffle
        while (currentIndex !== 0) {
            // Pick a remaining element
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            
            // And swap it with the current element
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        
        return array;
    };

    const filterProducts = () => {
        let filtered = [...products];

        // Apply category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => 
                product.category_id === parseInt(selectedCategory)
            );
        }

        // Apply price filter
        filtered = filtered.filter(
            product => product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        // Apply sorting
        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'popular':
                filtered.sort((a, b) => {
                    // First sort by number of reviews
                    const reviewDiff = b.total_reviews - a.total_reviews;
                    if (reviewDiff !== 0) return reviewDiff;
                    // If same number of reviews, sort by average rating
                    return b.average_rating - a.average_rating;
                });
                break;
            case 'featured':
                filtered = shuffleArray(filtered);
                break;
        }

        setFilteredProducts(filtered);
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const searchQuery = searchParams.get('search');
            const url = new URL(`${import.meta.env.VITE_API_URL}/api/products`);
            
            if (searchQuery) {
                url.searchParams.append('search', searchQuery);
            }

            const response = await axios.get(url.toString());
            
            if (response.data.success) {
                // Fetch review statistics for each product
                const productsWithStats = await Promise.all(
                    response.data.data.map(async (product) => {
                        try {
                            const statsResponse = await axios.get(
                                `${import.meta.env.VITE_API_URL}/api/reviews/statistics?product_id=${product.id}`
                            );
                            const reviewStats = statsResponse.data.statistics || { total_reviews: 0 };
                            
                            return {
                                id: product.id,
                                name: product.name,
                                price: parseFloat(product.price),
                                category: product.category.name,
                                category_id: product.category.id,
                                image_url: product.images.length > 0 
                                    ? product.images.find(img => img.is_primary)?.image_url || product.images[0].image_url 
                                    : 'default-image-url.jpg',
                                images: product.images.map(img => ({
                                    id: img.id,
                                    url: img.image_url,
                                    is_primary: img.is_primary
                                })),
                                description: product.description,
                                size: '8 oz',
                                burn_time: product.burn_time || 'N/A',
                                fragrance_notes: product.fragrance_notes || 'N/A',
                                stock: product.stock_quantity,
                                created_at: product.created_at,
                                total_reviews: reviewStats.total_reviews,
                                average_rating: reviewStats.average_rating || 0
                            };
                        } catch (error) {
                            console.error('Error fetching review stats:', error);
                            return {
                                ...product,
                                total_reviews: 0,
                                average_rating: 0
                            };
                        }
                    })
                );

                setProducts(productsWithStats);
                setFilteredProducts(productsWithStats);
            } else {
                toast.error('Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Error loading products');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setIsQuickViewOpen(true);
    };

    const handleLoadMore = () => {
        setDisplayLimit(prevLimit => prevLimit + 20);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-misty-rose/20 to-iris/5">
            {loading && <LoadingScreen text="Loading Products..." />}
            
            {/* Header Section */}
            <div className="container-custom pt-24 pb-12 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-thin mb-4 text-gray-900 font-montserrat"
                >
                    Discover Our Collection
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-gray-600 max-w-2xl mx-auto font-nunito"
                >
                    Explore handcrafted candles designed to illuminate your space with elegance.
                </motion.p>
            </div>

            {/* Filters and Products Section */}
            <div className="container-custom pb-24">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm">
                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategory === category.id
                                        ? 'bg-iris text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {/* Sort and Filter Buttons */}
                    <div className="flex items-center gap-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-iris/50"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <AdjustmentsHorizontalIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">Filters</span>
                        </button>
                    </div>
                </div>

                {/* Price Range Filter (shown when filters are open) */}
                {showFilters && (
                    <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="max-w-xl">
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Price Range: ${priceRange[0]} - ${priceRange[1]}
                            </label>
                            <Slider
                                range
                                min={0}
                                max={100}
                                value={priceRange}
                                onChange={setPriceRange}
                                className="mb-4"
                                railStyle={{ backgroundColor: '#FFE4D9' }}
                                trackStyle={[{ backgroundColor: '#7449A9' }]}
                                handleStyle={[
                                    {
                                        backgroundColor: '#7449A9',
                                        border: 'none',
                                        boxShadow: '0 0 0 2px white',
                                        opacity: 1
                                    },
                                    {
                                        backgroundColor: '#7449A9',
                                        border: 'none',
                                        boxShadow: '0 0 0 2px white',
                                        opacity: 1
                                    }
                                ]}
                            />
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && (
                    <>
                        {filteredProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {displayedProducts.map(product => (
                                        <ProductCard 
                                            key={product.id} 
                                            product={product} 
                                            onQuickView={handleQuickView}
                                        />
                                    ))}
                                </div>
                                
                                {/* Load More Button */}
                                {displayedProducts.length < filteredProducts.length && (
                                    <div className="flex justify-center mt-8">
                                        <button
                                            onClick={handleLoadMore}
                                            className="px-6 py-3 bg-iris text-white rounded-full hover:bg-iris/90 transition-colors duration-200 flex items-center gap-2"
                                        >
                                            Load More Products
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-lg text-gray-600">No candles found. Try adjusting your filters or explore all products.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Quick View Modal */}
            <QuickViewModal
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
};

export default Products; 