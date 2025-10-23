
import React, { useState, useEffect, useRef } from 'react';
import { FiMenu } from 'react-icons/fi';
import { useI18n } from '../lib/i18n';
import { User, ViewName } from '../App';

interface TopNavProps {
  setActiveView: (view: ViewName) => void;
  user: User | null;
}

const TopNav: React.FC<TopNavProps> = ({ setActiveView, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, view: ViewName) => {
    e.preventDefault();
    setActiveView(view);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="absolute top-6 left-6 z-[1000]" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="bg-white p-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
        aria-label="Main menu"
      >
        <FiMenu className="h-6 w-6 text-gray-800" />
      </button>

      {isMenuOpen && (
        <nav className="absolute left-0 mt-2 w-56 origin-top-left bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-2" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
            <a href="#" onClick={(e) => handleLinkClick(e, 'account')} className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 transition-colors duration-150" role="menuitem">
              {t('topNav.account')}
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'history')} className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 transition-colors duration-150" role="menuitem">
              {t('topNav.history')}
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'settings')} className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 transition-colors duration-150" role="menuitem">
              {t('topNav.settings')}
            </a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'appInfo')} className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 transition-colors duration-150" role="menuitem">
              {t('topNav.appInfo')}
            </a>
            {user?.role === 'superadmin' && (
              <>
                <div className="border-t my-1 border-gray-200"></div>
                <a href="#" onClick={(e) => handleLinkClick(e, 'admin')} className="block px-4 py-2 text-base text-teal-600 font-semibold hover:bg-gray-100 transition-colors duration-150" role="menuitem">
                  {t('topNav.manageChurches')}
                </a>
                <a href="#" onClick={(e) => handleLinkClick(e, 'apiSettings')} className="block px-4 py-2 text-base text-teal-600 font-semibold hover:bg-gray-100 transition-colors duration-150" role="menuitem">
                  {t('topNav.apiSettings')}
                </a>
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
};

export default TopNav;