import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
    CalendarIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const SalesReport = () => {
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState(new Date());
    const [salesData, setSalesData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSalesReport();
    }, [startDate, endDate]);

    const fetchSalesReport = async () => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/analytics/sales-report?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSalesData(data);
        } catch (error) {
            console.error('Error fetching sales report:', error);
            toast.error('Failed to load sales report');
        } finally {
            setLoading(false);
        }
    };

    const chartData = {
        labels: salesData?.map(item => item.date) || [],
        datasets: [
            {
                label: 'Revenue',
                data: salesData?.map(item => item.revenue) || [],
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.4,
            },
            {
                label: 'Orders',
                data: salesData?.map(item => item.order_count) || [],
                borderColor: 'rgb(16, 185, 129)',
                tension: 0.4,
            }
        ]
    };

    const downloadReport = () => {
        // Convert data to CSV
        const headers = ['Date', 'Orders', 'Revenue', 'Average Order Value'];
        const csvData = salesData.map(row => [
            row.date,
            row.order_count,
            row.revenue.toFixed(2),
            row.average_order_value.toFixed(2)
        ]);
        
        const csvContent = [headers, ...csvData]
            .map(row => row.join(','))
            .join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (loading || !salesData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Sales Report</h1>
                <button
                    onClick={downloadReport}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download Report
                </button>
            </div>

            {/* Date Range Picker */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <DatePicker
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            className="px-3 py-2 border rounded-md"
                        />
                    </div>
                    <span className="text-gray-500">to</span>
                    <DatePicker
                        selected={endDate}
                        onChange={date => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        className="px-3 py-2 border rounded-md"
                    />
                </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
                <Line 
                    data={chartData}
                    options={{
                        responsive: true,
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }}
                />
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Order Value</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {salesData.map((row, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(row.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {row.order_count}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${row.revenue.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${row.average_order_value.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesReport; 