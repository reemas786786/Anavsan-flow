
import React, { useState, useRef, useEffect } from 'react';
import { IconMenu, IconSparkles, IconUser, IconSearch, IconBell, IconClose, IconHelpCircle } from '../constants';
import NotificationDropdown from './NotificationDropdown';
import { Notification, Page } from '../types';

interface HeaderProps {
    onMenuClick: () => void;
    onLogoClick: () => void;
    isSidebarOpen: boolean;
    brandLogo: string | null;
    onOpenProfileSettings: () => void;
    onLogout: () => void;
    hasNewAssignment?: boolean;
    notifications: Notification[];
    onMarkAllNotificationsAsRead: () => void;
    onClearAllNotifications: () => void;
    onNavigate: (page: Page) => void;
    onOpenQuickAsk: () => void;
}

const AnavsanLogo: React.FC<{}> = () => (
    <div className="flex items-center" title="Anavsan - Home">
        <h1 className="text-xl font-bold flex items-center text-white">
            <span style={{fontFamily: 'serif', background: 'linear-gradient(to bottom right, #A78BFA, #6932D5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}} className="text-4xl -mr-1">
                A
            </span>
            <span className="tracking-[0.1em]">
                NAVSAN
            </span>
        </h1>
    </div>
);

const BrandLogo: React.FC<{ logoUrl: string }> = ({ logoUrl }) => (
    <div className="flex items-center justify-center h-[26px] w-[112px]" title="Brand Logo">
        <img src={logoUrl} alt="Brand Logo" className="max-h-full max-w-full object-contain" />
    </div>
);


const Header: React.FC<HeaderProps> = ({ 
    onMenuClick, 
    onLogoClick, 
    isSidebarOpen, 
    brandLogo, 
    onOpenProfileSettings, 
    onLogout, 
    hasNewAssignment, 
    notifications,
    onMarkAllNotificationsAsRead,
    onClearAllNotifications,
    onNavigate,
    onOpenQuickAsk,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setIsUserMenuOpen(false);
        }
        if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
            setIsNotificationsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-sidebar-topbar px-4 py-2 flex items-center justify-between flex-shrink-0 h-12 z-40 relative">
      <div className="flex items-center gap-4">
        <button 
            onClick={onMenuClick} 
            className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors" 
            aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar-menu"
        >
          {/* Visual change: Always show the hamburger icon regardless of sidebar state */}
          <IconMenu className="h-6 w-6" />
        </button>
        <button onClick={onLogoClick} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1 -m-1">
            {brandLogo ? <BrandLogo logoUrl={brandLogo} /> : <AnavsanLogo />}
        </button>
      </div>
      
      <div className="flex items-center space-x-1">
        <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IconSearch className="h-6 w-6 text-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full bg-white/20 border-0 text-white rounded-full py-2 pl-12 pr-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-sidebar-topbar"
            />
        </div>
        <button onClick={onOpenQuickAsk} className="p-2 rounded-full text-primary bg-primary/20 hover:bg-primary/30 transition-colors">
            <IconSparkles className="h-6 w-6" />
        </button>
        <div className="relative" ref={notificationsRef}>
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
              <IconBell className="h-6 w-6" />
              {unreadCount > 0 && (
                 <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-status-error text-white text-[10px] font-bold ring-2 ring-sidebar-topbar">{unreadCount}</span>
              )}
            </button>
            <NotificationDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                onMarkAllAsRead={onMarkAllNotificationsAsRead}
                onViewAll={() => {
                    onNavigate('Notifications');
                    setIsNotificationsOpen(false);
                }}
            />
        </div>
        <button 
            className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Help"
            title="Help"
        >
          <IconHelpCircle className="h-6 w-6" />
        </button>

        <div className="relative flex items-center pl-2" ref={userMenuRef}>
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors" aria-haspopup="true" aria-expanded={isUserMenuOpen} aria-label="User menu">
                <IconUser className="h-6 w-6" />
            </button>
            {isUserMenuOpen && (
                <div className="origin-top-right absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg bg-surface ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        <button onClick={() => { onOpenProfileSettings(); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover" role="menuitem">Profile Settings</button>
                        <button onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-status-error hover:bg-status-error/10" role="menuitem">Logout</button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
