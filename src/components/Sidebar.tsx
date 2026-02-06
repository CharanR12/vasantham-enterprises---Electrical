import React, { useState, createContext, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useClerk, useUser } from '@clerk/clerk-react';
import {
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Building2,
  FileText,
  FolderOpen
} from 'lucide-react';

type SidebarContextType = {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

type NavItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

type SidebarProps = {
  onExport?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onExport }) => {
  const location = useLocation();
  const { openOrganizationProfile } = useClerk();
  const { user } = useUser();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navItems: NavItem[] = [
    {
      path: '/',
      label: 'Sales',
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      path: '/inventory',
      label: 'Inventory',
      icon: <Package className="h-5 w-5" />,
    },
    {
      path: '/invoices',
      label: 'Invoices',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      path: '/files',
      label: 'Files',
      icon: <FolderOpen className="h-5 w-5" />,
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.includes('/sales');
    }
    return location.pathname.startsWith(path);
  };

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      to={item.path}
      onClick={() => setIsMobileOpen(false)}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
        ${isActive(item.path)
          ? 'bg-brand-50 text-brand-600 shadow-sm border border-brand-100'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }
      `}
      title={isCollapsed ? item.label : undefined}
    >
      <span className={`flex-shrink-0 ${isActive(item.path) ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {item.icon}
      </span>
      {!isCollapsed && (
        <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>
      )}
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-4 border-b border-slate-100 ${isCollapsed ? 'px-3 flex justify-center' : ''}`}>
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsMobileOpen(false)}>
          {isCollapsed ? (
            <img
              src="/Vasantham Enterprises Small Logo.svg"
              alt="Vasantham Enterprises"
              className="h-8 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <img
              src="/Vasantham Enterprises Full Logo.svg"
              alt="Vasantham Enterprises"
              className="h-10 transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
      </nav>

      {/* Actions */}
      <div className="p-3 border-t border-slate-100 space-y-1.5">
        {onExport && (
          <button
            onClick={() => {
              onExport();
              setIsMobileOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              text-slate-600 hover:text-slate-900 hover:bg-slate-100
            `}
            title={isCollapsed ? 'Export to Excel' : undefined}
          >
            <Download className="h-5 w-5 text-slate-400" />
            {!isCollapsed && <span className="font-semibold text-sm">Export</span>}
          </button>
        )}

        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User Profile */}
      <div className={`p-3 border-t border-slate-100 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? '' : 'px-2'}`}>
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                userButtonAvatarBox: "h-9 w-9 rounded-xl border-2 border-white shadow-sm",
                userButtonTrigger: "focus:shadow-none focus:outline-none"
              }
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Action
                label="Manage Organization"
                labelIcon={<Building2 className="h-4 w-4 text-brand-500" />}
                onClick={() => openOrganizationProfile()}
              />
            </UserButton.MenuItems>
          </UserButton>
          {!isCollapsed && (
            <span className="text-sm font-medium text-slate-700">{user?.firstName || 'Profile'}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 shadow-xl z-50
          transform transition-transform duration-300 ease-out lg:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col h-screen bg-white border-r border-slate-100 fixed left-0 top-0
          transition-all duration-300 ease-out z-30
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export const MobileMenuButton: React.FC = () => {
  const { setIsMobileOpen } = useSidebar();

  return (
    <button
      onClick={() => setIsMobileOpen(true)}
      className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
};

export default Sidebar;