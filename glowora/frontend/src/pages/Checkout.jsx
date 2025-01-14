import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
    LockClosedIcon,
    CreditCardIcon,
    TruckIcon,
    CheckIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const steps = [
    { id: 'delivery', name: 'Delivery', icon: TruckIcon },
    { id: 'payment', name: 'Payment', icon: CreditCardIcon },
    { id: 'review', name: 'Review', icon: CheckIcon },
];

// Payment Form Component
const PaymentForm = ({ onSubmit, processing, setCurrentStep }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [cardComplete, setCardComplete] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }

        if (!cardComplete) {
            setError('Please complete all card details.');
            return;
        }

        setError(null);
        onSubmit(stripe, elements).catch((err) => {
            setError(err.message);
        });
    };

    // Handle real-time validation errors from the card Element
    const handleChange = (event) => {
        setCardComplete(event.complete);
        if (event.error) {
            setError(event.error.message);
        } else {
            setError(null);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Details
                </label>
                <div className={`p-4 border rounded-lg ${error ? 'border-red-500' : 'border-gray-200'}`}>
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    fontFamily: 'Inter, sans-serif',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                            hidePostalCode: true,
                        }}
                        onChange={handleChange}
                    />
                </div>
                {error && (
                    <div className="mt-2 text-sm text-red-600">
                        {error}
                    </div>
                )}
            </div>
            <div className="mt-8 flex justify-between">
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep('delivery')}
                    className="btn-secondary"
                >
                    Back
                </motion.button>
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!stripe || processing || !cardComplete}
                    className="btn-primary flex items-center gap-2"
                >
                    {processing ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            Review Order
                            <ChevronRightIcon className="w-5 h-5" />
                        </>
                    )}
                </motion.button>
            </div>
        </form>
    );
};

