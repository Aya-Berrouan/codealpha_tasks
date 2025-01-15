import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ParticleBackground } from '../components/ParticleBackground';
import { InputField } from '../components/auth/InputField';
import { resetPassword } from '../services/auth';

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

// Reset Password Form Component
const ResetPasswordForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md px-8 py-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Reset Your Password</h2>
        <p className="text-white/60">
          Enter your new password below to reset your account password.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <InputField
            type="password"
            name="password"
            placeholder="New Password"
            value={formData.password}
            onChange={handleChange}
          />
          <InputField
            type="password"
            name="password_confirmation"
            placeholder="Confirm New Password"
            value={formData.password_confirmation}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary-pink to-primary-blue text-white rounded-lg font-semibold hover:from-primary-blue hover:to-primary-pink transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => window.location.href = '/auth'}
              className="px-8 py-3 text-lg font-semibold text-white rounded-lg border-2 border-white/50 hover:border-white transition-all duration-300 group"
            >
              <span className="bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
                Back to Login
              </span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

// Main Reset Password Component
export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isSmallScreen = useResponsive();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (!token || !email) {
      toast.error('Invalid reset password link');
      navigate('/auth');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (formData) => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      toast.error('Invalid reset password link');
      navigate('/auth');
      return;
    }
    
    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        token,
        email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      toast.success('Password has been reset successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-blue via-black to-black flex items-center justify-center">
      <ParticleBackground />
      <div className={`relative w-full mx-4 max-w-md flex`}>
        <div className="w-full bg-[#ffffff0d] backdrop-blur-xl rounded-3xl border border-[#ffffff1a] overflow-hidden">
          <ResetPasswordForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
};
