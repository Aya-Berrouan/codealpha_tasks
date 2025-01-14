import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TruckIcon,
    ClockIcon,
    GlobeAltIcon,
    MapPinIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ArrowLongDownIcon,
    QuestionMarkCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// Shipping Options
const shippingOptions = [
    {
        id: 'standard',
        title: 'Standard Shipping',
        duration: '3-5 business days',
        price: 'Free on orders over $50',
        basePrice: '$4.99',
        recommended: true,
        icon: TruckIcon
    },
    {
        id: 'express',
        title: 'Express Shipping',
        duration: '1-2 business days',
        price: '$9.99',
        basePrice: '$9.99',
        recommended: false,
        icon: ClockIcon
    },
    {
        id: 'international',
        title: 'International Shipping',
        duration: '7-14 business days',
        price: 'Calculated at checkout',
        basePrice: 'Varies',
        recommended: false,
        icon: GlobeAltIcon
    }
];

// Tracking Steps
const trackingSteps = [
    {
        id: 1,
        title: 'Order Confirmed',
        description: 'Your order has been received and confirmed',
        icon: CheckCircleIcon
    },
    {
        id: 2,
        title: 'Shipped',
        description: 'Your package has left our warehouse',
        icon: TruckIcon
    },
    {
        id: 3,
        title: 'In Transit',
        description: 'Your package is on its way',
        icon: MapPinIcon
    },
    {
        id: 4,
        title: 'Delivered',
        description: 'Your package has been delivered',
        icon: CheckCircleIcon
    }
];

// FAQ Items
const faqItems = [
    {
        id: 1,
        question: "How do I qualify for free shipping?",
        answer: "Free shipping is available on all orders over $50 within the continental United States. Simply add items to your cart totaling $50 or more before tax, and free shipping will be automatically applied at checkout."
    },
    {
        id: 2,
        question: "What if my package is delayed?",
        answer: "While we strive to deliver all packages on time, occasional delays may occur. If your package is delayed, you can track its status using your tracking number. For delays exceeding 2 business days, please contact our support team."
    },
    {
        id: 3,
        question: "Can I change my shipping address after placing an order?",
        answer: "Address changes can be made within 2 hours of placing your order. Please contact our customer service team immediately with your order number and the new shipping address."
    },
    {
        id: 4,
        question: "Do you ship internationally?",
        answer: "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. You can see specific shipping rates for your country at checkout."
    }
];

const Shipping = () => {
    const [expandedFaq, setExpandedFaq] = useState(null);

    const scrollToContent = (e) => {
        e.preventDefault();
        const element = document.getElementById('shipping-content');
        const headerOffset = 100;
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-misty-rose/20 to-royal-purple/5">
            {/* Hero Section */}
            <section className="pt-32 pb-16 relative overflow-hidden">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-center lg:text-left"
                        >
                            <h1 className="text-4xl md:text-5xl font-thin text-gray-900 mb-4 font-josefin">
                                Your Shipping, Our Priority
                            </h1>
                            <p className="text-lg text-gray-600">
                                Learn everything you need to know about how we deliver your favorite candles.
                            </p>
                            <motion.a
                                href="#shipping-content"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={scrollToContent}
                                className="mt-8 flex items-center gap-2 text-iris hover:text-iris/80 transition-colors mx-auto lg:mx-0 cursor-pointer"
                            >
                                <span>Learn More</span>
                                <ArrowLongDownIcon className="w-5 h-5" />
                            </motion.a>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-center"
                        >
                            <div className="w-48 h-48 bg-iris/10 rounded-full flex items-center justify-center relative">
                                <motion.div
                                    animate={{
                                        x: [0, 10, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                >
                                    <TruckIcon className="w-24 h-24 text-iris" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Shipping Overview Section */}
            <section className="pb-16" id="shipping-content">
                <div className="container-custom">
                    <h2 className="text-3xl font-thin text-gray-900 mb-8 text-center font-josefin">
                        Quick Facts About Shipping
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: 'Free Shipping',
                                description: 'On orders above $50',
                                icon: TruckIcon
                            },
                            {
                                title: 'Fast Delivery',
                                description: '2-5 business days',
                                icon: ClockIcon
                            },
                            {
                                title: 'Tracking Available',
                                description: 'Real-time order tracking',
                                icon: MapPinIcon
                            },
                            {
                                title: 'International Shipping',
                                description: 'Worldwide delivery',
                                icon: GlobeAltIcon
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-sm p-6"
                            >
                                <div className="w-12 h-12 bg-iris/10 rounded-full flex items-center justify-center mb-4">
                                    <item.icon className="w-6 h-6 text-iris" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Shipping Options Section */}
            <section className="pb-16">
                <div className="container-custom">
                    <h2 className="text-3xl font-thin text-gray-900 mb-8 text-center font-josefin">
                        Shipping Options
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {shippingOptions.map((option) => (
                            <motion.div
                                key={option.id}
                                className={`bg-white rounded-2xl shadow-sm p-6 ${
                                    option.recommended ? 'ring-2 ring-iris' : ''
                                }`}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-iris/10 rounded-full flex items-center justify-center">
                                        <option.icon className="w-6 h-6 text-iris" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {option.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {option.duration}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-medium text-iris">
                                        {option.price}
                                    </p>
                                    {option.recommended && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-iris/10 text-iris">
                                            Recommended
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tracking Section */}
            <section className="pb-16 pt-4 mb-8 bg-white">
                <div className="container-custom">
                    <h2 className="text-3xl font-thin text-gray-900 mb-8 text-center font-josefin">
                        Track Your Order
                    </h2>
                    <div className="relative">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-iris/20 via-iris to-iris/20" />
                        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
                            {trackingSteps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white p-4 text-center"
                                >
                                    <div className="w-12 h-12 bg-iris/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <step.icon className="w-6 h-6 text-iris" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="pb-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-thin text-gray-900 mb-8 text-center font-josefin">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {faqItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    className="bg-white rounded-2xl shadow-sm overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedFaq(
                                            expandedFaq === item.id ? null : item.id
                                        )}
                                        className="w-full px-6 py-4 flex items-center justify-between text-left"
                                    >
                                        <span className="text-lg font-medium text-gray-900">
                                            {item.question}
                                        </span>
                                        <motion.div
                                            animate={{ rotate: expandedFaq === item.id ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {expandedFaq === item.id && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-4 text-gray-600">
                                                    {item.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Shipping; 