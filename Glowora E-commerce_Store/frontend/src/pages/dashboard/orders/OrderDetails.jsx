import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import LoadingScreen from '../../../components/LoadingScreen';

const OrderStatusBadge = ({ status }) => {
    const statusClasses = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setOrder(data.order);
                setStatus(data.order.status);
            } else {
                toast.error('Failed to load order details');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Error loading order details');
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (data.success) {
                setStatus(newStatus);
                toast.success('Order status updated successfully');
            } else {
                toast.error(data.message || 'Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Error updating order status');
        }
    };

    if (loading) {
        return <LoadingScreen text="Loading Order Details..." />;
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Order not found</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to Orders
                </button>
                <div className="flex items-center gap-4">
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm 
                        focus:border-primary-500 focus:ring-primary-500
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <OrderStatusBadge status={status} />
                </div>
            </div>

            {/* Order Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Order Information</h2>
                        <p className="text-gray-600 dark:text-gray-400">Order #{order.order_number}</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Placed on {format(new Date(order.created_at), 'MMMM d, yyyy')}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Total Amount: ${Number(order.total_amount).toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Customer Information</h2>
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                                {order.user?.avatar_url ? (
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src={order.user.avatar_url}
                                        alt={`${order.user.first_name} ${order.user.last_name}`}
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500 text-sm">
                                            {order.user?.first_name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                    {order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Unknown User'}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {order.user?.email || 'No email available'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Subtotal
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {order.order_items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-16 w-16 flex-shrink-0">
                                            {item.type === 'custom_candle' ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="h-16 w-16 object-cover rounded-md"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                                                    }}
                                                />
                                            ) : item.product?.images?.length > 0 ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/storage/${item.product.images[0].image}`}
                                                    alt={item.product.name}
                                                    className="h-16 w-16 object-cover rounded-md"
                                                />
                                            ) : (
                                                <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                                    <span className="text-gray-400 dark:text-gray-500">No image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {item.type === 'custom_candle' ? item.name : item.product?.name}
                                            </div>
                                            {item.type === 'custom_candle' && item.custom_details && (
                                                <div className="text-xs text-gray-500">
                                                    <p>Scent: {item.custom_details.scent_name}</p>
                                                    <p>Jar Style: {item.custom_details.jar_style}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {item.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    ${Number(item.price).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                                Total
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                                ${Number(order.total_amount).toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Shipping Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Shipping Address</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {JSON.parse(order.shipping_address).address}<br />
                            {JSON.parse(order.shipping_address).city}, {JSON.parse(order.shipping_address).state} {JSON.parse(order.shipping_address).postal_code}<br />
                            {JSON.parse(order.shipping_address).country}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Payment Method</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{order.payment_method}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Payment Status: <span className="capitalize">{order.payment_status}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails; 