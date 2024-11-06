import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/main';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface QuickLink {
  label: string;
  url: string;
}

const GV_Footer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: 'Facebook', url: 'https://facebook.com/sitegenie', icon: 'facebook' },
    { platform: 'Twitter', url: 'https://twitter.com/sitegenie', icon: 'twitter' },
    { platform: 'LinkedIn', url: 'https://linkedin.com/company/sitegenie', icon: 'linkedin' },
    { platform: 'Instagram', url: 'https://instagram.com/sitegenie', icon: 'instagram' }
  ]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([
    { label: 'About Us', url: '/about' },
    { label: 'Terms of Service', url: '/terms' },
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Contact Us', url: '/contact' }
  ]);
  const [email, setEmail] = useState<string>('');

  const isAuthenticated = useSelector((state: RootState) => state.user_auth.is_authenticated);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleSocialLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement newsletter signup logic here
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">SiteGenie</h3>
            <p className="text-sm">
              AI-powered website creation platform. Transform your ideas into reality with ease.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.url} className="text-sm hover:text-gray-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              {isAuthenticated && (
                <li>
                  <Link to="/dashboard" className="text-sm hover:text-gray-300 transition-colors">
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleSocialLinkClick(link.url)}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label={`Follow us on ${link.platform}`}
                >
                  <i className={`fab fa-${link.icon} text-2xl`}></i>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
          <p>&copy; {currentYear} SiteGenie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default GV_Footer;