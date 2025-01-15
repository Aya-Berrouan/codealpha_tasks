import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data.orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((index) => (
                            <div key={index} className="bg-white rounded-lg p-6">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
                    
                    {orders.length === 0 ? (
                        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                            <Link to="/products" className="btn-primary inline-block">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="text-lg font-medium text-gray-900">
                                                    Order #{order.order_number}
                                                </h2>
                                                <p className="text-sm text-gray-500">
                                                    Placed on {format(new Date(order.created_at), 'MMMM d, yyyy')}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize
                                                ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            {order.order_items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                                        {item.type === 'custom_candle' ? (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                                                                }}
                                                            />
                                                        ) : item.product?.images?.length > 0 ? (
                                                            <img
                                                                src={`${import.meta.env.VITE_API_URL}/storage/${item.product.images[0].image}`}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {item.type === 'custom_candle' ? item.name : item.product?.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            Quantity: {item.quantity}
                                                        </p>
                                                        {item.type === 'custom_candle' && item.custom_details && (
                                                            <div className="text-xs text-gray-500">
                                                                <p>Scent: {item.custom_details.scent_name}</p>
                                                                <p>Jar Style: {item.custom_details.jar_style}</p>
                                                            </div>
                                                        )}
                                                        <p className="text-sm font-medium text-gray-900">
                                                            ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <span>Total</span>
                                                <span>${Number(order.total_amount).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 