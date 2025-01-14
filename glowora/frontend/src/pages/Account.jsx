import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    UserCircleIcon,
    PencilIcon,
    ShoppingBagIcon,
    HeartIcon,
    CogIcon,
    ArrowRightOnRectangleIcon,
    EyeIcon,
    EyeSlashIcon,
    BellIcon,
    MoonIcon,
    SunIcon,
    TrashIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ImageCropper from '../components/ImageCropper';

const Account = () => {
    const { user, logout, updateUser } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true
    });
    const [cropperImage, setCropperImage] = useState(null);

    // User data state
    const [userData, setUserData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        avatar: null,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Orders state
    const [orders, setOrders] = useState([]);

    // Load user data
    useEffect(() => {
        if (user) {
            setUserData({
                ...userData,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                zipCode: user.zip_code || '',
                avatar: user.avatar_url || null
            });
        }
    }, [user]);

    // Load orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setOrders(response.data.orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
                toast.error('Failed to load orders');
            }
        };

        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setCropperImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedBlob) => {
        try {
            const formData = new FormData();
            formData.append('avatar', croppedBlob, 'avatar.jpg');

            const response = await axios({
                method: 'post',
                url: `${import.meta.env.VITE_API_URL}/api/users/avatar`,
                data: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                }
            });

            if (response.data.avatar_url) {
                // Update local state
                setUserData(prev => ({
                    ...prev,
                    avatar: response.data.avatar_url
                }));

                // Update global auth context
                updateUser({
                    ...user,
                    avatar: response.data.avatar_url
                });

                // Fetch fresh user data
                const userResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/user`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (userResponse.data) {
                    setUserData(prev => ({
                        ...prev,
                        ...userResponse.data
                    }));
                    updateUser(userResponse.data);
                }

                toast.success('Profile picture updated successfully');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            const errorMessage = error.response?.data?.errors?.avatar?.[0] 
                || error.response?.data?.message 
                || 'Failed to update profile picture';
            toast.error(errorMessage);
        } finally {
            setCropperImage(null);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/users/profile`,
                {
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    phone: userData.phone,
                    address: userData.address,
                    city: userData.city,
                    state: userData.state,
                    zip_code: userData.zipCode
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.user) {
                updateUser(response.data.user);
                setUserData(prev => ({
                    ...prev,
                    ...response.data.user
                }));
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (userData.newPassword !== userData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (userData.newPassword.length < 8) {
            toast.error('New password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/users/password`,
                {
                    current_password: userData.currentPassword,
                    password: userData.newPassword,
                    password_confirmation: userData.confirmPassword
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setUserData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            toast.success('Password updated successfully');
        } catch (error) {
            console.error('Error changing password:', error);
            const errorMessage = error.response?.data?.message 
                || error.response?.data?.errors?.current_password?.[0]
                || error.response?.data?.errors?.password?.[0]
                || 'Failed to update password';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error('Failed to logout');
        }
    };

    // Calculate profile completion percentage
    const calculateProfileCompletion = () => {
        const requiredFields = {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email
        };

        const optionalFields = {
            phone: userData.phone,
            address: userData.address,
            city: userData.city,
            state: userData.state,
            zipCode: userData.zipCode,
            avatar: userData.avatar
        };

        // Required fields contribute 60% of the total
        const requiredFieldsCount = Object.keys(requiredFields).length;
        const completedRequiredFields = Object.values(requiredFields).filter(field => field && field.trim() !== '').length;
        const requiredFieldsPercentage = (completedRequiredFields / requiredFieldsCount) * 60;

        // Optional fields contribute 40% of the total
        const optionalFieldsCount = Object.keys(optionalFields).length;
        const completedOptionalFields = Object.values(optionalFields).filter(field => field && field.toString().trim() !== '').length;
        const optionalFieldsPercentage = (completedOptionalFields / optionalFieldsCount) * 40;

        return Math.round(requiredFieldsPercentage + optionalFieldsPercentage);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-misty-rose/20 to-royal-purple/5">
            {/* Header Section */}
            <section className="pt-32 pb-16">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-thin text-gray-900 mb-4 font-josefin">
                                Welcome Back, {userData.first_name}!
                            </h1>
                            <p className="text-lg text-gray-600">
                                Here's everything you need to manage your account.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-center lg:justify-end"
                        >
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                                    {userData.avatar ? (
                                        <img
                                            src={userData.avatar}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserCircleIcon className="w-full h-full text-gray-400" />
                                    )}
                                </div>
                                <label
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                                >
                                    <PencilIcon className="w-6 h-6" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Navigation Tabs */}
            <section className="pb-8">
                <div className="container-custom">
                    <div className="bg-white rounded-2xl shadow-sm p-4">
                        <div className="flex flex-wrap gap-4">
                            {[
                                { id: 'profile', name: 'Profile', icon: UserCircleIcon },
                                { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
                                { id: 'wishlist', name: 'Wishlist', icon: HeartIcon },
                                { id: 'settings', name: 'Settings', icon: CogIcon }
                            ].map((tab) => (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-iris text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.name}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="pb-24">
                <div className="container-custom">
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Profile Completion */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-xl font-medium text-gray-900 mb-4">
                                        Profile Completion
                                    </h2>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${calculateProfileCompletion()}%` }}
                                            className="bg-iris h-2 rounded-full"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Your profile is {calculateProfileCompletion()}% complete
                                    </p>
                                </div>

                                {/* Personal Information */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-xl font-medium text-gray-900 mb-6">
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={userData.first_name}
                                                onChange={handleInputChange}
                                                className="w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={userData.last_name}
                                                onChange={handleInputChange}
                                                className="w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={userData.email}
                                                onChange={handleInputChange}
                                                className="w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={userData.phone}
                                                onChange={handleInputChange}
                                                className="w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={userData.address}
                                                onChange={handleInputChange}
                                                className="w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={userData.city}
                                                onChange={handleInputChange}
                                                className="w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={userData.state}
                                                onChange={handleInputChange}
                                                className="w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ZIP Code
                                            </label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={userData.zipCode}
                                                onChange={handleInputChange}
                                                className="w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-8 flex justify-end">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSaveProfile}
                                            disabled={loading}
                                            className={`btn-primary flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'orders' && (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="bg-white rounded-2xl shadow-sm p-6"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        Order #{order.order_number}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Placed on {format(new Date(order.created_at), 'MMMM d, yyyy')}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize
                                                    ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                                    {order.status}
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                {order.order_items.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                                            {item.type === 'custom_candle' ? (
                                                                <img
                                                                    src={item.image_url}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                                                                    }}
                                                                />
                                                            ) : item.product?.images?.length > 0 ? (
                                                                <img
                                                                    src={`${import.meta.env.VITE_API_URL}/storage/${item.product.images[0].image}`}
                                                                    alt={item.product.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-grow">
                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                {item.type === 'custom_candle' ? item.name : item.product?.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                Quantity: {item.quantity}
                                                            </p>
                                                            {item.type === 'custom_candle' && item.custom_details && (
                                                                <div className="text-xs text-gray-500">
                                                                    <p>Scent: {item.custom_details.scent_name}</p>
                                                                    <p>Jar Style: {item.custom_details.jar_style}</p>
                                                                </div>
                                                            )}
                                                            <p className="text-sm font-medium text-gray-900">
                                                                ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-gray-200">
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <span>Total</span>
                                                    <span>${Number(order.total_amount).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                                        <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                                        <Link to="/products" className="btn-primary inline-block">
                                            Start Shopping
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'wishlist' && (
                            <motion.div
                                key="wishlist"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {wishlistItems.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {wishlistItems.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="bg-white rounded-2xl shadow-sm overflow-hidden group"
                                            >
                                                <div className="relative aspect-square overflow-hidden">
                                                    <img
                                                        src={item.product.image_url}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => addToCart(item.product)}
                                                            className="p-3 bg-white text-iris rounded-full hover:bg-iris hover:text-white transition-colors"
                                                        >
                                                            <ShoppingCartIcon className="w-5 h-5" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => removeFromWishlist(item.product.id)}
                                                            className="p-3 bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {item.product.description}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-lg font-semibold text-gray-900">
                                                            ${Number(item.product.price).toFixed(2)}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {item.product.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
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
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Password Change */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-xl font-medium text-gray-900 mb-6">
                                        Change Password
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="currentPassword"
                                                    value={userData.currentPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                >
                                                    {showPassword ? (
                                                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                                    ) : (
                                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={userData.newPassword}
                                                onChange={handleInputChange}
                                                className="w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={userData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris"
                                            />
                                        </div>
                                        <div className="pt-4">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleChangePassword}
                                                disabled={loading}
                                                className={`btn-primary flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    'Update Password'
                                                )}
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>

                                {/* Notification Preferences */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <h2 className="text-xl font-medium text-gray-900 mb-6">
                                        Notification Preferences
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <BellIcon className="w-6 h-6 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Email Notifications
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Receive updates about your orders
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setNotifications(prev => ({
                                                    ...prev,
                                                    email: !prev.email
                                                }))}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    notifications.email ? 'bg-iris' : 'bg-gray-200'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        notifications.email ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <BellIcon className="w-6 h-6 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        SMS Notifications
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Get text messages for important updates
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setNotifications(prev => ({
                                                    ...prev,
                                                    sms: !prev.sms
                                                }))}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    notifications.sms ? 'bg-iris' : 'bg-gray-200'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        notifications.sms ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <BellIcon className="w-6 h-6 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Push Notifications
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Receive browser notifications
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setNotifications(prev => ({
                                                    ...prev,
                                                    push: !prev.push
                                                }))}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    notifications.push ? 'bg-iris' : 'bg-gray-200'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        notifications.push ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Theme Toggle */}
                                <div className="bg-white rounded-2xl shadow-sm p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isDarkMode ? (
                                                <MoonIcon className="w-6 h-6 text-gray-400" />
                                            ) : (
                                                <SunIcon className="w-6 h-6 text-gray-400" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Dark Mode
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Toggle dark mode for the website
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={toggleDarkMode}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                isDarkMode ? 'bg-iris' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Logout Button */}
            <div className="fixed bottom-8 right-8">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-3 bg-iris text-white rounded-full shadow-lg hover:bg-iris/90 transition-colors"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                </motion.button>
            </div>

            {cropperImage && (
                <ImageCropper
                    image={cropperImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCropperImage(null)}
                />
            )}
        </div>
    );
};

export default Account; 