import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  url: string;
}

const GV_SideNavigation: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const dispatch: AppDispatch = useDispatch();
  const location = useLocation();
  const { project_id } = useParams<{ project_id: string }>();

  const currentProject = useSelector((state: RootState) => state.current_project);
  const userAuth = useSelector((state: RootState) => state.user_auth);

  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Overview', icon: ChevronRightIcon, url: `/projects/${project_id}` },
    { id: 'pages', label: 'Pages', icon: ChevronRightIcon, url: `/projects/${project_id}/pages` },
    { id: 'seo', label: 'SEO', icon: ChevronRightIcon, url: `/projects/${project_id}/seo` },
    { id: 'design', label: 'Design', icon: ChevronRightIcon, url: `/projects/${project_id}/design` },
    { id: 'settings', label: 'Settings', icon: ChevronRightIcon, url: `/projects/${project_id}/settings` },
  ];

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const fetchProjectDetails = useCallback(async () => {
    if (project_id && userAuth.token) {
      try {
        const response = await axios.get(`http://localhost:1337/api/projects/${project_id}`, {
          headers: { Authorization: `Bearer ${userAuth.token}` },
        });
        dispatch(set_current_project(response.data));
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    }
  }, [project_id, userAuth.token, dispatch]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  useEffect(() => {
    const currentSection = location.pathname.split('/').pop() || 'overview';
    setActiveSection(currentSection);
  }, [location]);

  return (
    <nav
      className={`bg-gray-800 text-white h-screen ${
        isCollapsed ? 'w-16' : 'w-64'
      } transition-all duration-300 ease-in-out`}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center">
            <img
              src={currentProject?.icon || 'https://picsum.photos/32/32'}
              alt="Project Icon"
              className="w-8 h-8 rounded-full mr-2"
            />
            <h2 className="text-lg font-semibold truncate">{currentProject?.name || 'Project Name'}</h2>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-6 h-6" />
          ) : (
            <ChevronLeftIcon className="w-6 h-6" />
          )}
        </button>
      </div>
      <ul className="mt-4">
        {navigationItems.map((item) => (
          <li key={item.id}>
            <Link
              to={item.url}
              className={`flex items-center py-2 px-4 ${
                activeSection === item.id ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-6 h-6 mr-2" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default GV_SideNavigation;