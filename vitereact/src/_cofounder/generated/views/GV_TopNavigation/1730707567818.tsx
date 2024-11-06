import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, logout, fetch_notifications, mark_notification_as_read } from '@/store/main';

const GV_TopNavigation: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userProfile = useSelector((state: RootState) => state.user_profile);
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const notificationsState = useSelector((state: RootState) => state.notifications);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (userAuth.is_authenticated) {
      dispatch(fetch_notifications());
    }
  }, [dispatch, userAuth.is_authenticated]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen);

  const handleNotificationClick = (notificationId: string) => {
    dispatch(mark_notification_as_read(notificationId));
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isActiveRoute = (path: string) => location.pathname.startsWith(path);

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-xl font-bold text-indigo-600">SiteGenie</Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/dashboard" className={`${isActiveRoute('/dashboard') ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Dashboard
                </Link>
                <Link to="/projects" className={`${isActiveRoute('/projects') ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Projects
                </Link>
                <Link to="/templates" className={`${isActiveRoute('/templates') ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Templates
                </Link>
                <Link to="/help" className={`${isActiveRoute('/help') ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Help
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={toggleNotifications}
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationsState.unread_count > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                )}
              </button>

              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleUserMenu}
                    className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    {userProfile.first_name && userProfile.last_name ? (
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100">
                        <span className="text-sm font-medium leading-none text-indigo-700">
                          {getInitials(userProfile.first_name, userProfile.last_name)}
                        </span>
                      </span>
                    ) : (
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://via.placeholder.com/40"
                        alt="User avatar"
                      />
                    )}
                  </button>
                </div>
                {isUserMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
                  >
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Your Profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Settings</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Sign out</button>
                  </div>
                )}
              </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isNotificationsOpen && (
          <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">Notifications</div>
            {notificationsState.notifications.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">No new notifications</div>
            ) : (
              notificationsState.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer ${notification.read ? 'opacity-50' : ''}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <p className="font-medium">{notification.type}</p>
                  <p className="text-xs text-gray-500">{notification.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        <div className={`${isNotificationsOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/dashboard" className={`${isActiveRoute('/dashboard') ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Dashboard
            </Link>
            <Link to="/projects" className={`${isActiveRoute('/projects') ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Projects
            </Link>
            <Link to="/templates" className={`${isActiveRoute('/templates') ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Templates
            </Link>
            <Link to="/help" className={`${isActiveRoute('/help') ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              Help
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                {userProfile.first_name && userProfile.last_name ? (
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100">
                    <span className="text-sm font-medium leading-none text-indigo-700">
                      {getInitials(userProfile.first_name, userProfile.last_name)}
                    </span>
                  </span>
                ) : (
                  <img
                    className="h-10 w-10 rounded-full"
                    src="https://via.placeholder.com/40"
                    alt="User avatar"
                  />
                )}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{`${userProfile.first_name} ${userProfile.last_name}`}</div>
                <div className="text-sm font-medium text-gray-500">{userProfile.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link to="/profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Your Profile
              </Link>
              <Link to="/settings" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default GV_TopNavigation;