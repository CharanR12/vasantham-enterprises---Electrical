import React from 'react';
import { Settings, BarChart3, Download, Building2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useClerk } from '@clerk/clerk-react';
import { useCustomers } from '../context/CustomerContext';
import { exportToExcel } from '../utils/excelExport';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { openOrganizationProfile } = useClerk();
  const { customers, salesPersons } = useCustomers();

  const isSettingsPage = location.pathname.includes('/settings') || location.pathname === '/admin';
  const isInventoryPage = location.pathname === '/inventory';
  const isSalesPage = location.pathname === '/' || location.pathname.includes('/sales');
  const isAnalyticsPage = location.pathname === '/analytics';


  const handleExportToExcel = async () => {
    try {
      // For now, we'll create a wrapper component that has access to inventory data
      const { products = [], brands = [], salesEntries = [] } = (window as any).inventoryData || {};

      exportToExcel(customers, salesPersons, products, brands, salesEntries);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdfa] bg-gradient-to-br from-white via-brand-50/50 to-[#fdf8f3]">
      <header className="glass-header shadow-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 group">
                {/* Small logo for mobile */}
                <img
                  src="/Vasantham Enterprises Small Logo.svg"
                  alt="Vasantham Enterprises"
                  className="h-8 sm:hidden transition-transform duration-300 group-hover:scale-105"
                />
                {/* Full logo for desktop */}
                <img
                  src="/Vasantham Enterprises Full Logo.svg"
                  alt="Vasantham Enterprises"
                  className="hidden sm:block h-10 transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

              {/* Navigation Tabs */}
              <nav className="flex items-center space-x-1 sm:space-x-2">
                <Link
                  to="/"
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${isSalesPage && !isAnalyticsPage
                    ? 'bg-brand-50 text-brand-600 shadow-sm border border-brand-100'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                  Sales
                </Link>
                <Link
                  to="/inventory"
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${isInventoryPage
                    ? 'bg-brand-50 text-brand-600 shadow-sm border border-brand-100'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                  Inventory
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-5">
              <div className="flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-100">
                <button
                  onClick={handleExportToExcel}
                  className="p-2 rounded-xl transition-all duration-200 text-slate-600 hover:text-brand-600 hover:bg-white hover:shadow-sm"
                  title="Export to Excel"
                >
                  <Download className="h-5 w-5" />
                </button>

                <Link
                  to="/analytics"
                  className={`p-2 rounded-xl transition-all duration-200 ${isAnalyticsPage
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  title="Analytics"
                >
                  <BarChart3 className="h-5 w-5" />
                </Link>

                <Link
                  to="/settings"
                  className={`p-2 rounded-xl transition-all duration-200 ${isSettingsPage
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </Link>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

              <div className="flex items-center pl-1 sm:pl-2">
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
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        {children}
      </main>
    </div>
  );
};

export default Layout;