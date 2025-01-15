import { useState, useEffect } from 'react';
import { InputField } from './InputField';

export const LoginForm = ({ onSubmit, onForgotPassword, initialEmail = '', loading }) => {
  const [formData, setFormData] = useState({
    email: initialEmail,
    password: ''
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      email: initialEmail,
      password: ''
    }));
  }, [initialEmail]);

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
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-white/60">Please sign in to your account</p>
      </div>
      
      <div className="space-y-6">
        <InputField
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />
        <InputField
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
        />
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-white/60 hover:text-white transition-colors duration-300"
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-primary-pink to-primary-blue text-white rounded-lg font-semibold hover:from-primary-blue hover:to-primary-pink transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </form>
  );
};

export const RegisterForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      username: formData.name.toLowerCase().replace(/\s+/g, '')
    };
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md px-8 py-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-white/60">Join us and start playing!</p>
      </div>
      
      <div className="space-y-6">
        <InputField
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
        />
        <InputField
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />
        <InputField
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
        />
        <InputField
          type="password"
          name="password_confirmation"
          placeholder="Confirm Password"
          value={formData.password_confirmation}
          onChange={handleChange}
          disabled={loading}
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-primary-pink to-primary-blue text-white rounded-lg font-semibold hover:from-primary-blue hover:to-primary-pink transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </form>
  );
};

export const ForgotPasswordForm = ({ onSubmit, onBack, loading }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md px-8 py-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
        <p className="text-white/60">Enter your email to reset your password</p>
      </div>
      
      <div className="space-y-6">
        <InputField
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-primary-pink to-primary-blue text-white rounded-lg font-semibold hover:from-primary-blue hover:to-primary-pink transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
        </button>
        
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full py-3 text-white/60 hover:text-white transition-colors duration-300"
        >
          Back to Login
        </button>
      </div>
    </form>
  );
};