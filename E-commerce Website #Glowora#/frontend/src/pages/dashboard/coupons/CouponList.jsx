import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import DeleteConfirmationModal from '../../../components/modals/DeleteConfirmationModal';
import LoadingScreen from '../../../components/LoadingScreen';
import TableScrollbar from '../../../components/TableScrollbar';

const CouponList = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    useEffect(() => {
        fetchCoupons();
    }, [token]);

    const fetchCoupons = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/coupons`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            console.log('Response:', response.data);
            if (response.data.success) {
                setCoupons(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (coupon) => {
        navigate(`/admin/coupons/edit/${coupon.id}`);
    };

    const handleDelete = async () => {
        if (!selectedCoupon) return;

        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/coupons/${selectedCoupon.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                toast.success('Coupon deleted successfully');
                fetchCoupons();
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            toast.error('Failed to delete coupon');
        } finally {
            setShowDeleteModal(false);
            setSelectedCoupon(null);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Coupons</h1>
                <button
                    onClick={() => navigate('/admin/coupons/create')}
                    className="bg-iris text-white px-4 py-2 rounded-md hover:bg-iris-600 transition-colors duration-200"
                >
                    Add Coupon
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <TableScrollbar>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Discount Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Discount Value
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Valid Until
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Min Purchase
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Max Uses
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {coupon.coupon_code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {coupon.discount_type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {coupon.discount_percentage}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {new Date(coupon.valid_until).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        ${coupon.min_purchase || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {coupon.max_uses || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                        {coupon.description || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(coupon)}
                                            className="text-iris hover:text-iris-600 mr-4"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedCoupon(coupon);
                                                setShowDeleteModal(true);
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableScrollbar>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedCoupon(null);
                }}
                onConfirm={handleDelete}
                title="Delete Coupon"
                message="Are you sure you want to delete this coupon? This action cannot be undone."
            />
        </div>
    );
};

export default CouponList; 