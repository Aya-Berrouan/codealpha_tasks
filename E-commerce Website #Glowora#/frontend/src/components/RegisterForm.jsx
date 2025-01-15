import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const result = await register(formData);
            console.log('Registration result:', result);
            
            if (result.success) {
                navigate('/dashboard');
            } else {
                setErrors(result.errors || { general: 'Registration failed' });
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ general: 'An unexpected error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
            </div>

            <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                    type="password"
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                />
                {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
            </div>

            {errors.general && (
                <div className="text-red-600 text-sm">{errors.general}</div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
        </form>
    );
};

export default RegisterForm; 