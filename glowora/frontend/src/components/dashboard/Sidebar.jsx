import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    HomeIcon,
    ShoppingBagIcon,
    FolderIcon,
    ShoppingCartIcon,
    StarIcon,
    UsersIcon,
    ChartBarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TicketIcon,
    ChatBubbleLeftRightIcon,
    BellIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
        { name: 'Categories', href: '/admin/categories', icon: FolderIcon },
        { name: 'Coupons', href: '/admin/coupons', icon: TicketIcon },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
        { name: 'Reviews', href: '/admin/reviews', icon: StarIcon },
        { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
        { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
    ];

    const isActiveLink = (path) => location.pathname === path;

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-20 flex flex-col bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 ${
                isOpen ? 'w-64' : 'w-20'
            }`}
        >
            {/* Logo section */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                {isOpen ? (
                    <>
                        <img 
                            src="/img/logo_admin.png" 
                            alt="Glowora Admin" 
                            className="h-10"
                        />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Collapse Sidebar"
                        >
                            <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                    </>
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <img 
                            src="/img/favicon.png" 
                            alt="G" 
                            className="h-8 w-8"
                        />
                        <button
                            onClick={() => setIsOpen(true)}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Expand Sidebar"
                        >
                            <ChevronRightIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4">
                <div className="px-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`${
                                isActiveLink(item.href)
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            } group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                !isOpen && 'justify-center'
                            }`}
                            title={item.name}
                        >
                            <item.icon className={`h-6 w-6 flex-shrink-0 ${!isOpen ? 'mx-auto' : 'mr-3'}`} />
                            {isOpen && <span>{item.name}</span>}
                        </Link>
                    ))}
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar; 