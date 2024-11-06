import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetch_user_profile } from '@/store/main';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UV_UserProfile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const userProfile = useSelector((state: RootState) => state.user_profile);

  const [isEditMode, setIsEditMode] = useState(false);
  const [firstName, setFirstName] = useState(userProfile.first_name || '');
  const [lastName, setLastName] = useState(userProfile.last_name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetch_user_profile());
  }, [dispatch]);

  useEffect(() => {
    setFirstName(userProfile.first_name || '');
    setLastName(userProfile.last_name || '');
    setEmail(userProfile.email || '');
  }, [userProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.put(
        'http://localhost:1337/api/users/me',
        { first_name: firstName, last_name: lastName, email },
        { headers: { Authorization: `Bearer ${userAuth.token}` } }
      );

      if (response.status === 200) {
        setSuccessMessage('Profile updated successfully');
        dispatch(fetch_user_profile());
        setIsEditMode(false);
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:1337/api/users/change-password',
        { current_password: currentPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${userAuth.token}` } }
      );

      if (response.status === 200) {
        setSuccessMessage('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError('Failed to change password. Please check your current password and try again.');
    }
  };

  const handleUpdateNotificationPreferences = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.put(
        'http://localhost:1337/api/users/notifications',
        notificationPreferences,
        { headers: { Authorization: `Bearer ${userAuth.token}` } }
      );

      if (response.status === 200) {
        setSuccessMessage('Notification preferences updated successfully');
      }
    } catch (err) {
      setError('Failed to update notification preferences. Please try again.');
    }
  };

  const handleInitiateAccountDeletion = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await axios.post(
          'http://localhost:1337/api/users/delete-account',
          {},
          { headers: { Authorization: `Bearer ${userAuth.token}` } }
        );

        if (response.status === 200) {
          alert('Your account deletion request has been initiated. You will receive further instructions via email.');
        }
      } catch (err) {
        setError('Failed to initiate account deletion. Please contact support.');
      }
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}
        {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">{successMessage}</div>}

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                First Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditMode}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                Last Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isEditMode}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditMode}
              />
            </div>
            {isEditMode ? (
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Save Changes
                </button>
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={() => setIsEditMode(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => setIsEditMode(true)}
              >
                Edit Profile
              </button>
            )}
          </form>
        </div>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                Current Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                New Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Change Password
            </button>
          </form>
        </div>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={notificationPreferences.emailNotifications}
                onChange={(e) => setNotificationPreferences({ ...notificationPreferences, emailNotifications: e.target.checked })}
              />
              <span className="ml-2 text-gray-700">Email Notifications</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={notificationPreferences.pushNotifications}
                onChange={(e) => setNotificationPreferences({ ...notificationPreferences, pushNotifications: e.target.checked })}
              />
              <span className="ml-2 text-gray-700">Push Notifications</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={notificationPreferences.marketingEmails}
                onChange={(e) => setNotificationPreferences({ ...notificationPreferences, marketingEmails: e.target.checked })}
              />
              <span className="ml-2 text-gray-700">Marketing Emails</span>
            </label>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleUpdateNotificationPreferences}
          >
            Update Notification Preferences
          </button>
        </div>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Account Management</h2>
          <p className="mb-4 text-red-600">Warning: This action is irreversible.</p>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleInitiateAccountDeletion}
          >
            Delete Account
          </button>
        </div>

        <div className="mt-8">
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-700">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
};

export default UV_UserProfile;