import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/main';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface BreadcrumbItem {
  label: string;
  url: string;
  isActive: boolean;
}

const GV_Breadcrumbs: React.FC = () => {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([
    { label: 'Home', url: '/dashboard', isActive: false }
  ]);

  const location = useLocation();
  const navigate = useNavigate();
  const currentProject = useSelector((state: RootState) => state.current_project);

  const generateBreadcrumbs = useCallback(() => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    let currentPath = '';
    const newBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', url: '/dashboard', isActive: false }
    ];

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);

      if (segment === 'projects' && currentProject) {
        label = currentProject.name || 'Project';
      }

      newBreadcrumbs.push({
        label,
        url: currentPath,
        isActive: index === pathSegments.length - 1
      });
    });

    return newBreadcrumbs;
  }, [location.pathname, currentProject]);

  useEffect(() => {
    setBreadcrumbItems(generateBreadcrumbs());
  }, [generateBreadcrumbs]);

  const handleNavigation = useCallback((url: string) => {
    navigate(url);
  }, [navigate]);

  const truncateLabel = (label: string, maxLength: number = 20) => {
    return label.length > maxLength ? `${label.substring(0, maxLength)}...` : label;
  };

  const breadcrumbsSchema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        "item": `${window.location.origin}${item.url}`
      }))
    };
  }, [breadcrumbItems]);

  return (
    <>
      <nav aria-label="Breadcrumb" className="py-2 px-4 bg-gray-100 text-sm">
        <ol className="flex items-center space-x-1 md:space-x-2">
          {breadcrumbItems.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index > 0 && (
                <FontAwesomeIcon icon={faChevronRight} className="text-gray-400 mx-1 md:mx-2" />
              )}
              {item.isActive ? (
                <span className="text-gray-500" aria-current="page">
                  {truncateLabel(item.label)}
                </span>
              ) : (
                <Link
                  to={item.url}
                  onClick={() => handleNavigation(item.url)}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  {index === 0 && <FontAwesomeIcon icon={faHome} className="mr-1" />}
                  {truncateLabel(item.label)}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbsSchema)}
      </script>
    </>
  );
};

export default React.memo(GV_Breadcrumbs);