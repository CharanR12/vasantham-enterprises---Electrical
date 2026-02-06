import React from 'react';
import { useCustomersQuery, useSalesPersonsQuery } from '../hooks/queries/useCustomerQueries';
import { exportToExcel } from '../utils/excelExport';
import Sidebar, { SidebarProvider, MobileMenuButton, useSidebar } from './Sidebar';

type LayoutProps = {
  children: React.ReactNode;
};

const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();
  const { data: customers = [] } = useCustomersQuery();
  const { data: salesPersons = [] } = useSalesPersonsQuery();

  const handleExportToExcel = async () => {
    try {
      const { products = [], brands = [], salesEntries = [] } = (window as any).inventoryData || {};
      exportToExcel(customers, salesPersons, products, brands, salesEntries);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdfa] bg-gradient-to-br from-white via-brand-50/50 to-[#fdf8f3]">
      {/* Sidebar */}
      <Sidebar onExport={handleExportToExcel} />

      {/* Main content wrapper */}
      <div
        className={`
          transition-all duration-300 ease-out
          ${isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}
        `}
      >
        {/* Mobile header - only visible on mobile for menu access */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="px-4 py-3 flex items-center gap-3">
            <MobileMenuButton />
            <img
              src="/Vasantham Enterprises Small Logo.svg"
              alt="Vasantham Enterprises"
              className="h-8"
            />
            <span className="font-bold text-slate-900 text-sm">Vasantham</span>
          </div>
        </header>

        {/* Main content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

export default Layout;