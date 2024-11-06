import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetch_user_profile } from '@/store/main';
import axios from 'axios';

const UV_UserProfile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const userProfile = useSelector((state: RootState) => state.user_profile);

  const [activeTab, setActiveTab] = useState('general');
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
  });
  const [billingInfo, setBillingInfo] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (userAuth.is_authenticated) {
      dispatch(fetch_user_profile());
      fetchBillingInfo();
      fetchConnectedAccounts();
    }
  }, [userAuth.is_authenticated, dispatch]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        ...formData,
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        email: userProfile.email || '',
      });
    }
  }, [userProfile]);

  const fetchBillingInfo = async () => {
    try {
      const response = await axios.get('http://localhost:1337/api/users/billing', {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setBillingInfo(response.data);
    } catch (error) {
      console.error('Error fetching billing info:', error);
    }
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationPreferences({ ...notificationPreferences, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:1337/api/users/me', 
        { firstName: formData.firstName, lastName: formData.lastName, email: formData.email },
        { headers: { Authorization: `Bearer ${userAuth.token}` } }
      );
      setSuccessMessage('Profile updated successfully');
      setIsEditMode(false);
      dispatch(fetch_user_profile());
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    try {
      await axios.post('http://localhost:1337/api/users/change-password', 
        { currentPassword: formData.currentPassword, newPassword: formData.newPassword },
        { headers: { Authorization: `Bearer ${userAuth.token}` } }
      );
      setSuccessMessage('Password changed successfully');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setErrorMessage('Failed to change password. Please check your current password and try again.');
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      await axios.put('http://localhost:1337/api/users/notifications', 
        notificationPreferences,
        { headers: { Authorization: `Bearer ${userAuth.token}` } }
      );
      setSuccessMessage('Notification preferences updated successfully');
    } catch (error) {
      setErrorMessage('Failed to update notification preferences. Please try again.');
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      await axios.delete(`http://localhost:1337/api/users/connected-accounts/${accountId}`, {
        headers: { Authorization: `Bearer ${userAuth.token}` },
      });
      setSuccessMessage('Account disconnected successfully');
      fetchConnectedAccounts();
    } catch (error) {
      setErrorMessage('Failed to disconnect account. Please try again.');
    }
  };

  const handleAccountDeletion = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axios.post('http://localhost:1337/api/users/delete-account', {}, {
          headers: { Authorization: `Bearer ${userAuth.token}` },
        });
        setSuccessMessage('Account deletion process initiated. You will receive further instructions via email.');
      } catch (error) {
        setErrorMessage('Failed to initiate account deletion. Please try again.');
      }
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <div className="mb-6">
          <ul className="flex border-b">
            <li className={`mr-1 ${activeTab === 'general' ? 'border-b-2 border-blue-500' : ''}`}>
              <button className="bg-white inline-block py-2 px-4 font-semibold" onClick={() => setActiveTab('general')}>
                General
              </button>
            </li>
            <li className={`mr-1 ${activeTab === 'password' ? 'border-b-2 border-blue-500' : ''}`}>
              <button className="bg-white inline-block py-2 px-4 font-semibold" onClick={() => setActiveTab('password')}>
                Password
              </button>
            </li>
            <li className={`mr-1 ${activeTab === 'notifications' ? 'border-b-2 border-blue-500' : ''}`}>
              <button className="bg-white inline-block py-2 px-4 font-semibold" onClick={() => setActiveTab('notifications')}>
                Notifications
              </button>
            </li>
            <li className={`mr-1 ${activeTab === 'billing' ? 'border-b-2 border-blue-500' : ''}`}>
              <button className="bg-white inline-block py-2 px-4 font-semibold" onClick={() => setActiveTab('billing')}>
                Billing
              </button>
            </li>
            <li className={`mr-1 ${activeTab === 'accounts' ? 'border-b-2 border-blue-500' : ''}`}>
              <button className="bg-white inline-block py-2 px-4 font-semibold" onClick={() => setActiveTab('accounts')}>
                Connected Accounts
              </button>
            </li>
          </ul>
        </div>

        {activeTab === 'general' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">General Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                  First Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
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
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                />
              </div>
              {isEditMode ? (
                <div>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                    type="submit"
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
              ) : (
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => setIsEditMode(true)}
                >
                  Edit Profile
                </button>
              )}
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                  Current Password
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
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
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
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
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
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
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Notification Preferences</h2>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={notificationPreferences.emailNotifications}
                  onChange={handleNotificationChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Email Notifications</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={notificationPreferences.pushNotifications}
                  onChange={handleNotificationChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Push Notifications</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="marketingEmails"
                  checked={notificationPreferences.marketingEmails}
                  onChange={handleNotificationChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Marketing Emails</span>
              </label>
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleNotificationUpdate}
            >
              Update Preferences
            </button>
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Billing Information</h2>
            {billingInfo ? (
              <div>
                <p><strong>Current Plan:</strong> {billingInfo.currentPlan}</p>
                <p><strong>Next Billing Date:</strong> {new Date(billingInfo.nextBillingDate).toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> {billingInfo.paymentMethod.type} ending in {billingInfo.paymentMethod.last4}</p>
                <h3 className="text-xl font-semibold mt-4 mb-2">Billing History</h3>
                <ul>
                  {billingInfo.billingHistory.map((item, index) => (
                    <li key={index} className="mb-2">
                      <span>{new Date(item.date).toLocaleDateString()}</span> - 
                      <span>${item.amount.toFixed(2)}</span> - 
                      <span>{item.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Loading billing information...</p>
            )}
          </div>
        )}

        {activeTab === 'accounts' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Connected Accounts</h2>
            {connectedAccounts.length > 0 ? (
              <ul>
                {connectedAccounts.map((account, index) => (
                  <li key={index} className="mb-2 flex justify-between items-center">
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
              <p>No connected accounts found.</p>
            )}
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-gray-300">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Danger Zone</h2>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleAccountDeletion}
          >
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
};

export default UV_UserProfile;