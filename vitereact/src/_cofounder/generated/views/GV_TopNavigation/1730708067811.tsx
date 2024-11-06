import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, logout, fetch_notifications, mark_notification_as_read } from '@/store/main';
import { Bell, ChevronDown } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const GV_TopNavigation: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userProfile = useSelector((state: RootState) => state.user_profile);
  const userAuth = useSelector((state: RootState) => state.user_auth);
  const notificationsState = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    if (userAuth.is_authenticated) {
      dispatch(fetch_notifications());
    }
  }, [dispatch, userAuth.is_authenticated]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

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
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0">
                <img src="/path-to-your-logo.png" alt="SiteGenie" className="h-8 w-auto" />
              </Link>
              <NavigationMenu className="hidden md:ml-6 md:flex">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/dashboard">
                      <NavigationMenuLink className={`${isActiveRoute('/dashboard') ? 'text-indigo-600' : 'text-gray-700'} px-3 py-2 text-sm font-medium`}>
                        Dashboard
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/projects">
                      <NavigationMenuLink className={`${isActiveRoute('/projects') ? 'text-indigo-600' : 'text-gray-700'} px-3 py-2 text-sm font-medium`}>
                        Projects
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/templates">
                      <NavigationMenuLink className={`${isActiveRoute('/templates') ? 'text-indigo-600' : 'text-gray-700'} px-3 py-2 text-sm font-medium`}>
                        Templates
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/help">
                      <NavigationMenuLink className={`${isActiveRoute('/help') ? 'text-indigo-600' : 'text-gray-700'} px-3 py-2 text-sm font-medium`}>
                        Help
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificationsState.unread_count > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 py-0.5 text-xs">
                        {notificationsState.unread_count}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notificationsState.notifications.length === 0 ? (
                    <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
                  ) : (
                    notificationsState.notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={notification.read ? 'opacity-50' : ''}
                      >
                        <div>
                          <p className="font-medium">{notification.type}</p>
                          <p className="text-xs text-gray-500">{notification.content}</p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-4 flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src="https://via.placeholder.com/40" alt="User avatar" />
                      <AvatarFallback>{getInitials(userProfile.first_name, userProfile.last_name)}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{`${userProfile.first_name} ${userProfile.last_name}`}</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Your Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default GV_TopNavigation;