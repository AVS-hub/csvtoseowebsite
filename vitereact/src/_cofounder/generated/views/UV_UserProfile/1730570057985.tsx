import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { RootState, AppDispatch, fetch_user_profile } from '@/store/main';

const UV_UserProfile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'general');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const userAuth = useSelector((state: RootState) => state.user_auth);
  const userProfile = useSelector((state: RootState) => state.user_profile);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (userAuth.is_authenticated) {
      dispatch(fetch_user_profile());
    }
  }, [dispatch, userAuth.is_authenticated]);

  useEffect(() => {
    if (userProfile) {
      setValue('firstName', userProfile.first_name);
      setValue('lastName', userProfile.last_name);
      setValue('email', userProfile.email);
    }
  }, [userProfile, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.put('http://localhost:1337/api/users/me', data, {
        headers: { Authorization: `Bearer ${userAuth.token}` }
      });
      dispatch(fetch_user_profile());
      setIsEditMode(false);
      setApiError(null);
    } catch (error) {
      setApiError('Failed to update profile. Please try again.');
    }
  };

  const handlePasswordChange = async (data: any) => {
    try {
      await axios.post('http://localhost:1337/api/users/change-password', data, {
        headers: { Authorization: `Bearer ${userAuth.token}` }
      });
      setApiError(null);
    } catch (error) {
      setApiError('Failed to change password. Please try again.');
    }
  };

  const handleNotificationPreferences = async (data: any) => {
    try {
      await axios.put('http://localhost:1337/api/users/notifications', data, {
        headers: { Authorization: `Bearer ${userAuth.token}` }
      });
      setApiError(null);
    } catch (error) {
      setApiError('Failed to update notification preferences. Please try again.');
    }
  };

  const handleAccountDeletion = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axios.post('http://localhost:1337/api/users/delete-account', {}, {
          headers: { Authorization: `Bearer ${userAuth.token}` }
        });
        navigate('/');
      } catch (error) {
        setApiError('Failed to delete account. Please try again.');
      }
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>

        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{apiError}</p>
          </div>
        )}

        <div className="mb-6">
          <nav className="flex border-b border-gray-200">
            <button
              className={`mr-4 py-2 px-4 ${activeTab === 'general' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`mr-4 py-2 px-4 ${activeTab === 'security' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button
              className={`mr-4 py-2 px-4 ${activeTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
          </nav>
        </div>

        {activeTab === 'general' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  {...register('firstName', { required: 'First name is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={!isEditMode}
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  {...register('lastName', { required: 'Last name is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={!isEditMode}
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={!isEditMode}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              {isEditMode ? (
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Edit Profile
                </button>
              )}
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  {...register('currentPassword', { required: 'Current password is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>}
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  {...register('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'Password must be at least 8 characters long' } })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: (value) => value === (document.getElementById('newPassword') as HTMLInputElement).value || 'Passwords do not match'
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Change Password
              </button>
            </form>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Notification Preferences</h2>
            <form onSubmit={handleSubmit(handleNotificationPreferences)} className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  {...register('emailNotifications')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                  Receive email notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  {...register('pushNotifications')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-700">
                  Receive push notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="marketingEmails"
                  {...register('marketingEmails')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="marketingEmails" className="ml-2 block text-sm text-gray-700">
                  Receive marketing emails
                </label>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Preferences
              </button>
            </form>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Danger Zone</h2>
          <p className="mb-4 text-gray-600">Once you delete your account, there is no going back. Please be certain.</p>
          <button
            onClick={handleAccountDeletion}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
};

export default UV_UserProfile;