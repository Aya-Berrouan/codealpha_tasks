import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBagIcon,
    TrashIcon,
    MinusIcon,
    PlusIcon,
    ArrowRightIcon,
    HeartIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import QuickViewModal from '../components/products/QuickViewModal';
import axios from 'axios';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, addToCart } = useCart();
    const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
    const [selectedItems, setSelectedItems] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [recommendedPage, setRecommendedPage] = useState(1);
    const [hasMoreRecommended, setHasMoreRecommended] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const ITEMS_PER_PAGE = 4;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendedProducts(1);
    }, []);

    const fetchRecommendedProducts = async () => {
        try {
            setLoading(true);
            // Get the categories from the cart items
            const categories = cartItems
                .filter(item => item.type === 'product' && item.product && item.product.category)
                .map(item => item.product.category);

            console.log('Cart Items:', cartItems);
            console.log('Categories:', categories);

            if (categories.length === 0) {
                console.log('No categories found');
                setRecommendedProducts([]);
                setLoading(false);
                return;
            }

            const apiUrl = `${import.meta.env.VITE_API_URL}/api/products/recommended`;
            console.log('Fetching from:', apiUrl);
            console.log('With params:', { 
                categories: categories.join(','),
                exclude: cartItems.map(item => item.product?.id).filter(Boolean).join(',')
            });

            const response = await axios.get(apiUrl, {
                params: { 
                    categories: categories.join(','),
                    exclude: cartItems.map(item => item.product?.id).filter(Boolean).join(',')
                }
            });

            console.log('API Response:', response.data);

            if (response.data.success) {
                setRecommendedProducts(response.data.data);
                console.log('Set recommended products:', response.data.data);
            }
        } catch (error) {
            console.error('Error fetching recommended products:', error);
            setRecommendedProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        if (!loadingMore && hasMoreRecommended) {
            await fetchRecommendedProducts(recommendedPage + 1);
        }
    };

    const handleQuantityChange = (cartId, newQuantity) => {
        if (newQuantity >= 1) {
            updateQuantity(cartId, newQuantity);
        }
    };

    const handleMoveToWishlist = async (item) => {
        if (isInWishlist(item.product.id)) {
            await removeFromWishlist(item.product.id);
        } else {
            await addToWishlist(item.product);
        }
    };

    const handleCheckout = async () => {
        setIsProcessing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsProcessing(false);
        // Navigate to checkout or show success message
        navigate('/checkout');
    };

    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setIsQuickViewOpen(true);
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

    // Add console log to check recommendedProducts state
    useEffect(() => {
        console.log('Current recommendedProducts:', recommendedProducts);
    }, [recommendedProducts]);

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
                                Your Cart
                            </h1>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <ShoppingBagIcon className="w-8 h-8 text-iris" />
                            </motion.div>
                        </div>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Review your items, make adjustments, and proceed to checkout when ready.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="pb-24">
                <div className="container-custom">
                    {cartItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16"
                        >
                            <div className="max-w-md mx-auto">
                                <ShoppingBagIcon className="w-24 h-24 mx-auto text-gray-300 mb-6" />
                                <h3 className="text-2xl font-thin text-gray-900 mb-4 font-josefin">
                                    Your cart is empty
                                </h3>
                                <p className="text-gray-600 mb-8">
                                    Start adding your favorite candles!
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2">
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-6"
                                >
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            variants={itemVariants}
                                            className="bg-white rounded-2xl shadow-sm p-6 flex gap-6"
                                        >
                                            {/* Product/Custom Candle Image */}
                                            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.type === 'custom_candle' ? item.custom_candle.image_url : item.product.image_url}
                                                    alt={item.type === 'custom_candle' ? item.custom_candle.name : item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Product/Custom Candle Details */}
                                            <div className="flex-grow flex flex-col">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {item.type === 'custom_candle' ? item.custom_candle.name : item.product.name}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {item.type === 'custom_candle' ? item.custom_candle.description : item.product.description}
                                                        </p>
                                                        {item.type === 'custom_candle' && (
                                                            <div className="mt-1 text-sm text-gray-500">
                                                                <p>Scent: {item.custom_candle.scent_name}</p>
                                                                <p>Jar Style: {item.custom_candle.jar_style}</p>
                                                                {item.custom_candle.custom_label && (
                                                                    <p>Custom Label: {item.custom_candle.custom_label}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-medium text-gray-900">
                                                            ${item.type === 'custom_candle' ? 
                                                                (Number(item.custom_candle.price) * item.quantity).toFixed(2) : 
                                                                (Number(item.product.price) * item.quantity).toFixed(2)}
                                                        </p>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            ${item.type === 'custom_candle' ? 
                                                                Number(item.custom_candle.price).toFixed(2) : 
                                                                Number(item.product.price).toFixed(2)} each
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="mt-4 flex justify-between items-center">
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                        >
                                                            <MinusIcon className="h-5 w-5" />
                                                        </button>
                                                        <span className="text-gray-700">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            <PlusIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl shadow-sm p-6 sticky top-24"
                                >
                                    <h2 className="text-xl font-medium text-gray-900 mb-6">
                                        Order Summary
                                    </h2>
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>${getCartTotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping</span>
                                            <span>Calculated at checkout</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tax</span>
                                            <span>Calculated at checkout</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex justify-between text-lg font-medium text-gray-900">
                                                <span>Total</span>
                                                <span>${getCartTotal().toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCheckout}
                                        disabled={isProcessing}
                                        className="w-full py-4 bg-iris text-white rounded-full font-medium hover:bg-iris/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {isProcessing ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Proceed to Checkout
                                                <ArrowRightIcon className="w-5 h-5" />
                                            </>
                                        )}
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Recommendations Section */}
            {cartItems.length > 0 && (
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
            )}

            {/* Quick View Modal */}
            <QuickViewModal
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
};

export default Cart; 