export default function Checkout() {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { token } = useAuth();
    const [currentStep, setCurrentStep] = useState('delivery');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        couponCode: '',
    });
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponDetails, setCouponDetails] = useState(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderNumber, setOrderNumber] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleCouponApply = async () => {
        if (!formData.couponCode) return;

        setValidatingCoupon(true);
        setCouponError('');
        setCouponApplied(false);
        setCouponDetails(null);

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/coupons`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data.success && response.data.data) {
                // Find the coupon with matching code
                const coupon = response.data.data.find(
                    c => c.coupon_code.toLowerCase() === formData.couponCode.toLowerCase()
                );

                if (!coupon) {
                    setCouponError('Invalid coupon code');
                    return;
                }
                
                // Check if coupon is expired
                if (new Date(coupon.valid_until) < new Date()) {
                    setCouponError('This coupon has expired');
                    return;
                }

                // Check if minimum purchase requirement is met
                if (coupon.min_purchase && getCartTotal() < coupon.min_purchase) {
                    setCouponError(`Minimum purchase of $${coupon.min_purchase} required`);
                    return;
                }

                setCouponApplied(true);
                setCouponDetails(coupon);
            } else {
                setCouponError('Invalid coupon code');
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
            setCouponError(error.response?.data?.message || 'Invalid coupon code');
        } finally {
            setValidatingCoupon(false);
        }
    };

    const calculateDiscount = () => {
        if (!couponApplied || !couponDetails) return 0;

        const subtotal = getCartTotal();
        if (couponDetails.discount_type === 'percentage') {
            return (subtotal * (couponDetails.discount_percentage / 100));
        } else {
            return couponDetails.discount_value;
        }
    };

    const validateDeliveryInfo = () => {
        const errors = {};
        
        // Validate required fields
        if (!formData.firstName?.trim()) {
            errors.firstName = 'First name is required';
        }
        
        if (!formData.lastName?.trim()) {
            errors.lastName = 'Last name is required';
        }
        
        if (!formData.email?.trim()) {
            errors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.phone?.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            errors.phone = 'Please enter a valid 10-digit phone number';
        }
        
        if (!formData.address?.trim()) {
            errors.address = 'Street address is required';
        }
        
        if (!formData.city?.trim()) {
            errors.city = 'City is required';
        }
        
        if (!formData.state?.trim()) {
            errors.state = 'State is required';
        }
        
        if (!formData.zipCode?.trim()) {
            errors.zipCode = 'ZIP code is required';
        } else if (!/^\d{5}$/.test(formData.zipCode)) {
            errors.zipCode = 'Please enter a valid 5-digit ZIP code';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePaymentInfo = () => {
        const errors = {};
        
        // Validate card number (16 digits)
        if (!formData.cardNumber?.trim()) {
            errors.cardNumber = 'Card number is required';
        } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
            errors.cardNumber = 'Please enter a valid 16-digit card number';
        }
        
        // Validate expiry date (MM/YY format)
        if (!formData.cardExpiry?.trim()) {
            errors.cardExpiry = 'Expiry date is required';
        } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.cardExpiry)) {
            errors.cardExpiry = 'Please enter a valid expiry date (MM/YY)';
        } else {
            // Check if card is not expired
            const [month, year] = formData.cardExpiry.split('/');
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            const today = new Date();
            if (expiry < today) {
                errors.cardExpiry = 'Card has expired';
            }
        }
        
        // Validate CVC (3 or 4 digits)
        if (!formData.cardCvc?.trim()) {
            errors.cardCvc = 'CVC is required';
        } else if (!/^\d{3,4}$/.test(formData.cardCvc)) {
            errors.cardCvc = 'Please enter a valid CVC (3-4 digits)';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNextStep = () => {
        if (currentStep === 'delivery') {
            const isValid = validateDeliveryInfo();
            if (isValid) {
                setCurrentStep('payment');
            }
        } else if (currentStep === 'payment') {
            const isValid = validatePaymentInfo();
            if (isValid) {
                setCurrentStep('review');
            }
        }
    };

    const handlePreviousStep = () => {
        if (currentStep === 'payment') setCurrentStep('delivery');
        else if (currentStep === 'review') setCurrentStep('payment');
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.type === 'custom_candle' 
                ? parseFloat(item.custom_candle.price) 
                : parseFloat(item.product.price);
            return total + (price * item.quantity);
        }, 0);
    };

    const handlePlaceOrder = async (stripe, elements) => {
        try {
            if (!validateDeliveryInfo()) {
                setError('Please check your delivery information and try again.');
                return;
            }

            setError(null);
            setIsProcessing(true);

            // Format shipping address
            const shippingAddress = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                postal_code: formData.zipCode,
                country: 'United States'
            };

            // Create order first
            const orderItems = cartItems.map(item => {
                if (item.type === 'custom_candle') {
                    const customCandle = item.custom_candle || {};
                    const imageUrl = customCandle.custom_details?.generated_image || customCandle.image_url;
                    const relativePath = imageUrl ? imageUrl.replace(/^http:\/\/localhost:8000\/storage\//, '') : null;

                    return {
                        type: 'custom_candle',
                        quantity: item.quantity,
                        price: parseFloat(customCandle.price || 0),
                        image_url: relativePath,
                        custom_details: {
                            scent_name: customCandle.scent_name || '',
                            jar_style: customCandle.jar_style || '',
                            custom_label: customCandle.custom_label || null,
                            generated_image: relativePath,
                            scent: customCandle.custom_details?.scent || null,
                            jar: customCandle.custom_details?.jar || null
                        }
                    };
                }

                return {
                    type: 'product',
                    product_id: item.product.id,
                    quantity: item.quantity,
                    price: parseFloat(item.product.price)
                };
            });

            const orderData = {
                items: orderItems,
                total_amount: (
                    getCartTotal() + 
                    (getCartTotal() * 0.1) - 
                    calculateDiscount()
                ),
                shipping_address: JSON.stringify(shippingAddress),
                billing_address: JSON.stringify(shippingAddress),
                payment_method: 'credit_card',
                coupon_code: couponApplied ? formData.couponCode : null,
                discount_amount: calculateDiscount()
            };

            // Create order
            const orderResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!orderResponse.data.success) {
                throw new Error('Failed to create order');
            }

            const orderId = orderResponse.data.order.id;

            // Create payment intent
            const paymentResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/payment/create-intent`, 
                { order_id: orderId },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!paymentResponse.data.success) {
                throw new Error('Failed to create payment intent');
            }

            // Get the card element
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error('Card element not found');
            }

            // Confirm the payment
            const { error: stripeError } = await stripe.confirmCardPayment(
                paymentResponse.data.clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: `${formData.firstName} ${formData.lastName}`,
                            email: formData.email,
                            phone: formData.phone,
                            address: {
                                line1: formData.address,
                                city: formData.city,
                                state: formData.state,
                                postal_code: formData.zipCode,
                                country: 'US',
                            },
                        },
                    },
                }
            );

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            // Clear the cart
            await clearCart();
            
            // Navigate to order confirmation
            navigate('/order-confirmation', {
                state: { orderId: orderId }
            });
        } catch (err) {
            console.error('Error processing payment:', err);
            setError(err.message || 'Error processing payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Animation variants
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
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
                                Almost There! Let's Make It Yours
                            </h1>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <LockClosedIcon className="w-8 h-8 text-iris" />
                            </motion.div>
                        </div>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Complete your order securely and enjoy your candles soon.
                        </p>
                    </motion.div>

                    {/* Progress Steps */}
                    <div className="mt-12">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-between">
                                {steps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={`flex items-center ${
                                            currentStep === step.id
                                                ? 'text-iris'
                                                : index < steps.findIndex(s => s.id === currentStep)
                                                ? 'text-iris'
                                                : 'text-gray-400'
                                        }`}
                                    >
                                        <div
                                            className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white ${
                                                currentStep === step.id
                                                    ? 'border-iris'
                                                    : index < steps.findIndex(s => s.id === currentStep)
                                                    ? 'border-iris'
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            <step.icon className="h-6 w-6" />
                                        </div>
                                        <p className="ml-4 font-medium">{step.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="pb-24">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-2">
                            <AnimatePresence mode="wait">
                                {currentStep === 'delivery' && (
                                    <motion.div
                                        key="delivery"
                                        variants={pageVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="bg-white rounded-2xl shadow-sm p-6"
                                    >
                                        <h2 className="text-2xl font-medium text-gray-900 mb-6">
                                            Delivery Information
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className={`w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                        formErrors.firstName ? 'border-red-300' : ''
                                                    }`}
                                                />
                                                {formErrors.firstName && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className={`w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                        formErrors.lastName ? 'border-red-300' : ''
                                                    }`}
                                                />
                                                {formErrors.lastName && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                        formErrors.email ? 'border-red-300' : ''
                                                    }`}
                                                />
                                                {formErrors.email && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className={`w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                        formErrors.phone ? 'border-red-300' : ''
                                                    }`}
                                                    required
                                                />
                                                {formErrors.phone && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Street Address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className={`w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                        formErrors.address ? 'border-red-300' : ''
                                                    }`}
                                                />
                                                {formErrors.address && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className={`w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                        formErrors.city ? 'border-red-300' : ''
                                                    }`}
                                                />
                                                {formErrors.city && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    State / Province
                                                </label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    className={`w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                        formErrors.state ? 'border-red-300' : ''
                                                    }`}
                                                />
                                                {formErrors.state && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.state}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ZIP / Postal Code
                                                </label>
                                                <input
                                                    type="text"
                                                    name="zipCode"
                                                    value={formData.zipCode}
                                                    onChange={handleInputChange}
                                                    className={`w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                        formErrors.zipCode ? 'border-red-300' : ''
                                                    }`}
                                                />
                                                {formErrors.zipCode && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.zipCode}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-end">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleNextStep}
                                                className="btn-primary flex items-center gap-2"
                                            >
                                                Continue to Payment
                                                <ChevronRightIcon className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}

                                {currentStep === 'payment' && (
                                    <motion.div
                                        key="payment"
                                        variants={pageVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="bg-white rounded-2xl shadow-sm p-6"
                                    >
                                        <h2 className="text-2xl font-medium text-gray-900 mb-6">
                                            Payment Information
                                        </h2>
                                        <Elements stripe={stripePromise} options={{
                                            locale: 'en',
                                            fonts: [{
                                                cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
                                            }],
                                        }}>
                                            <PaymentForm
                                                onSubmit={handlePlaceOrder}
                                                processing={isProcessing}
                                                setCurrentStep={setCurrentStep}
                                            />
                                        </Elements>
                                    </motion.div>
                                )}

                                {currentStep === 'review' && (
                                    <motion.div
                                        key="review"
                                        variants={pageVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="bg-white rounded-2xl shadow-sm p-6"
                                    >
                                        <h2 className="text-2xl font-medium text-gray-900 mb-6">
                                            Review Your Order
                                        </h2>
                                        <div className="space-y-6">
                                            {/* Delivery Information Summary */}
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                                    Delivery Information
                                                </h3>
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <p className="text-gray-600">
                                                        {formData.firstName} {formData.lastName}
                                                    </p>
                                                    <p className="text-gray-600">{formData.email}</p>
                                                    <p className="text-gray-600">{formData.phone}</p>
                                                    <p className="text-gray-600">{formData.address}</p>
                                                    <p className="text-gray-600">
                                                        {formData.city}, {formData.state} {formData.zipCode}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Payment Information Summary */}
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                                    Payment Information
                                                </h3>
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <p className="text-gray-600">
                                                        Card ending in {formData.cardNumber.slice(-4)}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Expires {formData.cardExpiry}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-between">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handlePreviousStep}
                                                className="btn-secondary"
                                            >
                                                Back
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handlePlaceOrder}
                                                disabled={isProcessing}
                                                className="btn-primary flex items-center gap-2"
                                            >
                                                {isProcessing ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        Place Order
                                                        <LockClosedIcon className="w-5 h-5" />
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-medium text-gray-900">
                                        Order Summary
                                    </h2>
                                    <button
                                        className="lg:hidden text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowOrderSummary(!showOrderSummary)}
                                    >
                                        {showOrderSummary ? (
                                            <ChevronDownIcon className="w-5 h-5" />
                                        ) : (
                                            <ChevronRightIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                <div className={`space-y-4 ${showOrderSummary ? 'block' : 'hidden lg:block'}`}>
                                    {/* Cart Items */}
                                    <div className="space-y-3">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={item.type === 'custom_candle' ? item.custom_candle.image_url : item.product.image_url}
                                                        alt={item.type === 'custom_candle' ? item.custom_candle.name : item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        {item.type === 'custom_candle' ? item.custom_candle.name : item.product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Qty: {item.quantity} × ${item.type === 'custom_candle' ? 
                                                            Number(item.custom_candle.price).toFixed(2) : 
                                                            Number(item.product.price).toFixed(2)}
                                                    </p>
                                                    {item.type === 'custom_candle' && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            <p>Scent: {item.custom_candle.scent_name}</p>
                                                            <p>Jar: {item.custom_candle.jar_style}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    ${item.type === 'custom_candle' ? 
                                                        (Number(item.custom_candle.price) * item.quantity).toFixed(2) : 
                                                        (Number(item.product.price) * item.quantity).toFixed(2)}
                                                    </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Coupon Code */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                name="couponCode"
                                                value={formData.couponCode}
                                                onChange={handleInputChange}
                                                placeholder="Enter coupon code"
                                                className={`flex-grow rounded-full border-gray-200 focus:ring-iris focus:border-iris text-sm ${
                                                    couponError ? 'border-red-300' : ''
                                                }`}
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleCouponApply}
                                                disabled={!formData.couponCode || validatingCoupon}
                                                className="btn-secondary text-sm"
                                            >
                                                {validatingCoupon ? (
                                                    <div className="w-4 h-4 border-2 border-iris border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    'Apply'
                                                )}
                                            </motion.button>
                                        </div>
                                        {couponError && (
                                            <p className="text-red-500 text-sm mt-2">
                                                {couponError}
                                            </p>
                                        )}
                                        {couponApplied && couponDetails && (
                                            <p className="text-green-600 text-sm mt-2">
                                                Coupon applied: {couponDetails.discount_type === 'percentage' 
                                                    ? `${couponDetails.discount_percentage}% off`
                                                    : `$${couponDetails.discount_value} off`}
                                            </p>
                                        )}
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="pt-4 border-t border-gray-200 space-y-2">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Subtotal</span>
                                            <span>${getCartTotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Shipping</span>
                                            <span>Free</span>
                                        </div>
                                        {couponApplied && couponDetails && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount {couponDetails.discount_type === 'percentage' 
                                                    ? `(${couponDetails.discount_percentage}%)`
                                                    : '(Fixed amount)'}</span>
                                                <span>-${calculateDiscount().toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Tax (10%)</span>
                                            <span>${(getCartTotal() * 0.1).toFixed(2)}</span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-200">
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <span>Total</span>
                                                <span>
                                                    ${(
                                                        getCartTotal() + 
                                                        (getCartTotal() * 0.1) - 
                                                        calculateDiscount()
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Including tax and shipping
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-white py-16">
                <div className="container-custom">
                    <h2 className="text-3xl font-thin text-gray-900 mb-8 text-center font-josefin">
                        Frequently Asked Questions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <QuestionMarkCircleIcon className="w-6 h-6 text-iris flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        When will my order arrive?
                                    </h3>
                                    <p className="text-gray-600">
                                        Orders typically arrive within 3-5 business days. You'll receive
                                        tracking information once your order ships.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <QuestionMarkCircleIcon className="w-6 h-6 text-iris flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Can I modify my order?
                                    </h3>
                                    <p className="text-gray-600">
                                        You can modify your order within 1 hour of placing it. Contact
                                        our support team for assistance.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <QuestionMarkCircleIcon className="w-6 h-6 text-iris flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        What's your return policy?
                                    </h3>
                                    <p className="text-gray-600">
                                        We accept returns within 30 days of delivery. Items must be
                                        unused and in original packaging.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
} 