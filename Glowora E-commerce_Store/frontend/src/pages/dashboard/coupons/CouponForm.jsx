import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const CouponForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useAuth();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        coupon_code: '',
        discount_type: 'percentage',
        discount_percentage: '',
        valid_until: '',
        min_purchase: '',
        max_uses: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditing && token) {
            fetchCoupon();
        }
    }, [id, token]);

    const fetchCoupon = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/coupons/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                const coupon = response.data.data;
                setFormData({
                    coupon_code: coupon.coupon_code,
                    discount_type: coupon.discount_type,
                    discount_percentage: coupon.discount_percentage,
                    valid_until: new Date(coupon.valid_until).toISOString().split('T')[0],
                    min_purchase: coupon.min_purchase || '',
                    max_uses: coupon.max_uses || '',
                    description: coupon.description || ''
                });
            } else {
                throw new Error(response.data.message || 'Failed to fetch coupon');
            }
        } catch (error) {
            console.error('Error fetching coupon:', error);
            toast.error('Error loading coupon');
            navigate('/admin/coupons');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const url = `${import.meta.env.VITE_API_URL}/api/coupons${isEditing ? `/${id}` : ''}`;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await axios({
                method,
                url,
                data: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                toast.success(`Coupon ${isEditing ? 'updated' : 'created'} successfully`);
                navigate('/admin/coupons');
            } else {
                throw new Error(response.data.message || 'Error saving coupon');
            }
        } catch (error) {
            console.error('Error saving coupon:', error);
            
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                setErrors(validationErrors);
                
                const firstError = Object.values(validationErrors)[0];
                toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                toast.error(error.response?.data?.message || error.message || 'Error saving coupon');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {isEditing ? 'Edit Coupon' : 'Add New Coupon'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 transition-colors duration-200">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Coupon Code
                        </label>
                        <input
                            type="text"
                            name="coupon_code"
                            value={formData.coupon_code}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            required
                        />
                        {errors.coupon_code && (
                            <p className="mt-1 text-sm text-red-600">{errors.coupon_code}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Discount Type
                        </label>
                        <select
                            name="discount_type"
                            value={formData.discount_type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            required
                        >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                        </select>
                        {errors.discount_type && (
                            <p className="mt-1 text-sm text-red-600">{errors.discount_type}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Discount Value
                        </label>
                        <input
                            type="number"
                            name="discount_percentage"
                            value={formData.discount_percentage}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            max={formData.discount_type === 'percentage' ? "100" : undefined}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            required
                        />
                        {errors.discount_percentage && (
                            <p className="mt-1 text-sm text-red-600">{errors.discount_percentage}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Valid Until
                        </label>
                        <input
                            type="date"
                            name="valid_until"
                            value={formData.valid_until}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            required
                        />
                        {errors.valid_until && (
                            <p className="mt-1 text-sm text-red-600">{errors.valid_until}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Minimum Purchase
                        </label>
                        <input
                            type="number"
                            name="min_purchase"
                            value={formData.min_purchase}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        />
                        {errors.min_purchase && (
                            <p className="mt-1 text-sm text-red-600">{errors.min_purchase}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Maximum Uses
                        </label>
                        <input
                            type="number"
                            name="max_uses"
                            value={formData.max_uses}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        />
                        {errors.max_uses && (
                            <p className="mt-1 text-sm text-red-600">{errors.max_uses}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        ></textarea>
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/coupons')}
                        className="ml-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-iris text-white px-4 py-2 rounded-md hover:bg-iris-600 transition-colors duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : isEditing ? 'Update Coupon' : 'Create Coupon'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CouponForm; 