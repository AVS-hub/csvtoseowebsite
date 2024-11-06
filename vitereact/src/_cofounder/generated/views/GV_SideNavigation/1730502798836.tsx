import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTachometerAlt, faFileAlt, faSearch, faPalette, faCog } from '@fortawesome/free-solid-svg-icons';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  url: string;
}

const GV_SideNavigation: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const location = useLocation();
  const { project_id } = useParams<{ project_id: string }>();
  const currentProject = useSelector((state: RootState) => state.current_project);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const navigationItems: NavigationItem[] = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: faTachometerAlt, url: `/projects/${project_id}` },
    { id: 'pages', label: 'Pages', icon: faFileAlt, url: `/projects/${project_id}/content` },
    { id: 'seo', label: 'SEO', icon: faSearch, url: `/projects/${project_id}/seo` },
    { id: 'design', label: 'Design', icon: faPalette, url: `/projects/${project_id}/design` },
    { id: 'settings', label: 'Settings', icon: faCog, url: `/projects/${project_id}/settings` },
  ], [project_id]);

  useEffect(() => {
    if (project_id && (!currentProject || currentProject.project_id !== project_id)) {
      dispatch(set_current_project(project_id));
    }
  }, [project_id, currentProject, dispatch]);

  useEffect(() => {
    const currentSection = navigationItems.find(item => location.pathname.includes(item.id));
    if (currentSection) {
      setActiveSection(currentSection.id);
    }
  }, [location.pathname, navigationItems]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, item: NavigationItem) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveSection(item.id);
    }
  }, []);

  return (
    <>
      <nav
        className={`bg-gray-800 text-white transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        } min-h-screen fixed left-0 top-0 z-30`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && currentProject && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">{currentProject.name?.[0] || ''}</span>
              </div>
              <span className="font-semibold truncate">{currentProject.name}</span>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} />
          </button>
        </div>
        <ul className="py-4">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.url}
                className={`flex items-center p-4 hover:bg-gray-700 ${
                  activeSection === item.id ? 'bg-gray-700' : ''
                }`}
                onClick={() => setActiveSection(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                tabIndex={0}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <FontAwesomeIcon icon={item.icon} className={`${isCollapsed ? 'mr-0' : 'mr-4'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* This div pushes the main content to the right */}
      </div>
    </>
  );
};

export default GV_SideNavigation;