import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ShoppingBagIcon, 
    UserIcon, 
    CheckCircleIcon, 
    ExclamationCircleIcon,
    BellIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import LoadingScreen from '../../../components/LoadingScreen';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/notifications`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
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
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/admin/notifications/${notificationId}/read`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
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
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/admin/notifications/mark-all-read`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (response.data.success) {
                setNotifications(notifications.map(notif => ({ ...notif, read: true })));
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/admin/notifications/${notificationId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (response.data.success) {
                setNotifications(notifications.filter(notif => notif.id !== notificationId));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.read) {
                await markAsRead(notification.id);
            }
            
            if (notification.type === 'order' && notification.data?.order_id) {
                navigate(`/admin/orders/${notification.data.order_id}`);
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Refresh notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'read') return notification.read;
        return true;
    });

    if (loading) {
        return <LoadingScreen text="Loading notifications..." />;
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Notifications</h1>
                <div className="flex items-center space-x-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">All Notifications</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 text-sm font-medium text-white bg-iris rounded-lg hover:bg-iris-600 transition-colors duration-200"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                {filteredNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredNotifications.map((notification) => {
                            const NotificationIcon = getNotificationIcon(notification.type);
                            return (
                                <div
                                    key={notification.id}
                                    className={`p-4 flex items-start space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                                >
                                    <NotificationIcon
                                        className={`h-6 w-6 ${
                                            !notification.read ? 'text-blue-500' : 'text-gray-400'
                                        }`}
                                    />
                                    <div 
                                        className="flex-1 cursor-pointer"
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <p className={`text-sm ${
                                            !notification.read
                                                ? 'text-gray-900 dark:text-white font-medium'
                                                : 'text-gray-600 dark:text-gray-300'
                                        }`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        title="Delete notification"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No notifications found
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage; 