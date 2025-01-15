import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QuestionMarkCircleIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// FAQ Categories and Questions
const faqCategories = [
    {
        id: 'orders',
        title: 'Orders & Shipping',
        icon: QuestionMarkCircleIcon,
        questions: [
            {
                id: 1,
                question: 'How long does shipping take?',
                answer: 'Standard shipping typically takes 3-5 business days within the continental US. International shipping may take 7-14 business days.'
            },
            {
                id: 2,
                question: 'Do you offer international shipping?',
                answer: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location.'
            },
            {
                id: 3,
                question: 'Can I track my order?',
                answer: "Yes, once your order ships, you'll receive a tracking number via email to monitor your package's journey."
            }
        ]
    },
    {
        id: 'products',
        title: 'Products & Materials',
        icon: QuestionMarkCircleIcon,
        questions: [
            {
                id: 4,
                question: 'What materials are your candles made from?',
                answer: 'Our candles are made from 100% natural soy wax, premium fragrance oils, and cotton wicks. All materials are sustainably sourced.'
            },
            {
                id: 5,
                question: 'How long do your candles burn?',
                answer: 'Our standard size candles have a burn time of approximately 40-50 hours when burned properly.'
            },
            {
                id: 6,
                question: 'Are your products vegan and cruelty-free?',
                answer: 'Yes, all our products are 100% vegan and cruelty-free. We never test on animals.'
            }
        ]
    },
    {
        id: 'returns',
        title: 'Returns & Refunds',
        icon: QuestionMarkCircleIcon,
        questions: [
            {
                id: 7,
                question: 'What is your return policy?',
                answer: 'We accept returns within 30 days of purchase. Items must be unused and in original packaging.'
            },
            {
                id: 8,
                question: 'How do I initiate a return?',
                answer: 'Log into your account and visit the Orders section, or contact our customer service team to start the return process.'
            },
            {
                id: 9,
                question: 'How long do refunds take to process?',
                answer: 'Refunds typically process within 3-5 business days after we receive your return.'
            }
        ]
    },
    {
        id: 'general',
        title: 'General Inquiries',
        icon: QuestionMarkCircleIcon,
        questions: [
            {
                id: 10,
                question: 'Do you offer wholesale pricing?',
                answer: 'Yes, we offer wholesale pricing for bulk orders. Please contact our sales team for more information.'
            },
            {
                id: 11,
                question: 'Can I customize my candles?',
                answer: 'Yes, we offer customization options for special events and corporate gifts. Minimum order quantities apply.'
            },
            {
                id: 12,
                question: 'How can I contact customer service?',
                answer: 'You can reach our customer service team via email, phone, or the contact form on our website.'
            }
        ]
    }
];

