import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import InteractiveBackground from './InteractiveBackground';
import Footer from '../Footer';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  useEffect(() => {
    // Get token and email from URL parameters
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    const emailParam = params.get('email');

    if (!tokenParam || !emailParam) {
      toast.error('Invalid password reset link');
      navigate('/login');
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, token, password, passwordConfirmation);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <InteractiveBackground />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16 mt-20">
        {/* Content Container */}
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-thin text-gray-900 mb-4 font-josefin">
                Reset Password
              </h2>
              <p className="text-lg text-gray-600">
                Enter your new password below to reset your account password.
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
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Create a new password"
                    className="pl-10 w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris"
                    disabled={loading}
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => {
                      setPasswordConfirmation(e.target.value);
                      setError('');
                    }}
                    placeholder="Confirm your new password"
                    className="pl-10 w-full rounded-full border-gray-200 focus:ring-iris focus:border-iris"
                    disabled={loading}
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`w-full btn-primary relative ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
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
                onClick={() => navigate('/login')}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`inline-flex items-center gap-2 text-iris hover:text-iris/80 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Login</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default ResetPassword; 