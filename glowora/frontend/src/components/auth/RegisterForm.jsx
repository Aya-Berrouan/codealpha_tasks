import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [errors, setErrors] = useState({});
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Client-side validation
        const validationErrors = {};
        if (formData.password !== formData.password_confirmation) {
            validationErrors.password = 'Passwords do not match';
        }
        if (formData.password.length < 8) {
            validationErrors.password = 'Password must be at least 8 characters';
        }
        if (!formData.email.includes('@')) {
            validationErrors.email = 'Please enter a valid email address';
        }
        if (!formData.first_name.trim()) {
            validationErrors.first_name = 'First name is required';
        }
        if (!formData.last_name.trim()) {
            validationErrors.last_name = 'Last name is required';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const result = await register({
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                password_confirmation: formData.password_confirmation
            });

            if (result.success) {
                navigate('/dashboard');
            } else {
                // Convert array errors to string
                const formattedErrors = {};
                for (const [key, value] of Object.entries(result.errors)) {
                    formattedErrors[key] = Array.isArray(value) ? value[0] : value;
                }
                setErrors(formattedErrors);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ general: 'Registration failed. Please try again.' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="first_name" className="sr-only">First Name</label>
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="sr-only">Last Name</label>
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password_confirmation" className="sr-only">Confirm Password</label>
                            <input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Confirm Password"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {Object.keys(errors).map((key) => (
                        <div key={key} className="text-red-500 text-sm text-center">
                            {errors[key]}
                        </div>
                    ))}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm; 