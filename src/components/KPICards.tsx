import React from 'react';
import { Customer } from '../types';
import { Users, Calendar, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { parseISO, isToday } from 'date-fns';

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
      icon: <Users className="h-5 w-5" />,
      color: 'text-brand-600',
      bgColor: 'bg-brand-50/50',
      borderColor: 'border-brand-100',
    },
    {
      label: "Today's Follow-ups",
      value: todayFollowUps,
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50/50',
      borderColor: 'border-amber-100',
    },
    {
      label: 'Sales Completed',
      value: completedSales,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50/50',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Sales Rejected',
      value: rejectedSales,
      icon: <XCircle className="h-5 w-5" />,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50/50',
      borderColor: 'border-rose-100',
    },
    {
      label: 'Pending Follow-ups',
      value: pendingFollowUps,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50/50',
      borderColor: 'border-sky-100',
    },
    {
      label: 'Total Sales Amount',
      value: formatCurrency(totalSalesAmount),
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-slate-900',
      bgColor: 'bg-white',
      borderColor: 'border-slate-200',
      isPrimary: true,
    },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className={`premium-card p-3 transition-all duration-300 group ${kpi.isPrimary ? 'lg:col-span-1 border-brand-200 ring-2 ring-brand-500/5' : ''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`${kpi.color} ${kpi.bgColor} p-1.5 rounded-lg border ${kpi.borderColor} transition-transform duration-300 group-hover:scale-110`}>
              {React.cloneElement(kpi.icon as React.ReactElement, { className: 'h-3.5 w-3.5' })}
            </div>
          </div>
          <div>
            <div className={`text-base font-black text-slate-900 tracking-tight truncate`}>
              {kpi.value}
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
              {kpi.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;