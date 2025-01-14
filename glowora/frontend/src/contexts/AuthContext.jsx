import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (token) {
            checkAuthStatus();
        } else {
            setLoading(false);
            setIsAuthenticated(false);
        }
    }, [token]);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/user`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
                setIsAuthenticated(true);
            } else {
                setToken(null);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setToken(null);
            localStorage.removeItem('token');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch(`${apiUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (response.ok) {
                setUser(data.user);
                setToken(data.token);
                setIsAuthenticated(true);
                localStorage.setItem('token', data.token);
                return { 
                    success: true,
                    isAdmin: data.user.role === 'admin'
                };
            } else {
                return { 
                    success: false, 
                    error: data.message || 'Invalid credentials'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: 'An unexpected error occurred'
            };
        }
    };

    const register = async (userData) => {
        try {
            // Validate required fields
            if (!userData.first_name?.trim() || !userData.last_name?.trim() || !userData.email?.trim() || !userData.password || !userData.password_confirmation) {
                return {
                    success: false,
                    errors: {
                        general: 'All fields are required'
                    }
                };
            }

            // Create registration data
            const registrationData = {
                first_name: userData.first_name.trim(),
                last_name: userData.last_name.trim(),
                email: userData.email.trim().toLowerCase(),
                password: userData.password,
                password_confirmation: userData.password_confirmation
            };

            console.log('Sending registration data:', registrationData);

            const response = await fetch(`${apiUrl}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(registrationData)
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (response.ok) {
                // Don't automatically log in the user
                return { success: true };
            } else {
                if (data.errors) {
                    return { 
                        success: false, 
                        errors: data.errors 
                    };
                } else {
                    toast.error(data.message || 'Registration failed');
                    return { 
                        success: false, 
                        errors: { general: data.message || 'Registration failed' } 
                    };
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                errors: { general: 'Registration failed. Please try again.' } 
            };
        }
    };

    const logout = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setUser(null);
                setToken(null);
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                toast.success('Logged out successfully');
                return true;
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed. Please try again.');
        }
        return false;
    };

    const forgotPassword = async (email) => {
        try {
            const response = await fetch(`${apiUrl}/api/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true };
            } else {
                toast.error(data.message || 'Failed to send reset instructions');
                return { 
                    success: false, 
                    error: data.message || 'Failed to send reset instructions'
                };
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error('An unexpected error occurred');
            return { 
                success: false, 
                error: 'An unexpected error occurred'
            };
        }
    };

    const resetPassword = async (email, token, password, password_confirmation) => {
        try {
            const response = await fetch(`${apiUrl}/api/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    token,
                    password,
                    password_confirmation
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Password has been reset successfully');
                return { success: true };
            } else {
                toast.error(data.message || 'Failed to reset password');
                return { 
                    success: false, 
                    error: data.message || 'Failed to reset password'
                };
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error('An unexpected error occurred');
            return { 
                success: false, 
                error: 'An unexpected error occurred'
            };
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        token,
        isAuthenticated,
        isAdmin: user?.role === 'admin',
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 