import React from 'react';
import { Customer, FollowUpStatus } from '../types';
import { Users, Calendar, CheckCircle, XCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { parseISO, isToday, isThisMonth } from 'date-fns';

type KPICardsProps = {
  customers: Customer[];
};

const KPICards: React.FC<KPICardsProps> = ({ customers }) => {
  // Calculate KPIs
  const totalCustomers = customers.length;
  
  const todayFollowUps = customers.filter(customer =>
    customer.followUps.some(followUp => isToday(parseISO(followUp.date)))
  ).length;
  
  const completedSales = customers.filter(customer =>
    customer.followUps.some(followUp => followUp.status === 'Sales completed')
  ).length;
  
  const rejectedSales = customers.filter(customer =>
    customer.followUps.some(followUp => followUp.status === 'Sales rejected')
  ).length;
  
  const pendingFollowUps = customers.filter(customer =>
    customer.followUps.some(followUp => 
      followUp.status === 'Not yet contacted' || 
      followUp.status === 'Scheduled next follow-up'
    )
  ).length;
  
  const thisMonthCustomers = customers.filter(customer =>
    isThisMonth(parseISO(customer.createdAt))
  ).length;
  
  // Calculate total sales amount
  const totalSalesAmount = customers.reduce((total, customer) => {
    return total + customer.followUps
      .filter(followUp => followUp.status === 'Sales completed' && followUp.salesAmount)
      .reduce((sum, followUp) => sum + (followUp.salesAmount || 0), 0);
  }, 0);
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const kpis = [
    {
      label: 'Total Customers',
      value: totalCustomers,
      icon: <Users className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: "Today's Follow-ups",
      value: todayFollowUps,
      icon: <Calendar className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Sales Completed',
      value: completedSales,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Sales Rejected',
      value: rejectedSales,
      icon: <XCircle className="h-4 w-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Pending Follow-ups',
      value: pendingFollowUps,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'This Month',
      value: thisMonthCustomers,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Sales Amount',
      value: formatCurrency(totalSalesAmount),
      icon: <DollarSign className="h-4 w-4" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className={`${kpi.bgColor} rounded-lg p-3 border border-opacity-20`}
        >
          <div className="flex items-center justify-between">
            <div className={`${kpi.color} ${kpi.bgColor} p-1.5 rounded-md`}>
              {kpi.icon}
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${kpi.color}`}>
                {typeof kpi.value === 'string' ? kpi.value : kpi.value}
              </div>
            </div>
          </div>
          <div className="mt-1">
            <p className="text-xs font-medium text-gray-600 truncate">
              {kpi.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;