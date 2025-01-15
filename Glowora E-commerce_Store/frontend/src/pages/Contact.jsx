import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { 
    PhoneIcon, 
    EnvelopeIcon, 
    MapPinIcon,
    ChatBubbleLeftRightIcon,
    QuestionMarkCircleIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { 
    FaInstagram, 
    FaFacebook, 
    FaPinterest, 
    FaTwitter 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';

const socialLinks = [
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FaPinterest, href: 'https://pinterest.com', label: 'Pinterest' },
    { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' }
];

const faqs = [
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day satisfaction guarantee. If you're not completely satisfied with your purchase, you can return it within 30 days for a full refund."
    },
    {
        question: "How can I track my order?",
        answer: "Once your order ships, you'll receive a tracking number via email. You can use this number to track your package on our website or through the carrier's website."
    },
    {
        question: "What are your shipping options?",
        answer: "We offer standard shipping (5-7 business days), express shipping (2-3 business days), and next-day delivery options. Shipping costs vary based on location and selected method."
    }
];

const testimonials = [
    {
        name: "Sarah M.",
        location: "New York",
        text: "The customer service team was incredibly helpful and responsive. They went above and beyond to help me with my order!"
    },
    {
        name: "James L.",
        location: "California",
        text: "Quick responses and very professional. Definitely recommend reaching out to them if you have any questions."
    },
    {
        name: "Emma R.",
        location: "Texas",
        text: "Had an issue with my order and they resolved it immediately. Great customer service!"
    }
];

const Contact = () => {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        subject: false,
        message: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 100]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Mark all fields as touched to show validation messages
        setTouched({
            name: true,
            email: true,
            subject: true,
            message: true
        });

        // Validate all fields
        const errors = {
            name: validateField('name', formData.name),
            email: validateField('email', formData.email),
            subject: validateField('subject', formData.subject),
            message: validateField('message', formData.message)
        };

        // Check if there are any errors
        if (Object.values(errors).some(error => error !== '')) {
            return; // Stop form submission if there are errors
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/contact`,
                formData
            );

            if (response.data.success) {
                setIsSubmitted(true);
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
                // Reset touched state
                setTouched({
                    name: false,
                    email: false,
                    subject: false,
                    message: false
                });
                setTimeout(() => setIsSubmitted(false), 5000);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    const validateField = (name, value) => {
        if (!value && touched[name]) {
            return 'This field is required';
        }
        if (name === 'email' && touched.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return 'Please enter a valid email address';
            }
        }
        return '';
    };

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            const targetPosition = section.offsetTop - 80; // Offset for header
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 1000; // Duration in milliseconds (1 second)
            let start = null;

            const animation = currentTime => {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const progress = Math.min(timeElapsed / duration, 1);

                // Easing function for smoother animation
                const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                
                window.scrollTo(0, startPosition + distance * ease(progress));

                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            };

            requestAnimationFrame(animation);
        }
    };

    // Animation variants for the dotted path
    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: { 
            pathLength: 1, 
            opacity: 1,
            transition: { 
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
            }
        }
    };

    return (
        <>
            {loading && <LoadingScreen text="Loading Contact Page..." />}
            <div ref={containerRef} className="relative scroll-smooth overflow-x-hidden">
            {/* Hero Section - Updated positioning */}
            <section className="pt-36 min-h-[70vh] bg-gradient-to-br from-white to-misty-rose/20">
                <div className="container-custom h-full py-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Side - Illustration */}
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            {/* Main Icon */}
                            <div className="relative w-40 h-40 mx-auto">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="absolute inset-0 bg-iris/10 rounded-full"
                                />
                                <ChatBubbleLeftRightIcon className="w-full h-full text-iris p-8" />
                                
                                {/* Floating dots */}
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-3 h-3 bg-iris/30 rounded-full"
                                        style={{
                                            left: `${20 + i * 15}%`,
                                            top: `${30 + i * 10}%`,
                                        }}
                                        animate={{
                                            y: [-10, 10, -10],
                                            opacity: [0.3, 0.6, 0.3],
                                            scale: [1, 1.2, 1]
                                        }}
                                        transition={{
                                            duration: 3 + i,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}

                                {/* Connecting path */}
                                <svg
                                    className="absolute inset-0 w-full h-full"
                                    viewBox="0 0 200 200"
                                >
                                    <motion.path
                                        d="M 100,0 C 150,50 150,150 100,200"
                                        stroke="rgb(129, 140, 248)"
                                        strokeWidth="2"
                                        strokeDasharray="8 8"
                                        fill="none"
                                        variants={pathVariants}
                                        initial="hidden"
                                        animate="visible"
                                    />
                                </svg>
                            </div>
                        </motion.div>

                        {/* Right Side - Content */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center md:text-left space-y-8"
                        >
                            {/* Headline with gradient underline */}
                            <div className="relative inline-block">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin text-gray-900 font-josefin">
                                    Let&apos;s Start the Conversation
                                </h1>
                                <motion.div 
                                    className="h-1 bg-gradient-to-r from-iris to-royal-purple mt-2"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                />
                            </div>

                            {/* Subtext */}
                            <p className="text-lg md:text-xl text-gray-600 font-nunito leading-relaxed max-w-2xl">
                                Whether you have questions, feedback, or ideas to share, 
                                we&apos;re here to listen. Let&apos;s connect and create 
                                something amazing together.
                            </p>

                            {/* CTA Buttons */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start mt-8"
                            >
                                <motion.button
                                    onClick={() => scrollToSection('contact-form')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-gradient-to-r from-iris to-royal-purple text-white rounded-full text-lg font-medium transition-all duration-300"
                                >
                                    Contact Us
                                </motion.button>
                                <motion.button
                                    onClick={() => scrollToSection('faq')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 border-2 border-iris text-iris rounded-full text-lg font-medium hover:bg-iris/5 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <QuestionMarkCircleIcon className="w-5 h-5" />
                                    <span>FAQ</span>
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>
            {/* Contact Form Section */}
            <section id="contact-form" className="py-24 bg-gradient-to-br from-white to-misty-rose/20">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
                        >
                            <h2 className="text-3xl font-thin text-gray-900 mb-8 text-center font-josefin">
                                Write to Us
                            </h2>
                                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-3 rounded-xl border ${validateField('name', formData.name) ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-iris focus:border-transparent transition-all duration-300`}
                                        placeholder="Enter your name"
                                    />
                                        {validateField('name', formData.name) && (
                                            <p className="mt-1 text-sm text-red-500">{validateField('name', formData.name)}</p>
                                        )}
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-3 rounded-xl border ${validateField('email', formData.email) ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-iris focus:border-transparent transition-all duration-300`}
                                        placeholder="Enter your email address"
                                    />
                                        {validateField('email', formData.email) && (
                                            <p className="mt-1 text-sm text-red-500">{validateField('email', formData.email)}</p>
                                        )}
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-3 rounded-xl border ${validateField('subject', formData.subject) ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-iris focus:border-transparent transition-all duration-300`}
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="inquiry">Product Inquiry</option>
                                        <option value="support">Order Support</option>
                                        <option value="other">Other</option>
                                    </select>
                                        {validateField('subject', formData.subject) && (
                                            <p className="mt-1 text-sm text-red-500">{validateField('subject', formData.subject)}</p>
                                        )}
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                            onBlur={handleBlur}
                                        rows={6}
                                            className={`w-full px-4 py-3 rounded-xl border ${validateField('message', formData.message) ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-iris focus:border-transparent transition-all duration-300 resize-none`}
                                        placeholder="Type your message here..."
                                    />
                                        {validateField('message', formData.message) && (
                                            <p className="mt-1 text-sm text-red-500">{validateField('message', formData.message)}</p>
                                        )}
                                </div>
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                    className={`w-full py-4 bg-iris text-white rounded-xl text-lg font-medium transition-all duration-300 ${
                                        isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-iris/90'
                                    }`}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </motion.button>
                            </form>
                            {isSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-6 p-4 bg-green-50 text-green-700 rounded-xl text-center"
                                >
                                    Thank you for reaching out! We'll get back to you soon.
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>
            {/* Location Section */}
            <section id="location" className="py-24 bg-white">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <h2 className="text-3xl font-thin text-gray-900 font-josefin">
                                Reach Us Directly
                            </h2>
                            <div className="space-y-6">
                                <a 
                                    href="tel:+18001234567"
                                    className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                                >
                                    <PhoneIcon className="w-6 h-6 text-iris" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="text-lg text-gray-900 group-hover:text-iris transition-colors">
                                            +1 (800) 123-4567
                                        </p>
                                    </div>
                                </a>
                                <a 
                                    href="mailto:support@yourbrand.com"
                                    className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                                >
                                    <EnvelopeIcon className="w-6 h-6 text-iris" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-lg text-gray-900 group-hover:text-iris transition-colors">
                                        gloworacandle@gmail.com
                                        </p>
                                    </div>
                                </a>
                                <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
                                    <MapPinIcon className="w-6 h-6 text-iris" />
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="text-lg text-gray-900">
                                            123 Candle Street, Glowtown, USA
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="h-[400px] rounded-3xl overflow-hidden shadow-lg"
                        >
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d-73.9!3d40.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM40zMDA!5e0!3m2!1sen!2sus!4v1234567890"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Store Location"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
            {/* FAQ Section */}
            <section id="faq" className="py-24 bg-gradient-to-br from-white to-misty-rose/20">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-3xl font-thin text-gray-900 mb-12 text-center font-josefin">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-white rounded-2xl shadow-sm overflow-hidden"
                                >
                                    <button
                                        onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                                    >
                                        <span className="text-lg text-gray-900">{faq.question}</span>
                                        <ChevronDownIcon 
                                            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                                                activeAccordion === index ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                    <motion.div
                                        initial={false}
                                        animate={{ 
                                            height: activeAccordion === index ? 'auto' : 0,
                                            opacity: activeAccordion === index ? 1 : 0
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="px-6 pb-4 text-gray-600">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>
            {/* Social Media Section */}
            <section className="py-24 bg-white">
                <div className="container-custom text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl font-thin text-gray-900 mb-6 font-josefin">
                            Stay Connected
                        </h2>
                        <p className="text-lg text-gray-600 mb-12">
                            Follow us for updates, inspiration, and exclusive offers!
                        </p>
                        <div className="flex justify-center gap-8">
                            {socialLinks.map((social, index) => {
                                const Icon = social.icon;
                                return (
                                    <motion.a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="w-12 h-12 rounded-full bg-iris text-white flex items-center justify-center hover:bg-iris/90 transition-colors"
                                    >
                                        <Icon className="w-6 h-6" />
                                    </motion.a>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </section>
            {/* Testimonials Section */}
            <section className="py-24 bg-gradient-to-br from-white to-misty-rose/20">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-3xl font-thin text-gray-900 mb-12 text-center font-josefin">
                            What Our Customers Say
                        </h2>
                        <div className="relative">
                            <div className="overflow-hidden">
                                <motion.div
                                    animate={{ x: `-${currentTestimonial * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="flex"
                                >
                                    {testimonials.map((testimonial, index) => (
                                        <div
                                            key={index}
                                            className="w-full flex-shrink-0 px-4"
                                        >
                                            <div className="bg-white rounded-3xl p-8 shadow-lg">
                                                <p className="text-gray-600 mb-6 text-lg italic">
                                                    "{testimonial.text}"
                                                </p>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {testimonial.name}
                                                    </p>
                                                    <p className="text-gray-500">
                                                        {testimonial.location}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                            <div className="flex justify-center gap-2 mt-8">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentTestimonial(index)}
                                        className={`w-3 h-3 rounded-full transition-colors ${
                                            currentTestimonial === index ? 'bg-iris' : 'bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-iris to-royal-purple text-white">
                <div className="container-custom text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-4xl font-thin mb-6 font-josefin">
                            We&apos;re Here to Help!
                        </h2>
                        <p className="text-xl mb-12 text-white/90">
                            Have more questions? Don&apos;t hesitate to reach out.
                        </p>
                        <motion.button
                                onClick={() => scrollToSection('contact-form')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-white text-iris rounded-full text-lg font-medium hover:bg-white/90 transition-colors"
                        >
                            Contact Us Now
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Progress Bar */}
            <motion.div
                className="fixed bottom-0 left-0 right-0 h-1 bg-iris origin-left z-50"
                style={{ scaleX: scrollYProgress, position: 'fixed' }}
            />
        </div>
        </>
    );
};

export default Contact; 