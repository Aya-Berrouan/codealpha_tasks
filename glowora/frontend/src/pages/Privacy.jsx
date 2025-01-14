import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheckIcon,
    LockClosedIcon,
    DocumentTextIcon,
    ServerIcon,
    UserCircleIcon,
    KeyIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ArrowLongDownIcon,
} from '@heroicons/react/24/outline';

// Privacy Policy Categories
const policyCategories = [
    {
        id: 'collection',
        title: 'Data We Collect',
        icon: DocumentTextIcon,
        summary: 'Information we gather to provide and improve our services.',
        content: `We collect various types of information to provide and improve our services:

• Personal Information: Name, email address, shipping address, and phone number when you create an account or make a purchase.
• Payment Information: Credit card details (stored securely through our payment processor).
• Usage Data: How you interact with our website, including browsing history and search queries.
• Device Information: Browser type, IP address, and device specifications.`
    },
    {
        id: 'usage',
        title: 'How We Use Your Data',
        icon: ServerIcon,
        summary: 'Ways we utilize collected information to serve you better.',
        content: `Your data helps us provide and improve our services:

• Process and fulfill your orders
• Send order confirmations and shipping updates
• Provide customer support
• Send promotional offers (with your consent)
• Improve our website and products
• Prevent fraud and enhance security`
    },
    {
        id: 'protection',
        title: 'How We Protect Your Data',
        icon: ShieldCheckIcon,
        summary: 'Security measures we implement to keep your information safe.',
        content: `We implement various security measures to protect your data:

• SSL encryption for all data transmission
• Secure payment processing
• Regular security audits
• Limited employee access to personal data
• Secure data storage with regular backups
• Compliance with data protection regulations`
    },
    {
        id: 'rights',
        title: 'Your Rights and Choices',
        icon: UserCircleIcon,
        summary: 'Control over your personal information.',
        content: `You have several rights regarding your personal data:

• Access your personal information
• Request corrections to your data
• Delete your account and associated data
• Opt-out of marketing communications
• Export your data
• Update your preferences at any time`
    }
];

const Privacy = () => {
    const [expandedCategory, setExpandedCategory] = useState(null);

    const scrollToContent = () => {
        document.getElementById('privacy-content').scrollIntoView({
            behavior: 'smooth'
        });
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
                                Your Privacy Is Our Priority
                            </h1>
                            <p className="text-lg text-gray-600">
                                We are committed to protecting your personal information and ensuring transparency in everything we do.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={scrollToContent}
                                className="mt-8 flex items-center gap-2 text-iris hover:text-iris/80 transition-colors mx-auto lg:mx-0"
                            >
                                <span>Learn More</span>
                                <ArrowLongDownIcon className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-center"
                        >
                            <div className="w-48 h-48 bg-iris/10 rounded-full flex items-center justify-center relative">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                    className="absolute inset-0 bg-iris/5 rounded-full"
                                />
                                <ShieldCheckIcon className="w-24 h-24 text-iris" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Privacy Summary Section */}
            <section className="pb-16" id="privacy-content">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: 'Secure Collection',
                                description: 'We only collect essential information needed to provide our services.',
                                icon: DocumentTextIcon
                            },
                            {
                                title: 'Protected Storage',
                                description: 'Your data is encrypted and stored on secure servers.',
                                icon: ServerIcon
                            },
                            {
                                title: 'Limited Access',
                                description: 'Only authorized personnel can access your information.',
                                icon: LockClosedIcon
                            },
                            {
                                title: 'Your Control',
                                description: 'Access, edit, or delete your data at any time.',
                                icon: KeyIcon
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

            {/* Detailed Policy Section */}
            <section className="pb-16">
                <div className="container-custom">
                    <div className="space-y-6">
                        {policyCategories.map((category) => (
                            <motion.div
                                key={category.id}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedCategory(
                                        expandedCategory === category.id ? null : category.id
                                    )}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-iris/10 rounded-full flex items-center justify-center">
                                            <category.icon className="w-5 h-5 text-iris" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {category.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {category.summary}
                                            </p>
                                        </div>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: expandedCategory === category.id ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {expandedCategory === category.id && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-4 text-gray-600 whitespace-pre-line">
                                                {category.content}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Privacy;