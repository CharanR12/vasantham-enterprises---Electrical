import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, UserPlus, Users } from 'lucide-react';

const MobileNav: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    {
      path: '/',
      label: "Today's",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      path: '/add-customer',
      label: 'Add',
      icon: <UserPlus className="h-5 w-5" />,
    },
    {
      path: '/customer-list',
      label: 'List',
      icon: <Users className="h-5 w-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              location.pathname === item.path
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;