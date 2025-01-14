import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    EnvelopeIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    UserIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import InteractiveBackground from '../components/auth/InteractiveBackground';
import ForgotPassword from '../components/auth/ForgotPassword';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

const Auth = () => {
    const navigate = useNavigate();
    const { login, register, isAuthenticated, user } = useAuth();
    const [view, setView] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [touched, setTouched] = useState({
        login: { email: false, password: false },
        register: { first_name: false, last_name: false, email: false, password: false, password_confirmation: false }
    });
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });
    const [registerForm, setRegisterForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    useEffect(() => {
        // Redirect based on authentication and role
        if (isAuthenticated) {
            if (user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const validateField = (form, name, value) => {
        if (!value && touched[form][name]) {
            return 'This field is required';
        }
        if (name === 'email' && touched[form][name] && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return 'Please enter a valid email address';
            }
        }
        if (form === 'register' && name === 'password_confirmation' && touched.register.password_confirmation) {
            if (value !== registerForm.password) {
                return 'Passwords do not match';
            }
        }
        return '';
    };

    const handleBlur = (form, field) => {
        setTouched(prev => ({
            ...prev,
            [form]: {
                ...prev[form],
                [field]: true
            }
        }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Mark all login fields as touched
        setTouched(prev => ({
            ...prev,
            login: {
                email: true,
                password: true
            }
        }));

        // Check for empty fields
        if (!loginForm.email || !loginForm.password) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await login(loginForm.email, loginForm.password);
            console.log('Login result:', result);
            
            if (result.success) {
                // Reset form
                resetForms();
                // Navigate based on user role
                if (result.isAdmin) {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                setError(result.error || 'Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Mark all register fields as touched
        setTouched(prev => ({
            ...prev,
            register: {
                first_name: true,
                last_name: true,
                email: true,
                password: true,
                password_confirmation: true
            }
        }));

        // Check for empty fields
        if (!registerForm.first_name || !registerForm.last_name || !registerForm.email || 
            !registerForm.password || !registerForm.password_confirmation) {
            return;
        }

        if (registerForm.password !== registerForm.password_confirmation) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const result = await register(registerForm);
            console.log('Registration result:', result);
            
            if (result.success) {
                // Save the email for login form
                const registeredEmail = registerForm.email;
                // Reset forms
                resetForms();
                // Pre-fill login form with the registered email
                setLoginForm(prev => ({
                    ...prev,
                    email: registeredEmail
                }));
                // Show success message
                toast.success('Registration successful! Please login to continue.');
                // Switch to login view
                setView('login');
            } else {
                setError(result.errors?.general || Object.values(result.errors || {})[0] || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForms = () => {
        setLoginForm({ email: '', password: '' });
        setRegisterForm({ first_name: '', last_name: '', email: '', password: '', password_confirmation: '' });
        setShowPassword(false);
        setShowConfirmPassword(false);
        setError('');
        setTouched({
            login: { email: false, password: false },
            register: { first_name: false, last_name: false, email: false, password: false, password_confirmation: false }
        });
    };

    const switchView = (newView) => {
        // If switching from register to login, keep the email
        if (view === 'register' && newView === 'login') {
            const currentEmail = registerForm.email;
            resetForms();
            setLoginForm(prev => ({
                ...prev,
                email: currentEmail
            }));
        } else {
            resetForms();
        }
        setView(newView);
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
            <div className="fixed inset-0">
                <InteractiveBackground />
            </div>
            
            <div className="relative flex-grow flex flex-col z-[1]">
                <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-24">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-4xl w-full"
                    >
                        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
                            {error && (
                                <div className="bg-red-50 text-red-500 p-4 text-center">
                                    {error}
                                </div>
                            )}
                            <div className="relative">
                                <AnimatePresence mode="wait">
                                    {view === 'login' && (
                                        <motion.div
                                            key="login"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-8 sm:p-12"
                                        >
                                            <div className="text-center mb-8">
                                                <h2 className="text-3xl font-thin text-gray-900 mb-4 font-josefin">
                                                    Welcome Back
                                                </h2>
                                                <p className="text-lg text-gray-600">
                                                    Login to access your account and enjoy our candles.
                                                </p>
                                            </div>

                                            <form onSubmit={handleLoginSubmit} className="space-y-6">
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
                                                            value={loginForm.email}
                                                            onChange={(e) => setLoginForm(prev => ({
                                                                ...prev,
                                                                email: e.target.value
                                                            }))}
                                                            onBlur={() => handleBlur('login', 'email')}
                                                            placeholder="Enter your email"
                                                            className={`pl-10 w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                                validateField('login', 'email', loginForm.email) ? 'border-red-500' : ''
                                                            }`}
                                                        />
                                                        </div>
                                                        {validateField('login', 'email', loginForm.email) && (
                                                            <p className="text-sm text-red-500 px-3">{validateField('login', 'email', loginForm.email)}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Password
                                                    </label>
                                                    <div className="flex flex-col space-y-1">
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={loginForm.password}
                                                            onChange={(e) => setLoginForm(prev => ({
                                                                ...prev,
                                                                password: e.target.value
                                                            }))}
                                                            onBlur={() => handleBlur('login', 'password')}
                                                            placeholder="Enter your password"
                                                            className={`pl-10 w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                                validateField('login', 'password', loginForm.password) ? 'border-red-500' : ''
                                                            }`}
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
                                                        {validateField('login', 'password', loginForm.password) && (
                                                            <p className="text-sm text-red-500 px-3">{validateField('login', 'password', loginForm.password)}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm">
                                                        <button
                                                            type="button"
                                                            onClick={() => switchView('forgot-password')}
                                                            className="text-iris hover:text-iris/80"
                                                        >
                                                            Forgot your password?
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <motion.button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="w-full btn-primary relative"
                                                    >
                                                        {isLoading ? (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            </div>
                                                        ) : (
                                                            'Login'
                                                        )}
                                                    </motion.button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}

                                    {view === 'register' && (
                                        <motion.div
                                            key="register"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-8 sm:p-12"
                                        >
                                            <div className="text-center mb-8">
                                                <h2 className="text-3xl font-thin text-gray-900 mb-4 font-josefin">
                                                    Create an Account
                                                </h2>
                                                <p className="text-lg text-gray-600">
                                                    Join us to save your favorites, track orders, and more.
                                                </p>
                                            </div>

                                            <form onSubmit={handleRegisterSubmit} className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            First Name
                                                        </label>
                                                        <div className="flex flex-col space-y-1">
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <UserIcon className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={registerForm.first_name}
                                                                onChange={(e) => setRegisterForm(prev => ({
                                                                    ...prev,
                                                                    first_name: e.target.value
                                                                }))}
                                                                onBlur={() => handleBlur('register', 'first_name')}
                                                                placeholder="First name"
                                                                className={`pl-10 w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                                    validateField('register', 'first_name', registerForm.first_name) ? 'border-red-500' : ''
                                                                }`}
                                                            />
                                                            </div>
                                                            {validateField('register', 'first_name', registerForm.first_name) && (
                                                                <p className="text-sm text-red-500 px-3">{validateField('register', 'first_name', registerForm.first_name)}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Last Name
                                                        </label>
                                                        <div className="flex flex-col space-y-1">
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <UserIcon className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={registerForm.last_name}
                                                                onChange={(e) => setRegisterForm(prev => ({
                                                                    ...prev,
                                                                    last_name: e.target.value
                                                                }))}
                                                                onBlur={() => handleBlur('register', 'last_name')}
                                                                placeholder="Last name"
                                                                className={`pl-10 w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                                    validateField('register', 'last_name', registerForm.last_name) ? 'border-red-500' : ''
                                                                }`}
                                                            />
                                                            </div>
                                                            {validateField('register', 'last_name', registerForm.last_name) && (
                                                                <p className="text-sm text-red-500 px-3">{validateField('register', 'last_name', registerForm.last_name)}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

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
                                                            value={registerForm.email}
                                                            onChange={(e) => setRegisterForm(prev => ({
                                                                ...prev,
                                                                email: e.target.value
                                                            }))}
                                                            onBlur={() => handleBlur('register', 'email')}
                                                            placeholder="Enter your email"
                                                            className={`pl-10 w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                                validateField('register', 'email', registerForm.email) ? 'border-red-500' : ''
                                                            }`}
                                                        />
                                                        </div>
                                                        {validateField('register', 'email', registerForm.email) && (
                                                            <p className="text-sm text-red-500 px-3">{validateField('register', 'email', registerForm.email)}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Password
                                                    </label>
                                                    <div className="flex flex-col space-y-1">
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={registerForm.password}
                                                            onChange={(e) => setRegisterForm(prev => ({
                                                                ...prev,
                                                                password: e.target.value
                                                            }))}
                                                            onBlur={() => handleBlur('register', 'password')}
                                                            placeholder="Create a password"
                                                            className={`pl-10 w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                                validateField('register', 'password', registerForm.password) ? 'border-red-500' : ''
                                                            }`}
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
                                                        {validateField('register', 'password', registerForm.password) && (
                                                            <p className="text-sm text-red-500 px-3">{validateField('register', 'password', registerForm.password)}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Confirm Password
                                                    </label>
                                                    <div className="flex flex-col space-y-1">
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            value={registerForm.password_confirmation}
                                                            onChange={(e) => setRegisterForm(prev => ({
                                                                ...prev,
                                                                password_confirmation: e.target.value
                                                            }))}
                                                            onBlur={() => handleBlur('register', 'password_confirmation')}
                                                            placeholder="Confirm your password"
                                                            className={`pl-10 w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris ${
                                                                validateField('register', 'password_confirmation', registerForm.password_confirmation) ? 'border-red-500' : ''
                                                            }`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                                            ) : (
                                                                <EyeIcon className="h-5 w-5 text-gray-400" />
                                                            )}
                                                        </button>
                                                        </div>
                                                        {validateField('register', 'password_confirmation', registerForm.password_confirmation) && (
                                                            <p className="text-sm text-red-500 px-3">
                                                                {validateField('register', 'password_confirmation', registerForm.password_confirmation)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <motion.button
                                                        type="submit"
                                                        disabled={isLoading}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="w-full btn-primary relative"
                                                    >
                                                        {isLoading ? (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            </div>
                                                        ) : (
                                                            'Create Account'
                                                        )}
                                                    </motion.button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}

                                    {view === 'forgot-password' && (
                                        <ForgotPassword onBack={() => switchView('login')} />
                                    )}
                                </AnimatePresence>

                                {/* Toggle Button (only show for login/register views) */}
                                {view !== 'forgot-password' && (
                                    <div className="p-8 text-center">
                                        <motion.button
                                            onClick={() => switchView(view === 'login' ? 'register' : 'login')}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="inline-flex items-center gap-2 text-iris hover:text-iris/80 transition-colors"
                                        >
                                            {view === 'login' ? (
                                                <>
                                                    <span>Create an Account</span>
                                                    <ArrowRightIcon className="w-4 h-4" />
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowLeftIcon className="w-4 h-4" />
                                                    <span>Back to Login</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default Auth; 