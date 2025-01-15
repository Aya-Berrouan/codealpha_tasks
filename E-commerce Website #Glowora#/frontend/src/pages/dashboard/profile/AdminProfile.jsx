import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { LockClosedIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import ImageCropper from '../../../components/ImageCropper';

const AdminProfile = () => {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        current_password: '',
        new_password: '',
        confirm_password: '',
        profile_image: null
    });

    const [passwordErrors, setPasswordErrors] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    // Function to get user initials
    const getInitials = () => {
        const firstName = formData.first_name || user?.first_name || '';
        const lastName = formData.last_name || user?.last_name || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarUpdate = async (file) => {
        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Please select an image file');
            }

            // Validate file size (5MB max)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                throw new Error('Image size should be less than 5MB');
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const avatarData = new FormData();
            avatarData.append('avatar', file);

            console.log('Uploading avatar:', {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: avatarData
            });

            const data = await response.json();
            console.log('Avatar upload response:', data);

            if (!response.ok) {
                if (response.status === 422) {
                    const validationErrors = data.errors;
                    const firstError = Object.values(validationErrors)[0];
                    throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
                }
                throw new Error(data.message || 'Failed to update avatar');
            }

            toast.success('Avatar updated successfully');
            window.location.reload(); // Reload to show new avatar
        } catch (error) {
            console.error('Error updating avatar:', error);
            toast.error(error.message || 'Failed to update avatar');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            setShowCropper(true);
        }
    };

    const handleCropComplete = async (croppedImage) => {
        try {
            await handleAvatarUpdate(croppedImage);
            setShowCropper(false);
            setSelectedImage(null);
        } catch (error) {
            console.error('Error updating avatar:', error);
            toast.error(error.message || 'Failed to update avatar');
        }
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setSelectedImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Create JSON data for profile update
            const jsonData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone || ''
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422) {
                    const validationErrors = data.errors;
                    const firstError = Object.values(validationErrors)[0];
                    throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
                }
                throw new Error(data.message || 'Failed to update profile');
            }

            toast.success('Profile updated successfully');
            setIsEditing(false);

            // Update the user context if needed
            if (typeof window !== 'undefined') {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = {
                    ...currentUser,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.location.reload();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const validatePasswords = () => {
        const errors = {
            current_password: '',
            new_password: '',
            confirm_password: ''
        };
        
        if (!formData.current_password) {
            errors.current_password = 'Current password is required';
        }
        
        if (!formData.new_password) {
            errors.new_password = 'New password is required';
        } else if (formData.new_password.length < 8) {
            errors.new_password = 'Password must be at least 8 characters long';
        }
        
        if (!formData.confirm_password) {
            errors.confirm_password = 'Please confirm your new password';
        } else if (formData.new_password !== formData.confirm_password) {
            errors.confirm_password = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!validatePasswords()) {
            return;
        }

        setIsPasswordLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: formData.current_password,
                    password: formData.new_password,
                    password_confirmation: formData.confirm_password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422) {
                    const validationErrors = data.errors;
                    const newErrors = { ...passwordErrors };
                    
                    if (validationErrors.current_password) {
                        newErrors.current_password = validationErrors.current_password[0];
                    }
                    if (validationErrors.password) {
                        newErrors.new_password = validationErrors.password[0];
                    }
                    
                    setPasswordErrors(newErrors);
                    return;
                }
                throw new Error(data.message || 'Failed to update password');
            }

            toast.success('Password updated successfully');
            setIsChangingPassword(false);
            setPasswordErrors({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            
            // Reset password fields
            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                confirm_password: ''
            }));
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(error.message || 'Failed to update password');
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
    };

    const confirmDeleteAccount = () => {
        // TODO: Implement account deletion logic
        toast.success('Account deleted successfully');
        setShowDeleteModal(false);
        logout();
    };

    const toggle2FA = () => {
        setIs2FAEnabled(!is2FAEnabled);
        toast.success(`2FA ${!is2FAEnabled ? 'enabled' : 'disabled'} successfully`);
    };

    const handleEditClick = () => {
        setFormData(prev => ({
            ...prev,
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
            phone: user?.phone || ''
        }));
        setIsEditing(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center">
                        <div className="relative group">
                            {formData.profile_image ? (
                                <img
                                    src={URL.createObjectURL(formData.profile_image)}
                                    alt="Profile"
                                    className="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                                />
                            ) : user?.avatar ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/storage/${user.avatar}`}
                                    alt="Profile"
                                    className="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                                />
                            ) : (
                                <div 
                                    className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-700 shadow-lg flex items-center justify-center text-3xl font-bold text-white"
                                    style={{ backgroundColor: '#B9B5F1' }}
                                >
                                    {getInitials()}
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 bg-iris text-white rounded-full p-3 cursor-pointer shadow-lg hover:bg-iris-600 transition-colors">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </label>
                            {/* Image Upload Instructions */}
                            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Click to change profile picture
                            </div>
                        </div>
                        <div className="ml-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {user?.first_name} {user?.last_name}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">Administrator</p>
                            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
                            {formData.profile_image && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, profile_image: null }))}
                                    className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                >
                                    Remove new image
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Image Cropper Modal */}
                {showCropper && selectedImage && (
                    <ImageCropper
                        image={selectedImage}
                        onCropComplete={handleCropComplete}
                        onCancel={handleCropCancel}
                        cropShape="round"
                        aspect={1}
                    />
                )}

                {/* Account Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={handleEditClick}
                                    className="bg-iris text-white px-4 py-2 rounded-md hover:bg-iris-600 transition-colors duration-200"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 text-base rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-iris text-white px-4 py-2 rounded-md hover:bg-iris-600 transition-colors duration-200"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Security Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h2>
                    
                    {/* Password Change */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsChangingPassword(!isChangingPassword)}
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                            >
                                {isChangingPassword ? 'Cancel' : 'Change'}
                            </button>
                        </div>
                        {isChangingPassword && (
                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={formData.current_password}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-4 py-3 text-base rounded-md border ${
                                            passwordErrors.current_password 
                                                ? 'border-red-500 dark:border-red-500' 
                                                : 'border-gray-300 dark:border-gray-600'
                                        } dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500`}
                                    />
                                    {passwordErrors.current_password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {passwordErrors.current_password}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="new_password"
                                        value={formData.new_password}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-4 py-3 text-base rounded-md border ${
                                            passwordErrors.new_password 
                                                ? 'border-red-500 dark:border-red-500' 
                                                : 'border-gray-300 dark:border-gray-600'
                                        } dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500`}
                                    />
                                    {passwordErrors.new_password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {passwordErrors.new_password}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full px-4 py-3 text-base rounded-md border ${
                                            passwordErrors.confirm_password 
                                                ? 'border-red-500 dark:border-red-500' 
                                                : 'border-gray-300 dark:border-gray-600'
                                        } dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500`}
                                    />
                                    {passwordErrors.confirm_password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {passwordErrors.confirm_password}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-iris text-white px-4 py-2 rounded-md hover:bg-iris-600 transition-colors duration-200"
                                        disabled={isPasswordLoading}
                                    >
                                        {isPasswordLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* 2FA Toggle */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <ShieldCheckIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={toggle2FA}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                        is2FAEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            is2FAEnabled ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                                    {is2FAEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Account Deletion */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Account</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all associated data</p>
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                className="bg-red-600 text-white px-6 py-3 text-base rounded-md hover:bg-red-700 font-medium"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        {/* Background overlay */}
                        <div 
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() => setShowDeleteModal(false)}
                        ></div>

                        {/* Modal panel */}
                        <div className="relative inline-block bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg">
                            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                            Delete Account
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Are you sure you want to delete your account? This action cannot be undone. 
                                                All of your data will be permanently removed from our servers forever.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={confirmDeleteAccount}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Delete Account
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-iris sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfile; 