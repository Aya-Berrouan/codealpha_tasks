import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import TableScrollbar from '../../../components/TableScrollbar';
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

const OrderList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [searchTerm, statusFilter, dateRange, currentPage]);

    const fetchOrders = async () => {
        try {
            let url = `${import.meta.env.VITE_API_URL}/api/orders?page=${currentPage}`;
            if (searchTerm) url += `&search=${searchTerm}`;
            if (statusFilter) url += `&status=${statusFilter}`;
            if (dateRange.start) url += `&start_date=${dateRange.start}`;
            if (dateRange.end) url += `&end_date=${dateRange.end}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setOrders(data.orders);
                setTotalPages(data.last_page);
            } else {
                toast.error('Failed to load orders');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Error loading orders');
            setLoading(false);
        }
    };

    const handleViewOrder = (orderId) => {
        navigate(`/admin/orders/${orderId}`);
    };

    const handleReset = () => {
        setSearchTerm('');
        setStatusFilter('');
        setDateRange({ start: '', end: '' });
        setCurrentPage(1);
    };

    if (loading) {
        return <LoadingScreen text="Loading Orders..." />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                            focus:ring-primary-500 focus:border-primary-500 
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                            placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                            focus:ring-primary-500 focus:border-primary-500
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                            focus:ring-primary-500 focus:border-primary-500
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                            focus:ring-primary-500 focus:border-primary-500
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* Reset Button */}
                    <div>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                            text-gray-700 dark:text-gray-300 rounded-md 
                            hover:bg-gray-50 dark:hover:bg-gray-700 
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                            dark:focus:ring-offset-gray-800
                            bg-white dark:bg-gray-700 transition-colors duration-200"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <TableScrollbar>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Order #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        #{order.order_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {order.user.first_name} {order.user.last_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <OrderStatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        ${Number(order.total_amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewOrder(order.id)}
                                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableScrollbar>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                            text-gray-700 dark:text-gray-300 rounded-md 
                            hover:bg-gray-50 dark:hover:bg-gray-700 
                            disabled:opacity-50 disabled:cursor-not-allowed
                            bg-white dark:bg-gray-800 transition-colors duration-200"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                            text-gray-700 dark:text-gray-300 rounded-md 
                            hover:bg-gray-50 dark:hover:bg-gray-700 
                            disabled:opacity-50 disabled:cursor-not-allowed
                            bg-white dark:bg-gray-800 transition-colors duration-200"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderList; 