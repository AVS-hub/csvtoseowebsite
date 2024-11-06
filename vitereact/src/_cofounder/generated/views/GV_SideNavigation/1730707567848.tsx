import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const GV_SideNavigation: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { project_id } = useParams<{ project_id: string }>();
  const location = useLocation();
  const currentProject = useSelector((state: RootState) => state.current_project);
  const userAuth = useSelector((state: RootState) => state.user_auth);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (project_id && (!currentProject || currentProject.project_id !== project_id)) {
      dispatch(set_current_project(project_id));
    }
  }, [project_id, currentProject, dispatch]);

  useEffect(() => {
    const path = location.pathname.split('/');
    const section = path[path.length - 1];
    setActiveSection(section === project_id ? 'overview' : section);
  }, [location, project_id]);

  const navigationItems = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: '🏠', url: `/projects/${project_id}` },
    { id: 'pages', label: 'Pages', icon: '📄', url: `/projects/${project_id}/pages` },
    { id: 'seo', label: 'SEO', icon: '🔍', url: `/projects/${project_id}/seo` },
    { id: 'design', label: 'Design', icon: '🎨', url: `/projects/${project_id}/design` },
    { id: 'export', label: 'Export', icon: '📤', url: `/projects/${project_id}/export` },
    { id: 'settings', label: 'Settings', icon: '⚙️', url: `/projects/${project_id}/settings` },
  ], [project_id]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    if (e.altKey) {
      const index = navigationItems.findIndex(item => item.id === activeSection);
      if (e.key === 'ArrowUp' && index > 0) {
        setActiveSection(navigationItems[index - 1].id);
      } else if (e.key === 'ArrowDown' && index < navigationItems.length - 1) {
        setActiveSection(navigationItems[index + 1].id);
      }
    }
  }, [navigationItems, activeSection]);

  if (!currentProject || !userAuth.is_authenticated) {
    return null;
  }

  return (
    <nav
      className={`bg-gray-800 text-white h-screen ${
        isCollapsed ? 'w-16' : 'w-64'
      } transition-all duration-300 ease-in-out fixed left-0 top-0 z-10`}
      onKeyDown={handleKeyNavigation}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <img
              src={currentProject.icon || `https://picsum.photos/seed/${currentProject.project_id}/32/32`}
              alt="Project Icon"
              className="w-8 h-8 rounded"
            />
            <h2 className="font-bold truncate">{currentProject.name}</h2>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      <ul className="py-4">
        {navigationItems.map((item) => (
          <li key={item.id}>
            <Link
              to={item.url}
              className={`flex items-center px-4 py-2 ${
                activeSection === item.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl mr-3" aria-hidden="true">
                {item.icon}
              </span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-700 rounded p-2">
            <h3 className="text-sm font-semibold mb-1">Project Progress</h3>
            <div className="w-full bg-gray-600 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full"
                style={{ width: '45%' }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default GV_SideNavigation;