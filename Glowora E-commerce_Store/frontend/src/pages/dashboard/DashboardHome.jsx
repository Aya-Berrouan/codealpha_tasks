import React, { useState, useEffect } from 'react';
import { 
    ShoppingBagIcon, 
    CurrencyDollarIcon, 
    UserGroupIcon, 
    StarIcon,
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
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
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import GaugeChart from 'react-gauge-chart';
import TableScrollbar from '../../components/TableScrollbar';

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
    Legend,
    Filler
);

const DashboardHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);
    const [salesChartData, setSalesChartData] = useState(null);
    const [orderStatusData, setOrderStatusData] = useState(null);
    const [customerActivityData, setCustomerActivityData] = useState(null);
    const [topProductsData, setTopProductsData] = useState(null);
    const [cartAbandonmentRate, setCartAbandonmentRate] = useState(0);
    const [cartAnalytics, setCartAnalytics] = useState({
        total_carts: 0,
        completed_orders: 0,
        abandoned_carts: 0,
        abandonment_rate: 0
    });
    const [ratingsData, setRatingsData] = useState(null);

    // Chart options
    const [lineChartOptions] = useState({
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.8,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 12,
                    padding: 10,
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)' // Gray-500
                }
            },
            title: {
                display: true,
                text: 'Total Sales Over Time',
                font: {
                    size: 16
                },
                padding: 15,
                color: 'rgb(17, 24, 39)' // Gray-900
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(107, 114, 128, 0.1)' // Light gray grid lines
                },
                ticks: {
                    callback: value => `$${value.toLocaleString()}`,
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                },
                title: {
                    display: true,
                    text: 'Cumulative Sales ($)',
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                }
            },
            x: {
                grid: {
                    color: 'rgba(107, 114, 128, 0.1)'
                },
                ticks: {
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                },
                title: {
                    display: true,
                    text: 'Date',
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                }
            }
        }
    });

    const [doughnutChartOptions] = useState({
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.8,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 12,
                    padding: 10,
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)' // Gray-500
                }
            },
            title: {
                display: true,
                text: 'Order Status Distribution',
                font: {
                    size: 16
                },
                padding: 15,
                color: 'rgb(17, 24, 39)' // Gray-900
            }
        }
    });

    const [barChartOptions] = useState({
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.2,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Sales by Product Category',
                font: {
                    size: 16
                },
                padding: 15,
                color: 'rgb(17, 24, 39)' // Gray-900
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(107, 114, 128, 0.1)'
                },
                ticks: {
                    callback: value => `$${value.toLocaleString()}`,
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                },
                title: {
                    display: true,
                    text: 'Sales Amount ($)',
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                }
            },
            x: {
                grid: {
                    color: 'rgba(107, 114, 128, 0.1)'
                },
                ticks: {
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                },
                title: {
                    display: true,
                    text: 'Product Category',
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                }
            }
        }
    });

    const [topProductsOptions] = useState({
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.2,
        indexAxis: 'y', // This makes the bar chart horizontal
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Top-Selling Products',
                font: {
                    size: 16
                },
                padding: 15,
                color: 'rgb(17, 24, 39)' // Gray-900
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(107, 114, 128, 0.1)'
                },
                ticks: {
                    callback: value => `$${value.toLocaleString()}`,
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                },
                title: {
                    display: true,
                    text: 'Sales Amount ($)',
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                }
            },
            y: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                }
            }
        }
    });

    const [ratingsChartOptions] = useState({
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.2,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Ratings Distribution',
                font: {
                    size: 16
                },
                padding: 15,
                color: 'rgb(17, 24, 39)' // Gray-900
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(107, 114, 128, 0.1)'
                },
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                },
                title: {
                    display: true,
                    text: 'Number of Reviews',
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                },
                title: {
                    display: true,
                    text: 'Rating',
                    font: {
                        size: 12
                    },
                    color: 'rgb(107, 114, 128)'
                }
            }
        }
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            };

            // Fetch all orders with their relationships
            const ordersResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/api/orders/dashboard-data`, 
                { headers }
            );
            const ordersData = await ordersResponse.json();

            if (!ordersResponse.ok) {
                throw new Error(ordersData.message || 'Failed to fetch orders');
            }


            // Calculate total sales from orders
            const totalSales = ordersData.orders?.reduce((sum, order) => {
                return sum + Number(order.total_amount || 0);
            }, 0) || 0;

            // Calculate total products ordered (sum of quantities)
            const productsOrdered = ordersData.orders?.reduce((sum, order) => {
                const orderQuantity = order.order_items?.reduce((itemSum, item) => {
                    return itemSum + Number(item.quantity || 0);
                }, 0) || 0;
                return sum + orderQuantity;
            }, 0) || 0;

            // Get unique customers count from orders
            const customersCount = new Set(
                ordersData.orders?.map(order => order.user?.id).filter(Boolean)
            ).size || 0;

            // Get total orders count
            const ordersCount = ordersData.orders?.length || 0;

            // Calculate month-over-month changes
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

            const currentMonthOrders = ordersData.orders?.filter(order => 
                new Date(order.created_at).getMonth() === currentMonth
            ) || [];

            const lastMonthOrders = ordersData.orders?.filter(order => 
                new Date(order.created_at).getMonth() === lastMonth
            ) || [];

            // Calculate current month products ordered
            const currentMonthProducts = currentMonthOrders.reduce((sum, order) => {
                const orderQuantity = order.order_items?.reduce((itemSum, item) => {
                    return itemSum + Number(item.quantity || 0);
                }, 0) || 0;
                return sum + orderQuantity;
            }, 0);

            // Calculate last month products ordered
            const lastMonthProducts = lastMonthOrders.reduce((sum, order) => {
                const orderQuantity = order.order_items?.reduce((itemSum, item) => {
                    return itemSum + Number(item.quantity || 0);
                }, 0) || 0;
                return sum + orderQuantity;
            }, 0);

            const currentMonthSales = currentMonthOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
            const lastMonthSales = lastMonthOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

            // Calculate actual number changes instead of percentages
            const calculateChange = (current, previous) => {
                const difference = current - previous;
                return difference;
            };


            const salesChange = calculateChange(currentMonthSales, lastMonthSales);
            const productsChange = calculateChange(currentMonthProducts, lastMonthProducts);
            const ordersChange = calculateChange(currentMonthOrders.length, lastMonthOrders.length);


            // Transform the data into our stats format
            const transformedStats = [
                {
                    name: 'Total Sales',
                    value: `$${totalSales.toFixed(2)}`,
                    icon: CurrencyDollarIcon,
                    change: `${salesChange >= 0 ? '+' : ''}$${Math.abs(salesChange).toFixed(2)}`,
                    changeType: salesChange >= 0 ? 'increase' : 'decrease'
                },
                {
                    name: 'Products Ordered',
                    value: productsOrdered.toString(),
                    icon: ShoppingBagIcon,
                    change: `${productsChange >= 0 ? '+' : ''}${productsChange}`,
                    changeType: productsChange >= 0 ? 'increase' : 'decrease'
                },
                {
                    name: 'Active Customers',
                    value: customersCount.toString(),
                    icon: UserGroupIcon,
                    change: `${customersCount} unique customers`,
                    changeType: 'increase'
                },
                {
                    name: 'Total Orders',
                    value: ordersCount.toString(),
                    icon: StarIcon,
                    change: `${ordersChange >= 0 ? '+' : ''}${ordersChange}`,
                    changeType: ordersChange >= 0 ? 'increase' : 'decrease'
                }
            ];

            setStats(transformedStats);
            setRecentOrders(ordersData.orders || []);

            // Prepare data for charts
            const salesByDate = {};
            const statusCount = { pending: 0, processing: 0, completed: 0, cancelled: 0 };
            const salesByCategory = {};
            const productSales = {};

            // Sort orders by date
            const sortedOrders = ordersData.orders?.sort((a, b) => 
                new Date(a.created_at) - new Date(b.created_at)
            ) || [];

            let cumulativeTotal = 0;
            sortedOrders.forEach(order => {
                // Cumulative sales by date
                const date = new Date(order.created_at).toLocaleDateString();
                cumulativeTotal += Number(order.total_amount);
                salesByDate[date] = cumulativeTotal;

                // Order status count
                statusCount[order.status] = (statusCount[order.status] || 0) + 1;

                // Process order items for category and product sales
                order.order_items?.forEach(item => {
                    if (item.product?.category?.name) {
                        // Category sales
                        const categoryName = item.product.category.name;
                        const itemTotal = Number(item.price) * Number(item.quantity);
                        salesByCategory[categoryName] = (salesByCategory[categoryName] || 0) + itemTotal;

                        // Product sales
                        if (item.product?.name) {
                            const productName = item.product.name;
                            productSales[productName] = (productSales[productName] || 0) + itemTotal;
                        }
                    }
                });
            });

            // Sort categories by sales amount (descending)
            const sortedCategories = Object.entries(salesByCategory)
                .sort(([,a], [,b]) => b - a)
                .reduce((acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {});

            // Get top 5 selling products
            const topProducts = Object.entries(productSales)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .reduce((acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {});


            // Sales Trend Chart Data
            setSalesChartData({
                labels: Object.keys(salesByDate),
                datasets: [{
                    label: 'Total Sales',
                    data: Object.values(salesByDate),
                    fill: true,
                    borderColor: '#6050C5', // Primary purple
                    backgroundColor: 'rgba(96, 80, 197, 0.1)', // Light purple with opacity
                    tension: 0.4
                }]
            });

            // Order Status Chart Data
            setOrderStatusData({
                labels: Object.keys(statusCount).map(status => status.charAt(0).toUpperCase() + status.slice(1)),
                datasets: [{
                    data: Object.values(statusCount),
                    backgroundColor: [
                        '#6050C5',   // Primary purple
                        '#7063C4',   // Secondary purple
                        '#B9B5F1',   // Light purple
                        '#7449A9',   // Dark purple
                        '#50368A'    // Deeper purple
                    ],
                    borderColor: [
                        '#6050C5',   // Primary purple
                        '#7063C4',   // Secondary purple
                        '#B9B5F1',   // Light purple
                        '#7449A9',   // Dark purple
                        '#50368A'    // Deeper purple
                    ],
                    borderWidth: 1
                }]
            });

            // Sales by Category Chart Data
            const categoryColors = [
                '#6050C5',   // Primary purple
                '#7063C4',   // Secondary purple
                '#B9B5F1',   // Light purple
                '#7449A9',   // Dark purple
                '#50368A',   // Deeper purple
                '#9B8AFB',   // Lavender
                '#8B72BE',   // Periwinkle
                '#D4CCF7'    // Soft purple
            ];

            setCustomerActivityData({
                labels: Object.keys(sortedCategories),
                datasets: [{
                    label: 'Sales Amount',
                    data: Object.values(sortedCategories),
                    backgroundColor: categoryColors.slice(0, Object.keys(sortedCategories).length),
                    borderColor: categoryColors.slice(0, Object.keys(sortedCategories).length),
                    borderWidth: 1
                }]
            });

            // Set Top Products Chart Data
            setTopProductsData({
                labels: Object.keys(topProducts),
                datasets: [{
                    label: 'Sales Amount',
                    data: Object.values(topProducts),
                    backgroundColor: [
                        '#6050C5',   // Primary purple
                        '#7063C4',   // Secondary purple
                        '#B9B5F1',   // Light purple
                        '#7449A9',   // Dark purple
                        '#50368A',   // Deeper purple
                    ],
                    borderColor: [
                        '#6050C5',   // Primary purple
                        '#7063C4',   // Secondary purple
                        '#B9B5F1',   // Light purple
                        '#7449A9',   // Dark purple
                        '#50368A',   // Deeper purple
                    ],
                    borderWidth: 1
                }]
            });

            // Set cart analytics data
            setCartAnalytics(ordersData.cart_analytics || {
                total_carts: 0,
                completed_orders: 0,
                abandoned_carts: 0,
                abandonment_rate: 0
            });
            setCartAbandonmentRate((ordersData.cart_analytics?.abandonment_rate || 0) / 100);

            // Set Ratings Distribution Chart Data
            if (ordersData.ratings_distribution) {
                setRatingsData({
                    labels: ['1★', '2★', '3★', '4★', '5★'],
                    datasets: [{
                        label: 'Number of Reviews',
                        data: Object.values(ordersData.ratings_distribution),
                        backgroundColor: [
                            '#FF6B6B',   // Red for 1 star
                            '#FFA07A',   // Light salmon for 2 stars
                            '#B9B5F1',   // Light purple for 3 stars
                            '#7063C4',   // Medium purple for 4 stars
                            '#6050C5',   // Primary purple for 5 stars
                        ],
                        borderColor: [
                            '#FF6B6B',
                            '#FFA07A',
                            '#B9B5F1',
                            '#7063C4',
                            '#6050C5',
                        ],
                        borderWidth: 1
                    }]
                });
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error(error.message || 'Error loading dashboard data');
            setCartAbandonmentRate(0);
            setCartAnalytics({
                total_carts: 0,
                completed_orders: 0,
                abandoned_carts: 0,
                abandonment_rate: 0
            });
            // Set default values in case of error
            setStats([
        {
            name: 'Total Sales',
                    value: '$0.00',
            icon: CurrencyDollarIcon,
                    change: '0%',
            changeType: 'increase'
        },
        {
                    name: 'Products Ordered',
                    value: '0',
            icon: ShoppingBagIcon,
                    change: '0 unique products',
            changeType: 'increase'
        },
        {
                    name: 'Active Customers',
                    value: '0',
            icon: UserGroupIcon,
                    change: '0 unique customers',
            changeType: 'increase'
        },
        {
                    name: 'Total Orders',
                    value: '0',
            icon: StarIcon,
                    change: '0%',
            changeType: 'increase'
                }
            ]);
            setRecentOrders([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats?.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200"
                    >
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                                <stat.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {stat.name}
                                </p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span
                                className={`text-sm font-medium ${
                                    stat.changeType === 'increase'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                }`}
                            >
                                {stat.change}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400"> vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Sales Trend Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 h-[350px] flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center">
                        {salesChartData && (
                            <Line options={lineChartOptions} data={salesChartData} />
                        )}
                    </div>
                </div>

                {/* Order Status Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 h-[350px] flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center">
                        {orderStatusData && (
                            <Doughnut options={doughnutChartOptions} data={orderStatusData} />
                        )}
                    </div>
                </div>

                {/* Sales by Category Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 h-[350px] flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center">
                        {customerActivityData && (
                            <Bar options={barChartOptions} data={customerActivityData} />
                        )}
                    </div>
                </div>

                {/* Top-Selling Products Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 h-[350px] flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center">
                        {topProductsData && (
                            <Bar options={topProductsOptions} data={topProductsData} />
                        )}
                    </div>
                </div>

                {/* Cart Abandonment Rate Gauge */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 h-[350px] flex flex-col items-center justify-center">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Cart Abandonment Rate
                    </h2>
                    <div className="w-full max-w-md">
                        <GaugeChart
                            id="cart-abandonment-gauge"
                            nrOfLevels={3}
                            colors={['#6050C5', '#B9B5F1', '#FFB4A2']}
                            percent={cartAbandonmentRate}
                            formatTextValue={value => `${value}%`}
                            textColor={'#6B7280'}
                            needleColor={'#6050C5'}
                            needleBaseColor={'#6050C5'}
                            animate={false}
                            cornerRadius={3}
                            arcsLength={[0.3, 0.3, 0.4]}
                        />
                    </div>
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Based on the last 30 days of data
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Total Carts</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {cartAnalytics.total_carts}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Abandoned Carts</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {cartAnalytics.abandoned_carts}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ratings Distribution Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 h-[350px] flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center">
                        {ratingsData && (
                            <Bar options={ratingsChartOptions} data={ratingsData} />
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-200">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h2>
                </div>
                <TableScrollbar>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Order #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {[...recentOrders]
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                .map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            #{order.order_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {order.user.first_name} {order.user.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                order.status === 'delivered' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : order.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : order.status === 'processing'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : order.status === 'shipped'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            ${Number(order.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </TableScrollbar>
            </div>
        </div>
    );
};

export default DashboardHome; 