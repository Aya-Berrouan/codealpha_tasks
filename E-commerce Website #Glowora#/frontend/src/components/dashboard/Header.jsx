import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    BellIcon, 
    UserCircleIcon, 
    ArrowRightOnRectangleIcon,
    SunIcon,
    MoonIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ShoppingBagIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Function to get user initials
    const getInitials = () => {
        const firstName = user?.first_name || '';
        const lastName = user?.last_name || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/notifications`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.success) {
                const formattedNotifications = response.data.data.map(notification => ({
                    id: notification.id,
                    type: notification.type,
                    message: notification.message,
                    time: new Date(notification.created_at).toLocaleString(),
                    read: notification.read,
                    icon: getNotificationIcon(notification.type),
                    data: notification.data
                }));
                setNotifications(formattedNotifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order':
                return ShoppingBagIcon;
            case 'user':
                return UserIcon;
            case 'success':
                return CheckCircleIcon;
            case 'alert':
                return ExclamationCircleIcon;
            default:
                return BellIcon;
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/notifications/${notificationId}/read`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.success) {
                setNotifications(notifications.map(notif => 
                    notif.id === notificationId ? { ...notif, read: true } : notif
                ));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/notifications/mark-all-read`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.success) {
                setNotifications(notifications.map(notif => ({ ...notif, read: true })));
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read first
            await markAsRead(notification.id);
            
            // Then navigate based on notification type
            if (notification.type === 'order' && notification.data?.order_id) {
                window.location.href = `/admin/orders/${notification.data.order_id}`;
            }
            setIsNotificationOpen(false);
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Set up polling for new notifications every 30 seconds
        const pollInterval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(pollInterval);
    }, []);

    useEffect(() => {
        // Update unread count
        setUnreadCount(notifications.filter(notif => !notif.read).length);
    }, [notifications]);

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 bg-white dark:bg-gray-800 shadow-sm px-6 transition-colors duration-200">
            {/* Left side */}
            <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="p-1 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                    title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {isDarkMode ? (
                        <SunIcon className="h-6 w-6" />
                    ) : (
                        <MoonIcon className="h-6 w-6" />
                    )}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button 
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="p-1 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 relative"
                    >
                        <BellIcon className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {isNotificationOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <>
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {notifications.slice(0, 2).map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                                                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                    }`}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <notification.icon className={`h-6 w-6 ${
                                                            !notification.read ? 'text-blue-500' : 'text-gray-400'
                                                        }`} />
                                                        <div className="flex-1">
                                                            <p className={`text-sm ${
                                                                !notification.read 
                                                                    ? 'text-gray-900 dark:text-white font-medium' 
                                                                    : 'text-gray-600 dark:text-gray-300'
                                                            }`}>
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {notification.time}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                            <Link
                                                to="/admin/notifications"
                                                className="text-sm text-center block w-full text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                                onClick={() => setIsNotificationOpen(false)}
                                            >
                                                {notifications.length > 2 ? `View all (${notifications.length})` : 'View all notifications'}
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                        No notifications
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button 
                        className="flex items-center space-x-2"
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    >
                        {user?.avatar ? (
                            <img 
                                src={`/storage/${user.avatar}`}
                                alt={`${user.first_name} ${user.last_name}`}
                                className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-700 shadow object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `http://localhost:8000/storage/${user.avatar}`;
                                }}
                            />
                        ) : (
                            <div 
                                className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-700 shadow flex items-center justify-center text-sm font-bold text-white"
                                style={{ backgroundColor: '#B9B5F1' }}
                            >
                                {getInitials()}
                            </div>
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {user?.first_name} {user?.last_name}
                        </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                            <Link
                                to="/admin/profile"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setIsProfileMenuOpen(false)}
                            >
                                <UserCircleIcon className="h-5 w-5 mr-2" />
                                Profile
                            </Link>
                            <button
                                onClick={() => {
                                    setIsProfileMenuOpen(false);
                                    logout();
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header; 