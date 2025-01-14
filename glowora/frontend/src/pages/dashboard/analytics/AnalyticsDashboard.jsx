import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { 
    CurrencyDollarIcon,
    ShoppingCartIcon,
    UserGroupIcon,
    UserPlusIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useTheme } from '../../../contexts/ThemeContext';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
                {change && (
                    <p className={`text-sm ${
                        changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                        {changeType === 'increase' ? '↑' : '↓'} {change}%
                    </p>
                )}
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-full">
                <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
        </div>
    </div>
);

const AnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/analytics/dashboard');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Move all data processing inside a function to avoid null reference errors
    const prepareChartData = () => {
        const salesTrendData = {
            labels: data?.sales_trend?.map(item => item.date) || [],
            datasets: [
                {
                    label: 'Revenue',
                    data: data?.sales_trend?.map(item => item.revenue) || [],
                    borderColor: 'rgb(59, 130, 246)',
                    tension: 0.4,
                },
                {
                    label: 'Orders',
                    data: data?.sales_trend?.map(item => item.order_count) || [],
                    borderColor: 'rgb(16, 185, 129)',
                    tension: 0.4,
                }
            ]
        };

        const categoryData = {
            labels: data?.category_performance?.map(cat => cat.name) || [],
            datasets: [{
                data: data?.category_performance?.map(cat => cat.revenue) || [],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
            }]
        };

        const ratingData = {
            labels: ['5★', '4★', '3★', '2★', '1★'],
            datasets: [{
                data: data?.customer_satisfaction?.rating_distribution?.map(r => r.count) || [],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(107, 114, 128, 0.8)',
                ],
            }]
        };

        return { salesTrendData, categoryData, ratingData };
    };

    const { salesTrendData, categoryData, ratingData } = prepareChartData();

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Sales"
                    value={`$${data?.sales_overview?.total_sales?.toLocaleString() || '0'}`}
                    icon={CurrencyDollarIcon}
                />
                <StatCard
                    title="Total Orders"
                    value={data?.sales_overview?.total_orders?.toLocaleString() || '0'}
                    icon={ShoppingCartIcon}
                />
                <StatCard
                    title="Total Customers"
                    value={data?.customer_metrics?.total_customers?.toLocaleString() || '0'}
                    icon={UserGroupIcon}
                />
                <StatCard
                    title="New Customers"
                    value={data?.customer_metrics?.new_customers_this_month || '0'}
                    icon={UserPlusIcon}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sales Trend</h2>
                    <Line 
                        data={salesTrendData}
                        options={{
                            responsive: true,
                            scales: {
                                y: { 
                                    beginAtZero: true,
                                    grid: {
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    },
                                    ticks: {
                                        color: isDarkMode ? '#9CA3AF' : '#4B5563',
                                    }
                                },
                                x: {
                                    grid: {
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    },
                                    ticks: {
                                        color: isDarkMode ? '#9CA3AF' : '#4B5563',
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    labels: {
                                        color: isDarkMode ? '#9CA3AF' : '#4B5563',
                                    }
                                }
                            }
                        }}
                    />
                </div>

                {/* Category Performance */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Category Revenue</h2>
                    <Doughnut 
                        data={categoryData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        color: isDarkMode ? '#9CA3AF' : '#4B5563',
                                    }
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Customer Satisfaction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Rating Distribution</h2>
                    <Bar 
                        data={ratingData}
                        options={{
                            responsive: true,
                            scales: {
                                y: { 
                                    beginAtZero: true,
                                    grid: {
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    },
                                    ticks: {
                                        color: isDarkMode ? '#9CA3AF' : '#4B5563',
                                    }
                                },
                                x: {
                                    grid: {
                                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    },
                                    ticks: {
                                        color: isDarkMode ? '#9CA3AF' : '#4B5563',
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    labels: {
                                        color: isDarkMode ? '#9CA3AF' : '#4B5563',
                                    }
                                }
                            }
                        }}
                    />
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Low Stock Alerts</h2>
                        <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="space-y-4">
                        {data.inventory_alerts.map(product => (
                            <div key={product.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="h-10 w-10 rounded-lg object-cover"
                                    />
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                                    {product.stock_quantity} left
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard; 