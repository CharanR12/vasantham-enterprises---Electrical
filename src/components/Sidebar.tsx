import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, UserPlus, Users } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    {
      path: '/',
      label: "Today's Follow-Ups",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      path: '/add-customer',
      label: 'Add Customer',
      icon: <UserPlus className="h-5 w-5" />,
    },
    {
      path: '/customer-list',
      label: 'Customer List',
      icon: <Users className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="bg-gray-800 text-white h-full min-h-screen w-64 fixed left-0 top-0 overflow-y-auto transition-all duration-300 ease-in-out shadow-lg lg:block hidden">
      <div className="p-5">
        <h1 className="text-xl font-bold mb-8">Sales Follow-Up Tracker</h1>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-gray-700 ${
                    location.pathname === item.path ? 'bg-gray-700' : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export const MobileSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const location = useLocation();
  
  const navItems = [
    {
      path: '/',
      label: "Today's Follow-Ups",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      path: '/add-customer',
      label: 'Add Customer',
      icon: <UserPlus className="h-5 w-5" />,
    },
    {
      path: '/customer-list',
      label: 'Customer List',
      icon: <Users className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`bg-gray-800 text-white h-full min-h-screen w-64 fixed left-0 top-0 overflow-y-auto transition-all duration-300 ease-in-out shadow-lg z-50 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden`}
      >
        <div className="p-5">
          <h1 className="text-xl font-bold mb-8">Sales Follow-Up Tracker</h1>
          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-gray-700 ${
                      location.pathname === item.path ? 'bg-gray-700' : ''
                    }`}
                    onClick={onClose}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;