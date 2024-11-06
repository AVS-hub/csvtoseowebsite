import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/main';
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const GV_Footer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const isAuthenticated = useSelector((state: RootState) => state.user_auth.is_authenticated);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const socialLinks = [
    { platform: 'Facebook', url: 'https://facebook.com/sitegenie', icon: Facebook },
    { platform: 'Twitter', url: 'https://twitter.com/sitegenie', icon: Twitter },
    { platform: 'LinkedIn', url: 'https://linkedin.com/company/sitegenie', icon: Linkedin },
    { platform: 'Instagram', url: 'https://instagram.com/sitegenie', icon: Instagram },
  ];

  const quickLinks = [
    { label: 'About Us', url: '/about' },
    { label: 'Terms of Service', url: '/terms' },
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Contact Us', url: '/contact' },
  ];

  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-start">
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.url}
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {isAuthenticated && (
                <li>
                  <Link
                    to="/dashboard"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Connect With Us</h3>
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${social.platform}`}
                >
                  <Button variant="outline" size="icon" className="bg-transparent border-gray-600 hover:bg-gray-700">
                    <social.icon className="h-4 w-4" />
                  </Button>
                </a>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/3 text-right">
            <p className="text-sm">&copy; {currentYear} SiteGenie. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GV_Footer;