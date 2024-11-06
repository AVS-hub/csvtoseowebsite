import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/main';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/solid';

interface BreadcrumbItem {
  label: string;
  url: string;
  isActive: boolean;
}

const GV_Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const currentProject = useSelector((state: RootState) => state.current_project);
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([
    { label: 'Home', url: '/dashboard', isActive: false }
  ]);

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
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);

      if (segment === 'projects' && currentProject && index === pathSegments.length - 1) {
        label = currentProject.name || 'Project';
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
    return label.length > maxLength ? label.substring(0, maxLength - 3) + '...' : label;
  };

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@id": `${window.location.origin}${item.url}`,
        "name": item.label
      }
    }))
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="py-3 px-4 bg-gray-100">
        <ol className="flex flex-wrap items-center space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index === 0 ? (
                <HomeIcon className="w-4 h-4 text-gray-500 mr-2" aria-hidden="true" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-500 mx-2" aria-hidden="true" />
              )}
              {!item.isActive ? (
                <Link
                  to={item.url}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {truncateLabel(item.label)}
                </Link>
              ) : (
                <span className="text-gray-700" aria-current="page">
                  {truncateLabel(item.label)}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>
    </>
  );
};

export default GV_Breadcrumbs;