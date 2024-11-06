import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/main';
import { FaHome, FaChevronRight } from 'react-icons/fa';

interface BreadcrumbItem {
  label: string;
  url: string;
  isActive: boolean;
}

const GV_Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ project_id?: string; page_id?: string }>();
  const currentProject = useSelector((state: RootState) => state.current_project);
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([
    { label: 'Home', url: '/dashboard', isActive: false }
  ]);

  useEffect(() => {
    const updateBreadcrumbs = () => {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const newBreadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', url: '/dashboard', isActive: false }
      ];

      let currentPath = '';
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        let label = segment.charAt(0).toUpperCase() + segment.slice(1);

        if (segment === 'projects' && params.project_id && currentProject) {
          label = currentProject.name || 'Project';
        }

        if (params.page_id && index === pathSegments.length - 1) {
          label = 'Page';  // You might want to fetch the actual page name here
        }

        newBreadcrumbs.push({
          label,
          url: currentPath,
          isActive: index === pathSegments.length - 1
        });
      });

      setBreadcrumbItems(newBreadcrumbs);
    };

    updateBreadcrumbs();
  }, [location, params, currentProject]);

  const truncateLabel = (label: string, maxLength: number) => {
    return label.length > maxLength ? label.substring(0, maxLength - 3) + '...' : label;
  };

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 bg-gray-100">
      <ol className="flex items-center space-x-1 text-sm">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <FaChevronRight className="flex-shrink-0 h-4 w-4 text-gray-400 mx-1" />
            )}
            {item.isActive ? (
              <span className="text-gray-500 font-medium" aria-current="page">
                {index === 0 ? (
                  <FaHome className="h-4 w-4" />
                ) : (
                  truncateLabel(item.label, 20)
                )}
              </span>
            ) : (
              <Link
                to={item.url}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                {index === 0 ? (
                  <FaHome className="h-4 w-4" />
                ) : (
                  truncateLabel(item.label, 20)
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": breadcrumbItems.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": `${window.location.origin}${item.url}`
          }))
        })}
      </script>
    </nav>
  );
};

export default GV_Breadcrumbs;