import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetch_user_profile } from '@/store/main';
import axios from 'axios';

const UV_UserProfile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const userProfile = useSelector((state: RootState) => state.user_profile);

  const [activeTab, setActiveTab] = useState<string>('general');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState({
    firstName: userProfile.first_name || '',
    lastName: userProfile.last_name || '',
    email: userProfile.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    dispatch(fetch_user_profile());
  }, [dispatch]);

  useEffect(() => {
    setProfileForm({
      firstName: userProfile.first_name || '',
      lastName: userProfile.last_name || '',
      email: userProfile.email || '',
    });
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handleNotificationToggle = (preference: string) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [preference]: !notificationPreferences[preference],
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const validateProfileForm = () => {
    if (!profileForm.firstName || !profileForm.lastName || !profileForm.email) {
      setErrorMessage('All fields are required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      setErrorMessage('Invalid email format');
      return false;
    }
    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setErrorMessage('All password fields are required');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return false;
    }
    if (passwordForm.newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    try {
      const response = await axios.put('http://localhost:1337/api/users/me', {
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
        email: profileForm.email,
      }, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });

      dispatch(fetch_user_profile());
      setIsEditMode(false);
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      await axios.post('http://localhost:1337/api/users/change-password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      }, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('Password changed successfully');
    } catch (error) {
      setErrorMessage('Failed to change password. Please check your current password and try again.');
    }
  };

  const handleNotificationPreferencesSubmit = async () => {
    try {
      await axios.put('http://localhost:1337/api/users/notifications', notificationPreferences, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setSuccessMessage('Notification preferences updated successfully');
    } catch (error) {
      setErrorMessage('Failed to update notification preferences. Please try again.');
    }
  };

  const handleAccountDeletion = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axios.post('http://localhost:1337/api/users/delete-account', {}, {
          headers: { Authorization: `Bearer ${userAuth.token}` },
        });
        // Redirect to logout or home page after account deletion
        window.location.href = '/';
      } catch (error) {
        setErrorMessage('Failed to delete account. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'general' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => handleTabChange('general')}
          >
            General
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'security' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => handleTabChange('security')}
          >
            Security
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'notifications' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => handleTabChange('notifications')}
          >
            Notifications
          </button>
        </div>
      </div>

      {errorMessage && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{errorMessage}</div>}
      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{successMessage}</div>}

      {activeTab === 'general' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="mb-4">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileForm.email}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            {isEditMode ? (
              <div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Change Password
            </button>
          </form>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Delete Account</h2>
            <p className="mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button
              onClick={handleAccountDeletion}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Notification Preferences</h2>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationPreferences.emailNotifications}
                onChange={() => handleNotificationToggle('emailNotifications')}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Email Notifications</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationPreferences.pushNotifications}
                onChange={() => handleNotificationToggle('pushNotifications')}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Push Notifications</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationPreferences.marketingEmails}
                onChange={() => handleNotificationToggle('marketingEmails')}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Marketing Emails</span>
            </label>
          </div>
          <button
            onClick={handleNotificationPreferencesSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
};

export default UV_UserProfile;