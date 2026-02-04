import React from 'react';
import { LogOut, Settings, BarChart3, Download } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useCustomers } from '../context/CustomerContext';
import { exportToExcel } from '../utils/excelExport';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { customers, salesPersons } = useCustomers();

  const isSettingsPage = location.pathname.includes('/settings') || location.pathname === '/admin';
  const isInventoryPage = location.pathname === '/inventory';
  const isSalesPage = location.pathname === '/' || location.pathname.includes('/sales');
  const isAnalyticsPage = location.pathname === '/analytics';

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-12 sm:h-14">
            <div className="flex items-center space-x-2 sm:space-x-6">
              <img
                src="/vasantham enterprise logo.png"
                alt="Vasantham Enterprises"
                className="h-5 sm:h-7"
              />

              {/* Navigation Tabs */}
              <div className="flex items-center space-x-1 sm:space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${isSalesPage && !isAnalyticsPage
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  Sales
                </Link>
                <Link
                  to="/inventory"
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${isInventoryPage
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  Inventory
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {user && (
                <span className="text-xs sm:text-sm text-gray-600 hidden md:inline">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              )}

              <button
                onClick={handleExportToExcel}
                className="p-1.5 rounded-md transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Export to Excel"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <Link
                to="/analytics"
                className={`p-1.5 rounded-md transition-colors ${isAnalyticsPage
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                title="Analytics"
              >
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>

              <Link
                to="/settings"
                className={`p-1.5 rounded-md transition-colors ${isSettingsPage
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                title="Settings"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center text-xs sm:text-sm text-gray-700 hover:text-gray-900 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;