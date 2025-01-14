import { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = ({ onBack }) => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getValidationError = () => {
        if (!email.trim() && touched) {
            return 'This field is required';
        }
        if (email.trim() && touched && !validateEmail(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setTouched(true);

        // Validate email
        if (!email.trim()) {
            return;
        }

        if (!validateEmail(email)) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await forgotPassword(email.trim());
            if (result.success) {
                setIsSubmitted(true);
            } else {
                setError(result.error || 'Failed to send reset instructions');
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center p-8 sm:p-12"
            >
                <div className="mb-8">
                    <h2 className="text-3xl font-thin text-gray-900 mb-4 font-josefin">
                        Check Your Email
                    </h2>
                    <p className="text-lg text-gray-600 mb-2">
                        We've sent password reset instructions to:
                    </p>
                    <p className="text-lg font-medium text-iris">
                        {email}
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                        Please check your spam folder if you don't see the email in your inbox.
                    </p>
                </div>

                <motion.button
                    onClick={onBack}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 text-iris hover:text-iris/80 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Back to Login</span>
                </motion.button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 sm:p-12"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-thin text-gray-900 mb-4 font-josefin">
                    Forgot Password?
                </h2>
                <p className="text-lg text-gray-600">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>
            </div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg text-center"
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <div className="flex flex-col space-y-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                onBlur={() => setTouched(true)}
                                placeholder="Enter your email"
                                className={`pl-10 w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                    getValidationError() ? 'border-red-500' : ''
                                }`}
                                disabled={isLoading}
                            />
                        </div>
                        {getValidationError() && (
                            <p className="text-sm text-red-500 px-3">{getValidationError()}</p>
                        )}
                    </div>
                </div>

                <div>
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className={`w-full btn-primary relative ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            'Reset Password'
                        )}
                    </motion.button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <motion.button
                    onClick={onBack}
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className={`inline-flex items-center gap-2 text-iris hover:text-iris/80 transition-colors ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Back to Login</span>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ForgotPassword; 