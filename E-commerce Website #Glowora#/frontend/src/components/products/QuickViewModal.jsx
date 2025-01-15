import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import PropTypes from 'prop-types';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';

const QuickViewModal = ({ isOpen, onClose, product }) => {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (product) {
            setSelectedImage(null);
            setQuantity(1);
        }
    }, [product]);

    if (!product) return null;

    // Set the initial selected image to the primary image or the first image
    const currentImage = selectedImage || 
        (product.images && product.images.length > 0
            ? (product.images.find(img => img.is_primary)?.url || product.images[0].url)
            : product.image_url);

    const handleWishlistClick = () => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
        onClose();
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform rounded-2xl bg-white shadow-xl transition-all max-w-4xl w-full max-h-[90vh] overflow-hidden">
                                <div className="absolute right-4 top-4 z-10">
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500 transition-colors"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                                    {/* Product Images Section */}
                                    <div className="space-y-6 p-6 overflow-y-auto">
                                        {/* Main Image */}
                                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={currentImage}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {/* Thumbnail Gallery */}
                                        {product.images && product.images.length > 1 && (
                                            <div className="flex justify-center">
                                                <div className="grid grid-flow-col gap-4 auto-cols-max">
                                                    {product.images
                                                        .filter(image => image.url !== currentImage)
                                                        .slice(0, 3)
                                                        .map((image) => (
                                                            <button
                                                                key={image.id}
                                                                onClick={() => setSelectedImage(image.url)}
                                                                className="flex-shrink-0 w-28 h-28 rounded-md overflow-hidden border-2 border-transparent transition-colors hover:border-iris"
                                                            >
                                                                <img
                                                                    src={image.url}
                                                                    alt={`${product.name} view`}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details Section */}
                                    <div className="overflow-y-auto max-h-[90vh]">
                                        <div className="p-6 md:p-8">
                                            <div className="mb-4">
                                                <Dialog.Title as="h3" className="text-2xl font-medium text-gray-900 mb-2">
                                                    {product.name}
                                                </Dialog.Title>
                                                <p className="text-sm text-gray-500">
                                                    {product.category}
                                                </p>
                                            </div>

                                            <div className="space-y-4 mb-6">
                                                <p className="text-gray-600">
                                                    {product.description}
                                                </p>
                                                {product.fragrance_notes && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                                                            Fragrance Notes
                                                        </h4>
                                                        <p className="text-gray-600">
                                                            {product.fragrance_notes}
                                                        </p>
                                                    </div>
                                                )}
                                                {product.burn_time && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                                                            Burn Time
                                                        </h4>
                                                        <p className="text-gray-600">
                                                            {product.burn_time}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Price and Actions */}
                                            <div className="space-y-4 mb-8">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-2xl font-semibold text-gray-900">
                                                        ${product.price}
                                                    </span>
                                                    <button
                                                        onClick={handleWishlistClick}
                                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                    >
                                                        {isInWishlist(product.id) ? (
                                                            <HeartIconSolid className="w-6 h-6 text-red-500" />
                                                        ) : (
                                                            <HeartIcon className="w-6 h-6 text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Quantity Selector */}
                                                <div className="flex items-center space-x-4">
                                                    <label htmlFor="quantity" className="text-sm font-medium text-gray-900">
                                                        Quantity
                                                    </label>
                                                    <select
                                                        id="quantity"
                                                        value={quantity}
                                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                                        className="rounded-full border-gray-200 text-gray-900 focus:ring-iris focus:border-iris"
                                                    >
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                                            <option key={num} value={num}>
                                                                {num}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Add to Cart Button */}
                                                <button
                                                    onClick={handleAddToCart}
                                                    className="w-full btn-primary py-3 text-base"
                                                >
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

QuickViewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    product: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        image_url: PropTypes.string.isRequired,
        images: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            url: PropTypes.string.isRequired,
            is_primary: PropTypes.bool
        })).isRequired,
        category: PropTypes.string.isRequired,
        description: PropTypes.string,
        fragrance_notes: PropTypes.string,
        burn_time: PropTypes.string,
    }),
};

export default QuickViewModal;