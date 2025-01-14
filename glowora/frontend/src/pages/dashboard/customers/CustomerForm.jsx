import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingScreen from '../../../components/LoadingScreen';

const CustomerForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        status: 'active',
        role: 'customer'
    });
    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isEditing) {
            fetchCustomer();
        }
    }, [id]);

    const fetchCustomer = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            console.log('Fetching customer data for ID:', id);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            console.log('API Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch customer data');
            }

            if (!data) {
                throw new Error('No customer data received');
            }

            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email || '',
                password: '', // Don't show the password
                phone: data.phone || '',
                address: data.address || '',
                status: data.status || 'active',
                role: data.role || 'customer'
            });
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                status: error.status,
                id: id,
                url: `${import.meta.env.VITE_API_URL}/api/users/${id}`
            });
            toast.error(`Error loading customer data: ${error.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            const url = isEditing 
                ? `${import.meta.env.VITE_API_URL}/api/users/${id}`
                : `${import.meta.env.VITE_API_URL}/api/users`;
            
            const method = isEditing ? 'PUT' : 'POST';
            
            // Remove empty password from update request
            const submitData = { ...formData };
            if (isEditing && !submitData.password) {
                delete submitData.password;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(submitData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(isEditing ? 'Customer updated successfully' : 'Customer created successfully');
                navigate('/admin/customers');
            } else {
                throw new Error(data.message || 'Error saving customer');
            }
        } catch (error) {
            console.error('Error saving customer:', error);
            toast.error(error.message || 'Error saving customer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return <LoadingScreen text="Loading customer data..." />;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {isEditing ? 'Edit Customer' : 'Add New Customer'}
                </h1>
                <button
                    onClick={() => navigate('/admin/customers')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                    Cancel
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password {isEditing && '(Leave blank to keep current password)'}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                {...(!isEditing && { required: true })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/customers')}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-iris text-white px-4 py-2 rounded-md hover:bg-iris-600 transition-colors duration-200"
                            disabled={submitting}
                        >
                            {submitting ? 'Saving...' : isEditing ? 'Update Customer' : 'Create Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerForm; 