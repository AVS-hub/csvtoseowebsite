import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/main';

const GV_Footer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const isAuthenticated = useSelector((state: RootState) => state.user_auth.is_authenticated);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const socialLinks = [
    { platform: 'Facebook', url: 'https://facebook.com/sitegenie', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
    { platform: 'Twitter', url: 'https://twitter.com/sitegenie', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
    { platform: 'LinkedIn', url: 'https://linkedin.com/company/sitegenie', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z' },
    { platform: 'Instagram', url: 'https://instagram.com/sitegenie', icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 6.5h11A5 5 0 0122.5 11.5v11a5 5 0 01-5 5h-11a5 5 0 01-5-5v-11a5 5 0 015-5z' }
  ];

  const quickLinks = [
    { label: 'About Us', url: '/about' },
    { label: 'Terms of Service', url: '/terms' },
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Contact Us', url: '/contact' }
  ];

  const handleSocialLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-2xl font-bold text-indigo-600">SiteGenie</Link>
            <p className="mt-2 text-sm text-gray-500">AI-powered website creation</p>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end space-x-4 mb-4 md:mb-0">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                to={link.url}
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            © {currentYear} SiteGenie. All rights reserved.
          </p>
          <div className="flex space-x-4">
            {socialLinks.map((link) => (
              <button
                key={link.platform}
                onClick={() => handleSocialLinkClick(link.url)}
                className="text-gray-400 hover:text-indigo-600 transition-colors duration-300"
                aria-label={`Follow us on ${link.platform}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={link.icon}
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GV_Footer;