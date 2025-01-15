import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    CurrencyDollarIcon,
    ShoppingCartIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
            <div className={`p-3 rounded-full ${color} bg-opacity-10 mr-4`}>
                <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    </div>
);

const OrderStatistics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/orders/statistics');
            const data = await response.json();
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard
                    title="Total Orders"
                    value={stats.total_orders}
                    icon={ShoppingCartIcon}
                    color="text-blue-600"
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pending_orders}
                    icon={ShoppingCartIcon}
                    color="text-yellow-600"
                />
                <StatCard
                    title="Processing Orders"
                    value={stats.processing_orders}
                    icon={TruckIcon}
                    color="text-purple-600"
                />
                <StatCard
                    title="Delivered Orders"
                    value={stats.delivered_orders}
                    icon={CheckCircleIcon}
                    color="text-green-600"
                />
                <StatCard
                    title="Cancelled Orders"
                    value={stats.cancelled_orders}
                    icon={XCircleIcon}
                    color="text-red-600"
                />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
                    <Link
                        to="/admin/orders"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Order Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Customer
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
                            {stats.recent_orders.map((order) => (
                                <tr key={order.order_id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link
                                            to={`/admin/orders/${order.order_id}`}
                                            className="text-primary-600 hover:text-primary-900"
                                        >
                                            {order.order_number}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.user.first_name} {order.user.last_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        ${order.total_amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderStatistics; 