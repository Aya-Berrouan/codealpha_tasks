import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DocumentTextIcon,
    ScaleIcon,
    LockClosedIcon,
    UserGroupIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon,
    ArrowLongDownIcon,
    BookOpenIcon,
    BuildingOfficeIcon,
    HandRaisedIcon,
} from '@heroicons/react/24/outline';

// Terms Categories
const termsCategories = [
    {
        id: 'definitions',
        title: 'Definitions',
        icon: BookOpenIcon,
        summary: 'Key terms used throughout this agreement.',
        content: `The following terms when used in this agreement have these specific meanings:

• "Service" refers to our website, products, and services
• "User" means any person accessing or using our Service
• "Content" includes text, images, videos, and other materials
• "Account" means a registered user profile on our Service`
    },
    {
        id: 'use-of-services',
        title: 'Use of Services',
        icon: GlobeAltIcon,
        summary: 'Guidelines for using our platform and services.',
        content: `By using our Service, you agree to:

• Use the Service in accordance with all applicable laws
• Maintain the security of your account credentials
• Not engage in any unauthorized access or use
• Not interfere with other users' access to the Service
• Not use the Service for any illegal or harmful purposes`
    },
    {
        id: 'intellectual-property',
        title: 'Intellectual Property',
        icon: ShieldCheckIcon,
        summary: 'Rights and ownership of content and materials.',
        content: `Our intellectual property rights include:

• All trademarks, logos, and brand features
• Website design and interface elements
• Product descriptions and images
• Original content and materials
• Software and technology infrastructure

You may not use our intellectual property without express permission.`
    },
    {
        id: 'user-responsibilities',
        title: 'User Responsibilities',
        icon: UserGroupIcon,
        summary: 'Your obligations when using our services.',
        content: `As a user, you are responsible for:

• Providing accurate account information
• Maintaining the confidentiality of your account
• All activities that occur under your account
• Complying with our terms and policies
• Reporting any unauthorized use of your account`
    },
    {
        id: 'liability',
        title: 'Limitations of Liability',
        icon: ExclamationTriangleIcon,
        summary: 'Scope and limits of our liability.',
        content: `Our liability is limited in the following ways:

• We provide the service "as is" without warranties
• We are not liable for indirect or consequential damages
• Our total liability is limited to the amount paid for services
• We are not responsible for third-party content or services
• Force majeure events are excluded from liability`
    },
    {
        id: 'governing-law',
        title: 'Governing Law',
        icon: ScaleIcon,
        summary: 'Legal framework governing this agreement.',
        content: `This agreement is governed by:

• The laws of the jurisdiction where we operate
• Applicable federal and state regulations
• International laws where relevant
• Dispute resolution will be handled through arbitration
• The venue for any legal proceedings will be in our jurisdiction`
    }
];

// FAQ Items
const faqItems = [
    {
        id: 1,
        question: "Can I terminate my account anytime?",
        answer: "Yes, you can terminate your account at any time through your account settings. However, you will remain responsible for any obligations incurred before termination."
    },
    {
        id: 2,
        question: "What happens if I violate the terms?",
        answer: "Violations may result in temporary or permanent suspension of your account, removal of content, or legal action depending on the severity of the violation."
    },
    {
        id: 3,
        question: "How can I report an issue?",
        answer: "You can report issues through our contact form, by emailing our support team, or by using the reporting features within our platform."
    }
];

const Terms = () => {
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const scrollToContent = (e) => {
        e.preventDefault();
        const element = document.getElementById('terms-content');
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
                                Terms & Conditions
                            </h1>
                            <p className="text-lg text-gray-600">
                                Understand the guidelines for using our services and ensuring a seamless experience.
                            </p>
                            <motion.a
                                href="#terms-content"
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
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                >
                                    <ScaleIcon className="w-24 h-24 text-iris" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Terms Summary Section */}
            <section className="pb-16" id="terms-content">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: 'Use of Services',
                                description: 'Guidelines for accessing and using our platform.',
                                icon: GlobeAltIcon
                            },
                            {
                                title: 'Privacy Commitment',
                                description: 'How we protect and handle your data.',
                                icon: LockClosedIcon
                            },
                            {
                                title: 'User Obligations',
                                description: 'Your responsibilities when using our services.',
                                icon: UserGroupIcon
                            },
                            {
                                title: 'Dispute Resolution',
                                description: 'How we handle and resolve conflicts.',
                                icon: ScaleIcon
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

            {/* Detailed Terms Section */}
            <section className="pb-16">
                <div className="container-custom">
                    <div className="space-y-6">
                        {termsCategories.map((category) => (
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

export default Terms;