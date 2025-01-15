import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    UsersIcon,
    UserPlusIcon,
    UserMinusIcon,
    ShoppingBagIcon
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

const CustomerStatistics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/users/statistics');
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Customers"
                    value={stats.total_users}
                    icon={UsersIcon}
                    color="text-blue-600"
                />
                <StatCard
                    title="Active Customers"
                    value={stats.active_users}
                    icon={UserPlusIcon}
                    color="text-green-600"
                />
                <StatCard
                    title="Inactive Customers"
                    value={stats.inactive_users}
                    icon={UserMinusIcon}
                    color="text-red-600"
                />
            </div>

            {/* Recent Customers */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Customers</h2>
                    <Link
                        to="/admin/customers"
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
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Joined Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {stats.recent_users.map((user) => (
                                <tr key={user.user_id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.first_name} {user.last_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            user.status === 'active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Top Customers by Orders</h2>
                <div className="space-y-4">
                    {stats.top_customers.map((customer) => (
                        <div key={customer.user_id} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <UsersIcon className="h-10 w-10 text-gray-400 mr-4" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {customer.first_name} {customer.last_name}
                                    </p>
                                    <p className="text-sm text-gray-500">{customer.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <ShoppingBagIcon className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">
                                    {customer.orders_count} orders
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CustomerStatistics; 