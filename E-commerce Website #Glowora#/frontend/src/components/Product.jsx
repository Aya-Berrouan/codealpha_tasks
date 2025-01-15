import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const Product = ({ product }) => {
    const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const inWishlist = isInWishlist(product.id);

    const handleWishlistClick = async (e) => {
        e.preventDefault();
        if (inWishlist) {
            await removeFromWishlist(product.id);
        } else {
            await addToWishlist(product);
        }
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        await addToCart(product);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <Link to={`/product/${product.id}`} className="block relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />
                <button
                    onClick={handleWishlistClick}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors duration-200"
                >
                    {inWishlist ? (
                        <FaHeart className="text-red-500 text-xl" />
                    ) : (
                        <FaRegHeart className="text-gray-500 text-xl" />
                    )}
                </button>
            </Link>
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">
                        ${Number(product.price).toFixed(2)}
                    </span>
                    <button
                        onClick={handleAddToCart}
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Product; 