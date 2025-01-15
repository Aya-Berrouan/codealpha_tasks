import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Configure axios
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    // Fetch user data from backend
                    const response = await axios.get('http://localhost:8001/api/user');
                    if (response.data) {
                        setUser({ ...response.data, token });
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (userData) => {
        localStorage.setItem('token', userData.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        
        try {
            const response = await axios.get('http://localhost:8001/api/user');
            setUser({ ...response.data, token: userData.token });
        } catch (error) {
            console.error('Error fetching user data:', error);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 