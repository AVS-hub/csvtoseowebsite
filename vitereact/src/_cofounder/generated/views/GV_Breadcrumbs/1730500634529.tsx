import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/main';

interface BreadcrumbItem {
  label: string;
  url: string;
  isActive: boolean;
}

const GV_Breadcrumbs: React.FC = () => {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);
  const location = useLocation();
  const { project_id, page_id } = useParams<{ project_id?: string; page_id?: string }>();
  const currentProject = useSelector((state: RootState) => state.current_project);

  const updateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let currentPath = '';
    const newBreadcrumbItems: BreadcrumbItem[] = [
      { label: 'Home', url: '/dashboard', isActive: false },
    ];

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);

      if (segment === project_id && currentProject) {
        label = currentProject.name || 'Project';
      } else if (segment === page_id) {
        label = 'Page';
      }

      newBreadcrumbItems.push({
        label,
        url: currentPath,
        isActive: index === pathSegments.length - 1,
      });
    });

    setBreadcrumbItems(newBreadcrumbItems);
  };

  useEffect(() => {
    updateBreadcrumbs();
  }, [location, currentProject]);

  const navigateToBreadcrumb = (url: string) => {
    // Navigation is handled by the Link component
  };

  return (
    <nav aria-label="Breadcrumb" className="py-2 px-4 bg-gray-100">
      <ol
        className="flex flex-wrap items-center space-x-2 text-sm"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {breadcrumbItems.map((item, index) => (
          <li
            key={item.url}
            className="flex items-center"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && (
              <svg
                className="w-3 h-3 mx-2 text-gray-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {!item.isActive ? (
              <Link
                to={item.url}
                className="text-blue-600 hover:text-blue-800 hover:underline"
                onClick={() => navigateToBreadcrumb(item.url)}
                itemProp="item"
              >
                <span itemProp="name" className="truncate max-w-xs inline-block">
                  {item.label}
                </span>
              </Link>
            ) : (
              <span
                className="text-gray-500 font-semibold truncate max-w-xs"
                aria-current="page"
                itemProp="name"
              >
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={`${index + 1}`} />
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default GV_Breadcrumbs;