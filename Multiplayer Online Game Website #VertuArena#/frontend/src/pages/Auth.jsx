import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParticleBackground } from '../components/ParticleBackground';
import { LoginForm, RegisterForm, ForgotPasswordForm } from '../components/auth/AuthForms';
import { OverlayPanel } from '../components/auth/OverlayPanel';
import { register, login, forgotPassword } from '../services/auth';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Hook for responsive design
const useResponsive = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isSmallScreen;
};

// Auth Container for medium and larger screens
const AuthDesktop = ({ isLogin, setIsLogin, isForgotPassword, handleSubmit, handleForgotPassword, handleForgotPasswordClick, handleBackToLogin, registeredEmail, loading }) => (
  <div className={`relative w-full mx-4 ${isForgotPassword ? 'max-w-md' : 'max-w-5xl min-h-[600px]'} flex`}>
    <div className="w-full bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
      {isForgotPassword ? (
        <div className="w-full py-8 px-6">
          <ForgotPasswordForm onSubmit={handleForgotPassword} onBack={handleBackToLogin} loading={loading} />
        </div>
      ) : (
        <div className="relative w-full h-full flex">
          <div className="absolute left-0 w-1/2 h-full flex items-center justify-center">
            <LoginForm onSubmit={handleSubmit} onForgotPassword={handleForgotPasswordClick} initialEmail={registeredEmail} loading={loading} />
          </div>
          <div className="absolute right-0 w-1/2 h-full flex items-center justify-center">
            <RegisterForm onSubmit={handleSubmit} loading={loading} />
          </div>
          <OverlayPanel isLogin={isLogin} onSwitch={() => setIsLogin(!isLogin)} />
        </div>
      )}
    </div>
  </div>
);

// Auth Container for small screens
const AuthMobile = ({ isLogin, setIsLogin, isForgotPassword, handleSubmit, handleForgotPassword, handleForgotPasswordClick, handleBackToLogin, registeredEmail, loading }) => (
  <div className="relative w-full max-w-md mx-4">
    <div className="w-full bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
      {isForgotPassword ? (
        <div className="w-full py-8 px-6">
          <ForgotPasswordForm onSubmit={handleForgotPassword} onBack={handleBackToLogin} loading={loading} />
        </div>
      ) : isLogin ? (
        <div className="space-y-8">
          <LoginForm onSubmit={handleSubmit} onForgotPassword={handleForgotPasswordClick} initialEmail={registeredEmail} loading={loading} />
          <div className="text-center pb-8">
            <p className="text-white/60 mb-4">Don't have an account?</p>
            <button
              onClick={() => setIsLogin(false)}
              className="px-8 py-3 text-lg font-semibold text-white rounded-lg border-2 border-white/50 hover:border-white transition-all duration-300 group"
              disabled={loading}
            >
              <span className="bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
                Register Now
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <RegisterForm onSubmit={handleSubmit} loading={loading} />
          <div className="text-center pb-8">
            <p className="text-white/60 mb-4">Already have an account?</p>
            <button
              onClick={() => setIsLogin(true)}
              className="px-8 py-3 text-lg font-semibold text-white rounded-lg border-2 border-white/50 hover:border-white transition-all duration-300 group"
              disabled={loading}
            >
              <span className="bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
                Login Here
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Main Auth Component
export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const isSmallScreen = useResponsive();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const loginResponse = await login(formData);
        await authLogin(loginResponse);
        navigate('/');
      } else {
        await register(formData);
        setRegisteredEmail(formData.email);
        setIsLogin(true);
        toast.success('Registration successful! Please log in.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred');
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    setLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      toast.success('Password reset link has been sent to your email');
      setIsForgotPassword(false);
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'An error occurred');
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-blue via-black to-black flex items-center justify-center">
      <ParticleBackground />
      {error && (
        <div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 max-w-md w-full mx-4 z-50 animate-slide-down"
        >
          <div className="relative bg-gradient-to-r from-red-500/10 to-red-600/10 backdrop-blur-xl border border-red-500/20 text-white px-6 py-4 rounded-xl shadow-2xl">
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 to-red-600 opacity-20 blur-xl -z-10" />
            
            {/* Error icon and message */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-5 h-5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 text-sm font-medium">{error}</div>
              <button 
                onClick={() => setError('')}
                className="flex-shrink-0 ml-4 -mr-2 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                aria-label="Dismiss error"
              >
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Animated progress bar */}
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-red-200/20 overflow-hidden rounded-b-xl">
              <div className="h-full w-full bg-gradient-to-r from-red-500 to-red-600 animate-shrink-width" />
            </div>
          </div>
        </div>
      )}
      {isSmallScreen ? (
        <AuthMobile
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          isForgotPassword={isForgotPassword}
          handleSubmit={handleSubmit}
          handleForgotPassword={handleForgotPassword}
          handleForgotPasswordClick={handleForgotPasswordClick}
          handleBackToLogin={handleBackToLogin}
          registeredEmail={registeredEmail}
          loading={loading}
        />
      ) : (
        <AuthDesktop
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          isForgotPassword={isForgotPassword}
          handleSubmit={handleSubmit}
          handleForgotPassword={handleForgotPassword}
          handleForgotPasswordClick={handleForgotPasswordClick}
          handleBackToLogin={handleBackToLogin}
          registeredEmail={registeredEmail}
          loading={loading}
        />
      )}
    </div>
  );
};