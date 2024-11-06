import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetch_user_profile } from '@/store/main';
import axios from 'axios';

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
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    dispatch(fetch_user_profile());
    fetchConnectedAccounts();
    fetchNotificationPreferences();
  }, [dispatch]);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/users/connected-accounts', {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setConnectedAccounts(response.data);
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/users/notification-preferences', {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setNotificationPreferences(response.data);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.put(
        'http://localhost:1337/api/users/me',
        { first_name: firstName, last_name: lastName, email },
        { headers: { Authorization: `Bearer ${userAuth.token}` } }
      );
      setIsEditMode(false);
      setSuccess('Profile updated successfully');
      dispatch(fetch_user_profile());
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      await axios.post(
        'http://localhost:1337/api/users/change-password',
        { current_password: currentPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${userAuth.token}` } }
      );
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError('Failed to change password');
    }
  };

  const handleUpdateNotificationPreferences = async () => {
    try {
      await axios.put(
        'http://localhost:1337/api/users/notification-preferences',
        notificationPreferences,
        { headers: { Authorization: `Bearer ${userAuth.token}` } }
      );
      setSuccess('Notification preferences updated successfully');
    } catch (error) {
      setError('Failed to update notification preferences');
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      await axios.delete(`http://localhost:1337/api/users/connected-accounts/${accountId}`, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      fetchConnectedAccounts();
      setSuccess('Account disconnected successfully');
    } catch (error) {
      setError('Failed to disconnect account');
    }
  };

  const handleInitiateAccountDeletion = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axios.post(
          'http://localhost:1337/api/users/delete-account',
          {},
          { headers: { Authorization: `Bearer ${userAuth.token}` } }
        );
        setSuccess('Account deletion process initiated. Check your email for further instructions.');
      } catch (error) {
        setError('Failed to initiate account deletion');
      }
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
          {isEditMode ? (
            <div>
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
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleUpdateProfile}
                >
                  Save Changes
                </button>
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => setIsEditMode(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-2"><strong>First Name:</strong> {userProfile.first_name}</p>
              <p className="mb-2"><strong>Last Name:</strong> {userProfile.last_name}</p>
              <p className="mb-2"><strong>Email:</strong> {userProfile.email}</p>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => setIsEditMode(true)}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
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
            onClick={handleChangePassword}
          >
            Change Password
          </button>
        </div>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-semibold mb-4">Notification Preferences</h2>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationPreferences.emailNotifications}
                onChange={(e) => setNotificationPreferences({ ...notificationPreferences, emailNotifications: e.target.checked })}
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
                onChange={(e) => setNotificationPreferences({ ...notificationPreferences, pushNotifications: e.target.checked })}
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
                onChange={(e) => setNotificationPreferences({ ...notificationPreferences, marketingEmails: e.target.checked })}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Marketing Emails</span>
            </label>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleUpdateNotificationPreferences}
          >
            Update Preferences
          </button>
        </div>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-semibold mb-4">Connected Accounts</h2>
          {connectedAccounts.length > 0 ? (
            <ul>
              {connectedAccounts.map((account: any) => (
                <li key={account.id} className="mb-2 flex justify-between items-center">
                  <span>{account.provider} - {account.accountName}</span>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => handleDisconnectAccount(account.id)}
                  >
                    Disconnect
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No connected accounts</p>
          )}
        </div>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-semibold mb-4">Delete Account</h2>
          <p className="mb-4 text-red-600">Warning: This action cannot be undone.</p>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleInitiateAccountDeletion}
          >
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
};

export default UV_UserProfile;