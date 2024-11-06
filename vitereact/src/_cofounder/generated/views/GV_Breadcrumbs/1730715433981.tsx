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
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([
    { label: 'Home', url: '/dashboard', isActive: false }
  ]);

  const location = useLocation();
  const params = useParams<{ project_id?: string; page_id?: string }>();
  const currentProject = useSelector((state: RootState) => state.current_project);

  useEffect(() => {
    updateBreadcrumbs();
  }, [location, currentProject]);

  const updateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    let currentPath = '';
    const newBreadcrumbItems: BreadcrumbItem[] = [
      { label: 'Home', url: '/dashboard', isActive: false }
    ];

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      let label = segment;

      if (segment === 'projects' && currentProject) {
        label = currentProject.name || 'Project';
      } else if (segment === params.project_id) {
        return; // Skip project_id segment
      } else if (segment === 'content' && params.page_id) {
        label = 'Page Content';
      } else {
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      newBreadcrumbItems.push({
        label,
        url: currentPath,
        isActive: index === pathSegments.length - 1
      });
    });

    setBreadcrumbItems(newBreadcrumbItems);
  };

  const truncateLabel = (label: string, maxLength: number = 20) => {
    return label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
  };

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 bg-gray-100">
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
            {index === 0 ? (
              <Link
                to={item.url}
                className="text-blue-600 hover:text-blue-800 flex items-center"
                itemProp="item"
              >
                <FaHome className="mr-1" />
                <span itemProp="name" className="sr-only">
                  {item.label}
                </span>
              </Link>
            ) : (
              <>
                <FaChevronRight className="text-gray-400 mx-2" aria-hidden="true" />
                {item.isActive ? (
                  <span className="text-gray-500" itemProp="name">
                    {truncateLabel(item.label)}
                  </span>
                ) : (
                  <Link
                    to={item.url}
                    className="text-blue-600 hover:text-blue-800"
                    itemProp="item"
                  >
                    <span itemProp="name">{truncateLabel(item.label)}</span>
                  </Link>
                )}
              </>
            )}
            <meta itemProp="position" content={`${index + 1}`} />
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default GV_Breadcrumbs;