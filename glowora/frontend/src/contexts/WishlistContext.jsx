import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const WishlistContext = createContext();
const apiUrl = import.meta.env.VITE_API_URL;

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, token } = useAuth();
    const navigate = useNavigate();

    // Fetch wishlist items when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlistItems();
        } else {
            setWishlistItems([]);
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchWishlistItems = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/wishlist`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setWishlistItems(data);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            toast.error('Failed to load wishlist items');
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (product) => {
        if (!isAuthenticated) {
            navigate('/login');
            return false;
        }

        try {
            const response = await fetch(`${apiUrl}/api/wishlist`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ product_id: product.id })
            });

            if (response.ok) {
                await fetchWishlistItems();
                toast.success('Item added to wishlist');
                return true;
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to add item to wishlist');
                return false;
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            toast.error('Failed to add item to wishlist');
            return false;
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return false;
        }

        // Find the wishlist item with the matching product ID
        const wishlistItem = wishlistItems.find(item => item.product.id === productId);
        if (!wishlistItem) {
            return false;
        }

        try {
            const response = await fetch(`${apiUrl}/api/wishlist/${wishlistItem.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                await fetchWishlistItems();
                toast.success('Item removed from wishlist');
                return true;
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to remove item from wishlist');
                return false;
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove item from wishlist');
            return false;
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.product.id === productId);
    };

    const clearWishlist = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return false;
        }

        try {
            const response = await fetch(`${apiUrl}/api/wishlist`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                setWishlistItems([]);
                toast.success('Wishlist cleared');
                return true;
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to clear wishlist');
                return false;
            }
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            toast.error('Failed to clear wishlist');
            return false;
        }
    };

    const value = {
        wishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount: wishlistItems.length
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

export default WishlistContext; 