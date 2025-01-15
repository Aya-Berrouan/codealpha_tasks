import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import LoadingScreen from '../../../components/LoadingScreen';

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomer();
    }, [id]);

    const fetchCustomer = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/users/${id}`);
            const data = await response.json();
            setCustomer(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching customer:', error);
            toast.error('Error loading customer details');
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen text="Loading customer details..." />;
    }

    if (!customer) {
        return <div>Customer not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    Customer Details
                </h1>
                <div className="flex space-x-3">
                    <button
                        onClick={() => navigate(`/admin/customers/edit/${customer.user_id}`)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                        Edit Customer
                    </button>
                    <button
                        onClick={() => navigate('/admin/customers')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Back to Customers
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Information */}
                <div className="col-span-2">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center mb-6">
                            <div className="flex-shrink-0">
                                <UserCircleIcon className="h-20 w-20 text-gray-400" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-xl font-medium text-gray-900">
                                    {customer.first_name} {customer.last_name}
                                </h2>
                                <p className="text-sm text-gray-500">Customer ID: {customer.user_id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {customer.phone || 'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {customer.address || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            customer.status === 'active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Joined Date</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white shadow rounded-lg p-6 mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Order History</h3>
                        {customer.orders && customer.orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Order ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {customer.orders.map((order) => (
                                            <tr key={order.order_id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {order.order_number}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        order.status === 'completed' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ${order.total_amount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No orders found</p>
                        )}
                    </div>
                </div>

                {/* Reviews */}
                <div className="col-span-1">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Reviews</h3>
                        {customer.reviews && customer.reviews.length > 0 ? (
                            <div className="space-y-4">
                                {customer.reviews.map((review) => (
                                    <div key={review.review_id} className="border-b border-gray-200 pb-4 last:border-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900">
                                                {review.product.name}
                                            </p>
                                            <span className="text-sm text-gray-500">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            {[...Array(5)].map((_, index) => (
                                                <svg
                                                    key={index}
                                                    className={`h-4 w-4 ${
                                                        index < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                                    }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No reviews found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails; 