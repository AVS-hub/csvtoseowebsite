import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  url: string;
}

const GV_SideNavigation: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { project_id } = useParams<{ project_id: string }>();
  const location = useLocation();
  const currentProject = useSelector((state: RootState) => state.current_project);
  const userAuth = useSelector((state: RootState) => state.user_auth);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [projectProgress, setProjectProgress] = useState(0);

  const navigationItems: NavigationItem[] = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, url: `/projects/${project_id}` },
    { id: 'pages', label: 'Pages', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, url: `/projects/${project_id}/pages` },
    { id: 'seo', label: 'SEO', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, url: `/projects/${project_id}/seo` },
    { id: 'design', label: 'Design', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>, url: `/projects/${project_id}/design` },
    { id: 'settings', label: 'Settings', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, url: `/projects/${project_id}/settings` },
  ], [project_id]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!currentProject || currentProject.project_id !== project_id) {
        try {
          const response = await axios.get(`http://localhost:1337/api/projects/${project_id}`, {
            headers: { Authorization: `Bearer ${userAuth.token}` }
          });
          dispatch(set_current_project(response.data));
        } catch (error) {
          console.error('Error fetching project details:', error);
        }
      }
    };

    fetchProjectDetails();
  }, [project_id, currentProject, dispatch, userAuth.token]);

  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = navigationItems.find(item => currentPath.includes(item.id));
    if (activeItem) {
      setActiveSection(activeItem.id);
    }
  }, [location.pathname, navigationItems]);

  useEffect(() => {
    // Simulating project progress calculation
    const calculateProgress = () => {
      // This is a placeholder. In a real scenario, you would calculate progress based on completed tasks or milestones
      const progress = Math.floor(Math.random() * 100);
      setProjectProgress(progress);
    };

    calculateProgress();
  }, [currentProject]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleKeyboardShortcut = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
      const index = parseInt(e.key) - 1;
      if (index < navigationItems.length) {
        setActiveSection(navigationItems[index].id);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, []);

  return (
    <>
      <nav
        className={`bg-gray-800 text-white h-screen ${
          isCollapsed ? 'w-16' : 'w-64'
        } transition-all duration-300 ease-in-out fixed left-0 top-0 z-10`}
        aria-label="Project navigation"
      >
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">
                  {currentProject?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-semibold truncate">
                {currentProject?.name || 'Loading...'}
              </h2>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-6 h-6" />
            ) : (
              <ChevronLeftIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="mt-4 px-4">
          <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 ease-in-out"
              style={{ width: `${projectProgress}%` }}
            ></div>
          </div>
          {!isCollapsed && (
            <p className="text-sm mt-1 text-gray-300">
              Project Progress: {projectProgress}%
            </p>
          )}
        </div>

        <ul className="mt-6 space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.url}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeSection === item.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <span className="mr-3">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default GV_SideNavigation;