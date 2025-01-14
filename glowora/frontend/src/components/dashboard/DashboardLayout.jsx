import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { isDarkMode } = useTheme();

    return (
        <div className={`${isDarkMode ? 'dark' : ''}`}>
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
                {/* Sidebar */}
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

                {/* Main Content */}
                <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    
                    {/* Main Content Area */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6 transition-colors duration-200">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout; 