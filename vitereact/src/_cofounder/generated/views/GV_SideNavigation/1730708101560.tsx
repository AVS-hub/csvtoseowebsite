import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, FileText, Search, PaintBucket, Settings, ChevronRight, ChevronLeft } from 'lucide-react';

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
    { id: 'overview', label: 'Overview', icon: Home, url: `/projects/${project_id}` },
    { id: 'pages', label: 'Pages', icon: FileText, url: `/projects/${project_id}/pages` },
    { id: 'seo', label: 'SEO', icon: Search, url: `/projects/${project_id}/seo` },
    { id: 'design', label: 'Design', icon: PaintBucket, url: `/projects/${project_id}/design` },
    { id: 'settings', label: 'Settings', icon: Settings, url: `/projects/${project_id}/settings` },
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
      } transition-all duration-300 ease-in-out fixed left-0 top-0 z-10 flex flex-col`}
      onKeyDown={handleKeyNavigation}
    >
      <div className="flex items-center p-4 border-b border-gray-700">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={currentProject.icon || `https://picsum.photos/seed/${currentProject.project_id}/40/40`} alt="Project Icon" />
          <AvatarFallback>{currentProject.name.charAt(0)}</AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <h2 className="font-bold truncate">{currentProject.name}</h2>
        )}
      </div>
      <ul className="flex-grow py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Link
                to={item.url}
                className={`flex items-center px-4 py-3 ${
                  activeSection === item.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } transition-colors duration-200`}
              >
                <Icon className="w-6 h-6 mr-3" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleCollapse}
          className="w-full justify-center"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </nav>
  );
};

export default GV_SideNavigation;