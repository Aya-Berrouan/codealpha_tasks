import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const OrderConfirmation = () => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const orderId = location.state?.orderId;
                if (!orderId) {
                    console.error('No order ID found in location state');
                    navigate('/');
                    return;
                }

                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.data.success) {
                    console.log('Order details received:', response.data.order);
                    setOrderDetails(response.data.order);
                } else {
                    setError('Failed to fetch order details');
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Error fetching order details');
            }
        };

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchOrderDetails();
    }, [location.state, navigate, isAuthenticated]);

    if (error) {
        return <div className="text-center text-red-600 mt-8">{error}</div>;
    }

    if (!orderDetails) {
        return <div className="text-center mt-8">Loading order details...</div>;
    }

    const formatAddress = (addressStr) => {
        try {
            const address = JSON.parse(addressStr);
            return (
                <div>
                    <p>{address.first_name} {address.last_name}</p>
                    <p>{address.address}</p>
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                </div>
            );
        } catch (e) {
            console.error('Error parsing address:', e);
            return addressStr;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-misty-rose/20 pt-40 pb-20">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 m-4 mb-12">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Order Confirmation</h1>
                    <p className="text-lg text-gray-600">Thank you for your order!</p>
                    <p className="text-md text-gray-500">Order Number: {orderDetails.order_number}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-3">Shipping Address</h2>
                        {formatAddress(orderDetails.shipping_address)}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-3">Billing Address</h2>
                        {formatAddress(orderDetails.billing_address)}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                    <div className="space-y-4">
                        {orderDetails.order_items && orderDetails.order_items.map((item) => (
                            <div key={item.id} className="flex gap-4 py-4 border-b border-gray-200">
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="text-sm font-medium text-gray-900">
                                        {item.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Quantity: {item.quantity}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Price: ${Number(item.price).toFixed(2)}
                                    </p>
                                    {item.type === 'custom_candle' && item.formatted_details && (
                                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Scent:</span>
                                                <span>{item.formatted_details.scent_name}</span>
                                            </div>
                                            {item.formatted_details.scent_description && (
                                                <p className="text-xs text-gray-500 italic ml-4">
                                                    {item.formatted_details.scent_description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Jar Style:</span>
                                                <span>{item.formatted_details.jar_style}</span>
                                            </div>
                                            {item.formatted_details.jar_description && (
                                                <p className="text-xs text-gray-500 italic ml-4">
                                                    {item.formatted_details.jar_description}
                                                </p>
                                            )}
                                            {item.formatted_details.custom_label && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Custom Label:</span>
                                                    <span>{item.formatted_details.custom_label}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    ${(item.quantity * Number(item.price)).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="text-right space-y-2">
                        {orderDetails.coupon_code && (
                            <p className="text-green-600">
                                Coupon Discount ({orderDetails.coupon_code}): -${Number(orderDetails.discount_amount).toFixed(2)}
                            </p>
                        )}
                        <p className="text-lg font-semibold">
                            Total: ${Number(orderDetails.total_amount).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation; 