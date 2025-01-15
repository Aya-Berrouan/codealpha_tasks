import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import QuickViewModal from '../../components/products/QuickViewModal';
import ReviewForm from '../../components/ReviewForm';
import ReviewList from '../../components/ReviewList';
import ReviewStats from '../../components/ReviewStats';
import LoadingScreen from '../../components/LoadingScreen';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [recommendedPage, setRecommendedPage] = useState(1);
    const [hasMoreRecommended, setHasMoreRecommended] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [recommendedLoading, setRecommendedLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const ITEMS_PER_PAGE = 4;

    useEffect(() => {
        fetchProductDetails();
        fetchRecommendedProducts(1);
    }, [productId]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${productId}`);
            if (response.data.success) {
                const productData = response.data.data;
                setProduct({
                    ...productData,
                    price: parseFloat(productData.price)
                });
                if (productData.images.length > 0) {
                    const primaryImage = productData.images.findIndex(img => img.is_primary);
                    setSelectedImage(primaryImage !== -1 ? primaryImage : 0);
                }
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            toast.error('Error loading product details');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendedProducts = async (page = 1) => {
        try {
            if (page === 1) {
                setRecommendedLoading(true);
            } else {
                setLoadingMore(true);
            }
            
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/recommended`, {
                params: {
                    page,
                    per_page: ITEMS_PER_PAGE,
                    exclude: [productId] // Exclude current product
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
                setRecommendedLoading(false);
            }
            setLoadingMore(false);
        }
    };

    const handleLoadMore = async () => {
        if (!loadingMore && hasMoreRecommended) {
            await fetchRecommendedProducts(recommendedPage + 1);
        }
    };

    const handleWishlistClick = () => {
        if (!product) return;
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
            toast.success('Removed from wishlist');
        } else {
            addToWishlist(product);
            toast.success('Added to wishlist');
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, quantity);
    };

    if (loading) {
        return <LoadingScreen text="Loading Product Details..." />;
    }

    if (recommendedLoading) {
        return <LoadingScreen text="Loading Recommendations..." />;
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
                <button
                    onClick={() => navigate('/products')}
                    className="btn-primary"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    // Set the initial selected image to the primary image or the first image
    const currentImage = product.images[selectedImage].image_url;

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-white via-misty-rose/20 to-iris/5 py-24">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
                        <button 
                            onClick={() => navigate('/')}
                            className="hover:text-iris transition-colors"
                        >
                            Home
                        </button>
                        <span>/</span>
                        <button 
                            onClick={() => navigate('/products')}
                            className="hover:text-iris transition-colors"
                        >
                            Products
                        </button>
                        <span>/</span>
                        <span className="text-gray-900">{product.name}</span>
                    </nav>

                    {/* Main Content */}
                    <div className="bg-white rounded-2xl shadow-xl max-w-6xl mx-auto overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Product Images Section */}
                            <div className="space-y-6 p-6">
                                {/* Main Image */}
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 max-w-[500px] mx-auto">
                                    <img
                                        src={currentImage}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                {/* Thumbnail Gallery */}
                                {product.images.length > 1 && (
                                    <div className="flex justify-center">
                                        <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-[400px]">
                                            {product.images
                                                .filter((_, index) => index !== selectedImage)
                                                .map((image, index) => (
                                                    <button
                                                        key={image.id}
                                                        onClick={() => setSelectedImage(product.images.findIndex(img => img.id === image.id))}
                                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:border-iris/50`}
                                                    >
                                                        <img
                                                            src={image.image_url}
                                                            alt={`${product.name} view ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="p-6 md:p-8">
                                <div className="mb-4">
                                    <h1 className="text-2xl font-medium text-gray-900 mb-2">
                                        {product.name}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        {product.category.name}
                                    </p>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <p className="text-gray-600">
                                        {product.description}
                                    </p>
                                    {product.fragrance_notes && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                                                Fragrance Notes
                                            </h4>
                                            <p className="text-gray-600">
                                                {product.fragrance_notes}
                                            </p>
                                        </div>
                                    )}
                                    {product.burn_time && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                                                Burn Time
                                            </h4>
                                            <p className="text-gray-600">
                                                {product.burn_time}
                                            </p>
                                        </div>
                                    )}
                                    {product.size && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                                                Size
                                            </h4>
                                            <p className="text-gray-600">
                                                {product.size}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Price and Actions */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-semibold text-gray-900">
                                            ${product.price.toFixed(2)}
                                        </span>
                                        <button
                                            onClick={handleWishlistClick}
                                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        >
                                            {isInWishlist(product.id) ? (
                                                <HeartIconSolid className="w-6 h-6 text-red-500" />
                                            ) : (
                                                <HeartIcon className="w-6 h-6 text-gray-600" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Quantity Selector */}
                                    <div className="flex items-center space-x-4">
                                        <label htmlFor="quantity" className="text-sm font-medium text-gray-900">
                                            Quantity
                                        </label>
                                        <select
                                            id="quantity"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="rounded-full border-gray-200 text-gray-900 focus:ring-iris focus:border-iris"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                                <option key={num} value={num}>
                                                    {num}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full btn-primary py-3 text-base"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="border-t border-gray-200">
                            <div className="p-6 md:p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Review Statistics */}
                                    <div className="lg:col-span-1">
                                        <ReviewStats productId={product.id} />
                                    </div>

                                    {/* Reviews List and Form */}
                                    <div className="lg:col-span-2">
                                        <div className="space-y-8">
                                            <ReviewList productId={product.id} />
                                            {isAuthenticated ? (
                                                <ReviewForm productId={product.id} onReviewSubmitted={() => {
                                                    fetchProductDetails();
                                                }} />
                                            ) : (
                                                <div className="bg-gray-50 rounded-xl p-6 text-center">
                                                    <p className="text-gray-600 mb-4">Want to share your thoughts about this product?</p>
                                                    <Link 
                                                        to="/login" 
                                                        className="text-iris hover:text-iris/80 font-medium"
                                                    >
                                                        Log in to write a review
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* You Might Also Like Section */}
                    <section className="py-16">
                        <div className="container mx-auto px-4">
                            <h2 className="text-3xl font-thin text-gray-900 mb-12 text-center font-josefin">
                                You Might Also Like
                            </h2>
                            {recommendedLoading ? (
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
                                                <div 
                                                    className="aspect-square overflow-hidden rounded-t-2xl"
                                                >
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
                                                            toast.success('Removed from wishlist');
                                                        } else {
                                                            addToWishlist(item);
                                                            toast.success('Added to wishlist');
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
                                                    <h3 className="text-lg font-medium text-gray-900 mb-1 hover:text-primary transition-colors">
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
                                                                addToCart(item, 1);
                                                                toast.success('Added to cart');
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
                                                            setSelectedProduct(item);
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

                    {/* Quick View Modal */}
                    <QuickViewModal
                        isOpen={isQuickViewOpen}
                        onClose={() => setIsQuickViewOpen(false)}
                        product={selectedProduct}
                    />
                </div>
            </div>
        </>
    );
};

export default ProductDetails; 