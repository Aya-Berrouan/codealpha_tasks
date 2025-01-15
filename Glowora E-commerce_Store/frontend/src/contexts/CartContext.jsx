import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartContext = createContext();
const apiUrl = import.meta.env.VITE_API_URL;

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, token } = useAuth();
    const navigate = useNavigate();

    // Fetch cart items when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchCartItems();
        } else {
            setCartItems([]);
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchCartItems = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCartItems(data);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            toast.error('Failed to load cart items');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        if (!isAuthenticated) {
            navigate('/login');
            return false;
        }

        try {
            let requestData;
            if (product.is_custom) {
                requestData = {
                    custom_candle: {
                        name: product.name,
                        price: product.price,
                        description: product.description || '',
                        image_url: product.image_url || '',
                        scent_name: product.custom_details.scent.name,
                        jar_style: product.custom_details.jar.name,
                        custom_label: product.custom_details.label || '',
                        custom_details: product.custom_details
                    },
                    quantity
                };
            } else {
                requestData = {
                    product_id: product.id,
                    quantity
                };
            }

            console.log('Sending request to add to cart:', requestData);

            const response = await fetch(`${apiUrl}/api/cart`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error response:', errorData);
                throw new Error(errorData.error || errorData.message || 'Failed to add item to cart');
            }

            await fetchCartItems();
            toast.success('Item added to cart successfully');
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error(error.message || 'Failed to add item to cart');
            return false;
        }
    };

    const updateQuantity = async (cartId, quantity) => {
        if (!isAuthenticated) {
            navigate('/login');
            return false;
        }

        try {
            const response = await fetch(`${apiUrl}/api/cart/${cartId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ quantity })
            });

            if (response.ok) {
                await fetchCartItems();
                toast.success('Cart updated');
                return true;
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to update cart');
                return false;
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error('Failed to update cart');
            return false;
        }
    };

    const removeFromCart = async (cartId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return false;
        }

        try {
            const response = await fetch(`${apiUrl}/api/cart/${cartId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                await fetchCartItems();
                toast.success('Item removed from cart');
                return true;
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to remove item from cart');
                return false;
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error('Failed to remove item from cart');
            return false;
        }
    };

    const clearCart = async (silent = false) => {
        if (!isAuthenticated) {
            navigate('/login');
            return false;
        }

        try {
            await axios.delete(`${apiUrl}/api/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            setCartItems([]);
            if (!silent) {
                toast.success('Cart cleared successfully');
            }
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            if (!silent) {
                toast.error('Failed to clear cart');
            }
            return false;
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const itemPrice = item.type === 'custom_candle' ? 
                Number(item.custom_candle.price) : 
                Number(item.product.price);
            return total + (itemPrice * item.quantity);
        }, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const value = {
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

CartProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useCart() {
    return useContext(CartContext);
} 