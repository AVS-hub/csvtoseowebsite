import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetch_user_profile } from '@/store/main';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Download, Trash2 } from 'lucide-react';

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
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Avatar className="h-24 w-24 mr-6">
              <AvatarImage src={userProfile.avatar || "https://picsum.photos/seed/user/200"} alt={`${userProfile.first_name} ${userProfile.last_name}`} />
              <AvatarFallback>{userProfile.first_name?.[0]}{userProfile.last_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{`${userProfile.first_name} ${userProfile.last_name}`}</h1>
              <p className="text-gray-600">{userProfile.email}</p>
              <p className="text-sm text-gray-500">Member since: {new Date(userProfile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <Button onClick={() => setIsEditMode(!isEditMode)} className="mt-4 md:mt-0">
            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditMode}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditMode}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleInputChange}
                    disabled={!isEditMode}
                  />
                </div>
                {isEditMode && (
                  <Button type="submit">Save Changes</Button>
                )}
              </form>
            </TabsContent>
            <TabsContent value="security">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <Button type="submit">Change Password</Button>
              </form>
            </TabsContent>
            <TabsContent value="notifications">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={notificationPreferences.emailNotifications}
                    onChange={() => handleNotificationToggle('emailNotifications')}
                    className="mr-2"
                  />
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={notificationPreferences.pushNotifications}
                    onChange={() => handleNotificationToggle('pushNotifications')}
                    className="mr-2"
                  />
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="marketingEmails"
                    checked={notificationPreferences.marketingEmails}
                    onChange={() => handleNotificationToggle('marketingEmails')}
                    className="mr-2"
                  />
                  <Label htmlFor="marketingEmails">Marketing Emails</Label>
                </div>
                <Button onClick={handleNotificationPreferencesSubmit}>Save Preferences</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-1/3 space-y-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <Link to="/public-profile">
                <Button variant="outline" className="w-full">
                  View Public Profile
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download Personal Data
              </Button>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Account Statistics</h2>
            <div className="space-y-2">
              <p>Last Login: {new Date(userProfile.last_login).toLocaleString()}</p>
              <p>Total Logins: {userProfile.login_count}</p>
              <p>Account Age: {Math.floor((Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24))} days</p>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <Button variant="destructive" onClick={handleAccountDeletion} className="w-full">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Account
            </Button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default UV_UserProfile;