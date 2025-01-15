import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/20/solid';
import LoadingScreen from '../../../components/LoadingScreen';

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useAuth();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        fragrance_notes: '',
        burn_time: '',
        price: '',
        stock_quantity: '',
        category_id: '',
        images: []
    });
    const [categories, setCategories] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (token) {
            fetchCategories();
            if (isEditing) {
                fetchProduct();
            }
        }
    }, [id, token]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/categories`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error(error.response?.data?.message || 'Error loading categories');
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/products/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
    
            if (response.data.success) {
                const product = response.data.data;
                setFormData({
                    name: product.name,
                    description: product.description,
                    fragrance_notes: product.fragrance_notes || '',
                    burn_time: product.burn_time || '',
                    price: product.price,
                    stock_quantity: product.stock_quantity,
                    category_id: product.category.id, 
                    images: []
                });
                if (product.images && product.images.length > 0) {
                    setImagePreviews(product.images.map(img => ({
                        id: img.id,
                        url: img.image_url,
                        is_primary: img.is_primary
                    })));
                }
            } else {
                throw new Error(response.data.message || 'Failed to fetch product');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error(error.response?.data?.message || 'Error loading product');
            navigate('/admin/products');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...files]
            }));
            
            // Create preview URLs for new images
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, {
                        url: reader.result,
                        file: file,
                        is_primary: prev.length === 0 // First image is primary by default
                    }]);
                };
                reader.readAsDataURL(file);
            });

            // Clear image error if exists
            if (errors.images) {
                setErrors(prev => ({
                    ...prev,
                    images: null
                }));
            }
        }
    };

    const handleRemoveImage = async (index) => {
        const imageToRemove = imagePreviews[index];
        
        if (imageToRemove.id) {
            try {
                const response = await axios.delete(
                    `${import.meta.env.VITE_API_URL}/api/products/${id}/images/${imageToRemove.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    }
                );
                
                if (response.data.success) {
                    setImagePreviews(prev => {
                        const newPreviews = prev.filter((_, i) => i !== index);
                        if (imageToRemove.is_primary && newPreviews.length > 0) {
                            newPreviews[0].is_primary = true;
                            updatePrimaryImage(newPreviews[0].id);
                        }
                        return newPreviews;
                    });

                    setFormData(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                    }));

                    toast.success('🖼️ Image removed successfully', {
                        position: "top-right",
                        autoClose: 2000
                    });
                    
                    await fetchProduct();
                } else {
                    toast.error('❌ Failed to remove image', {
                        position: "top-right",
                        autoClose: 3000
                    });
                }
            } catch (error) {
                console.error('Error removing image:', error);
                if (error.response?.status === 404) {
                    setImagePreviews(prev => prev.filter((_, i) => i !== index));
                    toast.warning('⚠️ Image was already removed', {
                        position: "top-right",
                        autoClose: 3000
                    });
                    await fetchProduct();
                } else {
                    toast.error(`❌ ${error.response?.data?.message || 'Error removing image'}`, {
                        position: "top-right",
                        autoClose: 3000
                    });
                }
            }
        } else {
            setImagePreviews(prev => {
                const newPreviews = prev.filter((_, i) => i !== index);
                if (imageToRemove.is_primary && newPreviews.length > 0) {
                    newPreviews[0].is_primary = true;
                }
                return newPreviews;
            });

            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));

            toast.info('🗑️ Image removed from selection', {
                position: "top-right",
                autoClose: 2000
            });
        }
    };

    const updatePrimaryImage = async (imageId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/products/${id}/images/${imageId}/primary`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
        } catch (error) {
            console.error('Error updating primary image:', error);
            toast.error('Failed to update primary image');
        }
    };

    const handleSetPrimaryImage = async (index) => {
        const imageToSetPrimary = imagePreviews[index];
        
        if (imageToSetPrimary.id) {
            try {
                const response = await axios.patch(
                    `${import.meta.env.VITE_API_URL}/api/products/${id}/images/${imageToSetPrimary.id}/primary`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    }
                );

                if (response.data.success) {
                    setImagePreviews(prev => prev.map((preview, i) => ({
                        ...preview,
                        is_primary: i === index
                    })));
                    toast.success('⭐ Primary image updated successfully', {
                        position: "top-right",
                        autoClose: 2000
                    });
                    await fetchProduct();
                } else {
                    toast.error('❌ Failed to update primary image', {
                        position: "top-right",
                        autoClose: 3000
                    });
                }
            } catch (error) {
                console.error('Error updating primary image:', error);
                toast.error(`❌ ${error.response?.data?.message || 'Failed to update primary image'}`, {
                    position: "top-right",
                    autoClose: 3000
                });
            }
        } else {
            setImagePreviews(prev => prev.map((preview, i) => ({
                ...preview,
                is_primary: i === index
            })));
            toast.info('⭐ Set as primary image', {
                position: "top-right",
                autoClose: 2000
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
    
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('fragrance_notes', formData.fragrance_notes);
            formDataToSend.append('burn_time', formData.burn_time);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('stock_quantity', formData.stock_quantity);
            formDataToSend.append('category_id', formData.category_id);
            
            // Handle new images
            formData.images.forEach((file, index) => {
                formDataToSend.append('images[]', file);
            });

            // Handle existing images
            const existingImages = imagePreviews
                .filter(preview => preview.id)
                .map(preview => ({
                    id: preview.id,
                    is_primary: preview.is_primary ? 1 : 0
                }));
    
            if (existingImages.length > 0) {
                formDataToSend.append('existing_images', JSON.stringify(existingImages));
            }
    
            if (isEditing) {
                formDataToSend.append('_method', 'PUT');
            }
    
            const url = `${import.meta.env.VITE_API_URL}/api/products${isEditing ? `/${id}` : ''}`;
    
            const response = await axios({
                method: 'POST',
                url,
                data: formDataToSend,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            if (response.data.success) {
                toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully`);
                navigate('/admin/products');
            } else {
                throw new Error(response.data.message || 'Error saving product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                setErrors(validationErrors);
                
                const firstError = Object.values(validationErrors)[0];
                toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                toast.error(error.response?.data?.message || error.message || 'Error saving product');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen text="Saving Product..." />;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 transition-colors duration-200">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Product Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                        </label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            required
                        />
                        {errors.price && (
                            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Stock Quantity
                        </label>
                        <input
                            type="number"
                            name="stock_quantity"
                            value={formData.stock_quantity}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            required
                        />
                        {errors.stock_quantity && (
                            <p className="mt-1 text-sm text-red-600">{errors.stock_quantity}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fragrance Notes
                        </label>
                        <input
                            type="text"
                            name="fragrance_notes"
                            value={formData.fragrance_notes}
                            onChange={handleChange}
                            placeholder="e.g., Vanilla, Lavender, Citrus"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        />
                        {errors.fragrance_notes && (
                            <p className="mt-1 text-sm text-red-600">{errors.fragrance_notes}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Burn Time
                        </label>
                        <input
                            type="text"
                            name="burn_time"
                            value={formData.burn_time}
                            onChange={handleChange}
                            placeholder="e.g., 30-40 hours"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        />
                        {errors.burn_time && (
                            <p className="mt-1 text-sm text-red-600">{errors.burn_time}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            required
                        ></textarea>
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Product Images
                        </label>
                        <div className="mt-1 space-y-4">
                            <div className="flex flex-wrap gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview.url}
                                            alt={`Preview ${index + 1}`}
                                            className={`h-32 w-32 object-cover rounded-lg ${
                                                preview.is_primary ? 'ring-2 ring-primary-500' : ''
                                            }`}
                                        />
                                        <div className="absolute top-2 right-2 flex space-x-1">
                                            <button
                                                type="button"
                                                onClick={() => handleSetPrimaryImage(index)}
                                                className={`p-1 rounded-full ${
                                                    preview.is_primary
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-white text-gray-600'
                                                } hover:bg-primary-600 hover:text-white`}
                                                title={preview.is_primary ? 'Primary Image' : 'Set as Primary'}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <input
                                type="file"
                                name="images"
                                onChange={handleImageChange}
                                accept="image/*"
                                multiple
                                className="w-full text-sm text-gray-500 dark:text-gray-300
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-primary-50 file:text-primary-700
                                    dark:file:bg-primary-900 dark:file:text-primary-200
                                    hover:file:bg-primary-100 dark:hover:file:bg-primary-800"
                            />
                        </div>
                        {errors.images && (
                            <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                        )}
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Upload multiple product images. The first image will be set as primary by default.
                            Click the star icon to set a different primary image.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="ml-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-iris text-white px-4 py-2 rounded-md hover:bg-iris-600 transition-colors duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm; 