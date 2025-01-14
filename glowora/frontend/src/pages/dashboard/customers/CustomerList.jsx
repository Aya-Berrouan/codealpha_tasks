import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EyeIcon,
    TrashIcon,
    UserCircleIcon,
    PencilIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import TableScrollbar from '../../../components/TableScrollbar';
import LoadingScreen from '../../../components/LoadingScreen';

const CustomerStatusBadge = ({ status = 'inactive' }) => {
    const statusClasses = {
        active: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400',
        inactive: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400',
        pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
    };

    const validStatus = status?.toLowerCase() || 'inactive';

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[validStatus] || statusClasses.inactive} transition-colors duration-200`}>
            {validStatus.charAt(0).toUpperCase() + validStatus.slice(1)}
        </span>
    );
};

const CustomerList = () => {
    const [allCustomers, setAllCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchCustomers();
    }, []); // Only fetch once when component mounts

    // Filter and sort customers whenever search term or sort options change
    useEffect(() => {
        filterAndSortCustomers();
    }, [searchTerm, sortBy, sortOrder, allCustomers]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                setLoading(false);
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users?role=customer`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok && data.data) {
                const customersWithStatus = data.data.map(customer => ({
                    ...customer,
                    status: 'active' // Default status
                }));
                setAllCustomers(customersWithStatus);
                filterAndSortCustomers(customersWithStatus);
            } else {
                console.error('API Error:', data);
                toast.error(data.message || 'Failed to load customers');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Error loading customers: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortCustomers = (customers = allCustomers) => {
        let filtered = [...customers];

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(customer => 
                customer.first_name?.toLowerCase().includes(searchLower) ||
                customer.last_name?.toLowerCase().includes(searchLower) ||
                customer.email?.toLowerCase().includes(searchLower) ||
                customer.phone?.toLowerCase().includes(searchLower)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'first_name':
                    comparison = a.first_name.localeCompare(b.first_name);
                    break;
                case 'created_at':
                    comparison = new Date(a.created_at) - new Date(b.created_at);
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });

        setFilteredCustomers(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    };

    // Get current page items
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredCustomers.slice(startIndex, endIndex);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    toast.success('Customer deleted successfully');
                    fetchCustomers();
                } else {
                    toast.error(data.message || 'Error deleting customer');
                }
            } catch (error) {
                console.error('Error deleting customer:', error);
                toast.error('Error deleting customer');
            }
        }
    };

    if (loading) {
        return <LoadingScreen text="Loading customers..." />;
    }

    return (
        <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Customers</h1>
                <Link
                    to="/admin/customers/create"
                    className="px-4 py-2 bg-iris text-white rounded-md hover:bg-iris-600 transition-colors duration-200"
                >
                    Add Customer
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 transition-colors duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-iris focus:border-iris dark:focus:ring-iris dark:focus:border-iris transition-colors duration-200"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
                    </div>

                    {/* Sort */}
                    <div>
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-iris focus:border-iris dark:focus:ring-iris dark:focus:border-iris transition-colors duration-200"
                        >
                            <option value="created_at-desc">Newest First</option>
                            <option value="created_at-asc">Oldest First</option>
                            <option value="first_name-asc">Name A-Z</option>
                            <option value="first_name-desc">Name Z-A</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <TableScrollbar>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                    Customer
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                    Contact
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                    Joined Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {getCurrentPageItems().map((customer) => (
                                <tr key={customer.id || customer.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {customer.avatar ? (
                                                    <img 
                                                        src={`${import.meta.env.VITE_API_URL}/storage/${customer.avatar}`}
                                                        alt={`${customer.first_name} ${customer.last_name}`}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                                                        }}
                                                    />
                                                ) : (
                                                    <UserCircleIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {customer.first_name} {customer.last_name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {customer.role}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">{customer.email}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone || 'No phone'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <CustomerStatusBadge status={customer.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex space-x-3 justify-end">
                                            <Link
                                                to={`/admin/customers/edit/${customer.id || customer.user_id}`}
                                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(customer.id || customer.user_id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableScrollbar>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-iris rounded-md disabled:opacity-50 text-iris hover:bg-iris hover:text-white dark:text-iris dark:hover:text-white transition-colors duration-200"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-iris rounded-md disabled:opacity-50 text-iris hover:bg-iris hover:text-white dark:text-iris dark:hover:text-white transition-colors duration-200"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerList; 