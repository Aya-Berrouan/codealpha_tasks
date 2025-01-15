const API_URL = 'http://localhost:8001';

const getCsrfToken = async () => {
    try {
        const response = await fetch(`${API_URL}/sanctum/csrf-cookie`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch CSRF token');
        }

        // Wait a moment for the cookie to be set
        await new Promise(resolve => setTimeout(resolve, 100));

        const token = getCookie('XSRF-TOKEN');
        if (!token) {
            throw new Error('CSRF token not found in cookies');
        }
        return token;
    } catch (error) {
        console.error('CSRF token error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        // Get CSRF token first
        const csrfToken = await getCsrfToken();

        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': decodeURIComponent(csrfToken),
            },
            credentials: 'include',
            body: JSON.stringify({
                name: userData.name,
                username: userData.username,
                email: userData.email,
                password: userData.password,
                password_confirmation: userData.password_confirmation,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 422) {
                throw new Error(Object.values(data.errors).flat().join('\n'));
            }
            throw new Error(data.message || 'Registration failed');
        }

        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const login = async (credentials) => {
    try {
        // Get CSRF token first
        const csrfToken = await getCsrfToken();

        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': decodeURIComponent(csrfToken),
            },
            credentials: 'include',
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 422) {
                throw new Error(Object.values(data.errors).flat().join('\n'));
            }
            throw new Error(data.message || 'Login failed');
        }

        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const checkAuthStatus = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }

        // Get CSRF token first
        const csrfToken = await getCsrfToken();

        const response = await fetch(`${API_URL}/api/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': `Bearer ${token}`,
                'X-XSRF-TOKEN': decodeURIComponent(csrfToken),
            },
            credentials: 'include',
        });

        return response.ok;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
};

export const logout = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Check if user is logged in
        const isLoggedIn = await checkAuthStatus();
        if (!isLoggedIn) {
            localStorage.removeItem('token');
            throw new Error('Not logged in');
        }

        // Get CSRF token first
        const csrfToken = await getCsrfToken();

        const response = await fetch(`${API_URL}/api/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': `Bearer ${token}`,
                'X-XSRF-TOKEN': decodeURIComponent(csrfToken),
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Logout failed');
        }

        localStorage.removeItem('token');
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

export const forgotPassword = async (email) => {
  try {
    // Get CSRF token first
    await getCsrfToken();

    const response = await fetch(`${API_URL}/api/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.email?.[0] || 'Failed to send reset email');
    }

    return data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

export const resetPassword = async (data) => {
  try {
    // Get CSRF token first
    await getCsrfToken();

    const response = await fetch(`${API_URL}/api/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || responseData.email?.[0] || 'Failed to reset password');
    }

    return responseData;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

// Helper function to get cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
} 