import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/20/solid';
import LoadingScreen from '../../../components/LoadingScreen';

const CategoryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useAuth();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: null,
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditing) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/categories/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            const data = response.data;
            setFormData({
                name: data.name,
                description: data.description,
                icon: null,
                image: null
            });
            
            // Set image preview if image exists
            if (data.image_url) {
                setImagePreview(data.image_url);
            }
            // Set icon preview if icon exists
            if (data.icon_url) {
                setIconPreview(data.icon_url);
            }
        } catch (error) {
            console.error('Error fetching category:', error);
            toast.error('Error loading category');
            navigate('/admin/categories');
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
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Clear image error if exists
            if (errors.image) {
                setErrors(prev => ({
                    ...prev,
                    image: null
                }));
            }
        }
    };

    const handleIconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                icon: file
            }));
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setIconPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Clear icon error if exists
            if (errors.icon) {
                setErrors(prev => ({
                    ...prev,
                    icon: null
                }));
            }
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
            
            // Only append image if it's a new file
            if (formData.image instanceof File) {
                formDataToSend.append('image', formData.image);
            }

            // Only append icon if it's a new file
            if (formData.icon instanceof File) {
                formDataToSend.append('icon', formData.icon);
            }

            const url = `${import.meta.env.VITE_API_URL}/api/categories${isEditing ? `/${id}` : ''}`;

            // For updates, we need to use POST with _method=PUT
            if (isEditing) {
                formDataToSend.append('_method', 'PUT');
            }

            console.log('Submitting form data:', {
                url,
                method: isEditing ? 'POST (with _method=PUT)' : 'POST',
                formData: Object.fromEntries(formDataToSend.entries())
            });

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

            console.log('Response:', response.data);

            if (response.data.success) {
                toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully`);
                navigate('/admin/categories');
            } else {
                throw new Error(response.data.message || 'Error saving category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                setErrors(validationErrors);
                
                // Show the first validation error message
                const firstError = Object.values(validationErrors)[0];
                toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                toast.error(error.response?.data?.message || error.message || 'Error saving category');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen text="Saving Category..." />;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {isEditing ? 'Edit Category' : 'Add New Category'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 transition-colors duration-200">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Icon Image
                        </label>
                        <input
                            type="file"
                            name="icon"
                            id="icon"
                            onChange={handleIconChange}
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary-50 file:text-primary-700
                                dark:file:bg-primary-900 dark:file:text-primary-200
                                hover:file:bg-primary-100 dark:hover:file:bg-primary-800"
                        />
                        {iconPreview && (
                            <div className="mt-2 relative inline-block">
                                <img
                                    src={iconPreview}
                                    alt="Icon preview"
                                    className="h-16 w-16 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, icon: null }));
                                        setIconPreview(null);
                                    }}
                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Description
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Cover Image
                        </label>
                        <input
                            type="file"
                            name="image"
                            id="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary-50 file:text-primary-700
                                dark:file:bg-primary-900 dark:file:text-primary-200
                                hover:file:bg-primary-100 dark:hover:file:bg-primary-800"
                        />
                        {imagePreview && (
                            <div className="mt-2 relative inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Cover preview"
                                    className="h-24 w-24 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, image: null }));
                                        setImagePreview(null);
                                    }}
                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/categories')}
                            className="ml-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-iris text-white px-4 py-2 rounded-md hover:bg-iris-600 transition-colors duration-200"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm; 