const FAQs = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState('orders');
    const [expandedQuestions, setExpandedQuestions] = useState([]);
    const [filteredFAQs, setFilteredFAQs] = useState(faqCategories);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        message: false
    });

    // Handle search
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredFAQs(faqCategories);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = faqCategories.map(category => ({
            ...category,
            questions: category.questions.filter(
                q => q.question.toLowerCase().includes(query) || 
                     q.answer.toLowerCase().includes(query)
            )
        })).filter(category => category.questions.length > 0);

        setFilteredFAQs(filtered);
    }, [searchQuery]);

    const toggleQuestion = (questionId) => {
        setExpandedQuestions(prev => 
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const validateField = (name, value, isSubmitting = false) => {
        // When submitting, we check regardless of touch state
        if (!value && (touched[name] || isSubmitting)) {
            return 'This field is required';
        }
        if (name === 'email' && (touched.email || isSubmitting) && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return 'Please enter a valid email address';
            }
        }
        return '';
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all fields with isSubmitting=true to force validation
        const errors = {
            name: validateField('name', contactForm.name, true),
            email: validateField('email', contactForm.email, true),
            message: validateField('message', contactForm.message, true)
        };

        // Check if any field is empty
        if (!contactForm.name || !contactForm.email || !contactForm.message) {
            // Mark all fields as touched to show validation messages
            setTouched({
                name: true,
                email: true,
                message: true
            });
            return; // Stop form submission if any field is empty
        }

        // Check if there are any validation errors
        if (Object.values(errors).some(error => error !== '')) {
            return; // Stop form submission if there are errors
        }

        setShowErrorMessage(false);
        setShowSuccessMessage(false);
        setIsSubmitting(true);
        
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/send-faq-email`,
                {
                    name: contactForm.name,
                    email: contactForm.email,
                    message: contactForm.message
                }
            );

            if (response.status === 200) {
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 3000);
                // Reset form and touched state
                setContactForm({ name: '', email: '', message: '' });
                setTouched({ name: false, email: false, message: false });
                toast.success('Message sent successfully!');
            } else {
                throw new Error(response.data.message || 'Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            setErrorMessage(error.response?.data?.message || 'Error sending message. Please try again.');
            setShowErrorMessage(true);
            toast.error(error.response?.data?.message || 'Error sending message. Please try again.');
            setTimeout(() => setShowErrorMessage(false), 3000);
        } finally {
            setIsSubmitting(false);
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
                                Frequently Asked Questions
                            </h1>
                            <p className="text-lg text-gray-600">
                                Find instant answers to the questions we get asked most often.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-center"
                        >
                            <div className="w-48 h-48 bg-iris/10 rounded-full flex items-center justify-center">
                                <QuestionMarkCircleIcon className="w-24 h-24 text-iris" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section className="pb-16">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for answers..."
                                className="w-full pl-6 pr-12 py-4 rounded-full border-gray-200 focus:ring-iris focus:border-iris text-lg"
                            />
                            <MagnifyingGlassIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs Section */}
            <section className="pb-16">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        {faqCategories.map((category) => (
                            <motion.button
                                key={category.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setExpandedCategory(category.id)}
                                className={`p-6 rounded-2xl text-center transition-colors ${
                                    expandedCategory === category.id
                                        ? 'bg-iris text-white'
                                        : 'bg-white text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <category.icon className={`w-8 h-8 mx-auto mb-4 ${
                                    expandedCategory === category.id ? 'text-white' : 'text-iris'
                                }`} />
                                <h3 className="text-lg font-medium">{category.title}</h3>
                            </motion.button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {filteredFAQs.map((category) => (
                            category.id === expandedCategory && (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-4"
                                >
                                    {category.questions.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-2xl shadow-sm overflow-hidden"
                                        >
                                            <button
                                                onClick={() => toggleQuestion(item.id)}
                                                className="w-full px-6 py-4 flex items-center justify-between text-left"
                                            >
                                                <span className="text-lg font-medium text-gray-900">
                                                    {item.question}
                                                </span>
                                                <motion.div
                                                    animate={{ rotate: expandedQuestions.includes(item.id) ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                                </motion.div>
                                            </button>
                                            <AnimatePresence>
                                                {expandedQuestions.includes(item.id) && (
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
                                        </div>
                                    ))}
                                </motion.div>
                            )
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Contact Section */}
            <section className="pb-24">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-thin text-gray-900 mb-4 font-josefin">
                                Didn't Find What You're Looking For?
                            </h2>
                            <p className="text-lg text-gray-600">
                                Reach out to us directly, and we'll be happy to assist you.
                            </p>
                        </div>

                        <form onSubmit={handleContactSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }))}
                                    onBlur={handleBlur}
                                    placeholder="Enter your full name"
                                    className={`w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                        validateField('name', contactForm.name, isSubmitting) ? 'border-red-500' : ''
                                    }`}
                                />
                                {validateField('name', contactForm.name, isSubmitting) && (
                                    <p className="mt-1 text-sm text-red-500">{validateField('name', contactForm.name, isSubmitting)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm(prev => ({
                                        ...prev,
                                        email: e.target.value
                                    }))}
                                    onBlur={handleBlur}
                                    placeholder="Enter your email address"
                                    className={`w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                        validateField('email', contactForm.email, isSubmitting) ? 'border-red-500' : ''
                                    }`}
                                />
                                {validateField('email', contactForm.email, isSubmitting) && (
                                    <p className="mt-1 text-sm text-red-500">{validateField('email', contactForm.email, isSubmitting)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Question
                                </label>
                                <textarea
                                    name="message"
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm(prev => ({
                                        ...prev,
                                        message: e.target.value
                                    }))}
                                    onBlur={handleBlur}
                                    rows={4}
                                    placeholder="Type your question here..."
                                    className={`w-full rounded-3xl border-gray-200 focus:ring-iris focus:border-iris ${
                                        validateField('message', contactForm.message, isSubmitting) ? 'border-red-500' : ''
                                    }`}
                                />
                                {validateField('message', contactForm.message, isSubmitting) && (
                                    <p className="mt-1 text-sm text-red-500">{validateField('message', contactForm.message, isSubmitting)}</p>
                                )}
                            </div>
                            <div className="flex justify-center">
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                    className={`btn-primary flex items-center gap-2 ${
                                        isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-iris/90'
                                    }`}
                                >
                                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </form>

                        <AnimatePresence>
                            {showSuccessMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="mt-6 p-4 bg-green-50 rounded-2xl flex items-center gap-3 text-green-800"
                                >
                                    <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
                                    <p>Thank you! We'll get back to you soon.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {showErrorMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="mt-6 p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-800"
                                >
                                    <ExclamationCircleIcon className="w-6 h-6 flex-shrink-0" />
                                    <p>{errorMessage}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQs; 